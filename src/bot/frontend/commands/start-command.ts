import { Composer, InlineKeyboard } from "grammy";
import type { BotContext } from "@/bot/context";
import { create_user_controller } from "@/bot/backend/controllers/users/create-user-controller";
import { ensure_active_account_controller } from "@/bot/backend/controllers/accounts/ensure-active-account-controller";
import { get_user_accounts_controller } from "@/bot/backend/controllers/accounts/get-user-accounts-controller";

export const start_command = new Composer<BotContext>();

start_command.command("start", async (ctx) => {
    const greeting = await create_user_controller(ctx);
    const telegram_id = ctx.from!.id.toString();
    const accounts = await get_user_accounts_controller(telegram_id);

    if (accounts.length === 0) {
        const keyboard = new InlineKeyboard().text("➕ Criar minha primeira conta", "acc_add");
        await ctx.reply(
            `${greeting}\n\nVocê ainda não tem nenhuma conta cadastrada. ` +
                "Crie sua primeira conta para começar a organizar suas finanças.",
            { reply_markup: keyboard }
        );
        return;
    }

    const active = await ensure_active_account_controller(telegram_id);
    const keyboard = new InlineKeyboard().text("🏠 Abrir menu principal", "main_menu");
    await ctx.reply(
        `${greeting}\n\nVocê está na conta: *${active?.name ?? "Nenhuma"}*.\n` +
            "Use o /menu para gerenciar suas receitas e despesas.",
        { reply_markup: keyboard, parse_mode: "Markdown" }
    );
});
