import { set_active_account_repository } from "@/bot/backend/repositories/accounts/set-active-account-repository";

interface SwitchAccountInput {
    telegram_id: string;
    account_id: string;
}

async function switch_account_controller({ telegram_id, account_id }: SwitchAccountInput): Promise<string> {
    const account = await set_active_account_repository({ telegram_id, account_id });
    if (!account) {
        return "❌ Não foi possível trocar de conta. Verifique se a conta existe e se você tem acesso a ela.";
    }

    return `✅ Conta *${account.name}* ativada!`;
}

export { switch_account_controller };
