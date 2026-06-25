import { conn } from "@/database/config";

interface ResolveMemberInput {
    telegram_id: string;
    account_id: string;
}

/**
 * Resolve the user behind a `telegram_id` and verify they belong to `account_id`
 * via the `users-accounts` join. Returns `{ user_id }` or `null` when the user
 * doesn't exist or has no access to the account. Shared guard for every
 * expense/income/balance repository (mirrors set-active-account-repository).
 */
async function resolve_member({ telegram_id, account_id }: ResolveMemberInput): Promise<{ user_id: string } | null> {
    const user = await conn("users").where({ telegram_id }).first();
    if (!user) return null;

    const membership = await conn("users-accounts").where({ user_id: user.id, account_id }).first();
    if (!membership) return null;

    return { user_id: user.id };
}

export { resolve_member };
