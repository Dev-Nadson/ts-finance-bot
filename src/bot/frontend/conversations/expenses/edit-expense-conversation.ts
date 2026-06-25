import { InlineKeyboard, type Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import type { BotContext } from "@/bot/context";
import { get_expenses_for_picker_controller } from "@/bot/backend/controllers/expenses/get-expenses-for-picker-controller";
import { update_expense_controller } from "@/bot/backend/controllers/expenses/update-expense-controller";
import { format_cents, parse_money_to_cents } from "@/libs/currency";

const EDIT_CATEGORIES: Record<string, string> = {
    exp_edit_cat_alimentacao: "Alimentação",
    exp_edit_cat_lazer: "Lazer",
    exp_edit_cat_necessidades: "Necessidades Básicas",
};

export async function edit_expense_conversation(
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
        await ctx.reply("Nenhuma despesa para editar neste período.");
        return;
    }

    const picker = new InlineKeyboard();
    for (const expense of expenses) {
        picker.text(`${format_cents(expense.value)} - ${expense.description ?? "-"}`, `exp_edit_pick_${expense.expenses_id}`).row();
    }
    await ctx.reply("Qual despesa deseja editar?", { reply_markup: picker });

    const pick_ctx = await conversation.waitForCallbackQuery(/^exp_edit_pick_(.+)$/);
    await pick_ctx.answerCallbackQuery();
    const expenses_id = pick_ctx.match?.[1];
    if (!expenses_id) {
        await ctx.reply("Seleção inválida.");
        return;
    }

    const fields = new InlineKeyboard()
        .text("💰 Valor", "exp_edit_value").row()
        .text("📝 Descrição", "exp_edit_description").row()
        .text("🍔 Alimentação", "exp_edit_cat_alimentacao").row()
        .text("🎮 Lazer", "exp_edit_cat_lazer").row()
        .text("🏠 Necessidades Básicas", "exp_edit_cat_necessidades");
    await ctx.reply("O que deseja editar?", { reply_markup: fields });

    const field_ctx = await conversation.waitForCallbackQuery([
        "exp_edit_value",
        "exp_edit_description",
        ...Object.keys(EDIT_CATEGORIES),
    ]);
    await field_ctx.answerCallbackQuery();
    const field = field_ctx.callbackQuery.data;

    const new_category = field ? EDIT_CATEGORIES[field] : undefined;
    if (new_category) {
        const result = await conversation.external(() =>
            update_expense_controller({ telegram_id, expenses_id, patch: { category: new_category } })
        );
        await ctx.reply(result);
        return;
    }

    if (field === "exp_edit_value") {
        await ctx.reply("Digite o novo valor (ex: 99,90):");
        let parsed: number | null = null;
        while (parsed === null) {
            const value_ctx = await conversation.waitFor("message:text");
            parsed = parse_money_to_cents(value_ctx.message.text);
            if (parsed === null) await ctx.reply("Valor inválido. Tente novamente.");
        }
        const value = parsed;
        const result = await conversation.external(() =>
            update_expense_controller({ telegram_id, expenses_id, patch: { value } })
        );
        await ctx.reply(result);
        return;
    }

    await ctx.reply("Digite a nova descrição:");
    const desc_ctx = await conversation.waitFor("message:text");
    const description = desc_ctx.message.text;
    const result = await conversation.external(() =>
        update_expense_controller({ telegram_id, expenses_id, patch: { description } })
    );
    await ctx.reply(result);
}
