import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut, ShoppingBag, LayoutDashboard } from 'lucide-react';

/**
 * Logo used in the header navigation bar.
 * Kept as a constant for easy reuse and updates.
 */
const LOGO_URL = "https://customer-assets.emergentagent.com/job_doc-database-hub/artifacts/kq2cvlzy_image.png";

/**
 * Header Component
 * ----------------
 * This component handles:
 * - Top navigation bar
 * - Authentication-based UI rendering
 * - Desktop and mobile navigation
 * - Admin/user-specific links
 */
const Header = () => {

  // Auth context provides user session and role info
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Controls mobile menu open/close state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Used for navigation actions (redirect after logout, etc.)
  const navigate = useNavigate();

  // Used to determine current active route
  const location = useLocation();

  /**
   * Handles user logout:
   * - Calls logout function from auth context
   * - Redirects user to homepage after logout
   */
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  /**
   * Navigation links displayed in the header
   * Centralized here for easy modification
   */
  const navLinks = [
    { name: 'Themes', path: '/themes' },
    { name: 'Venues', path: '/venues' },
    { name: 'Services', path: '/services' },
    { name: 'Packages', path: '/packages' },
  ];

  /**
   * Checks if a navigation link is active
   * Used to highlight the current page in UI
   */
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-header" data-testid="header">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main header layout: logo + nav + actions */}
        <div className="flex items-center justify-between h-20">

          {/* ================= LOGO SECTION ================= */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <img src={LOGO_URL} alt="iCore Celebrations" className="h-14 w-auto" />
          </Link>

          {/* ================= DESKTOP NAVIGATION ================= */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}

                /* Active link styling logic */
                className={`font-nunito font-semibold text-base transition-colors ${
                  isActive(link.path)
                    ? 'text-amber-500'
                    : 'text-slate-600 hover:text-amber-500'
                }`}

                data-testid={`nav-${link.name.toLowerCase()}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* ================= DESKTOP ACTIONS ================= */}
          <div className="hidden md:flex items-center gap-4">

            {/* If user is logged in */}
            {isAuthenticated ? (
              <>
                {/* My Plan link */}
                <Link
                  to="/my-plan"
                  className="flex items-center gap-2 text-slate-600 hover:text-amber-500 transition-colors"
                  data-testid="my-plan-link"
                >
                  <ShoppingBag size={20} />
                  <span className="font-nunito font-semibold">My Plan</span>
                </Link>

                {/* Admin dashboard (only for admin users) */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 text-slate-600 hover:text-purple-500 transition-colors"
                    data-testid="admin-link"
                  >
                    <LayoutDashboard size={20} />
                    <span className="font-nunito font-semibold">Admin</span>
                  </Link>
                )}

                {/* Profile link */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-slate-600 hover:text-amber-500 transition-colors"
                  data-testid="profile-link"
                >
                  <User size={20} />
                  <span className="font-nunito font-semibold">{user?.name}</span>
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors"
                  data-testid="logout-btn"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              /* If user is NOT logged in */
              <>
                <Link
                  to="/login"
                  className="btn-secondary text-sm px-6 py-2"
                  data-testid="login-link"
                >
                  Log In
                </Link>

                <Link
                  to="/register"
                  className="btn-primary text-sm px-6 py-2"
                  data-testid="register-link"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ================= MOBILE MENU BUTTON ================= */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {/* Toggle icon based on menu state */}
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

        {/* ================= MOBILE NAVIGATION MENU ================= */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200" data-testid="mobile-menu">

            <nav className="flex flex-col gap-4">

              {/* Mobile nav links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-nunito font-semibold text-base py-2 ${
                    isActive(link.path) ? 'text-amber-500' : 'text-slate-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Auth-based mobile menu */}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-plan"
                    className="font-nunito font-semibold text-base py-2 text-slate-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Plan
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="font-nunito font-semibold text-base py-2 text-purple-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="font-nunito font-semibold text-base py-2 text-slate-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="font-nunito font-semibold text-base py-2 text-red-500 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                /* Mobile login/register */
                <div className="flex flex-col gap-3 pt-4">

                  <Link
                    to="/login"
                    className="btn-secondary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>

                  <Link
                    to="/register"
                    className="btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>

                </div>
              )}

            </nav>
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;