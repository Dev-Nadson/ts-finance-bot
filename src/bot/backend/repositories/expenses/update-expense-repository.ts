import { conn } from "@/database/config";

interface UpdateExpensePatch {
    value?: number;
    category?: string;
    description?: string;
}

interface UpdateExpenseInput {
    telegram_id: string;
    expenses_id: string;
    patch: UpdateExpensePatch;
}

async function update_expense_repository({ telegram_id, expenses_id, patch }: UpdateExpenseInput): Promise<boolean> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return false;

    const fields: Record<string, unknown> = { updated_at: conn.fn.now() };
    if (patch.value !== undefined) fields.value = patch.value;
    if (patch.category !== undefined) fields.category = patch.category;
    if (patch.description !== undefined) fields.description = patch.description;

    const affected = await conn("expenses")
        .where({ expenses_id, user_id: user.id })
        .whereNull("delete_at")
        .update(fields);

    return affected > 0;
}

export { update_expense_repository };
export type { UpdateExpensePatch };
