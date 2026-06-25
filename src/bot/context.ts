import type { Context, SessionFlavor } from "grammy";
import type { ConversationFlavor } from "@grammyjs/conversations";

/**
 * Per-chat session data. Mirrors the in-memory state the original Python bot
 * kept in `context.user_data`: the active "competência" (period) the user is
 * currently browsing. The active account is NOT kept here - it is persisted in
 * the database (`users.active_account_id`).
 */
export interface SessionData {
    active_competence?: string;
}

export type BotContext = ConversationFlavor<Context & SessionFlavor<SessionData>>;
