import axios from 'axios';

// Backend base URL from environment variables
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Axios instance configured for your API
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: false
});

// Attach JWT token automatically to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // If token exists, attach it as Bearer token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Normalize backend error formats into readable strings
export const formatApiErrorDetail = (detail) => {
  if (detail == null) return "Something went wrong. Please try again.";

  // Plain string error
  if (typeof detail === "string") return detail;

  // Array of validation errors
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");

  // Single object error with msg
  if (detail && typeof detail.msg === "string") return detail.msg;

  return String(detail);
};

/* =======================
   THEMES API
======================= */

// Get all themes
export const getThemes = () => api.get('/themes');

// Get single theme by ID
export const getTheme = (id) => api.get(`/themes/${id}`);

/* =======================
   VENUES API
======================= */

// Get all venues
export const getVenues = () => api.get('/venues');

// Get venue by ID
export const getVenue = (id) => api.get(`/venues/${id}`);

/* =======================
   SERVICES API
======================= */

// Get all services
export const getServices = () => api.get('/services');

// Get single service
export const getService = (id) => api.get(`/services/${id}`);

/* =======================
   PACKAGES API
======================= */

// Get all packages
export const getPackages = () => api.get('/packages');

// Get single package
export const getPackage = (id) => api.get(`/packages/${id}`);

/* =======================
   PLANS API
======================= */

// Get current user plans
export const getPlans = () => api.get('/plans/my');

// NOTE: backend currently uses same endpoint for single plan fetch
export const getPlan = (id) => api.get('/plans/my');

// Create a new plan with theme + venue + event data
export const createPlan = (data) => api.post('/plans/theme', data);

// Add package to an existing plan
export const addPackageToPlan = (planId, data) => api.post('/plans/packages', data);

// Add service to plan
export const addServiceToPlan = (planId, data) => api.post('/plans/services', data);

// Remove package from plan
export const removePackageFromPlan = (planId, packageId) =>
  api.delete(`/plans/packages/${packageId}`);

// Remove service from plan
export const removeServiceFromPlan = (planId, serviceId) =>
  api.delete(`/plans/services/${serviceId}`);

// Delete entire plan
export const deletePlan = () => api.delete('/plans/my');

/* =======================
   ORDERS API
======================= */

// Get all orders for user
export const getOrders = () => api.get('/orders');

// Get single order
export const getOrder = (id) => api.get(`/orders/${id}`);

// Create new order
export const createOrder = (data) => api.post('/orders', data);

/* =======================
   CHECKOUT API
======================= */

// Create Stripe checkout session
export const createCheckoutSession = (data) =>
  api.post('/checkout/create-session', data);

// Get checkout session status
export const getCheckoutStatus = (sessionId) =>
  api.get(`/checkout/status/${sessionId}`);

/* =======================
   ADMIN API
======================= */

// Get all orders (admin view)
export const adminGetOrders = () => api.get('/admin/orders');

// Approve or update order status
export const adminApproveOrder = (orderId, data) =>
  api.post(`/admin/orders/${orderId}/approve`, data);

// Get dashboard stats
export const adminGetStats = () => api.get('/admin/stats');

// Export axios instance (for direct custom calls)
export default api;