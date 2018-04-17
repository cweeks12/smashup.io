exports.up = function(knex, Promise) {
    return Promise.all([
            knex.schema.createTable('ownedExpansions', function (table) {
                table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
                table.integer('expansion_id').unsigned().notNullable().references('id').inTable('expansions');
            }),
            knex.schema.createTable('chosenFactions', function (table) {
                table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
                table.integer('faction_id').unsigned().notNullable().references('id').inTable('factions');
            }),
            knex.schema.createTable('customFactions', function (table) {
                table.increments('id').primary();
                table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
                table.string('name').notNullable();
            }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('ownedExpansions'),
        knex.schema.dropTable('chosenFactions'),
        knex.schema.dropTable('customFactions'),
    ]);
};
