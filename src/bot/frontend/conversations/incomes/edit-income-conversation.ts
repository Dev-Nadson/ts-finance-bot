import { InlineKeyboard, type Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import type { BotContext } from "@/bot/context";
import { get_incomes_for_picker_controller } from "@/bot/backend/controllers/incomes/get-incomes-for-picker-controller";
import { update_income_controller } from "@/bot/backend/controllers/incomes/update-income-controller";
import { format_cents, parse_money_to_cents } from "@/libs/currency";

export async function edit_income_conversation(
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
        await ctx.reply("Nenhuma receita para editar neste período.");
        return;
    }

    const picker = new InlineKeyboard();
    for (const income of incomes) {
        picker.text(`${format_cents(income.value)} - ${income.description ?? "-"}`, `inc_edit_pick_${income.incomes_id}`).row();
    }
    await ctx.reply("Qual receita deseja editar?", { reply_markup: picker });

    const pick_ctx = await conversation.waitForCallbackQuery(/^inc_edit_pick_(.+)$/);
    await pick_ctx.answerCallbackQuery();
    const incomes_id = pick_ctx.match?.[1];
    if (!incomes_id) {
        await ctx.reply("Seleção inválida.");
        return;
    }

    const fields = new InlineKeyboard()
        .text("💰 Valor", "inc_edit_value").row()
        .text("📝 Descrição", "inc_edit_description");
    await ctx.reply("O que deseja editar?", { reply_markup: fields });

    const field_ctx = await conversation.waitForCallbackQuery(["inc_edit_value", "inc_edit_description"]);
    await field_ctx.answerCallbackQuery();

    if (field_ctx.callbackQuery.data === "inc_edit_value") {
        await ctx.reply("Digite o novo valor (ex: 2000,00):");
        let parsed: number | null = null;
        while (parsed === null) {
            const value_ctx = await conversation.waitFor("message:text");
            parsed = parse_money_to_cents(value_ctx.message.text);
            if (parsed === null) await ctx.reply("Valor inválido. Tente novamente.");
        }
        const value = parsed;
        const result = await conversation.external(() =>
            update_income_controller({ telegram_id, incomes_id, patch: { value } })
        );
        await ctx.reply(result);
        return;
    }

    await ctx.reply("Digite a nova descrição:");
    const desc_ctx = await conversation.waitFor("message:text");
    const description = desc_ctx.message.text;
    const result = await conversation.external(() =>
        update_income_controller({ telegram_id, incomes_id, patch: { description } })
    );
    await ctx.reply(result);
}
