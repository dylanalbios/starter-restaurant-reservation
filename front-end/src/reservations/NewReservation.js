import React, { useEffect, useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { today, formatAsTime } from "../utils/date-time";
import { createReservation } from "../utils/api";
import ReservationForm from "./ReservationForm";
import ErrorAlert from "../layout/ErrorAlert";



export default function NewReservation({ loadDashboard }) {
  const history = useHistory();

  const [errors, setErrors] = useState([]);
  const [apiError, setApiError] = useState(null);

  const [formData, setFormData] = useState({ 
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: today(),
    reservation_time: formatAsTime(new Date().toTimeString()),
    people: 1,
  });

  // Initialize abort controller using useMemo
  const abortController = useMemo(() => new AbortController(), []);

  // Abort any pending API requests when comonent unmounts
  useEffect(() => {
    return () => abortController.abort();
  }, [abortController]);

  function handleSubmit(event) {
    event.preventDefault();

    const foundErrors = validateFields().concat(validateDate());

    // If no errors are found, create the reservation
    if (foundErrors.length === 0) {
        createReservation( formData, abortController.signal)
          .then(loadDashboard)
          .then(() => 
            history.push(`/dashboard?date=${formData.reservation_date}`)
          )
          .catch((error) => {
            setApiError(`Failed to create reservation: ${error.message}`);
          });
    } else {
      setErrors(foundErrors);
    }

    return () => abortController.abort();
  };


  // Validates individual form fields
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


  // Validates the reservation data and time
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
    <> 
    {apiError ? <ErrorAlert message={apiError} /> : null}

    {errors.map((error, index) => (
      <ErrorAlert key={index} message={error.message} />
    ))}

      <ReservationForm
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        errors={errors}
        apiError={apiError}
        history={history}
      />
    </>
  );
}