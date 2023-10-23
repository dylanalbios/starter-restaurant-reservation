import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { listReservations } from "../utils/api";
import ReservationRow from "../dashboard/ReservationRow";

export default function Search() {
    const [mobileNumber, setMobileNumber] = useState("");
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState(null);

    function handleInputChange({ target }) {
        setMobileNumber(target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        const abortController = new AbortController();
        
        setError(null);

        const formattedMobileNumber = mobileNumber.replace(/\D/g, "");;

        listReservations({ mobile_number: formattedMobileNumber }, abortController.signal)
            .then(setReservations)
            .catch(setError);

        return () => abortController.abort();

    }


    function ReservationTable({ reservations }) {
        if(!reservations.length) {
            return <p>No reservations found</p>;
        }

        return (
            <table>
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        <th scope="col">Mobile Number</th>
                        <th scope="col">Date</th>
                        <th scope="col">Time</th>
                        <th scope="col">People</th>
                        <th scope="col">Status</th>
                        <th scope="col">Edit</th>
                        <th scope="col">Cancel</th>
                        <th scope="col">Seat</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map((reservation) => (
                        <ReservationRow key={reservation.reservation_id} reservation={reservation} />
                    ))}
                </tbody>
            </table>
        );
    }



    return (
        <>
            <form onSubmit={handleSubmit}>
                <ErrorAlert error={error} />
                <label className="form-label" htmlFor="mobile_number">
                    Enter mobile number
                </label>
                <div className="input-group">
                    <input
                        className="form-control"
                        name="mobile_number"
                        id="mobile_number"
                        placeholder="Enter Mobile Number"
                        type="search"
                        value={mobileNumber}
                        onChange={handleInputChange}
                        required
                    />

                    <button
                        className="btn btn-primary"
                        type="submit"
                        onClick={handleSubmit}
                    >
                        Find
                    </button>
                </div>
            </form>

            <ReservationTable reservations={reservations} />
        </>
    )
}