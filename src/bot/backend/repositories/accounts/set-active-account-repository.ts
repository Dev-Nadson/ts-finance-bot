import { conn } from "@/database/config";
import type { AccountSummary } from "./list-accounts-repository";

interface SetActiveAccountInput {
    telegram_id: string;
    account_id: string;
}

/**
 * Persist the active account on `users.active_account_id`. Returns the activated
 * account, or `null` when the user does not exist, the account does not exist,
 * or the user is not a member of that account (guards against activating an
 * account you have no access to).
 */
async function set_active_account_repository({
    telegram_id,
    account_id,
}: SetActiveAccountInput): Promise<AccountSummary | null> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return null;

    const membership = await conn("users-accounts").where({ user_id: user.id, account_id }).first();
    if (!membership) return null;

    const account = await conn("accounts").where({ id: account_id }).whereNull("deleted_at").first();
    if (!account) return null;

    await conn("users")
        .where({ id: user.id })
        .update({ active_account_id: account_id, updated_at: conn.fn.now() });

    return { id: account.id, name: account.name };
}

export { set_active_account_repository };
