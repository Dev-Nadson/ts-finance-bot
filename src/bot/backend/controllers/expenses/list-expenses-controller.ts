import { list_expenses_repository } from "@/bot/backend/repositories/expenses/list-expenses-repository";
import { materialize_recurring } from "@/bot/backend/repositories/shared/materialize-recurring";
import { format_cents } from "@/libs/currency";
import { format_competence } from "@/libs/dayjs";
import { TYPE_LABELS } from "@/libs/constants";

interface ListExpensesInput {
    telegram_id: string;
    account_id: string;
    competence: string;
}

async function list_expenses_controller({ telegram_id, account_id, competence }: ListExpensesInput): Promise<string> {
    await materialize_recurring({ telegram_id, account_id, competence });
    const expenses = await list_expenses_repository({ telegram_id, account_id, competence });

    if (expenses.length === 0) {
        return `Nenhuma despesa registrada em ${format_competence(competence)}.`;
    }

    const lines = expenses.map((expense) => {
        const tags = [expense.category, expense.sector].filter(Boolean).join(" · ");
        const tag_label = tags ? ` [${tags}]` : "";
        const type = TYPE_LABELS[expense.expense_type] ? ` (${TYPE_LABELS[expense.expense_type]})` : "";
        return `• ${format_cents(expense.value)} - ${expense.description ?? "-"}${tag_label}${type}`;
    });

    return `💸 *Despesas - ${format_competence(competence)}*\n\n${lines.join("\n")}`;
}

export { list_expenses_controller };
