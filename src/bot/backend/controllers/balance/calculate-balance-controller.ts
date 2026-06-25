import type { Context } from "grammy";
import { get_active_account_repository } from "@/bot/backend/repositories/accounts/get-active-account-repository";
import { calculate_balance_repository } from "@/bot/backend/repositories/balance/balance-repository";
import { format_cents } from "@/libs/currency";
import { format_competence } from "@/libs/dayjs";

/**
 * Build the "Saldo Geral" message for the active account: the balance for the
 * given competence (active month) AND the all-time accumulated balance.
 */
async function calculate_balance_controller(ctx: Context, competence: string): Promise<string> {
    const telegram_id = ctx.from?.id.toString();
    if (!telegram_id) return "❌ Não foi possível identificar o usuário.";

    const account = await get_active_account_repository(telegram_id);
    if (!account) return "Selecione uma conta primeiro em 💳 Contas.";

    const month = await calculate_balance_repository({ telegram_id, account_id: account.id, competence });
    const total = await calculate_balance_repository({ telegram_id, account_id: account.id });
    if (!month || !total) return "❌ Não foi possível calcular o saldo.";

    return (
        `📊 *Saldo Geral - ${account.name}*\n` +
        `📅 ${format_competence(competence)}\n` +
        `💰 Receitas: ${format_cents(month.incomes_cents)}\n` +
        `💸 Despesas: ${format_cents(month.expenses_cents)}\n` +
        `⚖️ Saldo do mês: ${format_cents(month.balance_cents)}\n\n` +
        `Σ *Acumulado (todos os meses)*\n` +
        `💰 Receitas: ${format_cents(total.incomes_cents)}\n` +
        `💸 Despesas: ${format_cents(total.expenses_cents)}\n` +
        `⚖️ Saldo total: ${format_cents(total.balance_cents)}`
    );
}

export { calculate_balance_controller };
