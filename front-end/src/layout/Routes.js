import React, { useState, useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import useQuery from "../utils/useQuery" 
import { listReservations, listTables } from "../utils/api";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import NewReservation from "../reservations/NewReservation";
import NewTable from "../tables/NewTable";
import SeatReservation from "../reservations/SeatReservation";
import Search from "../search/Search";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */


function Routes() {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);


  const query = useQuery();
  const date = query.get("date") || today();

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();

    setReservationsError(null)

    listReservations({ date: date }, abortController.signal)
    .then(setReservations)
    .catch(setReservationsError);

    listTables(abortController.signal)
      .then((tables) => tables.sort((tableA, tableB) => tableA.table_name - tableB.table_name))
      .then(setTables)
      .catch(setTablesError);

    return () => abortController.abort();
  }

  return (
    <Switch>
      <Route exact path={["/", "/reservations"]}>
        <Redirect to={"/dashboard"} />
      </Route>

      <Route path="/dashboard">
        <Dashboard 
          date={date} 
          reservations={reservations} 
          reservationsError={reservationsError} 
          tables={tables}
          tablesError={tablesError}
          loadDashboard={loadDashboard} 
        />
      </Route>

      <Route path="/reservations/new">
        <NewReservation loadDashboard={loadDashboard}/>
      </Route>

      <Route path="/reservations/:reservation_id/edit">
        <NewReservation loadDashboard={loadDashboard} edit={true} />
      </Route>

      <Route path="/tables/new">
        <NewTable loadDashboard={loadDashboard} />
      </Route>

      <Route path="/reservations/:reservation_id/seat">
        <SeatReservation loadDashboard={loadDashboard} tables={tables} />
      </Route>

      <Route path="/search">
        <Search />
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  )
}

export default Routes;
