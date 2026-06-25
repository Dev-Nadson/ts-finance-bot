import { get_active_account_repository } from "@/bot/backend/repositories/accounts/get-active-account-repository";
import {
    list_accounts_repository,
    type AccountSummary,
} from "@/bot/backend/repositories/accounts/list-accounts-repository";
import { set_active_account_repository } from "@/bot/backend/repositories/accounts/set-active-account-repository";

/**
 * Make sure the user has an active account: keep the current one if set,
 * otherwise activate the first account they belong to. Returns the active
 * account, or `null` when the user has no accounts yet.
 */
async function ensure_active_account_controller(telegram_id: string): Promise<AccountSummary | null> {
    const active = await get_active_account_repository(telegram_id);
    if (active) return active;

    const accounts = await list_accounts_repository(telegram_id);
    const first = accounts[0];
    if (!first) return null;

    return set_active_account_repository({ telegram_id, account_id: first.id });
}

export { ensure_active_account_controller };
