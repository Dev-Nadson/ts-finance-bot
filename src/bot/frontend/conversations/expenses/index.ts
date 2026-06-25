import { add_expense_conversation } from "./add-expense-conversation";
import { edit_expense_conversation } from "./edit-expense-conversation";
import { delete_expense_conversation } from "./delete-expense-conversation";

export const expenses_conversations = [
    add_expense_conversation,
    edit_expense_conversation,
    delete_expense_conversation,
] as const;
