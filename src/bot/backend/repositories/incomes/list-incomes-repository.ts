import { conn } from "@/database/config";
import { resolve_member } from "@/bot/backend/repositories/shared/resolve-member";

interface ListIncomesInput {
    telegram_id: string;
    account_id: string;
    competence: string;
}

interface IncomeSummary {
    incomes_id: string;
    value: number;
    type: string | null;
    description: string | null;
}

async function list_incomes_repository({
    telegram_id,
    account_id,
    competence,
}: ListIncomesInput): Promise<IncomeSummary[]> {
    const member = await resolve_member({ telegram_id, account_id });
    if (!member) return [];

    const rows = await conn("incomes")
        .where({ user_id: member.user_id, account_id, competence })
        .whereNull("delete_at")
        .orderBy("created_at", "asc")
        .select("incomes_id", "value", "type", "description");

    return rows as IncomeSummary[];
}

export { list_incomes_repository };
export type { IncomeSummary };
