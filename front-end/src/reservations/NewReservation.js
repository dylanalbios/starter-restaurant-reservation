import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { today, formatAsTime } from "../utils/date-time";
import { createReservation, editReservation, listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";



export default function NewReservation({ loadDashboard, edit }) {
  const history = useHistory();
  const { reservation_id } = useParams();

  const [errors, setErrors] = useState({
    api: null, 
    validation: [], 
    reservation: null,
  });

  const [formData, setFormData] = useState({ 
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: today(),
    reservation_time: formatAsTime(new Date().toTimeString()),
    people: 1,
  });

  useEffect(() => {
    async function fetchandFillRsv() {
      const abortController = new AbortController();

      try {
        const reservations = await listReservations({}, abortController.signal);
        const foundReservation = reservations.find(
          (res) => res.reservation_id === Number(reservation_id)
        );
        if (foundReservation && foundReservation.status === "booked") {
          setFormData({ ...foundReservation });
        } else {
          setErrors((prev) => ({
            ...prev,
            reservation: "Only booked reservations can be edited."
          }));
        }
      } catch (err) {
        setErrors((prev) => ({ ...prev, api: err }));
      }
    }

    if (edit && reservation_id) fetchandFillRsv();
  }, [edit, reservation_id]);

  function handleInputChange({ target }) {
    const value = target.name === 'people' ? Number(target.value): target.value;
    setFormData((prev) => ({ ...prev, [target.name]: value}));
  };


  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateFormData();

    if (validationErrors.length === 0) {
      try {
        const abortController = new AbortController();
        if (edit && reservation_id) {
          await editReservation(reservation_id, formData, abortController.signal);
        } else {
          await createReservation(formData, abortController.signal);
        }
        loadDashboard();
        history.push(`/dashboard?date=${formData.reservation_date}`);
      } catch (apiError) {
        setErrors((prev) => ({ ...prev, api: apiError}))
      }
    } else {
      setErrors((prev) => ({ ...prev, validation: validationErrors}))
    }
  };

  function validateFormData() {
    const errorMessage = [];

    if (formData.first_name.trim() === "") {
      errorMessage.push("First Name must be filled")
    }

    if (formData.last_name.trim() === "") {
      errorMessage.push("Last Name must be filled")
    }

    const phonePattern = /^[2-9]{1}[0-9]{9}$/;
    if(!phonePattern.test(formData.mobile_number)) {
      errorMessage.push("Mobile number must be 10 digits and cannot start with 0 or 1.");
    }

    const reservationDate = new Date(formData.reservation_date).getTime();
    const todaysDate = new Date();
    if (reservationDate < todaysDate) {
      errorMessage.push("Reservation date must be today or in the future.")
    }

    const reservationTime = formData.reservation_time;
    if (reservationTime < "10:30" || reservationTime > "21:30") {
      errorMessage.push("Reservation Time must be between 10:30AM and 9:30PM")
    }

    if (formData.people < 1) {
      errorMessage.push("Party size must be at least 1 person.")
    }

    return errorMessage;
  }


  return (
    <form onSubmit={handleSubmit}>

      {/* Display Errors */}
      {errors.validation.map((error, index) => (
        <ErrorAlert key={index} error={{ message: error }} />
      ))}
      <ErrorAlert error={errors.api} />
      <ErrorAlert error={{ message: errors.reservation }} />

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