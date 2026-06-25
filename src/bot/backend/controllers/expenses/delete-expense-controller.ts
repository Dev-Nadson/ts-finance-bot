import { delete_expense_repository } from "@/bot/backend/repositories/expenses/delete-expense-repository";

interface DeleteExpenseInput {
    telegram_id: string;
    expenses_id: string;
}

async function delete_expense_controller({ telegram_id, expenses_id }: DeleteExpenseInput): Promise<string> {
    const deleted = await delete_expense_repository({ telegram_id, expenses_id });
    return deleted ? "✅ Despesa excluída com sucesso!" : "❌ Despesa não encontrada ou sem permissão.";
}

export { delete_expense_controller };
