const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");



/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const date = req.query.date;
  const mobile_number = req.query.mobile_number;

  const reservations = await service.list(date, mobile_number);

  const filteredReservations = reservations.filter(
    (reservation) => reservation.status !== "finished"
  );

  res.json({ data: filteredReservations });
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
 * Middleware to validate the reservation data received in the request body.
 * It ensures that all required fields are present and in the correct format.
 * Sends an error response for any validation failure.
 */
async function validateReservation(req, res, next) {
  const data = req.body.data;
  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  // Helper function to send error
  const sendError = (message, status = 400) => next({ status, message });

  // Check for required fields
  const missingField = requiredFields.find(field => !data.hasOwnProperty(field) || data[field] === "");
  if (missingField) return sendError(`Field required: '${missingField}'`);

  // Date and Time validation
  const dateTime = `${data.reservation_date} ${data.reservation_time}`;
  if (Number.isNaN(Date.parse(dateTime))) {
      return sendError("'reservation_date' or 'reservation_time' field are in incorrect format");
  }

  // People field validation
  if (typeof data.people !== "number") return sendError("'people' field must be a number");
  if (data.people < 1) return sendError("'people' field must be at least 1");

  // Status field validation
  if (data.status && data.status !== "booked") {
      return sendError(`'status' field cannot be ${data.status}`);
  }

  next();
};

/**
 * Middleware to validate a reservation's date and time.
 * 
 * Ensures:
 * - The reservation isn't on a Tuesday (closed day).
 * - The date/time isn't in the past.
 * - The time falls within operating hours (10:30 AM - 10:30 PM).
 * - Reservations are made at least an hour before closing.
 * 
 * Sends error messages for validation failures and calls `next()` if all checks pass.
 */
async function validateDate(req, res, next) {
  const RESERVED_DATE_STRING = `${req.body.data.reservation_date}T${req.body.data.reservation_time}:00.000`;
  const reservedDate = new Date(RESERVED_DATE_STRING);
  const todaysDate = new Date();

  // Helper to send error messages
  const sendError = (message) => next({ status: 400, message });

  if (reservedDate.getDay() === 2) {
    return sendError("'reservation_date' field: restaurant is closed on tuesday");
  }

  if (reservedDate < todaysDate) {
    return sendError("'reservation_date' and 'reservation_time' field must be in the future");
  }

  const OPEN_HOUR = 10;
  const OPEN_MINUTE = 30;
  const CLOSE_HOUR = 22;
  const CLOSE_MINUTE = 30;
  const LAST_RESERVATION_HOUR = 21;
  const LAST_RESERVATION_MINUTE = 30;

  const isBeforeOpening = reservedDate.getHours() < OPEN_HOUR || 
                         (reservedDate.getHours() === OPEN_HOUR && reservedDate.getMinutes() < OPEN_MINUTE);

  const isAfterClosing = reservedDate.getHours() > CLOSE_HOUR || 
                        (reservedDate.getHours() === CLOSE_HOUR && reservedDate.getMinutes() >= CLOSE_MINUTE);

  const isLastReservationTime = reservedDate.getHours() > LAST_RESERVATION_HOUR ||
                               (reservedDate.getHours() === LAST_RESERVATION_HOUR && reservedDate.getMinutes() > LAST_RESERVATION_MINUTE);

  if (isBeforeOpening) {
    return sendError("'reservation_time; field: restaurant is not open until 10:30AM");
  }

  if (isAfterClosing) {
    return sendError("'reservation_time' field: restaurant is closed after 10:30PM");
  }

  if (isLastReservationTime) {
    return sendError("'reservation_time' field: reservation must be made at least an hour before closing (10:30PM)");
  }

  next();
};

/**
 * Create handler for reservation resources
 */
async function create(req, res) {
  req.body.data.status = "booked";

  const response = await service.create(req.body.data);

  res.status(201).json({ data: response[0] });
};

/**
 * Checks to see if reservation already exists within the table.
 */
async function reservationExists(req, res, next) {
  const reservation = await service.read(req.params.reservation_id);

  if (reservation) {
      res.locals.reservation = reservation;
      return next();
  }
  next({ status: 404, message: `Reservaiton cannot be found.` });
};

/**
 * Read function to return reservation details.
 * It sends back the reservation object saved in res.locals.reservation as JSON.
 */
async function read(req, res) {
  res.json({ data: res.locals.reservation });
  
};

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [asyncErrorBoundary(validateData), asyncErrorBoundary(validateDate), asyncErrorBoundary(validateReservation), asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
};
