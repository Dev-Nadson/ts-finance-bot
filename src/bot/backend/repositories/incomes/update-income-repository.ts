import { conn } from "@/database/config";
import { update_income_series } from "@/bot/backend/repositories/incomes/income-series-repository";

interface UpdateIncomePatch {
    value?: number;
    description?: string;
}

type EditScope = "single" | "future";

interface UpdateIncomeInput {
    telegram_id: string;
    incomes_id: string;
    patch: UpdateIncomePatch;
    scope?: EditScope | undefined; // "future" propagates to the series + later occurrences
}

async function update_income_repository({
    telegram_id,
    incomes_id,
    patch,
    scope = "single",
}: UpdateIncomeInput): Promise<boolean> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return false;

    const occurrence = await conn("incomes")
        .where({ incomes_id, user_id: user.id })
        .whereNull("delete_at")
        .first();
    if (!occurrence) return false;

    const fields: Record<string, unknown> = { updated_at: conn.fn.now() };
    if (patch.value !== undefined) fields.value = patch.value;
    if (patch.description !== undefined) fields.description = patch.description;

    // Always update this occurrence. The catch-up never rewrites existing rows,
    // so a "single" edit naturally stays local.
    await conn("incomes").where({ incomes_id, user_id: user.id }).whereNull("delete_at").update(fields);

    // "future": update the series template + already-materialized later months.
    if (scope === "future" && occurrence.series_id) {
        await update_income_series(occurrence.series_id, patch);
        await conn("incomes")
            .where({ series_id: occurrence.series_id, user_id: user.id })
            .where("competence", ">", occurrence.competence)
            .whereNull("delete_at")
            .update(fields);
    }

    return true;
}

export { update_income_repository };
export type { UpdateIncomePatch, EditScope };
