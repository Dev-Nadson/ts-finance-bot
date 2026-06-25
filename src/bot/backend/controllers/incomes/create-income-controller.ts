import { create_income_repository } from "@/bot/backend/repositories/incomes/create-income-repository";
import { format_cents } from "@/libs/currency";
import { TYPE_LABELS } from "@/libs/constants";

interface CreateIncomeInput {
    telegram_id: string;
    account_id: string;
    value: number; // integer cents
    income_type: number; // INCOMES_TYPES
    description: string;
    competence: string;
}

async function create_income_controller({
    telegram_id,
    account_id,
    value,
    income_type,
    description,
    competence,
}: CreateIncomeInput): Promise<string> {
    const created = await create_income_repository({
        telegram_id,
        account_id,
        value,
        income_type,
        description,
        competence,
    });

    if (!created) {
        return "❌ Não foi possível registrar a receita. Verifique se você tem acesso à conta.";
    }

    return `✅ Receita registrada: ${description} - ${format_cents(value)} (${TYPE_LABELS[income_type]})`;
}

export { create_income_controller };
