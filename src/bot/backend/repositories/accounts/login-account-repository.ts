import { conn } from "@/database/config";
import { compare_password } from "@/libs/utils";

type LoginResult =
    | { status: "ok"; id: string; name: string }
    | { status: "user_not_found" }
    | { status: "not_found" }
    | { status: "wrong_password" };

interface LoginAccountInput {
    telegram_id: string;
    name: string;
    password: string;
}

/**
 * Verify account credentials by name + password. On success, link the user to
 * the account (if not already linked) and persist it as the active account.
 */
async function login_account_repository({
    telegram_id,
    name,
    password,
}: LoginAccountInput): Promise<LoginResult> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return { status: "user_not_found" };

    const account = await conn("accounts").where({ name }).whereNull("deleted_at").first();
    if (!account) return { status: "not_found" };

    const matches = await compare_password(password, account.password);
    if (!matches) return { status: "wrong_password" };

    const membership = await conn("users-accounts")
        .where({ user_id: user.id, account_id: account.id })
        .first();
    if (!membership) {
        await conn("users-accounts").insert({ user_id: user.id, account_id: account.id });
    }

    await conn("users")
        .where({ id: user.id })
        .update({ active_account_id: account.id, updated_at: conn.fn.now() });

    return { status: "ok", id: account.id, name: account.name };
}

export { login_account_repository };
export type { LoginResult };
