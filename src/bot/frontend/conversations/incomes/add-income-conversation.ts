import { type Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import type { BotContext } from "@/bot/context";
import { create_income_controller } from "@/bot/backend/controllers/incomes/create-income-controller";
import { parse_money_to_cents } from "@/libs/currency";

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

    await ctx.reply("Qual o tipo da receita? (ex: Pix, Transferência, Boleto)");
    const type_ctx = await conversation.waitFor("message:text");
    const type = type_ctx.message.text;

    const telegram_id = ctx.from!.id.toString();
    const result = await conversation.external(() =>
        create_income_controller({ telegram_id, account_id, value, type, description, competence })
    );
    await ctx.reply(result, { parse_mode: "Markdown" });
}
