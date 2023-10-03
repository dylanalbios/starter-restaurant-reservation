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

/**
 * Reads table based on table_id.
 */
function read(table_id) {
    return knex(tableName).select("*").where({ table_id }).first();
};

/**
 * Updates the table with the given table_id to set its status to 'free'.
 * And clears the reservation_id.
 */
function freeTable(table_id) {
    return knex(tableName).where({ table_id }).update({ reservation_id: null, status: "free"});
};

/**
 * Updates the reservation status when table is cleared.
 */
function updateReservationStatus(reservation_id, status) {
    return knex("reservations").where({ reservation_id }).update({ status: status });
};

module.exports = {
    list,
    create,
    read,
    freeTable,
    updateReservationStatus,
}