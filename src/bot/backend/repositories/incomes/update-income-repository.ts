import { conn } from "@/database/config";

interface UpdateIncomePatch {
    value?: number;
    description?: string;
}

interface UpdateIncomeInput {
    telegram_id: string;
    incomes_id: string;
    patch: UpdateIncomePatch;
}

async function update_income_repository({ telegram_id, incomes_id, patch }: UpdateIncomeInput): Promise<boolean> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return false;

    const fields: Record<string, unknown> = { updated_at: conn.fn.now() };
    if (patch.value !== undefined) fields.value = patch.value;
    if (patch.description !== undefined) fields.description = patch.description;

    const affected = await conn("incomes")
        .where({ incomes_id, user_id: user.id })
        .whereNull("delete_at")
        .update(fields);

    return affected > 0;
}

export { update_income_repository };
export type { UpdateIncomePatch };
