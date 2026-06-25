import currency from "currency.js";

const BRL_OPTIONS: currency.Options = {
    symbol: "R$ ",
    decimal: ",",
    separator: ".",
    precision: 2,
};

export function brl(value: currency.Any, options?: currency.Options): currency {
    return currency(value, { ...BRL_OPTIONS, ...options });
}

/**
 * Parse a user-typed amount into integer cents, or `null` when invalid.
 *
 * Accepts both `1.234,56` (pt-BR grouping) and `150.50` / `1,234.56` (dot decimal),
 * matching the leniency of the original Python bot: if a comma is present it is the
 * decimal separator, otherwise the dot is. Rejects empty, non-numeric and values
 * `<= 0`. Amounts with more than two decimals are rounded by currency.js.
 */
export function parse_money_to_cents(text: string): number | null {
    const trimmed = text.trim();
    if (!trimmed) return null;

    // Whichever separator appears last is the decimal one; the other is grouping.
    // Handles "1.234,56", "1,234.56", "150,50", "150.50" and bare integers.
    const options: currency.Options =
        trimmed.lastIndexOf(",") > trimmed.lastIndexOf(".")
            ? { decimal: ",", separator: "." }
            : { decimal: ".", separator: "," };

    try {
        const parsed = brl(trimmed, { ...options, errorOnInvalid: true });
        return parsed.intValue > 0 ? parsed.intValue : null;
    } catch {
        return null;
    }
}

export function format_cents(cents: number): string {
    return brl(cents, { fromCents: true }).format();
}
