import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { today, formatAsTime } from "../utils/date-time";
import { createReservation, editReservation, listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";



export default function NewReservation({ loadDashboard, edit }) {
  const history = useHistory();
  const { reservation_id } = useParams();

  const [errors, setErrors] = useState([]);
  const [reservationError, setReservationError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const [formData, setFormData] = useState({ 
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: today(),
    reservation_time: formatAsTime(new Date().toTimeString()),
    people: 1,
  });


  useEffect(() => {
    if (edit) {
      if (!reservation_id) return null;

      loadReservations()
        .then((response) =>
          response.find(
            (reservation) =>
              reservation.reservation_id === Number(reservation_id)
          )
        )
        .then(fillFields);
    }

    function fillFields(foundReservation) {
      if (!foundReservation || foundReservation.status !== "booked") {
        return <p>Only booked reservations can be edited.</p>;
      }


      setFormData({
        first_name: foundReservation.first_name,
        last_name: foundReservation.last_name,
        mobile_number: foundReservation.mobile_number,
        reservation_date: foundReservation.reservation_date,
        reservation_time: foundReservation.reservation_time,
        people: foundReservation.people,
      });
    }

    async function loadReservations() {
      const abortController = new AbortController();

      return await listReservations(abortController.signal).catch(
        setReservationError
      );
    }
  }, [edit, reservation_id]);




  function handleInputChange({ target }) {
    setFormData({
      ...formData,
      [target.name]:
        target.name === "people" ? Number(target.value) : target.value,
    });
  };




  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();

    const foundErrors = validateFields().concat(validateDate());

    if (foundErrors.length === 0) {
      if (edit && reservation_id) {
        editReservation(reservation_id, formData, abortController.signal)
          .then(loadDashboard)
          .then(() => 
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setApiError);
      } else {
        createReservation( formData, abortController.signal)
          .then(loadDashboard)
          .then(() => 
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setApiError);
      }
    } else {
      setErrors(foundErrors);
    }

    setErrors(foundErrors);

    return () => abortController.abort();
  };



  function validateFields() {
    const foundErrors = [];
    for (const field in formData) {
      if (formData[field] === "") {
        foundErrors.push({
          message: `${field.split("_").join(" ")} must be filled in.`,
        });
      }
    }
    return foundErrors;
  };



  function validateDate() {
    const foundErrors = [];
    const reservedDate = new Date(
      `${formData.reservation_date}T${formData.reservation_time}:00.000`
    );
    const todaysDate = new Date();

    if (reservedDate.getDay() === 2) {
      foundErrors.push({
        message: "Reservation on a tuesday"
      });
    }

    if (reservedDate < todaysDate) {
      foundErrors.push({
        message: "Reservation in the past"
      });
    }

    const hour = reservedDate.getHours();
    const minute = reservedDate.getMinutes();

    if (hour < 10 || (hour === 10 && minute < 30)) {
      foundErrors.push({
        message: "Reservation not open til 10:30"
      });
    } else if (hour === 22 && minute >= 30) {
      foundErrors.push({
        message: "Reservation closed after 10:30"
      });
    } else if (hour === 21 && minute > 30) {
      foundErrors.push({
        message: "Reservation made an hour before close"
      });
    }

    return foundErrors;
  };




  return (
    <form onSubmit={handleSubmit}>

      {/* Display Errors */}
      {errors.map((error, index) => (
        <ErrorAlert key={index} error={error} />
      ))}
      <ErrorAlert error={apiError} />
      <ErrorAlert error={reservationError} />

      {/* Form */}
      <label className="form-label" htmlFor="first_name">First Name:</label>
      <input 
        className="form-control"
        name="first_name"
        id="first_name"
        type="text"
        onChange={handleInputChange}
        value={formData.first_name}
        required
        autoComplete="off"
      />
      

      <label className="form-label" htmlFor="last_name">Last Name:</label>
      <input 
        className="form-control"
        name="last_name"
        id="last_name"
        type="text"
        onChange={handleInputChange}
        value={formData.last_name}
        required
      />


      <label className="form-label" htmlFor="mobile_number">Mobile Number:</label>
      <input 
        className="form-control"
        name="mobile_number"
        id="mobile_number"
        type="text"
        onChange={handleInputChange}
        value={formData.mobile_number}
        required
      />


      <label className="form-label" htmlFor="reservation_date">Date of Reservation:</label>
      <input 
        className="form-control"
        name="reservation_date"
        id="reservation_date"
        type="date"
        onChange={handleInputChange}
        value={formData.reservation_date}
        required
      />
      

      <label className="form-label" htmlFor="reservation_time">Time of Reservation:</label>
      <input 
        className="form-control"
        name="reservation_time"
        id="reservation_time"
        type="time"
        onChange={handleInputChange}
        value={formData.reservation_time}
        required
      />


      <label className="form-label" htmlFor="people">Number of People:</label>
      <input 
        className="form-control"
        name="people"
        id="people"
        type="number"
        onChange={handleInputChange}
        value={formData.people}
        required
      />

      {/* Submit and Cancel buttons */}
      <button 
        className="btn btn-primary m-1"
        type="submit"
        onClick={handleSubmit}
      >
        Submit
      </button>

      <button 
        className="btn btn-secondary m-1"
        type="button"
        onClick={() => history.goBack()}
      >
        Cancel
      </button>
    </form>
  );
}