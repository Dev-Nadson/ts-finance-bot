import { add_income_conversation } from "./add-income-conversation";
import { edit_income_conversation } from "./edit-income-conversation";
import { delete_income_conversation } from "./delete-income-conversation";

export const incomes_conversations = [
    add_income_conversation,
    edit_income_conversation,
    delete_income_conversation,
] as const;
