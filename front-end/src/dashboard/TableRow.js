import React, { useState } from "react";
import { finishTable } from "../utils/api";

export default function TableRow({ table, loadDashboard}) {
    const {
        table_id,
        table_name,
        capacity,
        status,
        reservation_id,
    } = table;

    const [error, setError] = useState(null);

    // Don't return the table if it's finished or doesn't exist.
    if (!table) return null;

    async function handleTableFinish() {
        const abortController = new AbortController();
        if (window.confirm("Is this table ready to seat new guests? This action cannot be undone.")) {
            try {
                await finishTable(table.table_id, abortController.signal);
                loadDashboard();
            } catch (error) {
                console.error("Error finishing table:", error);
                setError(error.message)
            }
        }
        return () => abortController.abort();
    }


    return (
        <tr>
            {error && <td colSpan="6"><div className="alert alert-danger">{error}</div></td>}
            <th scope="row">{table_id}</th>
            <td>{table_name}</td>
            <td>{capacity}</td>
            <td data-table-id-status={table.table_id}>{status}</td>
            <td>{reservation_id ? reservation_id : "--"}</td>
            {status === "occupied" && (
                <td>
                    <button
                    data-table-id-finish={table_id}
                    onClick={handleTableFinish}
                    type="button"
                >Finish</button>
                </td>
            )}
        </tr>
    );
};