import { conn } from "@/database/config";
import { stop_expense_series } from "@/bot/backend/repositories/expenses/expense-series-repository";
import type { EditScope } from "@/bot/backend/repositories/expenses/update-expense-repository";

interface DeleteExpenseInput {
    telegram_id: string;
    expenses_id: string;
    scope?: EditScope | undefined; // "future" stops the series and removes later occurrences
}

/**
 * Soft delete: stamps `delete_at`. For a recurring item, the soft-deleted row is
 * a tombstone — the catch-up won't recreate that month. "future" also stops the
 * series and tombstones already-materialized later months.
 */
async function delete_expense_repository({
    telegram_id,
    expenses_id,
    scope = "single",
}: DeleteExpenseInput): Promise<boolean> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return false;

    const occurrence = await conn("expenses")
        .where({ expenses_id, user_id: user.id })
        .whereNull("delete_at")
        .first();
    if (!occurrence) return false;

    await conn("expenses")
        .where({ expenses_id, user_id: user.id })
        .whereNull("delete_at")
        .update({ delete_at: conn.fn.now() });

    if (scope === "future" && occurrence.series_id) {
        await stop_expense_series(occurrence.series_id, occurrence.competence);
        await conn("expenses")
            .where({ series_id: occurrence.series_id, user_id: user.id })
            .where("competence", ">", occurrence.competence)
            .whereNull("delete_at")
            .update({ delete_at: conn.fn.now() });
    }

    return true;
}

export { delete_expense_repository };
