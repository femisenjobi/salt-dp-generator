import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Validator from './Validator';
import Homepage from './Homepage'; // Import the Homepage component
import CustomDpForm from './CustomDpForm'; // Import the CustomDpForm component

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/"> {/* Add exact path for homepage */}
          <Homepage />
        </Route>
        <Route path="/create-custom-dp">
          <CustomDpForm />
        </Route>
        {/* Route for custom DPs via Validator */}
        <Route path="/dp/custom/:id">
          <Validator />
        </Route>
        {/* Route for predefined event DPs via Validator */}
        <Route path="/:eventKey">
          <Validator />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
