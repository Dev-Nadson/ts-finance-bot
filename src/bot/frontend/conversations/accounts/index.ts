import { create_account_conversation } from "./create-account-conversation";
import { login_account_conversation } from "./login-account-conversation";

export const accounts_conversations = [
    create_account_conversation,
    login_account_conversation,
] as const;
