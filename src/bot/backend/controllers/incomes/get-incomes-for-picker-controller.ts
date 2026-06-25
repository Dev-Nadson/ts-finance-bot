import {
    list_incomes_repository,
    type IncomeSummary,
} from "@/bot/backend/repositories/incomes/list-incomes-repository";

interface PickerInput {
    telegram_id: string;
    account_id: string;
    competence: string;
}

/** Raw income rows for building the edit/delete inline-button picker. */
async function get_incomes_for_picker_controller(input: PickerInput): Promise<IncomeSummary[]> {
    return list_incomes_repository(input);
}

export { get_incomes_for_picker_controller };
