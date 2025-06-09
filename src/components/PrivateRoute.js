import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // You can render a loading spinner or null while checking auth state
    return <div>Loading authentication state...</div>;
  }

  if (!isAuthenticated) {
    // User not authenticated, redirect to login page
    // Pass the current location so users can be redirected back after login (optional)
    // const location = useLocation(); // import { useLocation } from 'react-router-dom';
    // return <Navigate to="/login" state={{ from: location }} replace />;
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the children
  // If you are using this as a wrapper for <Route element={<Component />} />
  // then children prop will be used.
  // If you are using it like <Route><PrivateRoute><Component/></PrivateRoute></Route> (older react-router versions)
  // then it's fine.
  // For react-router-dom v6, it's common to pass the component as children or use <Outlet /> if it's a layout route.
  return children ? children : <Outlet />;
};

export default PrivateRoute;
