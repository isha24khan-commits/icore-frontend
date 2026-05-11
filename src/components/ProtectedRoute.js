import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * ------------------------
 * This component restricts access to routes that require authentication.
 * If the user is not logged in, they are redirected to the login page.
 */
export const ProtectedRoute = ({ children }) => {

  // Get authentication state from context
  const { user, loading } = useAuth();

  /**
   * While authentication state is being checked,
   * show a loading screen to prevent UI flicker.
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">

          {/* Loading indicator UI */}
          <div className="w-16 h-16 bg-amber-200 rounded-full"></div>
          <p className="text-slate-500 font-nunito">Loading...</p>

        </div>
      </div>
    );
  }

  /**
   * If user is NOT authenticated,
   * redirect them to login page
   */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, allow access to protected content
  return children;
};

/**
 * AdminRoute Component
 * --------------------
 * This is a stricter protected route that:
 * - Requires user to be logged in
 * - Requires user to have admin privileges
 */
export const AdminRoute = ({ children }) => {

  // Get authentication + role info
  const { user, loading, isAdmin } = useAuth();

  /**
   * Show loading screen while auth state is resolving
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">

          {/* Loading indicator */}
          <div className="w-16 h-16 bg-amber-200 rounded-full"></div>
          <p className="text-slate-500 font-nunito">Loading...</p>

        </div>
      </div>
    );
  }

  /**
   * If user is not logged in,
   * redirect to login page
   */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /**
   *    If user is logged in but NOT an admin,
   * redirect them to homepage (no access)
   */
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If admin, allowing access to protected admin routes
  return children;
};