import { conn } from "@/database/config";

interface DeleteExpenseInput {
    telegram_id: string;
    expenses_id: string;
}

/** Soft delete: stamps `delete_at` so the row is excluded from lists and balance. */
async function delete_expense_repository({ telegram_id, expenses_id }: DeleteExpenseInput): Promise<boolean> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return false;

    const affected = await conn("expenses")
        .where({ expenses_id, user_id: user.id })
        .whereNull("delete_at")
        .update({ delete_at: conn.fn.now() });

    return affected > 0;
}

export { delete_expense_repository };
