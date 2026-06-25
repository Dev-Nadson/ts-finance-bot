import { InlineKeyboard, type Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import type { BotContext } from "@/bot/context";
import { get_expenses_for_picker_controller } from "@/bot/backend/controllers/expenses/get-expenses-for-picker-controller";
import { update_expense_controller } from "@/bot/backend/controllers/expenses/update-expense-controller";
import { format_cents, parse_money_to_cents } from "@/libs/currency";
import { EXPENSE_SECTORS } from "@/libs/constants";
import type { UpdateExpensePatch } from "@/bot/backend/repositories/expenses/update-expense-repository";

const CATEGORIES: Record<string, string> = {
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
    const is_recurring = !!expenses.find((e) => e.expenses_id === expenses_id)?.series_id;

    const fields = new InlineKeyboard()
        .text("💰 Valor", "exp_edit_value").row()
        .text("📝 Descrição", "exp_edit_description").row()
        .text("🏷️ Categoria", "exp_edit_category").row()
        .text("🗂️ Setor", "exp_edit_sector");
    await ctx.reply("O que deseja editar?", { reply_markup: fields });

    const field_ctx = await conversation.waitForCallbackQuery([
        "exp_edit_value",
        "exp_edit_description",
        "exp_edit_category",
        "exp_edit_sector",
    ]);
    await field_ctx.answerCallbackQuery();
    const field = field_ctx.callbackQuery.data;

    const patch: UpdateExpensePatch = {};
    if (field === "exp_edit_value") {
        await ctx.reply("Digite o novo valor (ex: 99,90):");
        let parsed: number | null = null;
        while (parsed === null) {
            const value_ctx = await conversation.waitFor("message:text");
            parsed = parse_money_to_cents(value_ctx.message.text);
            if (parsed === null) await ctx.reply("Valor inválido. Tente novamente.");
        }
        patch.value = parsed;
    } else if (field === "exp_edit_description") {
        await ctx.reply("Digite a nova descrição:");
        const desc_ctx = await conversation.waitFor("message:text");
        patch.description = desc_ctx.message.text;
    } else if (field === "exp_edit_category") {
        const kb = new InlineKeyboard();
        for (const key of Object.keys(CATEGORIES)) kb.text(CATEGORIES[key]!, key).row();
        await ctx.reply("Selecione a nova categoria:", { reply_markup: kb });
        const cat_ctx = await conversation.waitForCallbackQuery(Object.keys(CATEGORIES));
        await cat_ctx.answerCallbackQuery();
        patch.category = (cat_ctx.callbackQuery.data && CATEGORIES[cat_ctx.callbackQuery.data]) || "Outros";
    } else {
        const kb = new InlineKeyboard();
        for (const key of Object.keys(EXPENSE_SECTORS)) kb.text(EXPENSE_SECTORS[key]!, key).row();
        await ctx.reply("Selecione o novo setor:", { reply_markup: kb });
        const sec_ctx = await conversation.waitForCallbackQuery(Object.keys(EXPENSE_SECTORS));
        await sec_ctx.answerCallbackQuery();
        patch.sector = (sec_ctx.callbackQuery.data && EXPENSE_SECTORS[sec_ctx.callbackQuery.data]) || "Outros";
    }

    const scope = await ask_edit_scope(conversation, ctx, is_recurring);

    const result = await conversation.external(() =>
        update_expense_controller({ telegram_id, expenses_id, patch, scope })
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
    await ctx.reply("Esta despesa é mensal. Aplicar a alteração em:", { reply_markup: keyboard });

    const scope_ctx = await conversation.waitForCallbackQuery(["scope_single", "scope_future"]);
    await scope_ctx.answerCallbackQuery();
    return scope_ctx.callbackQuery.data === "scope_future" ? "future" : "single";
}
