import { accounts_conversations } from "./accounts";
import { expenses_conversations } from "./expenses";
import { incomes_conversations } from "./incomes";

export const all_conversations = [
    ...accounts_conversations,
    ...expenses_conversations,
    ...incomes_conversations,
] as const;
