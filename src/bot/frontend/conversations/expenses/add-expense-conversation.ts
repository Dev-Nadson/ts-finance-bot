import { InlineKeyboard, type Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import type { BotContext } from "@/bot/context";
import { create_expense_controller } from "@/bot/backend/controllers/expenses/create-expense-controller";
import { parse_money_to_cents } from "@/libs/currency";
import { EXPENSES_TYPES, EXPENSE_SECTORS } from "@/libs/constants";

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

    const type_keyboard = new InlineKeyboard()
        .text("🔁 Mensal", "exp_type_mensal").row()
        .text("1️⃣ Avulso", "exp_type_avulso");
    await ctx.reply("Qual o tipo da despesa?", { reply_markup: type_keyboard });

    const type_ctx = await conversation.waitForCallbackQuery(["exp_type_mensal", "exp_type_avulso"]);
    await type_ctx.answerCallbackQuery();
    const expense_type =
        type_ctx.callbackQuery.data === "exp_type_mensal" ? EXPENSES_TYPES.MENSAL : EXPENSES_TYPES.AVULSO;

    const cat_keyboard = new InlineKeyboard()
        .text("🍔 Alimentação", "exp_cat_alimentacao").row()
        .text("🎮 Lazer", "exp_cat_lazer").row()
        .text("🏠 Necessidades Básicas", "exp_cat_necessidades");
    await ctx.reply("Selecione a categoria:", { reply_markup: cat_keyboard });

    const cat_ctx = await conversation.waitForCallbackQuery(Object.keys(CATEGORIES));
    await cat_ctx.answerCallbackQuery();
    const category = (cat_ctx.callbackQuery.data && CATEGORIES[cat_ctx.callbackQuery.data]) || "Outros";

    const sector_keyboard = new InlineKeyboard();
    for (const key of Object.keys(EXPENSE_SECTORS)) {
        sector_keyboard.text(EXPENSE_SECTORS[key]!, key).row();
    }
    await ctx.reply("Selecione o setor:", { reply_markup: sector_keyboard });

    const sector_ctx = await conversation.waitForCallbackQuery(Object.keys(EXPENSE_SECTORS));
    await sector_ctx.answerCallbackQuery();
    const sector = (sector_ctx.callbackQuery.data && EXPENSE_SECTORS[sector_ctx.callbackQuery.data]) || "Outros";

    const telegram_id = ctx.from!.id.toString();
    const result = await conversation.external(() =>
        create_expense_controller({ telegram_id, account_id, value, expense_type, category, sector, description, competence })
    );
    await ctx.reply(result, { parse_mode: "Markdown" });
}
