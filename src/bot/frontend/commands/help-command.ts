import { Composer } from "grammy";
import type { BotContext } from "@/bot/context";

export const help_command = new Composer<BotContext>();

const help_text =
    "💳 *Contas*\n" +
    "Crie, acesse e troque de conta pelo menu 💳 Contas.\n\n" +
    "💸 *Receitas e Despesas*\n" +
    "Registre e acompanhe suas movimentações pelo /menu.\n\n" +
    "📅 *Período (competência)*\n" +
    "Use 📅 Escolher Mês para definir o período em foco.\n\n" +
    "⚙️ *Geral*\n" +
    "`/start` - inicia o bot\n" +
    "`/menu` - exibe o menu principal interativo\n" +
    "`/help` - exibe esta mensagem de ajuda\n";

help_command.command("help", (ctx) => ctx.reply(help_text, { parse_mode: "Markdown" }));
