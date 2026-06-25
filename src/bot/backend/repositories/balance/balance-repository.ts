import { conn } from "@/database/config";
import { resolve_member } from "@/bot/backend/repositories/shared/resolve-member";

interface CalculateBalanceInput {
    telegram_id: string;
    account_id: string;
    competence?: string;
}

interface BalanceResult {
    incomes_cents: number;
    expenses_cents: number;
    balance_cents: number;
}

/** Account-wide sum of `value` (cents), optionally scoped to a competence. */
async function sum_value(table: "incomes" | "expenses", account_id: string, competence?: string): Promise<number> {
    const rows = await conn(table)
        .where({ account_id })
        .whereNull("delete_at")
        .modify((qb) => {
            if (competence !== undefined) qb.where({ competence });
        })
        .sum({ total: "value" });

    const total = rows[0]?.total;
    return total != null ? Number(total) : 0;
}

/**
 * Balance for an account: total incomes minus total expenses (in cents). When
 * `competence` is given, only that period is summed; otherwise it's all-time.
 * Returns `null` when the user is not a member of the account.
 */
async function calculate_balance_repository({
    telegram_id,
    account_id,
    competence,
}: CalculateBalanceInput): Promise<BalanceResult | null> {
    const member = await resolve_member({ telegram_id, account_id });
    if (!member) return null;

    const incomes_cents = await sum_value("incomes", account_id, competence);
    const expenses_cents = await sum_value("expenses", account_id, competence);

    return { incomes_cents, expenses_cents, balance_cents: incomes_cents - expenses_cents };
}

export { calculate_balance_repository };
export type { BalanceResult };
