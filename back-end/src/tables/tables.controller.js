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
    if (req.body.data.reservation_id) {
        req.body.data.status = "occupied";
        await service.updateReservationStatus(req.body.data.reservation_id, "seated");
    } else {
        req.body.data.status = "free";
    }
  
    const response = await service.create(req.body.data);
  
    res.status(201).json({ data: response });
};

/**
 * Checks if a table exists with the same table_id.
 */
async function tableExists(req, res, next) {
    const { table_id } = req.params;
    const table = await service.read(table_id);

    if (!table) {
        return next({
            status: 404,
            message: `table_id '${table_id}' does not  exist`,
        });
    }

    res.locals.table = table;
    next();
};

/**
 *  Checks for valid status of 'tables' and 'reservations'.
 *  Checks for valid capacity of table for the reservation.
 */
async function validateSeats(req, res, next) {
    if (res.locals.table.status === "occupied") {
        return next({
            status: 400,
            message: "This table is currently 'occupied'.",
        })
    };

    if (res.locals.reservation.status === "seated") {
        return next({
            status: 400,
            message: "This reservation is currently 'seated'.",
        })
    };

    if (res.locals.table.capacity < res.locals.reservation.people) {
        return next({
            status: 400,
            message: `This table does not have enough capacity for your reservation of ${res.locals.reservation.people} people.`,
        })
    };
    next();
};

/**
 * Changes the table status to occupied and the reservation status to seated.
 */
async function seatTable(req, res) {
    await service.occupyTable(
        res.locals.table.table_id,
        res.locals.reservation.reservation_id
    );

    await service.updateReservationStatus(
        res.locals.reservation.reservation_id, "seated"
    );

    res.status(200).json({ data: { status: "seated" } });
};

/**
 * Clears table and updates the reservation and table status
 */
async function clearTable(req, res) {
    await service.updateReservationStatus(
        res.locals.table.reservation_id, 
        "finished"
    );

    await service.freeTable(res.locals.table.table_id);

    res.status(200).json({ data: { status: "finished" } });
};

/**
 * Checks if table is seated or not.
 */
async function validateSeatedTable(req, res, next) {
    if (res.locals.table.status !== "occupied") {
        return next({
            status: 400,
            message: "table is not occupied",
        });
    }

    next();
};



/**
 *  Validates that the reservation exists
 */
async function validateReservation(req, res, next) {
    const { reservation_id } = req.body.data;

    if (!reservation_id) {
        return next({
            status: 400,
            message: "reservation_id field must be included"
        });
    };

    const reservation = await service.readReservation(reservation_id);
    if (!reservation) {
        return next({
            status: 404,
            message: `reservation_id ${reservation_id} does not exist`
        });
    };

    res.locals.reservation = reservation;
    next();
};

module.exports = {
    list: [asyncErrorBoundary(list)],
    create: [
        asyncErrorBoundary(validateData), 
        asyncErrorBoundary(validateTable), 
        asyncErrorBoundary(create),
    ],
    seatTable: [
        asyncErrorBoundary(validateData),
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(validateReservation),
        asyncErrorBoundary(validateSeats),
        asyncErrorBoundary(seatTable),
    ],
    clearTable: [
        asyncErrorBoundary(tableExists), 
        asyncErrorBoundary(validateSeatedTable), 
        asyncErrorBoundary(clearTable),
    ],
};
