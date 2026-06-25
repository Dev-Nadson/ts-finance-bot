import { Composer, InlineKeyboard } from "grammy";
import type { BotContext } from "@/bot/context";
import { get_active_account_controller } from "@/bot/backend/controllers/accounts/get-active-account-controller";
import { get_user_accounts_controller } from "@/bot/backend/controllers/accounts/get-user-accounts-controller";
import { list_accounts_controller } from "@/bot/backend/controllers/accounts/list-accounts-controller";
import { switch_account_controller } from "@/bot/backend/controllers/accounts/switch-account-controller";

export const accounts_menu = new Composer<BotContext>();

export const accountsKeyboard = new InlineKeyboard()
    .text("➕ Criar Conta", "acc_add").row()
    .text("🔐 Entrar em uma Conta", "acc_login").row()
    .text("🔄 Trocar de Conta", "acc_switch").row()
    .text("📋 Minhas Contas", "acc_list").row()
    .text("🔙 Voltar", "main_menu");

const backToAccounts = new InlineKeyboard().text("🔙 Voltar", "accounts_menu");

accounts_menu.callbackQuery("accounts_menu", async (ctx) => {
    const active_account = await get_active_account_controller(ctx);
    await ctx.editMessageText(
        `💳 *Menu de Contas*\n\n🔵 Conta ativa: *${active_account}*\n\nEscolha uma opção:`,
        { reply_markup: accountsKeyboard, parse_mode: "Markdown" }
    );
    await ctx.answerCallbackQuery();
});

accounts_menu.callbackQuery("acc_add", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter("create_account_conversation");
});

accounts_menu.callbackQuery("acc_login", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter("login_account_conversation");
});

accounts_menu.callbackQuery("acc_switch", async (ctx) => {
    const telegram_id = ctx.from!.id.toString();
    const accounts = await get_user_accounts_controller(telegram_id);

    if (accounts.length === 0) {
        await ctx.editMessageText("Você ainda não possui contas para ativar.", { reply_markup: backToAccounts });
        await ctx.answerCallbackQuery();
        return;
    }

    const keyboard = new InlineKeyboard();
    for (const account of accounts) {
        keyboard.text(account.name, `acc_select_${account.id}`).row();
    }
    keyboard.text("🔙 Voltar", "accounts_menu");

    await ctx.editMessageText("Selecione a conta que deseja ativar:", { reply_markup: keyboard });
    await ctx.answerCallbackQuery();
});

accounts_menu.callbackQuery(/^acc_select_(.+)$/, async (ctx) => {
    const account_id = ctx.match[1];
    if (!account_id) {
        await ctx.answerCallbackQuery();
        return;
    }

    const telegram_id = ctx.from!.id.toString();
    const result = await switch_account_controller({ telegram_id, account_id });

    await ctx.editMessageText(result, { reply_markup: backToAccounts, parse_mode: "Markdown" });
    await ctx.answerCallbackQuery();
});

accounts_menu.callbackQuery("acc_list", async (ctx) => {
    const telegram_id = ctx.from!.id.toString();
    const text = await list_accounts_controller(telegram_id);

    await ctx.editMessageText(text, { reply_markup: backToAccounts, parse_mode: "Markdown" });
    await ctx.answerCallbackQuery();
});
