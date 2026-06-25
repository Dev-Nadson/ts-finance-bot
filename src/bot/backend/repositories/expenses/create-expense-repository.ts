import { conn } from "@/database/config";
import { create_id } from "@/libs/utils";
import { resolve_member } from "@/bot/backend/repositories/shared/resolve-member";

interface CreateExpenseInput {
    telegram_id: string;
    account_id: string;
    value: number; // integer cents
    type: string;
    category: string;
    description: string;
    competence: string;
}

async function create_expense_repository(input: CreateExpenseInput): Promise<boolean> {
    const member = await resolve_member({ telegram_id: input.telegram_id, account_id: input.account_id });
    if (!member) return false;

    await conn("expenses").insert({
        expenses_id: create_id(),
        account_id: input.account_id,
        user_id: member.user_id,
        value: input.value,
        type: input.type,
        category: input.category,
        description: input.description,
        competence: input.competence,
    });

    return true;
}

export { create_expense_repository };
