import { conn } from "@/database/config";
import { create_id } from "@/libs/utils";
import { shift_competence } from "@/libs/dayjs";

interface CreateExpenseSeriesInput {
    account_id: string;
    user_id: string;
    value: number; // integer cents
    description: string;
    category: string;
    sector: string;
    start_competence: string;
}

interface ExpenseSeries {
    series_id: string;
    account_id: string;
    user_id: string;
    value: number;
    description: string | null;
    category: string | null;
    sector: string | null;
    start_competence: string;
    end_competence: string | null;
    active: boolean;
}

/** Create a recurring expense template. Returns the new `series_id`. */
async function create_expense_series(input: CreateExpenseSeriesInput): Promise<string> {
    const series_id = create_id();
    await conn("expense_series").insert({
        series_id,
        account_id: input.account_id,
        user_id: input.user_id,
        value: input.value,
        description: input.description,
        category: input.category,
        sector: input.sector,
        start_competence: input.start_competence,
    });
    return series_id;
}

interface ExpenseSeriesPatch {
    value?: number;
    description?: string;
    category?: string;
    sector?: string;
}

/** Update the canonical values of a series (used by "este + futuros" edits). */
async function update_expense_series(series_id: string, patch: ExpenseSeriesPatch): Promise<void> {
    const fields: Record<string, unknown> = { updated_at: conn.fn.now() };
    if (patch.value !== undefined) fields.value = patch.value;
    if (patch.description !== undefined) fields.description = patch.description;
    if (patch.category !== undefined) fields.category = patch.category;
    if (patch.sector !== undefined) fields.sector = patch.sector;
    await conn("expense_series").where({ series_id }).update(fields);
}

/** Stop a recurring series so `competence` and later months no longer recur. */
async function stop_expense_series(series_id: string, competence: string): Promise<void> {
    await conn("expense_series").where({ series_id }).update({
        active: false,
        end_competence: shift_competence(competence, -1),
        updated_at: conn.fn.now(),
    });
}

/** Active series that should have an occurrence in `competence`. */
async function list_active_expense_series(
    account_id: string,
    user_id: string,
    competence: string
): Promise<ExpenseSeries[]> {
    const rows = await conn("expense_series")
        .where({ account_id, user_id, active: true })
        .where("start_competence", "<=", competence)
        .where((qb) => qb.whereNull("end_competence").orWhere("end_competence", ">=", competence))
        .select("*");
    return rows as ExpenseSeries[];
}

export {
    create_expense_series,
    update_expense_series,
    stop_expense_series,
    list_active_expense_series,
};
export type { ExpenseSeries, ExpenseSeriesPatch };
