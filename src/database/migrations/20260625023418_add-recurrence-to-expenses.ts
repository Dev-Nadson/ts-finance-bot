import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("expenses", (table) => {
        // 1 = Mensal (recorrente), 2 = Avulso. Default Avulso for legacy rows.
        table.smallint("expense_type").notNullable().defaultTo(2);
        // Links an occurrence to its recurring series (null = Avulso).
        table.string("series_id", 24).index();
        // New classification, independent from `category`.
        table.string("sector", 100);
    });

    // The recurring "template" + lifecycle for monthly expenses.
    await knex.schema.createTable("expense_series", (table) => {
        table.string("series_id", 24).primary().notNullable();
        table.string("account_id", 24).references("id").inTable("accounts").notNullable();
        table.string("user_id", 24).references("id").inTable("users").notNullable();
        table.integer("value").notNullable();
        table.string("description", 255);
        table.string("category", 100);
        table.string("sector", 100);
        table.string("start_competence").notNullable();
        table.string("end_competence"); // nullable: recurrence stops after this competence
        table.boolean("active").notNullable().defaultTo(true);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("expense_series");
    await knex.schema.alterTable("expenses", (table) => {
        table.dropColumn("expense_type");
        table.dropColumn("series_id");
        table.dropColumn("sector");
    });
}

