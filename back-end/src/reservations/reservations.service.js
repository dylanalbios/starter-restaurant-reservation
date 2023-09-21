const knex = require("../db/connection");

const tableName = "reservations";

/**
 * List handler for reservation resources.
 * - If a date is provided, it lists reservations for that specific date.
 * - If a mobile_number is provided, it searches for reservations with matching mobile numbers, 
 *   ignoring common formatting characters.
 * - If neither date nor mobile_number is provided, it lists all reservations.
 */
function list(date, mobile_number) {
    if (date) {
        return knex(tableName)
            .select("*")
            .where({ reservation_date: date })
            .orderBy("reservation_time");
    }

    if (mobile_number) {
        return knex(tableName)
          .whereRaw(
            "translate(mobile_number, '() -', '') like ?",
            `%${mobile_number.replace(/\D/g, "")}%`
          )
          .orderBy("reservation_date");
      }
    
      return knex("reservations").select("*");
    };


/**
 * Create handler for reservation resources.
 * Inserts a new reservation into the database.
 */
function create(reservation) {
    return knex(tableName).insert(reservation).returning("*")
};

module.exports = {
    list,
    create,
}