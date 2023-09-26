const knex = require("../db/connection");

const tableName = "tables";

/**
 * Lists the 'tables' table in order by name
 */
function list() {
    return knex(tableName).select("*").orderBy("table_name");
};



module.exports = {
    list,

}