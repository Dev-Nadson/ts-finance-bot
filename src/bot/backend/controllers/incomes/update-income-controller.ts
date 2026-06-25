import {
    update_income_repository,
    type UpdateIncomePatch,
    type EditScope,
} from "@/bot/backend/repositories/incomes/update-income-repository";

interface UpdateIncomeInput {
    telegram_id: string;
    incomes_id: string;
    patch: UpdateIncomePatch;
    scope?: EditScope;
}

async function update_income_controller({ telegram_id, incomes_id, patch, scope }: UpdateIncomeInput): Promise<string> {
    const updated = await update_income_repository({ telegram_id, incomes_id, patch, scope });
    return updated ? "✅ Receita atualizada com sucesso!" : "❌ Receita não encontrada ou sem permissão.";
}

export { update_income_controller };
