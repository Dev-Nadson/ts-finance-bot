import {
    update_expense_repository,
    type UpdateExpensePatch,
    type EditScope,
} from "@/bot/backend/repositories/expenses/update-expense-repository";

interface UpdateExpenseInput {
    telegram_id: string;
    expenses_id: string;
    patch: UpdateExpensePatch;
    scope?: EditScope;
}

async function update_expense_controller({ telegram_id, expenses_id, patch, scope }: UpdateExpenseInput): Promise<string> {
    const updated = await update_expense_repository({ telegram_id, expenses_id, patch, scope });
    return updated ? "✅ Despesa atualizada com sucesso!" : "❌ Despesa não encontrada ou sem permissão.";
}

export { update_expense_controller };
