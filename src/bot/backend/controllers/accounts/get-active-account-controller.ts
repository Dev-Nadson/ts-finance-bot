import type { Context } from "grammy";
import { get_active_account_repository } from "@/bot/backend/repositories/accounts/get-active-account-repository";

async function get_active_account_controller(ctx: Context): Promise<string> {
    const telegram_id = ctx.from?.id.toString();
    if (!telegram_id) return "Nenhuma";

    const account = await get_active_account_repository(telegram_id);
    return account ? account.name : "Nenhuma";
}

export { get_active_account_controller };
