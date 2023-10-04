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
    return knex(tableName).insert(table).returning("*").then((createdRecord) => createdRecord[0]);
};

/**
 * Reads table based on table_id.
 */
function read(table_id) {
    return knex(tableName).select("*").where({ table_id }).first();
};

/**
 * Reads reservation id
 */
function readReservation(reservation_id) {
    return knex("reservations").select("*").where({ reservation_id }).first();
};

/**
 * Updates the table with the given table_id to set its status to 'free'
 */
function occupyTable(table_id, reservation_id) {
    return knex(tableName).where({ table_id }).update({ reservation_id: reservation_id, status: "occupied"});
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
    readReservation,
    occupyTable,
    freeTable,
    updateReservationStatus,
}