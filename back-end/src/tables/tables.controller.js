const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * Lists out the tables (already in order)
 */
async function list (req, res) {
    const response = await service.list();

    res.json({ data: response });
};

/**
 * Middleware to check if the request body contains a 'data' object.
 * If the 'data' object is missing, it sends an error response.
 */
async function validateData(req, res, next) {
    if (!req.body.data) {
      return next({
        status: 400,
        message: "Body must include a request body data object",
      });
    }
  
    next();
};

/**
 * Middleware to validate the table data received in the request body.
 * It ensures that all required fields are present and in the correct format.
 * Sends an error response for any validation failure.
 */
async function validateTable(req, res, next) {
    const data = req.body.data;
    const requiredFields = [
      "table_name",
      "capacity",
    ];
  
    // Helper function to send error
    const sendError = (message, status = 400) => next({ status, message });
  
    // Check for required fields
    const missingField = requiredFields.find(field => !data.hasOwnProperty(field) || data[field] === "");
    if (missingField) return sendError(`Field required: '${missingField}'`);

    // Check table name length
    if (data.table_name.length < 2) {
        return sendError(`'table_name' invalid must be more than 1 character: ${data.table_name}`);
    };

    // Check if capacity is zero
    if (data.capacity === 0) {
        return sendError(`'capacity' invalid must be greater than zero: ${data.capacity}`);
    };

    // Check if capacity is not a number
    if (isNaN(data.capacity) || typeof data.capacity === "string") {
        return sendError(`'capacity' invalid must be a number`, 400);
    };
    next();
};

/**
 * Create handler for table resources
 */
async function create(req, res) {
    req.body.data.status = "occupied";
  
    const [response] = await service.create(req.body.data);
  
    res.status(201).json({ data: response });
};

/**
 * Checks if a table exists with the same table_id.
 */
async function tableExists(req, res, next) {
    //console.log(req, "tableExists"); // THIS RUNS
    const { table_id } = req.params;
    const table = await service.read(table_id);

    if (!table) {
        return next({
            status: 404,
            message: `table_id '${table_id}' does not  exist`,
        });
    }

    res.locals.table = table;
    //console.log(table); // THIS RUNS
    next();
};

/**
 * Clears table and updates the reservation and table status
 */
async function clearTable(req, res) {
    //console.log(req, "clearTable"); // THIS DOES NOT RUN
    //console.log("clearTable called, res.locals.table:", res.locals.table); // THIS DOES NOT RUNv
    const { reservation_id, table_id } = res.locals.table;
    //console.log("rerservation_id", reservation_id); // THIS DOES NOT RUN
    //console.log("table_id", table_id); // THIS DOES NOT RUN

    await service.updateReservationStatus(reservation_id, "finished");
    await service.freeTable(table_id);


    res.status(200).json({ data: { status: "finished" } });
};

/**
 * Checks if table is seated or not.
 */
async function validateSeatedTable(req, res, next) {
    //console.log(req, "validateSeatedTable");  //THIS RUNS
    if (res.locals.table.status !== "occupied") {
        return next({
            status: 400,
            message: "table is not occupied",
        });
    }
    //console.log(res.locals.table.status) // THIS DOES NOT RUN but does pass status 400

    next();
};

module.exports = {
    list: [asyncErrorBoundary(list)],
    create: [
        asyncErrorBoundary(validateData), 
        asyncErrorBoundary(validateTable), 
        asyncErrorBoundary(create)
    ],
    clearTable: [
        asyncErrorBoundary(tableExists), 
        asyncErrorBoundary(validateSeatedTable), 
        asyncErrorBoundary(clearTable),
    ],
};
