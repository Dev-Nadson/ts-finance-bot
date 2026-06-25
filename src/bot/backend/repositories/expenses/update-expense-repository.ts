import { conn } from "@/database/config";
import { update_expense_series } from "@/bot/backend/repositories/expenses/expense-series-repository";

interface UpdateExpensePatch {
    value?: number;
    category?: string;
    sector?: string;
    description?: string;
}

type EditScope = "single" | "future";

interface UpdateExpenseInput {
    telegram_id: string;
    expenses_id: string;
    patch: UpdateExpensePatch;
    scope?: EditScope | undefined; // "future" propagates to the series + later occurrences
}

async function update_expense_repository({
    telegram_id,
    expenses_id,
    patch,
    scope = "single",
}: UpdateExpenseInput): Promise<boolean> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return false;

    const occurrence = await conn("expenses")
        .where({ expenses_id, user_id: user.id })
        .whereNull("delete_at")
        .first();
    if (!occurrence) return false;

    const fields: Record<string, unknown> = { updated_at: conn.fn.now() };
    if (patch.value !== undefined) fields.value = patch.value;
    if (patch.category !== undefined) fields.category = patch.category;
    if (patch.sector !== undefined) fields.sector = patch.sector;
    if (patch.description !== undefined) fields.description = patch.description;

    // Always update this occurrence. The catch-up never rewrites existing rows,
    // so a "single" edit naturally stays local.
    await conn("expenses").where({ expenses_id, user_id: user.id }).whereNull("delete_at").update(fields);

    // "future": update the series template + already-materialized later months.
    if (scope === "future" && occurrence.series_id) {
        await update_expense_series(occurrence.series_id, patch);
        await conn("expenses")
            .where({ series_id: occurrence.series_id, user_id: user.id })
            .where("competence", ">", occurrence.competence)
            .whereNull("delete_at")
            .update(fields);
    }

    return true;
}

export { update_expense_repository };
export type { UpdateExpensePatch, EditScope };
