import { create_expense_repository } from "@/bot/backend/repositories/expenses/create-expense-repository";
import { format_cents } from "@/libs/currency";

interface CreateExpenseInput {
    telegram_id: string;
    account_id: string;
    value: number; // integer cents
    category: string;
    description: string;
    competence: string;
}

async function create_expense_controller({
    telegram_id,
    account_id,
    value,
    category,
    description,
    competence,
}: CreateExpenseInput): Promise<string> {
    const created = await create_expense_repository({
        telegram_id,
        account_id,
        value,
        type: category,
        category,
        description,
        competence,
    });

    if (!created) {
        return "❌ Não foi possível registrar a despesa. Verifique se você tem acesso à conta.";
    }

    return `✅ Despesa registrada: ${description} - ${format_cents(value)} [${category}]`;
}

export { create_expense_controller };
