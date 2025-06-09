import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

import Validator from './Validator';
import Homepage from './Homepage'; // Import the Homepage component
import CustomDpForm from './CustomDpForm'; // Import the CustomDpForm component
import RegisterPage from './pages/RegisterPage'; // Import RegisterPage
import LoginPage from './pages/LoginPage'; // Import LoginPage
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import { useAuth } from './AuthContext'; // Import useAuth to display user info and logout

function App() {
  const { isAuthenticated, user, logout, loading } = useAuth(); // Get auth state

  return (
    // Wrap the Router with QueryClientProvider
      <Router>
        <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0', marginBottom: '1rem' }}>
          <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
          <Link to="/create-custom-dp" style={{ marginRight: '1rem' }}>Create DP</Link>
          {!loading && !isAuthenticated && (
            <>
              <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          {!loading && isAuthenticated && (
            <>
              <span style={{ marginRight: '1rem' }}>Welcome, {user?.username || 'User'}!</span>
              <button onClick={logout}>Logout</button>
            </>
          )}
          {loading && <span>Loading...</span>}
        </nav>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route
            path="/create-custom-dp"
            element={
              <PrivateRoute>
                <CustomDpForm />
              </PrivateRoute>
            }
          />
          <Route path="/register" element={<RegisterPage />} /> {/* Add Register route */}
          <Route path="/login" element={<LoginPage />} /> {/* Add Login route */}
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
