import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Validator from './Validator';
import Homepage from './Homepage'; // Import the Homepage component
import CustomDpForm from './CustomDpForm'; // Import the CustomDpForm component
import SharedDpViewer from './SharedDpViewer'; // Import the SharedDpViewer component

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
        {/* New route for SharedDpViewer */}
        <Route path="/dp/:dpId">
          <SharedDpViewer />
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
