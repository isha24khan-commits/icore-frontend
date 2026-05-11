import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  Users,
  ArrowLeft,
  Lock,
  Package,
  Wrench
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

/**
 * CheckoutPage Component
 * ----------------------
 * This page handles:
 * - Displaying order summary
 * - Showing selected packages & services
 * - Payment form input
 * - Payment submission flow
 */
const CheckoutPage = () => {

  // Get order ID from URL
  const { orderId } = useParams();

  // Navigation helper
  const navigate = useNavigate();

  // Stores order details
  const [order, setOrder] = useState(null);

  // Stores selected services in plan
  const [planServices, setPlanServices] = useState([]);

  // Stores selected packages in plan
  const [planPackages, setPlanPackages] = useState([]);

  // Loading state for data fetch
  const [loading, setLoading] = useState(true);

  // Payment processing state
  const [processing, setProcessing] = useState(false);

  // Payment form fields
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  /**
   * Fetch order + plan data on page load
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, planRes] = await Promise.all([
          api.get(`/orders/${orderId}`),
          api.get('/plans/my')
        ]);

        setOrder(orderRes.data);
        setPlanServices(planRes.data.services || []);
        setPlanPackages(planRes.data.packages || []);

      } catch (error) {
        console.error(error);
        toast.error('Order not found');
        navigate('/my-plan');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, navigate]);

  /**
   * Handles payment submission
   * - Validates input fields
   * - Sends request to backend checkout API
   * - Redirects to success page on success
   */
  const handlePayment = async () => {
    if (!cardName || !cardNumber || !expiry || !cvv) {
      toast.error('Please fill in all payment fields');
      return;
    }

    setProcessing(true);

    try {
      await api.post('/checkout/create-session', {
        order_id: orderId,
        origin_url: window.location.origin
      });

      toast.success('Payment successful!');
      navigate(`/order-success/${orderId}`);

    } catch (err) {
      console.error(err);
      toast.error('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  /**
   * Formats card number input (adds spacing every 4 digits)
   */
  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
  };

  /**
   * Formats expiry date as MM/YY
   */
  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }

    return cleaned;
  };

  /**
   * Loading state UI
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-200 rounded-full"></div>
          <p className="text-slate-500 font-nunito">Loading order...</p>
        </div>
      </div>
    );
  }

  // If no order found, render nothing
  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back navigation */}
        <button
          onClick={() => navigate('/my-plan')}
          className="flex items-center gap-2 text-slate-600 hover:text-amber-500 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-nunito font-semibold">
            Back to My Plan
          </span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ================= ORDER SUMMARY ================= */}
          <div className="lg:col-span-2">

            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

              <h1 className="font-fredoka text-3xl text-slate-900 mb-6">
                Order Summary
              </h1>

              {/* Event Info Section */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">

                {/* Date */}
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl">
                  <Calendar size={20} className="text-purple-500" />
                  <div>
                    <p className="font-nunito text-xs text-slate-500">
                      Date
                    </p>

                    {/* Date formatting (MM/DD/YYYY) */}
                    <p className="font-nunito font-semibold text-slate-900 text-sm">
                      {order.event_date
                        ? (() => {
                            const [year, month, day] =
                              order.event_date.split('T')[0].split('-');
                            return `${month}/${day}/${year}`;
                          })()
                        : 'Loading...'}
                    </p>

                  </div>
                </div>

                {/* Guests */}
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl">
                  <Users size={20} className="text-green-500" />
                  <div>
                    <p className="font-nunito text-xs text-slate-500">
                      Guests
                    </p>
                    <p className="font-nunito font-semibold text-slate-900 text-sm">
                      {order.guest_count}
                    </p>
                  </div>
                </div>

              </div>

              {/* ================= PRICE BREAKDOWN ================= */}
              <div className="border-t border-slate-100 pt-6 space-y-3">

                <div className="flex justify-between items-center py-2">
                  <span className="font-nunito text-slate-600">Theme</span>
                  <span className="font-nunito font-semibold">
                    {order.theme_name}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="font-nunito text-slate-600">
                    Venue — {order.venue_name}
                  </span>
                  <span className="font-nunito font-semibold">
                    ${parseFloat(order.price_per_day || 0).toFixed(2)}
                  </span>
                </div>

                {/* Packages Section */}
                {planPackages.length > 0 && (
                  <div className="pt-2">
                    <p className="font-nunito text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Package size={12} /> Packages
                    </p>

                    {planPackages.map(pkg => (
                      <div key={pkg.package_id} className="flex justify-between items-center py-1">
                        <span className="font-nunito text-slate-600 text-sm">
                          — {pkg.name}
                        </span>
                        <span className="font-nunito font-semibold text-sm">
                          ${parseFloat(pkg.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Services Section */}
                {planServices.length > 0 && (
                  <div className="pt-2">
                    <p className="font-nunito text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Wrench size={12} /> Services
                    </p>

                    {planServices.map(svc => (
                      <div key={svc.service_id} className="flex justify-between items-center py-1">
                        <span className="font-nunito text-slate-600 text-sm">
                          — {svc.name}
                        </span>
                        <span className="font-nunito font-semibold text-sm">
                          ${parseFloat(svc.estimated_price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="font-fredoka text-xl text-slate-900">
                    Total Estimate
                  </span>
                  <span className="font-fredoka text-3xl text-amber-500">
                    ${parseFloat(order.total_estimate || 0).toFixed(2)}
                  </span>
                </div>

              </div>

              {/* Notice */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="font-nunito text-amber-700 text-sm">
                  ⏳ After payment your order will be <strong>pending admin approval</strong>.
                  You can track the status on your profile page.
                </p>
              </div>

            </div>
          </div>

          {/* ================= PAYMENT FORM ================= */}
          <div className="lg:col-span-1">

            <div className="bg-white rounded-3xl p-8 shadow-[0_20px_40px_rgb(0,0,0,0.08)] sticky top-24">

              <h2 className="font-fredoka text-2xl text-slate-900 mb-6">
                Payment Details
              </h2>

              {/* Payment inputs (card details) */}
              {/* (inputs */}

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? 'Processing...' : (
                  <>
                    <CreditCard size={20} />
                    Pay Now
                  </>
                )}
              </button>

              {/* Security note */}
              <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-sm">
                <Lock size={14} />
                <span className="font-nunito">Secured Payment</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CheckoutPage;