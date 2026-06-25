import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("incomes", (table) => {
        // 1 = Mensal (recorrente), 2 = Avulso. Default Avulso for legacy rows.
        table.smallint("income_type").notNullable().defaultTo(2);
        // Links an occurrence to its recurring series (null = Avulso).
        table.string("series_id", 24).index();
    });

    // The recurring "template" + lifecycle for monthly incomes.
    await knex.schema.createTable("income_series", (table) => {
        table.string("series_id", 24).primary().notNullable();
        table.string("account_id", 24).references("id").inTable("accounts").notNullable();
        table.string("user_id", 24).references("id").inTable("users").notNullable();
        table.integer("value").notNullable();
        table.string("description", 255);
        table.string("start_competence").notNullable();
        table.string("end_competence"); // nullable: recurrence stops after this competence
        table.boolean("active").notNullable().defaultTo(true);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("income_series");
    await knex.schema.alterTable("incomes", (table) => {
        table.dropColumn("income_type");
        table.dropColumn("series_id");
    });
}

