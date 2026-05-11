import React, { useState, useEffect } from 'react';
import { getPackages } from '../services/api';
import { Gift, DollarSign, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useNavigate } from 'react-router-dom';

/**
 * PackagesPage
 * Displays all available party packages
 * Includes filtering by theme and navigation to package details
 */
const PackagesPage = () => {

  // Stores all packages from API
  const [packages, setPackages] = useState([]);

  // Stores filtered packages based on selected theme
  const [filteredPackages, setFilteredPackages] = useState([]);

  // Stores unique theme list for filtering dropdown
  const [themes, setThemes] = useState([]);

  // Currently selected theme filter
  const [selectedTheme, setSelectedTheme] = useState('all');

  // Loading state while fetching data
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /**
   * Fetch packages from backend API on page load
   * Also extracts unique themes for filtering
   */
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await getPackages();

        // Store full dataset
        setPackages(response.data);

        // Default view shows all packages
        setFilteredPackages(response.data);

        // Extract unique theme names (remove null/undefined)
        const uniqueThemes = [...new Set(response.data.map(p => p.theme_name).filter(Boolean))];
        setThemes(uniqueThemes);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  /**
   * Updates displayed packages when theme filter changes
   */
  useEffect(() => {
    if (selectedTheme === 'all') {
      setFilteredPackages(packages);
    } else {
      setFilteredPackages(packages.filter(p => p.theme_name === selectedTheme));
    }
  }, [selectedTheme, packages]);

  /**
   * Determines if a package should be styled as premium/deluxe
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
   * Loading UI state while API request is in progress
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-200 rounded-full"></div>
          <p className="text-slate-500 font-nunito">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12" data-testid="packages-page">

      {/* Page header section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title + intro */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
            <Gift size={16} />
            Party Packages
          </div>

          <h1 className="font-fredoka text-4xl sm:text-5xl text-slate-900 mb-4">
            All-Inclusive{' '}
            <span className="gradient-text">Packages</span>
          </h1>

          <p className="font-nunito text-lg text-slate-600 max-w-2xl mx-auto">
            Choose from our curated packages that bundle decorations, 
            supplies, and extras for each theme.
          </p>
        </div>

        {/* Theme filter dropdown */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm">
            <Sparkles size={18} className="text-amber-400" />

            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="border-none shadow-none w-[220px] font-nunito" data-testid="theme-filter">
                <SelectValue placeholder="All Themes" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Themes</SelectItem>
                {themes.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Packages grid display */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {/* Individual package cards */}
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.package_id}
              className={`relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 card-hover cursor-pointer ${
                isDeluxe(pkg.name) ? 'border-amber-300' : 'border-transparent'
              }`}
              data-testid={`package-card-${pkg.package_id}`}
              onClick={() => navigate(`/packages/${pkg.package_id}`)}
            >

              {/* Package image or fallback */}
              {pkg.image_url ? (
                <img
                  src={pkg.image_url}
                  alt={pkg.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className={`w-full h-40 flex items-center justify-center ${isDeluxe(pkg.name) ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-gradient-to-br from-pink-100 to-purple-100'}`}>
                  <span className="text-5xl">🎁</span>
                </div>
              )}

              <div className="p-6">

                {/* Premium badge */}
                {isDeluxe(pkg.name) && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                      Premium
                    </span>
                  </div>
                )}

                {/* Theme label */}
                <div className="mb-4">
                  <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {pkg.theme_name || 'General'}
                  </span>
                </div>

                {/* Package name */}
                <h3 className="font-fredoka text-lg text-slate-900 mb-4">
                  {pkg.name}
                </h3>

                {/* Price display */}
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-amber-500" />
                  <span className="font-fredoka text-2xl text-slate-900">
                    {parseFloat(pkg.price).toFixed(2)}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <p className="font-nunito text-slate-500">No packages found for this theme.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PackagesPage;