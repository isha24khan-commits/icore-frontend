import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from './components/ui/sonner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ThemesPage from './pages/ThemesPage';
import ThemeDetailPage from './pages/ThemeDetailPage';
import VenuesPage from './pages/VenuesPage';
import VenueDetailPage from './pages/VenueDetailPage';
import ServicesPage from './pages/ServicesPage';
import PackagesPage from './pages/PackagesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import PackageDetailPage from './pages/PackageDetailPage';
import MyPlanPage from './pages/MyPlanPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

function App() {
  return (
    // Global authentication wrapper (provides user state across app)
    <AuthProvider>

      {/* Router handles all page navigation */}
      <BrowserRouter>

        {/* Main app layout container */}
        <div className="App min-h-screen flex flex-col">

          {/* Top navigation bar */}
          <Header />

          {/* Main page content area */}
          <main className="flex-1">

            {/* Application routes */}
            <Routes>

              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Theme browsing */}
              <Route path="/themes" element={<ThemesPage />} />
              <Route path="/themes/:id" element={<ThemeDetailPage />} />

              {/* Venue browsing */}
              <Route path="/venues" element={<VenuesPage />} />
              <Route path="/venues/:id" element={<VenueDetailPage />} />

              {/* Services browsing */}
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />

              {/* Packages browsing */}
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/packages/:id" element={<PackageDetailPage />} />

              {/* Protected user plan page */}
              <Route
                path="/my-plan"
                element={
                  <ProtectedRoute>
                    <MyPlanPage />
                  </ProtectedRoute>
                }
              />

              {/* DUPLICATE ROUTE (kept as-is, no changes requested) */}
              <Route
                path="/my-plan"
                element={
                  <ProtectedRoute>
                    <MyPlanPage />
                  </ProtectedRoute>
                }
              />

              {/* Checkout flow (requires login) */}
              <Route
                path="/checkout/:orderId"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />

              {/* Order success confirmation page */}
              <Route
                path="/order-success/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderSuccessPage />
                  </ProtectedRoute>
                }
              />

              {/* User profile page */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only dashboard */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

            </Routes>
          </main>

          {/* Footer shown on all pages */}
          <Footer />

          {/* Global toast notifications */}
          <Toaster position="top-right" richColors />

        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;