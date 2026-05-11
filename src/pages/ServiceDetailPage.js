import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, ExternalLink, ArrowLeft, Tag, Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const ServiceDetailPage = () => {
  // Get service ID from URL
  const { id } = useParams();

  // React Router navigation
  const navigate = useNavigate();

  // Check user authentication status
  const { isAuthenticated } = useAuth();

  // Store selected service data
  const [service, setService] = useState(null);

  // Loading state while fetching service
  const [loading, setLoading] = useState(true);

  // Fetch service details when page loads
  useEffect(() => {
    getService(id)
      .then(r => setService(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Return different badge colors based on category
  const getCategoryColor = (category) => {
    const colors = {
      'Custom Cakes': 'bg-pink-100 text-pink-700',
      'Dessert Tables': 'bg-rose-100 text-rose-700',
      'Catering': 'bg-orange-100 text-orange-700',
      'Clown Entertainment': 'bg-yellow-100 text-yellow-700',
      'Magician': 'bg-purple-100 text-purple-700',
      'Face Painting': 'bg-cyan-100 text-cyan-700',
      'Photography': 'bg-blue-100 text-blue-700',
      'Balloon Decor': 'bg-red-100 text-red-700',
      'Birthday Decor': 'bg-amber-100 text-amber-700',
      'Party Supplies': 'bg-green-100 text-green-700',
      'Food Truck Catering': 'bg-lime-100 text-lime-700',
      'Pizza Catering': 'bg-orange-100 text-orange-700',
      'Bounce House Rental': 'bg-indigo-100 text-indigo-700',
    };

    // Default fallback color
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  // Add service into user's plan
  const handleAddToplan = async () => {

    // Redirect guest users to login page
    if (!isAuthenticated) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }

    try {
      // Send add service request
      await api.post('/plans/services', {
        service_id: parseInt(id),
        quantity: 1
      });

      // Success notification
      toast.success('Service added to your plan!');

      // Redirect to My Plan page
      navigate('/my-plan');

    } catch (err) {

      // Show backend error if request fails
      toast.error(
        err.response?.data?.error || 'Failed to add service'
      );
    }
  };

  // Loading screen while API request completes
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-200 rounded-full"></div>
          <p className="text-slate-500 font-nunito">
            Loading service...
          </p>
        </div>
      </div>
    );
  }

  // Prevent rendering if service doesn't exist
  if (!service) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">

      {/* Main container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back navigation button */}
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-2 text-slate-600 hover:text-amber-500 transition-colors mb-8"
        >
          <ArrowLeft size={20} />

          <span className="font-nunito font-semibold">
            Back to Services
          </span>
        </button>

        {/* Service detail card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_5px_20px_rgb(0,0,0,0.08)]">

          {/* Service image section */}
          <div className="h-55 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">

            {service.image_url ? (

              // Display uploaded service image
              <img
                src={service.image_url}
                alt={service.name}
                className="w-full h-[400px] lg:h-[500px] object-cover rounded-3xl shadow-lg"
              />

            ) : (

              // Fallback emoji placeholder
              <span className="text-8xl">🎉</span>
            )}
          </div>

          <div className="p-8">

            {/* Service title and category */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">

              <div>

                {/* Category badge */}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${getCategoryColor(service.category)}`}
                >
                  {service.category}
                </span>

                {/* Service name */}
                <h1 className="font-fredoka text-3xl sm:text-4xl text-slate-900">
                  {service.name}
                </h1>

              </div>
            </div>

            {/* Information cards */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">

              {/* Category info */}
              <div className="bg-slate-50 rounded-2xl p-6">

                <div className="flex items-center gap-3 mb-2">

                  <Tag size={24} className="text-purple-500" />

                  <span className="font-fredoka text-lg text-slate-900">
                    Category
                  </span>

                </div>

                <p className="font-nunito text-xl font-bold text-slate-900">
                  {service.category}
                </p>

              </div>

              {/* Pricing info */}
              <div className="bg-slate-50 rounded-2xl p-6">

                <div className="flex items-center gap-3 mb-2">

                  <DollarSign size={24} className="text-amber-500" />

                  <span className="font-fredoka text-lg text-slate-900">
                    Estimated Price
                  </span>

                </div>

                {/* Format price to 2 decimals */}
                <p className="font-nunito text-3xl font-bold text-slate-900">
                  ${parseFloat(service.estimated_price).toFixed(2)}
                </p>

              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">

              {/* Add to plan button */}
              <button
                onClick={handleAddToplan}
                className="btn-primary px-8 py-4 text-lg flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add to My Plan
              </button>

              {/* External vendor link */}
              {service.vendor_link && (

                <a
                  href={service.vendor_link}

                  // Open in new tab
                  target="_blank"

                  // Security protection for external links
                  rel="noopener noreferrer"

                  className="btn-secondary px-8 py-4 text-lg flex items-center justify-center gap-2"
                >
                  Visit Vendor

                  <ExternalLink size={18} />
                </a>

              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;