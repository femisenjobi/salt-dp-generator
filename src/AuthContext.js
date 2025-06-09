import React, { createContext, useContext, useState, useEffect } from 'react';

// Create AuthContext
const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial loading state

  useEffect(() => {
    // Try to load token and user from localStorage on initial render
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem('authUser'); // Clear corrupted user data
        }
      }
      // TODO: Add a call to a backend endpoint like /api/auth/me to validate token
      // and get fresh user data. For now, we assume the stored token is valid.
    }
    setLoading(false); // Finished loading
  }, []);

  const login = (userData, authToken) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    // Optionally, redirect to login page or home page
    // window.location.href = '/login';
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export AuthContext as well if it needs to be used directly elsewhere (optional)
// export { AuthContext };
