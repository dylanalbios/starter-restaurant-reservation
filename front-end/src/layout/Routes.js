import React, { useState, useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import useQuery from "../utils/useQuery" 
import { listReservations } from "../utils/api";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import NewReservation from "../reservations/NewReservation";

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


  const query = useQuery();
  const date = query.get("date") || today();

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();

    setReservationsError(null)

    listReservations({ date: date }, abortController.signal)
    .then(setReservations)
    .catch(setReservationsError);

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
          loadDashboard={() => setReservations([])} 
        />
      </Route>

      <Route path="/reservations/new">
        <NewReservation loadDashboard={loadDashboard}/>
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  )
}

export default Routes;
