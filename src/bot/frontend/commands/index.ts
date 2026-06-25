import { Composer } from "grammy";
import type { BotContext } from "@/bot/context";
import { start_command } from "./start-command";
import { menu_command } from "./general-menu";
import { help_command } from "./help-command";
import { accounts_menu } from "./accounts-menu";
import { incomes_menu } from "./incomes-menu";
import { expenses_menu } from "./expenses-menu";

export const index_commands = new Composer<BotContext>();

index_commands.use(
    start_command,
    menu_command,
    help_command,
    accounts_menu,
    incomes_menu,
    expenses_menu
);
