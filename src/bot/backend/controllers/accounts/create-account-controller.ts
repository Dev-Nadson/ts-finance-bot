import { create_account_repository } from "@/bot/backend/repositories/accounts/create-account-repository";

interface CreateAccountInput {
    telegram_id: string;
    name: string;
    password: string;
}

async function create_account_controller(input: CreateAccountInput): Promise<string> {
    return create_account_repository(input);
}

export { create_account_controller };
