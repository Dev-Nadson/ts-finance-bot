import {
    list_accounts_repository,
    type AccountSummary,
} from "@/bot/backend/repositories/accounts/list-accounts-repository";

async function get_user_accounts_controller(telegram_id: string): Promise<AccountSummary[]> {
    return list_accounts_repository(telegram_id);
}

export { get_user_accounts_controller };
