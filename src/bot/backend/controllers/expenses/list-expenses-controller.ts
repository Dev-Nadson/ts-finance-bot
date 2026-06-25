import { list_expenses_repository } from "@/bot/backend/repositories/expenses/list-expenses-repository";
import { format_cents } from "@/libs/currency";
import { format_competence } from "@/libs/dayjs";

interface ListExpensesInput {
    telegram_id: string;
    account_id: string;
    competence: string;
}

async function list_expenses_controller({ telegram_id, account_id, competence }: ListExpensesInput): Promise<string> {
    const expenses = await list_expenses_repository({ telegram_id, account_id, competence });

    if (expenses.length === 0) {
        return `Nenhuma despesa registrada em ${format_competence(competence)}.`;
    }

    const lines = expenses.map((expense) => {
        const category = expense.category ? ` [${expense.category}]` : "";
        return `• ${format_cents(expense.value)} - ${expense.description ?? "-"}${category}`;
    });

    return `💸 *Despesas - ${format_competence(competence)}*\n\n${lines.join("\n")}`;
}

export { list_expenses_controller };
