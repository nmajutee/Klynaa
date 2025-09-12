/**
 * Customer Bins - Bin management for customers
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { customerDashboardApi, Bin, CreateBin, PickupRequest } from '../../services/customerDashboardApi';
import { useAuth } from '../../stores/authStore';

interface FilterState {
  status: string;
  search: string;
}

interface BinModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  bin: Bin | null;
}

interface NewBinFormData extends CreateBin {
  use_current_location: boolean;
}

const CustomerBins: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    search: ''
  });

  const [binModal, setBinModal] = useState<BinModalState>({
    isOpen: false,
    mode: 'create',
    bin: null
  });

  const [binForm, setBinForm] = useState<NewBinFormData>({
    label: '',
    latitude: 0,
    longitude: 0,
    address: '',
    capacity_liters: 120,
    use_current_location: false
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedBinHistory, setSelectedBinHistory] = useState<{
    binId: number | null;
    history: PickupRequest[];
    loading: boolean;
  }>({
    binId: null,
    history: [],
    loading: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'customer') {
      router.push('/dashboard');
      return;
    }

    loadBins();
  }, [isAuthenticated, user, router]);

  const loadBins = async () => {
    try {
      setLoading(true);
      const response = await customerDashboardApi.getBins();
      setBins(response.results);
    } catch (err) {
      console.error('Failed to load bins:', err);
      setError('Failed to load bins');
    } finally {
      setLoading(false);
    }
  };

  const refreshBins = async () => {
    setRefreshing(true);
    await loadBins();
    setRefreshing(false);
  };

  const filteredBins = bins.filter(bin => {
    const matchesStatus = filters.status === 'all' || bin.status === filters.status;
    const matchesSearch = !filters.search || 
      bin.label.toLowerCase().includes(filters.search.toLowerCase()) ||
      bin.address.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setBinForm(prev => ({ ...prev, latitude, longitude }));
        
        // Try to get address from coordinates (reverse geocoding)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data.display_name) {
            setBinForm(prev => ({ ...prev, address: data.display_name }));
          }
        } catch (err) {
          console.error('Failed to get address:', err);
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get your location. Please enter coordinates manually.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    );
  };

  const openBinModal = (mode: 'create' | 'edit' | 'view', bin?: Bin) => {
    setBinModal({ isOpen: true, mode, bin: bin || null });
    
    if (mode === 'create') {
      setBinForm({
        label: '',
        latitude: 0,
        longitude: 0,
        address: '',
        capacity_liters: 120,
        use_current_location: false
      });
    } else if (bin && mode === 'edit') {
      setBinForm({
        label: bin.label,
        latitude: bin.latitude,
        longitude: bin.longitude,
        address: bin.address,
        capacity_liters: bin.capacity_liters,
        use_current_location: false
      });
    }
    
    setFormErrors({});
  };

  const closeBinModal = () => {
    setBinModal({ isOpen: false, mode: 'create', bin: null });
    setBinForm({
      label: '',
      latitude: 0,
      longitude: 0,
      address: '',
      capacity_liters: 120,
      use_current_location: false
    });
    setFormErrors({});
  };

  const validateBinForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!binForm.label.trim()) {
      errors.label = 'Bin label is required';
    }

    if (!binForm.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!binForm.latitude || !binForm.longitude) {
      errors.location = 'Location coordinates are required';
    }

    if (binForm.capacity_liters < 10 || binForm.capacity_liters > 1000) {
      errors.capacity = 'Capacity must be between 10 and 1000 liters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBinForm()) return;

    try {
      setSubmitting(true);
      
      const binData: CreateBin = {
        label: binForm.label,
        latitude: binForm.latitude,
        longitude: binForm.longitude,
        address: binForm.address,
        capacity_liters: binForm.capacity_liters
      };

      if (binModal.mode === 'create') {
        await customerDashboardApi.createBin(binData);
      } else if (binModal.mode === 'edit' && binModal.bin) {
        await customerDashboardApi.updateBin(binModal.bin.id, binData);
      }

      await refreshBins();
      closeBinModal();
    } catch (err: any) {
      console.error('Failed to save bin:', err);
      
      if (err.response?.data) {
        const backendErrors: Record<string, string> = {};
        Object.keys(err.response.data).forEach(key => {
          backendErrors[key] = Array.isArray(err.response.data[key]) 
            ? err.response.data[key][0] 
            : err.response.data[key];
        });
        setFormErrors(backendErrors);
      } else {
        setFormErrors({ general: 'Failed to save bin. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBin = async (bin: Bin) => {
    if (!confirm(`Are you sure you want to delete "${bin.label}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await customerDashboardApi.deleteBin(bin.id);
      await refreshBins();
    } catch (err) {
      console.error('Failed to delete bin:', err);
      alert('Failed to delete bin. Please try again.');
    }
  };

  const handleReportFull = async (bin: Bin) => {
    try {
      await customerDashboardApi.reportFullBin(bin.id);
      await refreshBins();
    } catch (err) {
      console.error('Failed to report full bin:', err);
      alert('Failed to report bin as full. Please try again.');
    }
  };

  const loadBinHistory = async (binId: number) => {
    setSelectedBinHistory({ binId, history: [], loading: true });
    
    try {
      const history = await customerDashboardApi.getBinPickupHistory(binId);
      setSelectedBinHistory({ binId, history, loading: false });
    } catch (err) {
      console.error('Failed to load bin history:', err);
      setSelectedBinHistory({ binId, history: [], loading: false });
    }
  };

  const getBinStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'full': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !refreshing) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bins...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Bins</h1>
                <p className="text-gray-600 mt-1">
                  Manage your waste bins and track their status
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={refreshBins}
                  disabled={refreshing}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  {refreshing ? '⟳' : '🔄'} Refresh
                </button>
                <button
                  onClick={() => openBinModal('create')}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <span>➕</span>
                  Add Bin
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="full">Full</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by label or address..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bins</p>
                  <p className="text-2xl font-bold text-gray-900">{bins.length}</p>
                </div>
                <div className="text-blue-500 text-2xl">🗑️</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-900">
                    {bins.filter(b => b.status === 'active').length}
                  </p>
                </div>
                <div className="text-green-500 text-2xl">✅</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Full Bins</p>
                  <p className="text-2xl font-bold text-red-900">
                    {bins.filter(b => b.status === 'full' || b.fill_level >= 80).length}
                  </p>
                </div>
                <div className="text-red-500 text-2xl">🚨</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Fill Level</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {bins.length > 0 ? Math.round(bins.reduce((sum, b) => sum + b.fill_level, 0) / bins.length) : 0}%
                  </p>
                </div>
                <div className="text-purple-500 text-2xl">📊</div>
              </div>
            </div>
          </div>

          {/* Bins List */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={refreshBins}
                className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          ) : filteredBins.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🗑️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {bins.length === 0 ? 'No Bins Added' : 'No Bins Found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {bins.length === 0 
                  ? "Add your first bin to start managing waste collection."
                  : "No bins match your current filters."}
              </p>
              {bins.length === 0 && (
                <button
                  onClick={() => openBinModal('create')}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                >
                  Add Your First Bin
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredBins.map((bin) => (
                <div key={bin.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{bin.label}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBinStatusColor(bin.status)}`}>
                          {bin.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{bin.address}</p>
                      <p className="text-xs text-gray-500">ID: {bin.bin_id}</p>
                    </div>
                  </div>

                  {/* Fill Level Indicator */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Fill Level</span>
                      <span className={`text-sm font-medium ${customerDashboardApi.getFillLevelColor(bin.fill_level)}`}>
                        {bin.fill_level}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${customerDashboardApi.getFillLevelBgColor(bin.fill_level)}`}
                        style={{ width: `${bin.fill_level}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Bin Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Capacity</p>
                      <p className="font-medium">{bin.capacity_liters}L</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Pickup</p>
                      <p className="font-medium">
                        {bin.last_pickup ? customerDashboardApi.formatDate(bin.last_pickup) : 'Never'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <button
                        onClick={() => router.push(`/customer/pickups/new?bin=${bin.id}`)}
                        className="w-full bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 text-sm"
                      >
                        📋 Request Pickup
                      </button>
                      
                      {bin.fill_level < 80 && bin.status === 'active' && (
                        <button
                          onClick={() => handleReportFull(bin)}
                          className="w-full bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 text-sm"
                        >
                          🚨 Report Full
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => loadBinHistory(bin.id)}
                        className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm"
                      >
                        📊 History
                      </button>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => openBinModal('edit', bin)}
                          className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteBin(bin)}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bin Modal */}
        {binModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {binModal.mode === 'create' ? 'Add New Bin' : 
                 binModal.mode === 'edit' ? 'Edit Bin' : 'Bin Details'}
              </h3>
              
              {formErrors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700">{formErrors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmitBin} className="space-y-4">
                {/* Bin Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bin Label *
                  </label>
                  <input
                    type="text"
                    value={binForm.label}
                    onChange={(e) => setBinForm(prev => ({ ...prev, label: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 ${formErrors.label ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., Kitchen Bin, Office Waste"
                    disabled={binModal.mode === 'view'}
                  />
                  {formErrors.label && <p className="text-sm text-red-600 mt-1">{formErrors.label}</p>}
                </div>

                {/* Location */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Location *
                    </label>
                    {binModal.mode !== 'view' && (
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                      >
                        {locationLoading ? '📍 Getting...' : '📍 Use Current Location'}
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <input
                        type="number"
                        step="any"
                        value={binForm.latitude || ''}
                        onChange={(e) => setBinForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                        className={`w-full border rounded-lg px-3 py-2 ${formErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Latitude"
                        disabled={binModal.mode === 'view'}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="any"
                        value={binForm.longitude || ''}
                        onChange={(e) => setBinForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                        className={`w-full border rounded-lg px-3 py-2 ${formErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Longitude"
                        disabled={binModal.mode === 'view'}
                      />
                    </div>
                  </div>
                  {formErrors.location && <p className="text-sm text-red-600">{formErrors.location}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    value={binForm.address}
                    onChange={(e) => setBinForm(prev => ({ ...prev, address: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 h-20 ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Full address where the bin is located"
                    disabled={binModal.mode === 'view'}
                  />
                  {formErrors.address && <p className="text-sm text-red-600 mt-1">{formErrors.address}</p>}
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (Liters) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={binForm.capacity_liters}
                    onChange={(e) => setBinForm(prev => ({ ...prev, capacity_liters: parseInt(e.target.value) || 120 }))}
                    className={`w-full border rounded-lg px-3 py-2 ${formErrors.capacity ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={binModal.mode === 'view'}
                  />
                  {formErrors.capacity && <p className="text-sm text-red-600 mt-1">{formErrors.capacity}</p>}
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeBinModal}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    {binModal.mode === 'view' ? 'Close' : 'Cancel'}
                  </button>
                  
                  {binModal.mode !== 'view' && (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : (binModal.mode === 'create' ? 'Add Bin' : 'Save Changes')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bin History Modal */}
        {selectedBinHistory.binId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Pickup History - {bins.find(b => b.id === selectedBinHistory.binId)?.label}
                </h3>
                <button
                  onClick={() => setSelectedBinHistory({ binId: null, history: [], loading: false })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {selectedBinHistory.loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading history...</p>
                </div>
              ) : selectedBinHistory.history.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📋</div>
                  <p className="text-gray-600">No pickup history for this bin</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedBinHistory.history.map(pickup => (
                    <div key={pickup.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Pickup #{pickup.id}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${customerDashboardApi.getStatusColor(pickup.status)}`}>
                              {pickup.status_display}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {customerDashboardApi.formatDateTime(pickup.created_at)}
                          </p>
                          {pickup.worker_info && (
                            <p className="text-sm text-gray-600">
                              Worker: {pickup.worker_info.full_name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {customerDashboardApi.formatCurrency(pickup.expected_fee)}
                          </div>
                          <p className="text-sm text-gray-600">{pickup.waste_type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomerBins;
