import { InlineKeyboard, type Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import type { BotContext } from "@/bot/context";
import { create_expense_controller } from "@/bot/backend/controllers/expenses/create-expense-controller";
import { parse_money_to_cents } from "@/libs/currency";

const CATEGORIES: Record<string, string> = {
    exp_cat_alimentacao: "Alimentação",
    exp_cat_lazer: "Lazer",
    exp_cat_necessidades: "Necessidades Básicas",
};

export async function add_expense_conversation(
    conversation: Conversation<BotContext, Context>,
    ctx: Context,
    account_id: string,
    competence: string
): Promise<void> {
    await ctx.reply("💸 *Nova despesa*\nQual a descrição?", { parse_mode: "Markdown" });
    const desc_ctx = await conversation.waitFor("message:text");
    const description = desc_ctx.message.text;

    await ctx.reply("Qual o valor? (ex: 150,50)");
    let parsed: number | null = null;
    while (parsed === null) {
        const value_ctx = await conversation.waitFor("message:text");
        parsed = parse_money_to_cents(value_ctx.message.text);
        if (parsed === null) await ctx.reply("Valor inválido. Digite um número positivo (ex: 150,50).");
    }
    const value = parsed;

    const keyboard = new InlineKeyboard()
        .text("🍔 Alimentação", "exp_cat_alimentacao").row()
        .text("🎮 Lazer", "exp_cat_lazer").row()
        .text("🏠 Necessidades Básicas", "exp_cat_necessidades");
    await ctx.reply("Selecione a categoria:", { reply_markup: keyboard });

    const cat_ctx = await conversation.waitForCallbackQuery(Object.keys(CATEGORIES));
    await cat_ctx.answerCallbackQuery();
    const data = cat_ctx.callbackQuery.data;
    const category = (data && CATEGORIES[data]) || "Outros";

    const telegram_id = ctx.from!.id.toString();
    const result = await conversation.external(() =>
        create_expense_controller({ telegram_id, account_id, value, category, description, competence })
    );
    await ctx.reply(result, { parse_mode: "Markdown" });
}
