import { get_active_account_repository } from "@/bot/backend/repositories/accounts/get-active-account-repository";
import { list_accounts_repository } from "@/bot/backend/repositories/accounts/list-accounts-repository";

async function list_accounts_controller(telegram_id: string): Promise<string> {
    const accounts = await list_accounts_repository(telegram_id);
    if (accounts.length === 0) {
        return "Você ainda não possui contas. Crie uma em ➕ Criar Conta.";
    }

    const active = await get_active_account_repository(telegram_id);
    const lines = accounts.map((account) => {
        const marker = active && account.id === active.id ? " 🔵" : "";
        return `• *${account.name}*${marker}`;
    });

    return `💳 *Suas Contas:*\n\n${lines.join("\n")}`;
}

export { list_accounts_controller };
