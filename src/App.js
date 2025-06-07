import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Validator from './Validator';
import Homepage from './Homepage'; // Import the Homepage component
import CustomDpForm from './CustomDpForm'; // Import the CustomDpForm component

function App() {
  return (
    // Wrap the Router with QueryClientProvider
      <Router>
        <Routes>
          <Route exact path="/" element={<Homepage />} />
          <Route path="/create-custom-dp" element={<CustomDpForm />} />
          {/* Route for custom DPs via Validator */}
          <Route path="/dp/custom/:id" element={<Validator />} />
          {/* Route for predefined event DPs via Validator */}
          <Route path="/:eventKey" element={<Validator />} />
        </Routes>
      </Router>
  );
}

export default App;
