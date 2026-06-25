import { conn } from "@/database/config";

interface DeleteIncomeInput {
    telegram_id: string;
    incomes_id: string;
}

/** Soft delete: stamps `delete_at` so the row is excluded from lists and balance. */
async function delete_income_repository({ telegram_id, incomes_id }: DeleteIncomeInput): Promise<boolean> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return false;

    const affected = await conn("incomes")
        .where({ incomes_id, user_id: user.id })
        .whereNull("delete_at")
        .update({ delete_at: conn.fn.now() });

    return affected > 0;
}

export { delete_income_repository };
