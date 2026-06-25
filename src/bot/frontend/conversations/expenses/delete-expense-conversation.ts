import { InlineKeyboard, type Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import type { BotContext } from "@/bot/context";
import { get_expenses_for_picker_controller } from "@/bot/backend/controllers/expenses/get-expenses-for-picker-controller";
import { delete_expense_controller } from "@/bot/backend/controllers/expenses/delete-expense-controller";
import { format_cents } from "@/libs/currency";

export async function delete_expense_conversation(
    conversation: Conversation<BotContext, Context>,
    ctx: Context,
    account_id: string,
    competence: string
): Promise<void> {
    const telegram_id = ctx.from!.id.toString();

    const expenses = await conversation.external(() =>
        get_expenses_for_picker_controller({ telegram_id, account_id, competence })
    );
    if (expenses.length === 0) {
        await ctx.reply("Nenhuma despesa para excluir neste período.");
        return;
    }

    const picker = new InlineKeyboard();
    for (const expense of expenses) {
        picker.text(`${format_cents(expense.value)} - ${expense.description ?? "-"}`, `exp_del_pick_${expense.expenses_id}`).row();
    }
    await ctx.reply("Qual despesa deseja excluir?", { reply_markup: picker });

    const pick_ctx = await conversation.waitForCallbackQuery(/^exp_del_pick_(.+)$/);
    await pick_ctx.answerCallbackQuery();
    const expenses_id = pick_ctx.match?.[1];
    if (!expenses_id) {
        await ctx.reply("Seleção inválida.");
        return;
    }

    const confirm = new InlineKeyboard().text("✅ Confirmar", "exp_del_yes").text("❌ Cancelar", "exp_del_no");
    await ctx.reply("Tem certeza que deseja excluir esta despesa?", { reply_markup: confirm });

    const confirm_ctx = await conversation.waitForCallbackQuery(["exp_del_yes", "exp_del_no"]);
    await confirm_ctx.answerCallbackQuery();
    if (confirm_ctx.callbackQuery.data === "exp_del_no") {
        await ctx.reply("Exclusão cancelada.");
        return;
    }

    const result = await conversation.external(() => delete_expense_controller({ telegram_id, expenses_id }));
    await ctx.reply(result);
}
