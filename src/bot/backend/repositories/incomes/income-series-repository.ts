import { conn } from "@/database/config";
import { create_id } from "@/libs/utils";
import { shift_competence } from "@/libs/dayjs";

interface CreateIncomeSeriesInput {
    account_id: string;
    user_id: string;
    value: number; // integer cents
    description: string;
    start_competence: string;
}

interface IncomeSeries {
    series_id: string;
    account_id: string;
    user_id: string;
    value: number;
    description: string | null;
    start_competence: string;
    end_competence: string | null;
    active: boolean;
}

/** Create a recurring income template. Returns the new `series_id`. */
async function create_income_series(input: CreateIncomeSeriesInput): Promise<string> {
    const series_id = create_id();
    await conn("income_series").insert({
        series_id,
        account_id: input.account_id,
        user_id: input.user_id,
        value: input.value,
        description: input.description,
        start_competence: input.start_competence,
    });
    return series_id;
}

interface IncomeSeriesPatch {
    value?: number;
    description?: string;
}

/** Update the canonical values of a series (used by "este + futuros" edits). */
async function update_income_series(series_id: string, patch: IncomeSeriesPatch): Promise<void> {
    const fields: Record<string, unknown> = { updated_at: conn.fn.now() };
    if (patch.value !== undefined) fields.value = patch.value;
    if (patch.description !== undefined) fields.description = patch.description;
    await conn("income_series").where({ series_id }).update(fields);
}

/** Stop a recurring series so `competence` and later months no longer recur. */
async function stop_income_series(series_id: string, competence: string): Promise<void> {
    await conn("income_series").where({ series_id }).update({
        active: false,
        end_competence: shift_competence(competence, -1),
        updated_at: conn.fn.now(),
    });
}

/** Active series that should have an occurrence in `competence`. */
async function list_active_income_series(
    account_id: string,
    user_id: string,
    competence: string
): Promise<IncomeSeries[]> {
    const rows = await conn("income_series")
        .where({ account_id, user_id, active: true })
        .where("start_competence", "<=", competence)
        .where((qb) => qb.whereNull("end_competence").orWhere("end_competence", ">=", competence))
        .select("*");
    return rows as IncomeSeries[];
}

export {
    create_income_series,
    update_income_series,
    stop_income_series,
    list_active_income_series,
};
export type { IncomeSeries, IncomeSeriesPatch };
