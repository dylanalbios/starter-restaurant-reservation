import React from "react";

export default function ReservationForm({ 
    formData, 
    setFormData, 
    handleSubmit, 
    history,
}) {

    // Handle changes in the input and update formData
    function handleInputChange({ target }) {
        setFormData({
            ...formData,
            [target.name]:
                target.name === "people" ? Number(target.value) : target.value,
        });
    };

    // Render the wform
    return (
        <form onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
        }}>

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