import { conn } from "@/database/config";

interface AccountSummary {
    id: string;
    name: string;
}

async function list_accounts_repository(telegram_id: string): Promise<AccountSummary[]> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return [];

    const accounts = await conn("accounts")
        .join("users-accounts", "accounts.id", "users-accounts.account_id")
        .where("users-accounts.user_id", user.id)
        .whereNull("accounts.deleted_at")
        .select("accounts.id as id", "accounts.name as name");

    return accounts as AccountSummary[];
}

export { list_accounts_repository };
export type { AccountSummary };
