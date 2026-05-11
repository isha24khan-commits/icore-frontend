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
 * Handles order summary display and secure payment simulation.
 */
const CheckoutPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // State
  const [order, setOrder] = useState(null);
  const [planServices, setPlanServices] = useState([]);
  const [planPackages, setPlanPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Payment Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  /**
   * Fetch order + plan data
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
   * Input Formatters
   */
  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  /**
   * Payment Submission
   */
  const handlePayment = async () => {
    if (!cardName || !cardNumber || !expiry || !cvv) {
      toast.error('Please fill in all payment fields');
      return;
    }

    setProcessing(true);

    try {
      // In a real Stripe flow, you might redirect here
      // For this implementation, we proceed to success after API confirmation
      await api.post('/checkout/create-session', {
        order_id: orderId,
        origin_url: window.location.origin
      });

      toast.success('Payment processed successfully!');
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      console.error(err);
      toast.error('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-200 rounded-full"></div>
          <p className="text-slate-500 font-nunito">Loading your celebration...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/my-plan')}
          className="flex items-center gap-2 text-slate-600 hover:text-amber-500 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-nunito font-semibold">Back to My Plan</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT: Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h1 className="font-fredoka text-3xl text-slate-900 mb-6">Order Summary</h1>

              {/* Event Quick Stats */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl">
                  <Calendar size={20} className="text-purple-500" />
                  <div>
                    <p className="font-nunito text-xs text-slate-500 uppercase tracking-wide">Date</p>
                    <p className="font-nunito font-bold text-slate-900">
                      {order.event_date ? new Date(order.event_date).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl">
                  <Users size={20} className="text-green-500" />
                  <div>
                    <p className="font-nunito text-xs text-slate-500 uppercase tracking-wide">Guests</p>
                    <p className="font-nunito font-bold text-slate-900">{order.guest_count} Attendees</p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-nunito text-slate-600">Theme: {order.theme_name}</span>
                  <span className="font-nunito font-semibold text-slate-400 italic text-sm">Included</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-nunito text-slate-600">Venue: {order.venue_name}</span>
                  <span className="font-nunito font-semibold">
                    ${parseFloat(order.price_per_day || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>

                {/* Packages */}
                {planPackages.length > 0 && (
                  <div className="pt-2">
                    <p className="font-nunito text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-1">
                      <Package size={12} /> Selected Packages
                    </p>
                    {planPackages.map(pkg => (
                      <div key={pkg.package_id} className="flex justify-between items-center py-1">
                        <span className="font-nunito text-slate-600 text-sm pl-2">— {pkg.name}</span>
                        <span className="font-nunito font-semibold text-sm">
                          ${parseFloat(pkg.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Services */}
                {planServices.length > 0 && (
                  <div className="pt-2">
                    <p className="font-nunito text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-1">
                      <Wrench size={12} /> Add-on Services
                    </p>
                    {planServices.map(svc => (
                      <div key={svc.service_id} className="flex justify-between items-center py-1">
                        <span className="font-nunito text-slate-600 text-sm pl-2">— {svc.name}</span>
                        <span className="font-nunito font-semibold text-sm">
                          ${parseFloat(svc.estimated_price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-slate-100 pt-6 flex justify-between items-end">
                  <div>
                    <p className="font-fredoka text-xl text-slate-900">Total Estimate</p>
                    <p className="font-nunito text-xs text-slate-400 italic">Inclusive of all selected items</p>
                  </div>
                  <span className="font-fredoka text-4xl text-amber-500">
                    ${parseFloat(order.total_estimate || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>
              </div>

              {/* Status Notice */}
              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
                <div className="bg-blue-500 p-1 rounded-full text-white mt-0.5">
                  <Lock size={12} />
                </div>
                <p className="font-nunito text-blue-700 text-xs leading-relaxed">
                  <strong>Pending Approval:</strong> Your celebration details will be reviewed by our team immediately after payment. You can track progress in your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Payment Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-[0_20px_40px_rgb(0,0,0,0.08)] sticky top-24">
              <h2 className="font-fredoka text-2xl text-slate-900 mb-6">Payment</h2>

              <div className="space-y-4 mb-8">
                {/* Cardholder Name */}
                <div>
                  <label className="block font-nunito text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all font-nunito text-slate-900"
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label className="block font-nunito text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      maxLength="19"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all font-nunito text-slate-900"
                    />
                    <CreditCard size={18} className="absolute right-4 top-3.5 text-slate-300" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry */}
                  <div>
                    <label className="block font-nunito text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all font-nunito text-slate-900"
                    />
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block font-nunito text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="***"
                      maxLength="4"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all font-nunito text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className={`w-full py-4 rounded-2xl font-fredoka text-lg transition-all flex items-center justify-center gap-2 
                  ${processing 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg active:scale-[0.98]'
                  }`}
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Complete Booking
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                <Lock size={12} />
                <span>Encrypted & Secured</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
