import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";


export default function NewTable ({ loadDashboard }) {
    const history = useHistory();

    const [errors, setErrors] = useState([]);
    const [apiError, setApiError] = useState(null);

    const [formData, setFormData] = useState({
        table_name: "",
        capacity: 0,
    });

    function handleInputChange({ target }) {
        setFormData({
          ...formData,
          [target.name]:
            target.name === "capacity" ? Number(target.value) : target.value,
        });
    };

    function handleSubmit(event) {
        event.preventDefault();
        const foundErrors = validateFields();
        const abortController = new AbortController();
        if (foundErrors.length === 0) {
            createTable(formData, abortController.signal)
                .then(loadDashboard)
                .then(() => history.push("/dashboard"))
                .catch(setApiError);
        }   else {
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
    }

    return (
        <form onSubmit={handleSubmit}>

        {/* Display Errors */}
        {errors.map((error, index) => (
            <ErrorAlert key={index} error={error} />
        ))}
        <ErrorAlert error={apiError} />

        {/* Form */}
        <label className="form-label" htmlFor="table_name">Table Name:</label>
        <input 
            className="form-control"
            name="table_name"
            id="table_name"
            type="text"
            onChange={handleInputChange}
            value={formData.table_name}
            required
            autoComplete="off"
        />
      

        <label className="form-label" htmlFor="capacity">Capacity:</label>
        <input 
            className="form-control"
            name="capacity"
            id="capacity"
            type="number"
            onChange={handleInputChange}
            value={formData.capacity}
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