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
          <Route path="/" element={<Homepage />} />
          <Route path="/create-custom-dp" element={<CustomDpForm />} />
          {/* Route for custom DPs via Validator */}
          <Route path="/dp/custom/:id" element={<Validator />} />
          {/* New route for DPs by slug */}
          <Route path="/dp/:slug" element={<Validator />} />
          {/* Route for predefined event DPs via Validator (should be last for top-level slugs) */}
          <Route path="/:eventKey" element={<Validator />} />
        </Routes>
      </Router>
  );
}

export default App;
