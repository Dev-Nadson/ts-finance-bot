import { InlineKeyboard, type Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import type { BotContext } from "@/bot/context";
import { get_incomes_for_picker_controller } from "@/bot/backend/controllers/incomes/get-incomes-for-picker-controller";
import { delete_income_controller } from "@/bot/backend/controllers/incomes/delete-income-controller";
import { format_cents } from "@/libs/currency";

export async function delete_income_conversation(
    conversation: Conversation<BotContext, Context>,
    ctx: Context,
    account_id: string,
    competence: string
): Promise<void> {
    const telegram_id = ctx.from!.id.toString();

    const incomes = await conversation.external(() =>
        get_incomes_for_picker_controller({ telegram_id, account_id, competence })
    );
    if (incomes.length === 0) {
        await ctx.reply("Nenhuma receita para excluir neste período.");
        return;
    }

    const picker = new InlineKeyboard();
    for (const income of incomes) {
        picker.text(`${format_cents(income.value)} - ${income.description ?? "-"}`, `inc_del_pick_${income.incomes_id}`).row();
    }
    await ctx.reply("Qual receita deseja excluir?", { reply_markup: picker });

    const pick_ctx = await conversation.waitForCallbackQuery(/^inc_del_pick_(.+)$/);
    await pick_ctx.answerCallbackQuery();
    const incomes_id = pick_ctx.match?.[1];
    if (!incomes_id) {
        await ctx.reply("Seleção inválida.");
        return;
    }

    const confirm = new InlineKeyboard().text("✅ Confirmar", "inc_del_yes").text("❌ Cancelar", "inc_del_no");
    await ctx.reply("Tem certeza que deseja excluir esta receita?", { reply_markup: confirm });

    const confirm_ctx = await conversation.waitForCallbackQuery(["inc_del_yes", "inc_del_no"]);
    await confirm_ctx.answerCallbackQuery();
    if (confirm_ctx.callbackQuery.data === "inc_del_no") {
        await ctx.reply("Exclusão cancelada.");
        return;
    }

    const result = await conversation.external(() => delete_income_controller({ telegram_id, incomes_id }));
    await ctx.reply(result);
}
