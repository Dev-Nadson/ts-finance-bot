import { createId } from "@paralleldrive/cuid2";
import { compare, hash } from "bcrypt";
import { env } from "./environments";

export function create_id(): string {
    return createId()
}

export async function hash_password(text: string): Promise<string> {
    return hash(text, env.BCRYPT_ROUNDS)
}

export async function compare_password(text: string, hashed: string): Promise<boolean> {
    return compare(text, hashed)
}
