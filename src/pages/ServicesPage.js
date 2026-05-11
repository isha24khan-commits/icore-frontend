import React, { useState, useEffect } from 'react';
import { getServices } from '../services/api';
import { PartyPopper, DollarSign, ExternalLink, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useNavigate } from 'react-router-dom';

const ServicesPage = () => {

  // Stores full list of services fetched from backend
  const [services, setServices] = useState([]);

  // Stores filtered services based on selected category
  const [filteredServices, setFilteredServices] = useState([]);

  // Stores unique categories extracted from services
  const [categories, setCategories] = useState([]);

  // Tracks currently selected category filter
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Loading state for API request
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch services from backend on first render
  useEffect(() => {
    const fetchServices = async () => {
      try {

        // API call to fetch all services
        const response = await getServices();

        // Save raw services data
        setServices(response.data);

        // Default filtered list = all services
        setFilteredServices(response.data);

        // Extract unique categories from service list
        const uniqueCategories = [...new Set(response.data.map(s => s.category))];
        setCategories(uniqueCategories);

      } catch (error) {

        // Log any API errors
        console.error('Error fetching services:', error);

      } finally {

        // Stop loading spinner
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Update filtered services whenever category changes
  useEffect(() => {

    // If "all" selected, show everything
    if (selectedCategory === 'all') {
      setFilteredServices(services);
    } else {

      // Filter services by selected category
      setFilteredServices(
        services.filter(s => s.category === selectedCategory)
      );
    }

  }, [selectedCategory, services]);

  // Returns Tailwind CSS color classes for each category badge
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

    // fallback style if category not found
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  // Show loading screen while fetching services
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">

          {/* loading indicator */}
          <div className="w-16 h-16 bg-amber-200 rounded-full"></div>

          <p className="text-slate-500 font-nunito">
            Loading services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12" data-testid="services-page">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}
        <div className="text-center mb-12">

          {/* Header badge */}
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
            <PartyPopper size={16} />
            Party Services
          </div>

          {/* Page title */}
          <h1 className="font-fredoka text-4xl sm:text-5xl text-slate-900 mb-4">
            Premium{' '}
            <span className="gradient-text">Services</span>
          </h1>

          {/* Subtitle */}
          <p className="font-nunito text-lg text-slate-600 max-w-2xl mx-auto">
            From delicious cakes to amazing entertainment, partner with Long Island's 
            finest vendors for your celebration.
          </p>
        </div>

        {/* FILTER SECTION */}
        <div className="flex justify-center mb-8">

          <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm">

            <Filter size={18} className="text-slate-400" />

            {/* Category dropdown filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>

              <SelectTrigger className="border-none shadow-none w-[200px] font-nunito" data-testid="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>

              <SelectContent>

                {/* default option */}
                <SelectItem value="all">All Categories</SelectItem>

                {/* dynamic categories */}
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}

              </SelectContent>
            </Select>
          </div>
        </div>

        {/* SERVICES GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {/* loop through filtered services */}
          {filteredServices.map((service) => (
            <div
              key={service.service_id}
              className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 card-hover cursor-pointer group"
              onClick={() => navigate(`/services/${service.service_id}`)}
            >

              {/* IMAGE SECTION */}
              <div className="w-full h-64 overflow-hidden bg-slate-50 flex items-center justify-center p-2">

                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.name}

                    // smart image fit depending on vendor type
                    className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                      ['Campbell\'s Bakery', 'Sweet Karma Desserts', 'Nitas Pastries', 'Balloon Artistry LI'].includes(service.name)
                        ? 'object-contain'
                        : 'object-cover object-top'
                    }`}

                    // fallback image if loading fails
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400?text=Service+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <span className="text-5xl">🎉</span>
                  </div>
                )}
              </div>

              {/* CARD CONTENT */}
              <div className="p-6">

                {/* category badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${getCategoryColor(service.category)}`}>
                  {service.category}
                </span>

                {/* service name */}
                <h3 className="font-fredoka text-xl text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {service.name}
                </h3>

                {/* price */}
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={18} className="text-amber-500" />
                  <span className="font-nunito font-bold text-slate-900">
                    ${parseFloat(service.estimated_price).toFixed(2)}
                  </span>
                  <span className="font-nunito text-slate-500 text-sm">estimated</span>
                </div>

                {/* vendor link */}
                {service.vendor_link && (
                  <a
                    href={service.vendor_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-600 font-nunito font-semibold text-sm"
                  >
                    Visit Vendor
                    <ExternalLink size={14} />
                  </a>
                )}

              </div>
            </div>
          ))}

        </div>

        {/* EMPTY STATE */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="font-nunito text-slate-500">
              No services found in this category.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ServicesPage;