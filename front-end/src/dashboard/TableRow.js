import React from "react";

export default function TableRow({ table, loadDashboard}) {
    const {
        table_id,
        table_name,
        capacity,
        status,
        reservation_id,
    } = table;

    // Don't return the table if it's finished or doesn't exist.
    if (!table) return null;


    return (
        <tr>
            <th scope="row">{table_id}</th>
            <td>{table_name}</td>
            <td>{capacity}</td>
            <td>{status}</td>
            <td>{reservation_id}</td>
        </tr>
    );
};