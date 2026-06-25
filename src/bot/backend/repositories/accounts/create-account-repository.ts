import { conn } from "@/database/config";
import { create_id, hash_password } from "@/libs/utils";

interface CreateAccountInput {
    telegram_id: string;
    name: string;
    password: string;
}

async function create_account_repository({ telegram_id, name, password }: CreateAccountInput): Promise<string> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) {
        return "❌ Usuário não encontrado. Use /start primeiro.";
    }

    const existing_account = await conn("accounts")
        .where({ name })
        .whereNull("deleted_at")
        .first();
    if (existing_account) {
        return `❌ Já existe uma conta chamada *${name}*. Escolha outro nome.`;
    }

    await conn.transaction(async (trx) => {
        const account_id = create_id();

        await trx("accounts").insert({
            id: account_id,
            name,
            password: await hash_password(password),
        });

        await trx("users-accounts").insert({
            user_id: user.id,
            account_id,
        });
    })

    return `✅ Conta *${name}* criada com sucesso!`;
}

export { create_account_repository };
