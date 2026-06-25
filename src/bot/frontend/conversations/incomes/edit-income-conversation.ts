import { InlineKeyboard, type Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import type { BotContext } from "@/bot/context";
import { get_incomes_for_picker_controller } from "@/bot/backend/controllers/incomes/get-incomes-for-picker-controller";
import { update_income_controller } from "@/bot/backend/controllers/incomes/update-income-controller";
import { format_cents, parse_money_to_cents } from "@/libs/currency";
import type { UpdateIncomePatch } from "@/bot/backend/repositories/incomes/update-income-repository";

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
    const is_recurring = !!incomes.find((i) => i.incomes_id === incomes_id)?.series_id;

    const fields = new InlineKeyboard()
        .text("💰 Valor", "inc_edit_value").row()
        .text("📝 Descrição", "inc_edit_description");
    await ctx.reply("O que deseja editar?", { reply_markup: fields });

    const field_ctx = await conversation.waitForCallbackQuery(["inc_edit_value", "inc_edit_description"]);
    await field_ctx.answerCallbackQuery();

    const patch: UpdateIncomePatch = {};
    if (field_ctx.callbackQuery.data === "inc_edit_value") {
        await ctx.reply("Digite o novo valor (ex: 2000,00):");
        let parsed: number | null = null;
        while (parsed === null) {
            const value_ctx = await conversation.waitFor("message:text");
            parsed = parse_money_to_cents(value_ctx.message.text);
            if (parsed === null) await ctx.reply("Valor inválido. Tente novamente.");
        }
        patch.value = parsed;
    } else {
        await ctx.reply("Digite a nova descrição:");
        const desc_ctx = await conversation.waitFor("message:text");
        patch.description = desc_ctx.message.text;
    }

    const scope = await ask_edit_scope(conversation, ctx, is_recurring);

    const result = await conversation.external(() =>
        update_income_controller({ telegram_id, incomes_id, patch, scope })
    );
    await ctx.reply(result);
}

/** For recurring (Mensal) items, ask whether the change is local or propagates. */
async function ask_edit_scope(
    conversation: Conversation<BotContext, Context>,
    ctx: Context,
    is_recurring: boolean
): Promise<"single" | "future"> {
    if (!is_recurring) return "single";

    const keyboard = new InlineKeyboard()
        .text("📌 Só este mês", "scope_single").row()
        .text("🔁 Este + futuros", "scope_future");
    await ctx.reply("Esta receita é mensal. Aplicar a alteração em:", { reply_markup: keyboard });

    const scope_ctx = await conversation.waitForCallbackQuery(["scope_single", "scope_future"]);
    await scope_ctx.answerCallbackQuery();
    return scope_ctx.callbackQuery.data === "scope_future" ? "future" : "single";
}
