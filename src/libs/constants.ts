/**
 * Shared option sets for incomes/expenses. Stored in the DB as the integer
 * codes below; rendered to the user via the label maps.
 */

// 1 = Mensal (recorrente), 2 = Avulso (único).
export const INCOMES_TYPES = { MENSAL: 1, AVULSO: 2 } as const;
export const EXPENSES_TYPES = { MENSAL: 1, AVULSO: 2 } as const;

export type LaunchType = (typeof INCOMES_TYPES)[keyof typeof INCOMES_TYPES];

export const TYPE_LABELS: Record<number, string> = {
    1: "🔁 Mensal",
    2: "1️⃣ Avulso",
};

// Callback key -> rótulo. Mirrors the Record<string,string> pattern used for
// expense categories. Extend this list to add more sectors.
export const EXPENSE_SECTORS: Record<string, string> = {
    exp_sec_alimentacao: "Alimentação",
    exp_sec_saude: "Saúde",
    exp_sec_transporte: "Transporte",
    exp_sec_educacao: "Educação",
    exp_sec_moradia: "Moradia",
    exp_sec_outros: "Outros",
};
