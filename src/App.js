import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Validator from './Validator';
import Homepage from './Homepage'; // Import the Homepage component

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/"> {/* Add exact path for homepage */}
          <Homepage />
        </Route>
        <Route path="/:event">
          <Validator />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
