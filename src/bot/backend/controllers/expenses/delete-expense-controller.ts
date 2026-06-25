import { delete_expense_repository } from "@/bot/backend/repositories/expenses/delete-expense-repository";
import type { EditScope } from "@/bot/backend/repositories/expenses/update-expense-repository";

interface DeleteExpenseInput {
    telegram_id: string;
    expenses_id: string;
    scope?: EditScope;
}

async function delete_expense_controller({ telegram_id, expenses_id, scope }: DeleteExpenseInput): Promise<string> {
    const deleted = await delete_expense_repository({ telegram_id, expenses_id, scope });
    return deleted ? "✅ Despesa excluída com sucesso!" : "❌ Despesa não encontrada ou sem permissão.";
}

export { delete_expense_controller };
