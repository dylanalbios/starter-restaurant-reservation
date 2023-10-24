import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { today, formatAsTime } from "../utils/date-time";
import { createReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";



export default function NewReservation({ loadDashboard }) {
  const history = useHistory();

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


  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();

    const foundErrors = validateFields().concat(validateDate());

    if (foundErrors.length === 0) {
        createReservation( formData, abortController.signal)
          .then(loadDashboard)
          .then(() => 
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch(setApiError);
    } else {
      setErrors(foundErrors);
    }

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
    <ReservationForm
      formData={formData}
      setFormData={setFormData}
      handleSubmit={handleSubmit}
      errors={errors}
      apiError={apiError}
      history={history}
      reservationError={reservationError}
    />
  );
}