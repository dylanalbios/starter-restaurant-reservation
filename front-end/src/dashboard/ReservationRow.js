import React from "react";
import { updateReservationStatus } from "../utils/api";
import { Link } from "react-router-dom/cjs/react-router-dom.min";


export default function ReservationRow({ reservation, loadDashboard }) {
  
  //console.log("Reservation in ReservationRow:", reservation);
  //console.log("Status for Reservation:", reservation.status);

  const {
    reservation_id, 
    first_name, 
    last_name, 
    mobile_number, 
    reservation_date,
    reservation_time,
    people,
    status 
  } = reservation;


  // Don't return the reservation if it's finished or it doesn't exist
  if (!reservation || status === "finished") return null;


  function handleCancel(){
    if (window.confirm("Do you want to cancel this reservation? This action cannot be undone.")) {
      const abortController = new AbortController();

      updateReservationStatus(reservation_id, "cancelled", abortController.signal)
        .then(loadDashboard);

        return () => abortController.abort();
      
    }
  };


  return (
    <tr>
      <th scope="row">{reservation_id}</th>
      <td>{first_name}</td>
      <td>{last_name}</td>
      <td>{mobile_number}</td>
      <td>{reservation_date}</td>
      <td>{reservation_time.substr(0, 5)}</td>
      <td>{people}</td>
      <td data-reservation-id-status={reservation_id}>{status}</td>
      {status === "booked" && (
        <>
        <td>
          <Link to={`/reservations/${reservation_id}/edit`}>
            <button className="btn btn-secondary" type="button">Edit</button>
          </Link>
        </td>
        <td>
          <button
            className="btn btn-danger"
            type="button"
            onClick={handleCancel}
            data-reservation-id-cancel={reservation_id}
          >
            Cancel
          </button>
        </td>
        <td>
          <Link to={`/reservations/${reservation_id}/seat`}>
            <button className="btn btn-primary" type="button">Seat</button>
          </Link>
        </td>
        </>
      )}
    </tr>
  );
};