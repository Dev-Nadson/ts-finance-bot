import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users-accounts', (table) => {
        table.increments('user_account_id').primary().notNullable();
        table.string('user_id', 24).references('id').inTable('users').notNullable();
        table.string('account_id', 24).references('id').inTable('accounts').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('users-accounts');
}