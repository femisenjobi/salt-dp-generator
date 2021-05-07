import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Validator from './Validator';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/:event">
          <Validator />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
