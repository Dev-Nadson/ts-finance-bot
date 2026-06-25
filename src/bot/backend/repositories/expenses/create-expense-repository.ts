import { conn } from "@/database/config";
import { create_id } from "@/libs/utils";
import { EXPENSES_TYPES } from "@/libs/constants";
import { resolve_member } from "@/bot/backend/repositories/shared/resolve-member";
import { create_expense_series } from "@/bot/backend/repositories/expenses/expense-series-repository";

interface CreateExpenseInput {
    telegram_id: string;
    account_id: string;
    value: number; // integer cents
    expense_type: number; // EXPENSES_TYPES
    category: string;
    sector: string;
    description: string;
    competence: string;
}

async function create_expense_repository(input: CreateExpenseInput): Promise<boolean> {
    const member = await resolve_member({ telegram_id: input.telegram_id, account_id: input.account_id });
    if (!member) return false;

    // Mensal: create the recurring series so future months get the occurrence
    // automatically via the catch-up. The current month is materialized here.
    const series_id =
        input.expense_type === EXPENSES_TYPES.MENSAL
            ? await create_expense_series({
                  account_id: input.account_id,
                  user_id: member.user_id,
                  value: input.value,
                  description: input.description,
                  category: input.category,
                  sector: input.sector,
                  start_competence: input.competence,
              })
            : null;

    await conn("expenses").insert({
        expenses_id: create_id(),
        account_id: input.account_id,
        user_id: member.user_id,
        value: input.value,
        expense_type: input.expense_type,
        series_id,
        category: input.category,
        sector: input.sector,
        description: input.description,
        competence: input.competence,
    });

    return true;
}

export { create_expense_repository };
