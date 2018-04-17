exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('expansions', function (table) {
            table.increments('id').primary();
            table.string('name');
        }),
        knex.schema.createTable('factions', function (table) {
            table.increments('id').primary();
            table.string('name');
            table.integer('expansion_id').unsigned().notNullable().references('id').inTable('expansions');
        }),
    ]
    );
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('factions'),
        knex.schema.dropTable('expansions'),
    ]);
};
