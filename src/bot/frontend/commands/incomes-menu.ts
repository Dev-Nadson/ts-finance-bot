import { Composer, InlineKeyboard } from "grammy";
import type { BotContext } from "@/bot/context";
import { get_active_account_repository } from "@/bot/backend/repositories/accounts/get-active-account-repository";
import { list_incomes_controller } from "@/bot/backend/controllers/incomes/list-incomes-controller";
import { current_competence } from "@/libs/dayjs";

export const incomes_menu = new Composer<BotContext>();

export const incomesKeyboard = new InlineKeyboard()
    .text("➕ Adicionar Receita", "add_income").row()
    .text("✏️ Editar Receita", "edit_income").row()
    .text("❌ Remover Receita", "delete_income").row()
    .text("📋 Listar Todas", "list_incomes").row()
    .text("🔙 Voltar", "main_menu");

const backToIncomes = new InlineKeyboard().text("🔙 Voltar", "incomes_menu");
const NO_ACCOUNT = "Você precisa de uma conta ativa. Vá em 💳 Contas para criar ou ativar uma.";

incomes_menu.callbackQuery("incomes_menu", async (ctx) => {
    await ctx.editMessageText("💰 *Menu de Receitas*\n\nEscolha uma opção:", {
        reply_markup: incomesKeyboard,
        parse_mode: "Markdown",
    });
    await ctx.answerCallbackQuery();
});

async function enter_income_flow(ctx: BotContext, conversation_name: string): Promise<void> {
    await ctx.answerCallbackQuery();
    const telegram_id = ctx.from!.id.toString();
    const account = await get_active_account_repository(telegram_id);
    if (!account) {
        await ctx.editMessageText(NO_ACCOUNT, { reply_markup: backToIncomes });
        return;
    }
    const competence = ctx.session.active_competence ?? current_competence();
    await ctx.conversation.enter(conversation_name, account.id, competence);
}

incomes_menu.callbackQuery("add_income", (ctx) => enter_income_flow(ctx, "add_income_conversation"));
incomes_menu.callbackQuery("edit_income", (ctx) => enter_income_flow(ctx, "edit_income_conversation"));
incomes_menu.callbackQuery("delete_income", (ctx) => enter_income_flow(ctx, "delete_income_conversation"));

incomes_menu.callbackQuery("list_incomes", async (ctx) => {
    await ctx.answerCallbackQuery();
    const telegram_id = ctx.from!.id.toString();
    const account = await get_active_account_repository(telegram_id);
    if (!account) {
        await ctx.editMessageText(NO_ACCOUNT, { reply_markup: backToIncomes });
        return;
    }
    const competence = ctx.session.active_competence ?? current_competence();
    const text = await list_incomes_controller({ telegram_id, account_id: account.id, competence });
    await ctx.editMessageText(text, { reply_markup: backToIncomes, parse_mode: "Markdown" });
});
