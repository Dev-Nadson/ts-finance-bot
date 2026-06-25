import { conn } from "@/database/config";
import type { AccountSummary } from "./list-accounts-repository";

async function get_active_account_repository(telegram_id: string): Promise<AccountSummary | null> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user || !user.active_account_id) return null;

    const account = await conn("accounts")
        .where({ id: user.active_account_id })
        .whereNull("deleted_at")
        .first();
    if (!account) return null;

    return { id: account.id, name: account.name };
}

export { get_active_account_repository };
