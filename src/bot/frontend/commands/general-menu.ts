import { Composer, InlineKeyboard } from "grammy";
import type { BotContext } from "@/bot/context";
import { get_active_account_controller } from "@/bot/backend/controllers/accounts/get-active-account-controller";
import { calculate_balance_controller } from "@/bot/backend/controllers/balance/calculate-balance-controller";
import { current_competence, format_competence, recent_competences } from "@/libs/dayjs";

export const menu_command = new Composer<BotContext>();

const menuKeyboard = new InlineKeyboard()
    .text("💳 Contas", "accounts_menu").row()
    .text("💰 Receitas", "incomes_menu").row()
    .text("💸 Despesas", "expenses_menu").row()
    .text("📊 Saldo Geral", "show_balance").row()
    .text("📅 Escolher Mês", "months_menu");

function active_competence(ctx: BotContext): string {
    return ctx.session.active_competence ?? current_competence();
}

async function render_main_menu(ctx: BotContext): Promise<string> {
    const active_account = await get_active_account_controller(ctx);
    const competence = format_competence(active_competence(ctx));

    return (
        "🏠 *Menu Principal*\n\n" +
        `🔵 Conta ativa: *${active_account}*\n` +
        `📅 Mês ativo: *${competence}*\n\n` +
        "Escolha uma opção:"
    );
}

menu_command.command("menu", async (ctx) => {
    await ctx.reply(await render_main_menu(ctx), { reply_markup: menuKeyboard, parse_mode: "Markdown" });
});

menu_command.callbackQuery("main_menu", async (ctx) => {
    await ctx.editMessageText(await render_main_menu(ctx), { reply_markup: menuKeyboard, parse_mode: "Markdown" });
    await ctx.answerCallbackQuery();
});

menu_command.callbackQuery("show_balance", async (ctx) => {
    const keyboard = new InlineKeyboard().text("🔙 Voltar", "main_menu");
    const text = await calculate_balance_controller(ctx, active_competence(ctx));

    await ctx.editMessageText(text, { reply_markup: keyboard, parse_mode: "Markdown" });
    await ctx.answerCallbackQuery();
});

menu_command.callbackQuery("months_menu", async (ctx) => {
    const keyboard = new InlineKeyboard();
    for (const competence of recent_competences(6)) {
        keyboard.text(format_competence(competence), `competence_set_${competence}`).row();
    }
    keyboard.text("🔙 Voltar", "main_menu");

    await ctx.editMessageText("📅 *Escolher Período*\n\nSelecione o mês para visualização:", {
        reply_markup: keyboard,
        parse_mode: "Markdown",
    });
    await ctx.answerCallbackQuery();
});

menu_command.callbackQuery(/^competence_set_(.+)$/, async (ctx) => {
    const competence = ctx.match[1];
    if (competence) {
        ctx.session.active_competence = competence;
        await ctx.answerCallbackQuery(`Período alterado para ${format_competence(competence)}`);
    } else {
        await ctx.answerCallbackQuery();
    }

    await ctx.editMessageText(await render_main_menu(ctx), { reply_markup: menuKeyboard, parse_mode: "Markdown" });
});
