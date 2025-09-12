/**
 * Customer Pickups - Pickup history and management for customers
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { customerDashboardApi, PickupRequest } from '../../services/customerDashboardApi';
import { useAuth } from '../../stores/authStore';

interface FilterState {
  status: string;
  waste_type: string;
  payment_method: string;
  date_range: string;
}

interface RatingModalState {
  isOpen: boolean;
  pickup: PickupRequest | null;
  rating: number;
  comment: string;
}

const CustomerPickups: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    waste_type: 'all',
    payment_method: 'all',
    date_range: 'all'
  });

  const [ratingModal, setRatingModal] = useState<RatingModalState>({
    isOpen: false,
    pickup: null,
    rating: 5,
    comment: ''
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

    loadPickups();
  }, [isAuthenticated, user, router, currentPage, filters]);

  const loadPickups = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        page_size: 10
      };

      // Add filters
      if (filters.status !== 'all') params.status = filters.status;

      const response = await customerDashboardApi.getPickups(params);
      
      setPickups(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / 10));
    } catch (err) {
      console.error('Failed to load pickups:', err);
      setError('Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

  const refreshPickups = async () => {
    setRefreshing(true);
    await loadPickups();
    setRefreshing(false);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCancelPickup = async (pickup: PickupRequest) => {
    if (!pickup.can_cancel) return;
    
    const reason = prompt('Please provide a reason for cancellation (optional):');
    if (reason === null) return; // User cancelled the prompt
    
    try {
      await customerDashboardApi.cancelPickup(pickup.id, reason);
      await refreshPickups();
    } catch (err) {
      console.error('Failed to cancel pickup:', err);
      alert('Failed to cancel pickup. Please try again.');
    }
  };

  const handleRateWorker = (pickup: PickupRequest) => {
    if (!pickup.can_rate) return;
    
    setRatingModal({
      isOpen: true,
      pickup,
      rating: 5,
      comment: ''
    });
  };

  const submitRating = async () => {
    if (!ratingModal.pickup) return;
    
    try {
      await customerDashboardApi.rateWorker(ratingModal.pickup.id, {
        rating: ratingModal.rating,
        comment: ratingModal.comment || undefined
      });
      
      setRatingModal({ isOpen: false, pickup: null, rating: 5, comment: '' });
      await refreshPickups();
    } catch (err) {
      console.error('Failed to submit rating:', err);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const getStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
      'open': '🔄',
      'accepted': '👍',
      'picked': '🚛',
      'completed': '✅',
      'cancelled': '❌'
    };
    return icons[status] || '❓';
  };

  const getPaymentMethodIcon = (method: string): string => {
    const icons: Record<string, string> = {
      'cash': '💰',
      'mobile_money': '📱',
      'card': '💳'
    };
    return icons[method] || '💰';
  };

  if (loading && !refreshing) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pickups...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">My Pickups</h1>
                <p className="text-gray-600 mt-1">
                  Track your waste collection history and manage active requests
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={refreshPickups}
                  disabled={refreshing}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  {refreshing ? '⟳' : '🔄'} Refresh
                </button>
                <button
                  onClick={() => router.push('/customer/pickups/new')}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <span>📋</span>
                  New Pickup
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Pickups</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="accepted">Accepted</option>
                  <option value="picked">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waste Type</label>
                <select
                  value={filters.waste_type}
                  onChange={(e) => handleFilterChange('waste_type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Types</option>
                  <option value="general">General</option>
                  <option value="organic">Organic</option>
                  <option value="plastic">Plastic</option>
                  <option value="metal">Metal</option>
                  <option value="electronic">Electronic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={filters.payment_method}
                  onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.date_range}
                  onChange={(e) => handleFilterChange('date_range', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pickups</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                </div>
                <div className="text-blue-500 text-2xl">📊</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-900">
                    {pickups.filter(p => ['open', 'accepted', 'picked'].includes(p.status)).length}
                  </p>
                </div>
                <div className="text-green-500 text-2xl">🔄</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {pickups.filter(p => p.status === 'completed').length}
                  </p>
                </div>
                <div className="text-purple-500 text-2xl">✅</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-lg font-bold text-indigo-900">
                    {customerDashboardApi.formatCurrency(
                      pickups.reduce((sum, p) => sum + parseFloat(p.expected_fee || '0'), 0)
                    )}
                  </p>
                </div>
                <div className="text-indigo-500 text-2xl">💰</div>
              </div>
            </div>
          </div>

          {/* Pickups List */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={refreshPickups}
                className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          ) : pickups.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pickups Found</h3>
              <p className="text-gray-600 mb-4">
                {Object.values(filters).some(f => f !== 'all') 
                  ? 'No pickups match your current filters.'
                  : "You haven't requested any pickups yet."}
              </p>
              <button
                onClick={() => router.push('/customer/pickups/new')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
              >
                Request Your First Pickup
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pickups.map((pickup) => (
                <div key={pickup.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    {/* Left Side - Pickup Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getStatusIcon(pickup.status)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Pickup #{pickup.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {pickup.bin_label || `Bin #${pickup.bin}`} • {pickup.bin_address}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${customerDashboardApi.getStatusColor(pickup.status)}`}>
                          {pickup.status_display}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Waste Type</p>
                          <p className="font-medium capitalize">{pickup.waste_type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Weight</p>
                          <p className="font-medium">{pickup.estimated_weight_kg} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Payment Method</p>
                          <p className="font-medium flex items-center gap-1">
                            {getPaymentMethodIcon(pickup.payment_method)}
                            {pickup.payment_method.replace('_', ' ')}
                          </p>
                        </div>
                      </div>

                      {pickup.notes && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500">Notes</p>
                          <p className="text-sm text-gray-700">{pickup.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Created: {customerDashboardApi.formatDateTime(pickup.created_at)}</span>
                        {pickup.accepted_at && (
                          <span>Accepted: {customerDashboardApi.formatDateTime(pickup.accepted_at)}</span>
                        )}
                        {pickup.completed_at && (
                          <span>Completed: {customerDashboardApi.formatDateTime(pickup.completed_at)}</span>
                        )}
                      </div>

                      {pickup.worker_info && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700">
                            Worker: {pickup.worker_info.full_name}
                          </p>
                          {pickup.worker_info.phone_number && (
                            <p className="text-sm text-gray-600">
                              📞 {pickup.worker_info.phone_number}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            Rating: {pickup.worker_info.rating_average.toFixed(1)} ⭐
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Side - Actions and Price */}
                    <div className="ml-6 text-right">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Expected Fee</p>
                        <p className="text-xl font-bold text-gray-900">
                          {customerDashboardApi.formatCurrency(pickup.expected_fee)}
                        </p>
                        {pickup.actual_fee && pickup.actual_fee !== pickup.expected_fee && (
                          <p className="text-sm text-gray-600">
                            Actual: {customerDashboardApi.formatCurrency(pickup.actual_fee)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        {pickup.can_cancel && (
                          <button
                            onClick={() => handleCancelPickup(pickup)}
                            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            Cancel Pickup
                          </button>
                        )}

                        {pickup.can_rate && (
                          <button
                            onClick={() => handleRateWorker(pickup)}
                            className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                          >
                            Rate Worker
                          </button>
                        )}

                        {pickup.estimated_arrival && (
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600">Estimated Arrival</p>
                            <p className="text-sm font-medium text-blue-800">
                              {customerDashboardApi.formatDateTime(pickup.estimated_arrival)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages} ({totalCount} total pickups)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rating Modal */}
        {ratingModal.isOpen && ratingModal.pickup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Rate Worker: {ratingModal.pickup.worker_info?.full_name}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5 stars)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRatingModal(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl ${star <= ratingModal.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (optional)
                </label>
                <textarea
                  value={ratingModal.comment}
                  onChange={(e) => setRatingModal(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRatingModal({ isOpen: false, pickup: null, rating: 5, comment: '' })}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRating}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomerPickups;
