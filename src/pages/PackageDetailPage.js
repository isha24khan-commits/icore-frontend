import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPackage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, ArrowLeft, Gift, Sparkles, Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

/**
 * PackageDetailPage
 * Displays full details of a selected package including:
 * - Image or fallback icon
 * - Description
 * - Theme information
 * - Price
 * - Ability to add package to user's plan
 */
const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Stores selected package data
  const [pkg, setPkg] = useState(null);

  // Loading state while fetching package details
  const [loading, setLoading] = useState(true);

  /**
   * Fetch package details on page load or when ID changes
   */
  useEffect(() => {
    getPackage(id)
      .then(r => setPkg(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  /**
   * Determines whether a package is considered "premium/deluxe"
   * based on keywords in the package name
   */
  const isDeluxe = (name) => {
    return name.toLowerCase().includes('deluxe') ||
      name.toLowerCase().includes('mega') ||
      name.toLowerCase().includes('premium') ||
      name.toLowerCase().includes('ultimate') ||
      name.toLowerCase().includes('pro') ||
      name.toLowerCase().includes('full') ||
      name.toLowerCase().includes('luxury');
  };

  /**
   * Adds the selected package to the user's plan
   * Requires authentication; redirects to login if not logged in
   */
  const handleAddToplan = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }

    try {
      await api.post('/plans/packages', { package_id: parseInt(id), quantity: 1 });
      toast.success('Package added to your plan!');
      navigate('/my-plan');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add package');
    }
  };

  /**
   * Loading state UI
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-200 rounded-full"></div>
          <p className="text-slate-500 font-nunito">Loading package...</p>
        </div>
      </div>
    );
  }

  /**
   * If no package is found, render nothing
   */
  if (!pkg) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back navigation */}
        <button
          onClick={() => navigate('/packages')}
          className="flex items-center gap-2 text-slate-600 hover:text-amber-500 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-nunito font-semibold">Back to Packages</span>
        </button>

        {/* Main package card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)]">

          {/* Package image section (or fallback icon) */}
          <div className={`h-85 flex items-center justify-center overflow-hidden ${isDeluxe(pkg.name) ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-gradient-to-br from-pink-100 to-purple-100'}`}>
            {pkg.image_url ? (
              <img
                src={pkg.image_url}
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Gift size={80} className={isDeluxe(pkg.name) ? 'text-amber-400' : 'text-pink-400'} />
            )}
          </div>

          <div className="p-8">

            {/* Premium badge for deluxe packages */}
            {isDeluxe(pkg.name) && (
              <div className="inline-block bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg mb-4">
                Premium Package
              </div>
            )}

            {/* Description section */}
            {pkg.description && (
              <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <p className="font-nunito text-slate-600 leading-relaxed">
                  {pkg.description}
                </p>
              </div>
            )}

            {/* Theme and price details */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">

              {/* Theme info */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles size={24} className="text-amber-500" />
                  <span className="font-fredoka text-lg text-slate-900">Theme</span>
                </div>
                <p className="font-nunito text-xl font-bold text-slate-900">
                  {pkg.theme_name}
                </p>
              </div>

              {/* Price info */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign size={24} className="text-amber-500" />
                  <span className="font-fredoka text-lg text-slate-900">Price</span>
                </div>
                <p className="font-nunito text-3xl font-bold text-slate-900">
                  ${parseFloat(pkg.price).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Add to plan button */}
            <button
              onClick={handleAddToplan}
              className="btn-primary px-8 py-4 text-lg flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add to My Plan
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailPage;