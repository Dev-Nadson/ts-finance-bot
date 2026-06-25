import { conn } from "@/database/config";
import { create_id } from "@/libs/utils";
import { resolve_member } from "@/bot/backend/repositories/shared/resolve-member";

interface CreateIncomeInput {
    telegram_id: string;
    account_id: string;
    value: number; // integer cents
    type: string;
    description: string;
    competence: string;
}

async function create_income_repository(input: CreateIncomeInput): Promise<boolean> {
    const member = await resolve_member({ telegram_id: input.telegram_id, account_id: input.account_id });
    if (!member) return false;

    await conn("incomes").insert({
        incomes_id: create_id(),
        account_id: input.account_id,
        user_id: member.user_id,
        value: input.value,
        type: input.type,
        description: input.description,
        competence: input.competence,
    });

    return true;
}

export { create_income_repository };
