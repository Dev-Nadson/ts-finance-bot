import {
    list_expenses_repository,
    type ExpenseSummary,
} from "@/bot/backend/repositories/expenses/list-expenses-repository";

interface PickerInput {
    telegram_id: string;
    account_id: string;
    competence: string;
}

/** Raw expense rows for building the edit/delete inline-button picker. */
async function get_expenses_for_picker_controller(input: PickerInput): Promise<ExpenseSummary[]> {
    return list_expenses_repository(input);
}

export { get_expenses_for_picker_controller };
