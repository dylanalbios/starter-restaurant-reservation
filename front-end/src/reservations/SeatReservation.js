import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { listReservations, seatTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";


export default function SeatReservation ({ loadDashboard, tables }) {
    const history = useHistory();
    const { reservation_id } = useParams();

    const [errors, setErrors] = useState([]);
    const [apiError, setApiError] = useState(null);
    const [reservationsError, setReservationsError] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [table_id, setTableId] = useState(0);
    

    useEffect(fetchReservations, []);

    function fetchReservations() {
        const abortController = new AbortController();
        setReservationsError(null);
        listReservations(abortController.signal)
            .then(setReservations)
            .catch(setReservationsError);
        return () => abortController.abort();
    };

    function handleInputChange({ target }) {
        setTableId(Number(target.value));
    };

    function handleSubmit(event) {
        event.preventDefault();
        const abortController = new AbortController();
        const seatingErrors = validateSeat(table_id);
        if (seatingErrors.length === 0) {
            seatTable(reservation_id, Number(table_id), abortController.signal)
                .then(loadDashboard)
                .then(() => history.push("/dashboard"))
                .catch(setApiError);
        }   else {
            setErrors(seatingErrors.map(error => ({ message: error })));
        }
        return () => abortController.abort();
    };

    function validateSeat(selectedTableId) {
        const foundErrors = [];

        const foundTable = tables.find(
            (table) => table.table_id === selectedTableId
        );

        const foundReservation = reservations.find(
            (reservation) => reservation.reservation_id === Number(reservation_id)
        );

        if (!foundTable) {
            foundErrors.push("Selected table does not exist")
        }   else if (!foundReservation){
            foundErrors.push("This reservation does not exist")
        }   else {
            if (foundTable.status === "occupied") {
                foundErrors.push("This table is already occupied")
            } 
            if (foundTable.capacity < foundReservation.people) {
                foundErrors.push(`This table is not big enough for ${foundReservation.people} people`)
            }
        }
        return foundErrors;
    }


    const currentReservation = reservations.find(
        (reservation) => reservation.reservation_id === Number(reservation_id)
    );

    const numberOfPeople = currentReservation ? currentReservation.people : null;

    return (
        <form onSubmit={handleSubmit}>
        
            {/* Display Errors */}
            {errors.map((error, index) => (
                <ErrorAlert key={index} error={error.message} />
            ))}
            <ErrorAlert error={apiError} />
            <ErrorAlert error={reservationsError} />

            {/* Display number of people in current reservation */}
            {numberOfPeople && (
                <p>
                    Number of people in the reservation: <strong>{numberOfPeople}</strong>
                </p>
            )}


            {/* Form */}
            <label className="form-label" htmlFor="table_id">Choose Table:</label>
            <select
                className="form-control"
                name="table_id"
                id="table_id"
                value={table_id}
                onChange={handleInputChange}
            >
                <option value={0}>Choose a table</option>
                {tables.map((table) => (
                    <option key={table.table_id} value={table.table_id}>
                        {table.table_name} - {table.capacity}
                    </option>
                ))}
            </select>
              
        
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
    )
}