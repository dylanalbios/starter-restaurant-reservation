import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { editReservation, listReservations } from "../utils/api";
import ReservationForm from "./ReservationForm";



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

    return () => abortController.abort();
  }, [reservation_id]);


  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();

    const foundErrors = validateFields().concat(validateDate());

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