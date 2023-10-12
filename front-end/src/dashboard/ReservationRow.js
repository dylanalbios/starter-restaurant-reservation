import React from "react";


function ReservationRow({ reservation, loadDashboard }) {
  
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


  /*function handleCancel(){
    if (window.confirm("Do you want to cancel this reservation? This action cannot be undone.")) {
      const abortController = new AbortController();

      
    }
  };*/


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
      {status === "booked" &&
        <td>
          <button
            className="btn btn-danger"
            type="button"
            //onClick={handleCancel}
            data-reservaion-id-cancel={reservation_id}
          >
            Cancel
          </button>
        </td>
      }
    </tr>
  );
};

export default ReservationRow;