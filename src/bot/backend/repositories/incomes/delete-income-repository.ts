import { conn } from "@/database/config";
import { stop_income_series } from "@/bot/backend/repositories/incomes/income-series-repository";
import type { EditScope } from "@/bot/backend/repositories/incomes/update-income-repository";

interface DeleteIncomeInput {
    telegram_id: string;
    incomes_id: string;
    scope?: EditScope | undefined; // "future" stops the series and removes later occurrences
}

/**
 * Soft delete: stamps `delete_at`. For a recurring item, the soft-deleted row is
 * a tombstone — the catch-up won't recreate that month. "future" also stops the
 * series and tombstones already-materialized later months.
 */
async function delete_income_repository({
    telegram_id,
    incomes_id,
    scope = "single",
}: DeleteIncomeInput): Promise<boolean> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return false;

    const occurrence = await conn("incomes")
        .where({ incomes_id, user_id: user.id })
        .whereNull("delete_at")
        .first();
    if (!occurrence) return false;

    await conn("incomes")
        .where({ incomes_id, user_id: user.id })
        .whereNull("delete_at")
        .update({ delete_at: conn.fn.now() });

    if (scope === "future" && occurrence.series_id) {
        await stop_income_series(occurrence.series_id, occurrence.competence);
        await conn("incomes")
            .where({ series_id: occurrence.series_id, user_id: user.id })
            .where("competence", ">", occurrence.competence)
            .whereNull("delete_at")
            .update({ delete_at: conn.fn.now() });
    }

    return true;
}

export { delete_income_repository };
