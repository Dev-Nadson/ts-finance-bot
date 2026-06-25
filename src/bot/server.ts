import { Bot, session } from "grammy";
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

bot.start();
