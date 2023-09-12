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
};;

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
}



/**
 * Create handler for reservation resources
 */
async function create(req, res) {
  req.body.data.status = "booked";

  const response = await service.create(req.body.data);

  res.status(201).json({ data: response[0] });
};

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [asyncErrorBoundary(validateReservation), asyncErrorBoundary(create)],
};
