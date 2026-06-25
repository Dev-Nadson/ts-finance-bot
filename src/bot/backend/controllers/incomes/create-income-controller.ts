import { create_income_repository } from "@/bot/backend/repositories/incomes/create-income-repository";
import { format_cents } from "@/libs/currency";

interface CreateIncomeInput {
    telegram_id: string;
    account_id: string;
    value: number; // integer cents
    type: string;
    description: string;
    competence: string;
}

async function create_income_controller({
    telegram_id,
    account_id,
    value,
    type,
    description,
    competence,
}: CreateIncomeInput): Promise<string> {
    const created = await create_income_repository({
        telegram_id,
        account_id,
        value,
        type,
        description,
        competence,
    });

    if (!created) {
        return "❌ Não foi possível registrar a receita. Verifique se você tem acesso à conta.";
    }

    return `✅ Receita registrada: ${description} - ${format_cents(value)} (${type})`;
}

export { create_income_controller };
