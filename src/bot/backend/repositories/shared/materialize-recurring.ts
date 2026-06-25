import { conn } from "@/database/config";
import { create_id } from "@/libs/utils";
import { INCOMES_TYPES, EXPENSES_TYPES } from "@/libs/constants";
import { resolve_member } from "@/bot/backend/repositories/shared/resolve-member";
import { list_active_income_series } from "@/bot/backend/repositories/incomes/income-series-repository";
import { list_active_expense_series } from "@/bot/backend/repositories/expenses/expense-series-repository";

interface MaterializeInput {
    telegram_id: string;
    account_id: string;
    competence: string;
}

/**
 * Lazy "catch-up" for recurring (Mensal) items: ensures every active series has
 * an occurrence row in `competence`. Called when a month is opened (list/balance).
 *
 * Idempotent: an occurrence is created only when NO row exists for the series in
 * that competence — counting soft-deleted rows too. A soft-deleted occurrence is
 * a tombstone (the user deleted "só este mês"), so it is never recreated.
 */
async function materialize_recurring({ telegram_id, account_id, competence }: MaterializeInput): Promise<void> {
    const member = await resolve_member({ telegram_id, account_id });
    if (!member) return;
    const user_id = member.user_id;

    const income_series = await list_active_income_series(account_id, user_id, competence);
    for (const series of income_series) {
        const existing = await conn("incomes").where({ series_id: series.series_id, competence }).first();
        if (existing) continue;

        await conn("incomes").insert({
            incomes_id: create_id(),
            account_id,
            user_id,
            value: series.value,
            income_type: INCOMES_TYPES.MENSAL,
            series_id: series.series_id,
            description: series.description,
            competence,
        });
    }

    const expense_series = await list_active_expense_series(account_id, user_id, competence);
    for (const series of expense_series) {
        const existing = await conn("expenses").where({ series_id: series.series_id, competence }).first();
        if (existing) continue;

        await conn("expenses").insert({
            expenses_id: create_id(),
            account_id,
            user_id,
            value: series.value,
            expense_type: EXPENSES_TYPES.MENSAL,
            series_id: series.series_id,
            category: series.category,
            sector: series.sector,
            description: series.description,
            competence,
        });
    }
}

export { materialize_recurring };
