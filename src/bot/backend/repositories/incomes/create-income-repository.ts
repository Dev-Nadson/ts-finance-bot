import { conn } from "@/database/config";
import { create_id } from "@/libs/utils";
import { INCOMES_TYPES } from "@/libs/constants";
import { resolve_member } from "@/bot/backend/repositories/shared/resolve-member";
import { create_income_series } from "@/bot/backend/repositories/incomes/income-series-repository";

interface CreateIncomeInput {
    telegram_id: string;
    account_id: string;
    value: number; // integer cents
    income_type: number; // INCOMES_TYPES
    description: string;
    competence: string;
}

async function create_income_repository(input: CreateIncomeInput): Promise<boolean> {
    const member = await resolve_member({ telegram_id: input.telegram_id, account_id: input.account_id });
    if (!member) return false;

    // Mensal: create the recurring series so future months get the occurrence
    // automatically via the catch-up. The current month is materialized here.
    const series_id =
        input.income_type === INCOMES_TYPES.MENSAL
            ? await create_income_series({
                  account_id: input.account_id,
                  user_id: member.user_id,
                  value: input.value,
                  description: input.description,
                  start_competence: input.competence,
              })
            : null;

    await conn("incomes").insert({
        incomes_id: create_id(),
        account_id: input.account_id,
        user_id: member.user_id,
        value: input.value,
        income_type: input.income_type,
        series_id,
        description: input.description,
        competence: input.competence,
    });

    return true;
}

export { create_income_repository };
