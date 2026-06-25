import { Bot, GrammyError, HttpError, session } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { env } from "@/libs/environments";
import type { BotContext, SessionData } from "./context";
import { index_commands } from "./frontend/commands";
import { all_conversations } from "./frontend/conversations";

const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN);

bot.use(session({ initial: (): SessionData => ({}) }));
bot.use(conversations());
for (const fn of all_conversations) {
    bot.use(createConversation(fn));
}
bot.use(index_commands);

bot.catch(async (err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);

    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }

    // Always acknowledge callback queries so the user's button stops spinning.
    if (ctx.callbackQuery) {
        await ctx
            .answerCallbackQuery({ text: "Ops, algo deu errado. Tente novamente.", show_alert: false })
            .catch(() => {});
    }
});

bot.start();
