import { list_incomes_repository } from "@/bot/backend/repositories/incomes/list-incomes-repository";
import { format_cents } from "@/libs/currency";
import { format_competence } from "@/libs/dayjs";

interface ListIncomesInput {
    telegram_id: string;
    account_id: string;
    competence: string;
}

async function list_incomes_controller({ telegram_id, account_id, competence }: ListIncomesInput): Promise<string> {
    const incomes = await list_incomes_repository({ telegram_id, account_id, competence });

    if (incomes.length === 0) {
        return `Nenhuma receita registrada em ${format_competence(competence)}.`;
    }

    const lines = incomes.map((income) => {
        const type = income.type ? ` (${income.type})` : "";
        return `• ${format_cents(income.value)} - ${income.description ?? "-"}${type}`;
    });

    return `💰 *Receitas - ${format_competence(competence)}*\n\n${lines.join("\n")}`;
}

export { list_incomes_controller };
