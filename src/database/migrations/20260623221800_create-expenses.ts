import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('expenses', (table) => {
        table.string('expenses_id', 24).primary().notNullable();
        table.string('account_id', 24).references('id').inTable('accounts').notNullable();
        table.string('user_id', 24).references('id').inTable('users').notNullable();
        table.integer('value').notNullable(); // conferir forma melhor
        table.string('type', 100);
        table.string('category', 100);
        table.string('description', 255);
        table.string('competence').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at');
        table.timestamp('delete_at');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('expenses');
}