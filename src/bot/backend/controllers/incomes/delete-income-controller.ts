import { delete_income_repository } from "@/bot/backend/repositories/incomes/delete-income-repository";

interface DeleteIncomeInput {
    telegram_id: string;
    incomes_id: string;
}

async function delete_income_controller({ telegram_id, incomes_id }: DeleteIncomeInput): Promise<string> {
    const deleted = await delete_income_repository({ telegram_id, incomes_id });
    return deleted ? "✅ Receita excluída com sucesso!" : "❌ Receita não encontrada ou sem permissão.";
}

export { delete_income_controller };
