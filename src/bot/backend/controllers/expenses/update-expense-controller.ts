import {
    update_expense_repository,
    type UpdateExpensePatch,
} from "@/bot/backend/repositories/expenses/update-expense-repository";

interface UpdateExpenseInput {
    telegram_id: string;
    expenses_id: string;
    patch: UpdateExpensePatch;
}

async function update_expense_controller({ telegram_id, expenses_id, patch }: UpdateExpenseInput): Promise<string> {
    const updated = await update_expense_repository({ telegram_id, expenses_id, patch });
    return updated ? "✅ Despesa atualizada com sucesso!" : "❌ Despesa não encontrada ou sem permissão.";
}

export { update_expense_controller };
