import { InlineKeyboard, type Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import type { BotContext } from "@/bot/context";
import { create_income_controller } from "@/bot/backend/controllers/incomes/create-income-controller";
import { parse_money_to_cents } from "@/libs/currency";
import { INCOMES_TYPES } from "@/libs/constants";

export async function add_income_conversation(
    conversation: Conversation<BotContext, Context>,
    ctx: Context,
    account_id: string,
    competence: string
): Promise<void> {
    await ctx.reply("💰 *Nova receita*\nQual a descrição?", { parse_mode: "Markdown" });
    const desc_ctx = await conversation.waitFor("message:text");
    const description = desc_ctx.message.text;

    await ctx.reply("Qual o valor? (ex: 2000,00)");
    let parsed: number | null = null;
    while (parsed === null) {
        const value_ctx = await conversation.waitFor("message:text");
        parsed = parse_money_to_cents(value_ctx.message.text);
        if (parsed === null) await ctx.reply("Valor inválido. Digite um número positivo (ex: 2000,00).");
    }
    const value = parsed;

    const keyboard = new InlineKeyboard()
        .text("🔁 Mensal", "inc_type_mensal").row()
        .text("1️⃣ Avulso", "inc_type_avulso");
    await ctx.reply("Qual o tipo da receita?", { reply_markup: keyboard });

    const type_ctx = await conversation.waitForCallbackQuery(["inc_type_mensal", "inc_type_avulso"]);
    await type_ctx.answerCallbackQuery();
    const income_type =
        type_ctx.callbackQuery.data === "inc_type_mensal" ? INCOMES_TYPES.MENSAL : INCOMES_TYPES.AVULSO;

    const telegram_id = ctx.from!.id.toString();
    const result = await conversation.external(() =>
        create_income_controller({ telegram_id, account_id, value, income_type, description, competence })
    );
    await ctx.reply(result, { parse_mode: "Markdown" });
}
