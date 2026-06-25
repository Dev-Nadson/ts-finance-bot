import type { Context } from "grammy";
import { create_user_repository } from "@/bot/backend/repositories/users/create-user-repository";

async function create_user_controller(ctx: Context): Promise<string> {
    const telegram_id = ctx.from!.id.toString();
    const name = [ctx.from!.first_name, ctx.from!.last_name].filter(Boolean).join(" ");

    return create_user_repository({ telegram_id, name });
}

export { create_user_controller };
