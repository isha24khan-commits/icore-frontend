import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import axios from 'axios';

/**
 * Backend API base URL from environment variables
 * Used for all authentication requests
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * AuthContext
 * -----------
 * Global authentication context for the entire app.
 * Stores:
 * - user state
 * - authentication status
 * - login/register/logout functions
 */
const AuthContext = createContext(null);

/**
 * Custom hook to access authentication context easily
 * Ensures it is used only inside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

/**
 * AuthProvider Component
 * ----------------------
 * Wraps the entire application and provides:
 * - authentication state
 * - login/register/logout functions
 * - user role information
 */
export const AuthProvider = ({ children }) => {

  // Stores current logged-in user (or false if not authenticated)
  const [user, setUser] = useState(null);

  // Tracks loading state while checking authentication
  const [loading, setLoading] = useState(true);

  /**
   * Checks if user is already logged in using localStorage
   * Runs on app startup
   */
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      // Restore user session from stored data
      setUser(JSON.parse(userData));
    } else {
      // No valid session found
      setUser(false);
    }

    setLoading(false);
  }, []);

  /**
   * Runs authentication check once when app loads
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * LOGIN FUNCTION
   * Sends credentials to backend and stores token + user data
   */
  const login = async (email, password) => {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      { email, password }
    );

    const { token, role, message } = response.data;

    const userData = { email, role };

    // Store session in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    // Set global axios header for authenticated requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Update user state
    setUser(userData);

    return response.data;
  };

  /**
   * REGISTER FUNCTION
   * Creates a new user and logs them in immediately
   */
  const register = async (name, email, password) => {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/register`,
      { name, email, password }
    );

    const { token } = response.data;

    const userData = {
      name,
      email,
      role: 'customer' // default role for new users
    };

    // Store session
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setUser(userData);

    return response.data;
  };

  /**
   * LOGOUT FUNCTION
   * Clears all authentication data from app and storage
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    delete axios.defaults.headers.common['Authorization'];

    setUser(false);
  };

  /**
   * Set axios auth header if token already exists on refresh
   */
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  /**
   * Global auth value provided to entire app
   */
  const value = {
    user,
    loading,
    login,
    register,
    logout,

    // Derived states
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};