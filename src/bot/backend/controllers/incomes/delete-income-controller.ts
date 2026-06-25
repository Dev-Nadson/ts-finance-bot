import { delete_income_repository } from "@/bot/backend/repositories/incomes/delete-income-repository";
import type { EditScope } from "@/bot/backend/repositories/incomes/update-income-repository";

interface DeleteIncomeInput {
    telegram_id: string;
    incomes_id: string;
    scope?: EditScope;
}

async function delete_income_controller({ telegram_id, incomes_id, scope }: DeleteIncomeInput): Promise<string> {
    const deleted = await delete_income_repository({ telegram_id, incomes_id, scope });
    return deleted ? "✅ Receita excluída com sucesso!" : "❌ Receita não encontrada ou sem permissão.";
}

export { delete_income_controller };
