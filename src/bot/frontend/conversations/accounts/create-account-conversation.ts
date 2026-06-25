import type { Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import type { BotContext } from "@/bot/context";
import { create_account_controller } from "@/bot/backend/controllers/accounts/create-account-controller";

export async function create_account_conversation(
    conversation: Conversation<BotContext, Context>,
    ctx: Context
): Promise<void> {
    await ctx.reply("💳 *Criar nova conta*\nQual será o nome da conta?", { parse_mode: "Markdown" });

    const name_ctx = await conversation.waitFor("message:text");
    const account_name = name_ctx.message.text;

    await ctx.reply("🔐 Digite uma senha para a conta:");

    const pass_ctx = await conversation.waitFor("message:text");
    const password = pass_ctx.message.text;

    const telegram_id = ctx.from!.id.toString();

    const result = await conversation.external(() =>
        create_account_controller({ telegram_id, name: account_name, password })
    );

    await ctx.reply(result, { parse_mode: "Markdown" });
}
