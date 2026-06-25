import { Composer, InlineKeyboard } from "grammy";
import type { BotContext } from "@/bot/context";
import { get_active_account_repository } from "@/bot/backend/repositories/accounts/get-active-account-repository";
import { list_expenses_controller } from "@/bot/backend/controllers/expenses/list-expenses-controller";
import { current_competence } from "@/libs/dayjs";

export const expenses_menu = new Composer<BotContext>();

export const expensesKeyboard = new InlineKeyboard()
    .text("➕ Adicionar Despesa", "add_expense").row()
    .text("✏️ Editar Despesa", "edit_expense").row()
    .text("❌ Remover Despesa", "delete_expense").row()
    .text("📋 Listar Todas", "list_expenses").row()
    .text("🔙 Voltar", "main_menu");

const backToExpenses = new InlineKeyboard().text("🔙 Voltar", "expenses_menu");
const NO_ACCOUNT = "Você precisa de uma conta ativa. Vá em 💳 Contas para criar ou ativar uma.";

expenses_menu.callbackQuery("expenses_menu", async (ctx) => {
    await ctx.editMessageText("💸 *Menu de Despesas*\n\nEscolha uma opção:", {
        reply_markup: expensesKeyboard,
        parse_mode: "Markdown",
    });
    await ctx.answerCallbackQuery();
});

async function enter_expense_flow(ctx: BotContext, conversation_name: string): Promise<void> {
    await ctx.answerCallbackQuery();
    const telegram_id = ctx.from!.id.toString();
    const account = await get_active_account_repository(telegram_id);
    if (!account) {
        await ctx.editMessageText(NO_ACCOUNT, { reply_markup: backToExpenses });
        return;
    }
    const competence = ctx.session.active_competence ?? current_competence();
    await ctx.conversation.enter(conversation_name, account.id, competence);
}

expenses_menu.callbackQuery("add_expense", (ctx) => enter_expense_flow(ctx, "add_expense_conversation"));
expenses_menu.callbackQuery("edit_expense", (ctx) => enter_expense_flow(ctx, "edit_expense_conversation"));
expenses_menu.callbackQuery("delete_expense", (ctx) => enter_expense_flow(ctx, "delete_expense_conversation"));

expenses_menu.callbackQuery("list_expenses", async (ctx) => {
    await ctx.answerCallbackQuery();
    const telegram_id = ctx.from!.id.toString();
    const account = await get_active_account_repository(telegram_id);
    if (!account) {
        await ctx.editMessageText(NO_ACCOUNT, { reply_markup: backToExpenses });
        return;
    }
    const competence = ctx.session.active_competence ?? current_competence();
    const text = await list_expenses_controller({ telegram_id, account_id: account.id, competence });
    await ctx.editMessageText(text, { reply_markup: backToExpenses, parse_mode: "Markdown" });
});
