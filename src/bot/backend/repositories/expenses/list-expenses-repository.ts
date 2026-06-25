import { conn } from "@/database/config";
import { resolve_member } from "@/bot/backend/repositories/shared/resolve-member";

interface ListExpensesInput {
    telegram_id: string;
    account_id: string;
    competence: string;
}

interface ExpenseSummary {
    expenses_id: string;
    value: number;
    expense_type: number;
    series_id: string | null;
    category: string | null;
    sector: string | null;
    description: string | null;
}

async function list_expenses_repository({
    telegram_id,
    account_id,
    competence,
}: ListExpensesInput): Promise<ExpenseSummary[]> {
    const member = await resolve_member({ telegram_id, account_id });
    if (!member) return [];

    const rows = await conn("expenses")
        .where({ user_id: member.user_id, account_id, competence })
        .whereNull("delete_at")
        .orderBy("created_at", "asc")
        .select("expenses_id", "value", "expense_type", "series_id", "category", "sector", "description");

    return rows as ExpenseSummary[];
}

export { list_expenses_repository };
export type { ExpenseSummary };
