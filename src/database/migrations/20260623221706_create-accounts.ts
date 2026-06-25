import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('accounts', (table) => {
        table.string('id', 24).primary().notNullable();
        table.string('name', 80).notNullable();
        table.string('password').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at');
        table.timestamp('deleted_at');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('accounts');
}

