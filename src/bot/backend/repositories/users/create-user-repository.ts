import { conn } from "@/database/config";
import { create_id } from "@/libs/utils";

interface CreateUserInput {
    telegram_id: string;
    name: string;
}

async function create_user_repository({ telegram_id, name }: CreateUserInput): Promise<string> {
    const already_exists_user = await conn("users").where({ telegram_id }).first();

    if (already_exists_user) return `Usuário já cadastrado, bem vindo de volta, ${name}! 👋`;

    await conn("users").insert({
        id: create_id(),
        telegram_id,
        name,
    });

    return `Usuário cadastrado com sucesso, ${name}! 🎉`;
}

export { create_user_repository };