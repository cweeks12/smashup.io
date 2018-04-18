
exports.up = function(knex, Promise) {
    return Promise.all([
            knex.schema.createTable('users', function (table) {
                table.increments('id').primary();
                table.string('username');
                table.string('email');
                table.string('hashed_password');
                table.string('role');
            }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('users'),
    ]);
};
