const knex = require("../db/connection");

const tableName = "tables";

/**
 * Lists the 'tables' table in order by name
 */
function list() {
    return knex(tableName).select("*").orderBy("table_name");
};


/**
 * Create handler for tables.
 * Inserts a new table into the database.
 */
function create(table) {
    return knex(tableName).insert(table).returning(["capacity", "table_name"])
};

module.exports = {
    list,
    create,
}