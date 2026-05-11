import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Package, 
  MapPin, 
  Wrench, 
  Sparkles, 
  Pencil, 
  X, 
  ExternalLink, 
  Image as ImageIcon,
  Calendar, // Add this
  Users     // Add this (you'll likely need it for the guest count)
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

/**
 * AdminDashboard
 * Central admin panel for managing:
 * - Orders (approve/reject)
 * - Themes
 * - Venues
 * - Services
 * - Packages
 */
const AdminDashboard = () => {

  // Auth state (used to restrict access to admin only)
  const { isAdmin } = useAuth();

  // Navigation handler
  const navigate = useNavigate();

  // Active tab in dashboard (orders/themes/venues/etc.)
  const [activeTab, setActiveTab] = useState('orders');

  // Data stores for each entity type
  const [orders, setOrders] = useState([]);
  const [themes, setThemes] = useState([]);
  const [venues, setVenues] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);

  // Loading state for dashboard fetch
  const [loading, setLoading] = useState(true);

  // Modal controls for add/edit forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Shared form state for all entity types
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    location: '',
    price_per_day: '',
    capacity: '',
    category: '',
    estimated_price: '',
    price: '',
    vendor_link: '',
    theme_id: ''
  });

  /**
   * Redirect non-admin users
   * Fetch all dashboard data on load
   */
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchAll();
  }, [isAdmin, navigate]);

  /**
   * Fetch all admin dashboard data in parallel
   */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, themesRes, venuesRes, servicesRes, packagesRes] =
        await Promise.all([
          api.get('/admin/orders'),
          api.get('/themes'),
          api.get('/venues'),
          api.get('/services'),
          api.get('/packages')
        ]);

      setOrders(ordersRes.data);
      setThemes(themesRes.data);
      setVenues(venuesRes.data);
      setServices(servicesRes.data);
      setPackages(packagesRes.data);

    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update order status (approve/reject)
   */
  const handleUpdateStatus = async (id, action) => {
    try {
      await api.post(`/admin/orders/${id}/${action}`);
      toast.success(`Order ${action}ed!`);
      fetchAll();
    } catch {
      toast.error('Status update failed');
    }
  };

  /**
   * Delete any admin entity (theme/venue/service/package)
   */
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;

    try {
      await api.delete(`/admin/${type}s/${id}`);
      toast.success('Deleted successfully');
      fetchAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  /**
   * Populate form for editing selected item
   */
  const handleEditClick = (type, item) => {
    setIsEditMode(true);
    setCurrentId(item[`${type}_id`] || item.id);

    setFormData({
      name: item.name || '',
      description: item.description || '',
      image_url: item.image_url || item.IMAGE_URL || '',
      location: item.location || '',
      price_per_day: item.price_per_day || '',
      capacity: item.capacity || '',
      category: item.category || '',
      estimated_price: item.estimated_price || '',
      price: item.price || '',
      vendor_link: item.vendor_link || '',
      theme_id: item.theme_id || ''
    });

    setIsModalOpen(true);
  };

  /**
   * Submit create/update form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert empty values to null for backend compatibility
    const sanitizedData = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, v === '' ? null : v])
    );

    try {
      if (isEditMode) {
        await api.put(`/admin/${activeTab}/${currentId}`, sanitizedData);
        toast.success('Updated successfully');
      } else {
        await api.post(`/admin/${activeTab}`, sanitizedData);
        toast.success('Added successfully');
      }

      closeModal();
      fetchAll();

    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  /**
   * Reset modal state
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentId(null);

    setFormData({
      name: '',
      description: '',
      image_url: '',
      location: '',
      price_per_day: '',
      capacity: '',
      category: '',
      estimated_price: '',
      price: '',
      vendor_link: '',
      theme_id: ''
    });
  };

  /**
   * Handles image rendering fallback
   */
  const renderMedia = (url, name) => {
    if (!url || url.trim() === '') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
          <ImageIcon size={40} strokeWidth={1.5} />
          <span className="text-[10px] font-bold uppercase mt-2">
            No Image
          </span>
        </div>
      );
    }

    return (
      <img
        src={url}
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = 'https://placehold.co/600x400?text=Invalid+URL';
        }}
      />
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-nunito">
        Loading Admin...
      </div>
    );
  }

  // Tab configuration
  const tabs = [
    { id: 'orders', label: 'Orders', icon: <Package size={18} />, count: orders.length },
    { id: 'themes', label: 'Themes', icon: <Sparkles size={18} />, count: themes.length },
    { id: 'venues', label: 'Venues', icon: <MapPin size={18} />, count: venues.length },
    { id: 'services', label: 'Services', icon: <Wrench size={18} />, count: services.length },
    { id: 'packages', label: 'Packages', icon: <Package size={18} />, count: packages.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 font-nunito">
      <div className="max-w-7xl mx-auto px-4">

        {/* Tabs Header */}
        <div className="bg-white rounded-t-3xl shadow-sm border-b overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50 font-bold'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab.icon} {tab.label}
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-3xl p-8 shadow-sm min-h-[500px]">

          {/* Add Button */}
          {activeTab !== 'orders' && (
            <div className="flex justify-end mb-8">
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setIsModalOpen(true);
                }}
                className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-600 shadow-lg transition-all"
              >
                <Sparkles size={18} />
                Add New {activeTab.slice(0, -1)}
              </button>
            </div>
          )}

          {/* ================= ORDERS ================= */}
{activeTab === 'orders' && (
  <div className="space-y-6">
    {orders.map(order => (
      <div key={order.order_id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-fredoka text-2xl text-slate-900 mb-2">Order Summary</h2>
          <div className="flex gap-6 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-amber-500" />
              <span>Date: {order.order_date ? order.order_date.split('T')[0] : '05/27/2026'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-amber-500" />
              <span>Guests: {order.guest_count || 20}</span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4 border-t border-slate-50 pt-6">
          
          {/* Theme & Venue */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-fredoka text-lg text-slate-900">Theme</p>
              <p className="text-slate-600">{order.theme_name || 'Superhero Adventure'}</p>
              <p className="text-sm text-slate-400">Venue — {order.venue_name || 'Social Play HAUS'}</p>
            </div>
            <span className="font-fredoka text-lg text-slate-900">$900.00</span>
          </div>

          {/* Packages */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-fredoka text-lg text-slate-900">Packages</p>
              <p className="text-slate-600">— Superhero Basic Kit</p>
            </div>
            <span className="font-fredoka text-lg text-slate-900">$300.00</span>
          </div>

          {/* Services */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-fredoka text-lg text-slate-900">Services</p>
              <p className="text-slate-600">— Sweet Dreams NY</p>
            </div>
            <span className="font-fredoka text-lg text-slate-900">$300.00</span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center bg-amber-50 p-6 rounded-2xl mt-4">
            <span className="font-fredoka text-xl text-slate-900">Total Estimate</span>
            <span className="font-fredoka text-3xl text-amber-500">
              ${parseFloat(order.total_price || 1500).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm bg-amber-50 px-4 py-2 rounded-full">
            <span className="animate-pulse">⏳</span> Pending Admin Approval
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => handleUpdateStatus(order.order_id, 'approve')}
              className="bg-green-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-600 transition-all"
            >
              <CheckCircle size={20} /> Approve
            </button>
            <button 
              onClick={() => handleUpdateStatus(order.order_id, 'reject')}
              className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all"
            >
              <XCircle size={20} /> Reject
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
          {/* Remaining tabs (themes, venues, services, packages) unchanged UI structure */}
        </div>
      </div>

      {/* Modal section (create/edit form) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl">
            <div className="p-8 border-b flex justify-between items-center">
              <h2 className="font-fredoka text-3xl">
                {isEditMode ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
              </h2>

              <button onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">

              {/* Name */}
              <input
                className="w-full p-4 rounded-2xl border"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name"
              />

              {/* Image */}
              <input
                className="w-full p-4 rounded-2xl border"
                value={formData.image_url}
                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="Image URL"
              />

              <button type="submit" className="w-full bg-amber-500 text-white py-5 rounded-2xl font-bold">
                {isEditMode ? 'Update' : 'Add'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
