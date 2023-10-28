import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { editReservation, listReservations } from "../utils/api";
import ReservationForm from "./ReservationForm";
import ErrorAlert from "../layout/ErrorAlert";



export default function EditReservation({ loadDashboard }) {
  const history = useHistory();
  const { reservation_id } = useParams();

  const [errors, setErrors] = useState([]);
  const [reservationError, setReservationError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const [formData, setFormData] = useState({ 
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  });


  useEffect(() => {
    const abortController = new AbortController();

    if (!reservation_id) return null;

    loadReservations()
        .then((response) =>
            response.find(
                (reservation) =>
                    reservation.reservation_id === Number(reservation_id)
            )
        )
        .then(fillFields)
        .catch(error => setReservationError(error));

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

    // Cleanup: Abort any pending API requests
    return () => abortController.abort();
  }, [reservation_id]);


  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();

    const foundErrors = validateFields().concat(validateDate());

    // If no errors are found, proceed to edit reservation
    if (foundErrors.length === 0) {
        editReservation(reservation_id, formData, abortController.signal)
            .then(loadDashboard)
            .then(() => 
                history.push(`/dashboard?date=${formData.reservation_date}`)
            )
            .catch((error) => {
                setApiError(`Failed to edit reservation: ${error.message}`);
            });
    } else {
      setErrors(foundErrors);
    }

    return () => abortController.abort();
  };


  // Validates indidvidual form fields
  function validateFields() {
    const foundErrors = [];
    for (const field in formData) {
      if (formData[field] === "") {
        foundErrors.push({
          message: `${field.split("_").join(" ")} must be filled in.`,
        });
      }
    }
    
    if (!/^\d{10}$/.test(formData.mobile_number)) {
      foundErrors.push({
        message: "Mobile number must be 10 digits.",
      })
    }

    return foundErrors;
  };

  // Specifically checks if reservation is on a tuesday
  function tuesdayReservation(date, time) {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute, second] = time.split(":").map(Number);

    const reservedDate = new Date(year, month - 1, day, hour, minute, second);

    return reservedDate.getDay() === 2;
  }

  // Validates the reservation date and time
  function validateDate() {
    const foundErrors = [];
    const { reservation_date, reservation_time} = formData;
    const reservedDate = new Date(`${reservation_date}T${reservation_time}:00.000`)
    const todaysDate = new Date();

    todaysDate.setHours(0, 0, 0, 0);

    if (tuesdayReservation(reservation_date, reservation_time)) {
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
      {apiError ? <ErrorAlert error={apiError} /> : null}

      {errors.map((error, index) => (
        <ErrorAlert key={index} error={error} />
      ))}

      {reservationError ? <ErrorAlert error={reservationError} /> : null}

      <ReservationForm
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        errors={errors}
        apiError={apiError}
        history={history}
        reservationError={reservationError}
      />
    </>
  );
}