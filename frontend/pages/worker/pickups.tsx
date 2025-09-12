/**
 * Worker Pickups Page - Mobile-First Design
 * Shows pending, available, and completed pickups with actions
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PrivateRoute from '../../components/PrivateRoute';
import { enhancedWorkerDashboardApi } from '../../services/enhancedWorkerDashboardApi';
import WorkerLayout from '../../components/layout/WorkerLayout';
import PickupSidebar from '../../components/worker/PickupSidebar';
import dynamic from 'next/dynamic';

const WorkerMap = dynamic(() => import('../../components/WorkerMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse" />
});
import type { PendingPickup, AvailablePickup, CompletedPickup } from '../../services/enhancedWorkerDashboardApi';

type TabType = 'pending' | 'available' | 'completed';

const WorkerPickups: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingPickups, setPendingPickups] = useState<PendingPickup[]>([]);
  const [availablePickups, setAvailablePickups] = useState<AvailablePickup[]>([]);
  const [completedPickups, setCompletedPickups] = useState<CompletedPickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadPickupsData();
  }, []);

  const loadPickupsData = async () => {
    try {
      setLoading(true);
      const [pendingRes, availableRes, completedRes] = await Promise.all([
        enhancedWorkerDashboardApi.getPendingPickups(),
        enhancedWorkerDashboardApi.getAvailablePickups(),
        enhancedWorkerDashboardApi.getCompletedPickups(),
      ]);

      setPendingPickups(pendingRes.data.pending_pickups);
      setAvailablePickups(availableRes.data.available_pickups);
      setCompletedPickups(completedRes.data.completed_pickups);
    } catch (error) {
      console.error('Failed to load pickups:', error);
    } finally {
      setLoading(false);
    }
  };



  const getUrgencyColor = (urgency: string) => {
    return urgency === 'high' ? 'border-l-4 border-red-500' : '';
  };

  const handleAcceptPickup = async (pickupId: number) => {
    try {
      setActionLoading(pickupId);
      await enhancedWorkerDashboardApi.acceptPickup(pickupId);
      await loadPickupsData(); // Reload data
    } catch (error) {
      console.error('Failed to accept pickup:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const openChat = (pickupId: number) => {
    router.push(`/worker/chat/${pickupId}`);
  };

  const openMapsNavigation = (lat: number | null, lng: number | null) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <PrivateRoute requiredRole="worker">
      <div className="min-h-screen bg-gray-50 pb-20">
        <Head>
          <title>Pickups - Klynaa Worker</title>
        </Head>

        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Pickups</h1>
              <button
                onClick={loadPickupsData}
                className="p-2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                🔄
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Pending ({pendingPickups.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'available'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Available ({availablePickups.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Completed ({completedPickups.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto px-4">
          {/* Pending Pickups */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingPickups.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-gray-500">No pending pickups</p>
                </div>
              ) : (
                pendingPickups.map((pickup) => (
                  <div key={pickup.id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">#{pickup.id}</h3>
                      <span className="text-xs text-gray-500">{pickup.formatted_time}</span>
                    </div>
                    <p className="text-gray-600 mb-2">{pickup.owner_name}</p>
                    <p className="text-sm text-gray-500 mb-3">{pickup.location.address}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-600">${pickup.expected_fee}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openMapsNavigation(pickup.location.latitude, pickup.location.longitude)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          🗺️ Navigate
                        </button>
                        {pickup.actions.can_chat && (
                          <button
                            onClick={() => openChat(pickup.id)}
                            className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                          >
                            💬 Chat
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Available Pickups */}
          {activeTab === 'available' && (
            <div className="space-y-4">
              {availablePickups.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-gray-500">No available pickups nearby</p>
                </div>
              ) : (
                availablePickups.map((pickup) => (
                  <div key={pickup.id} className={`bg-white rounded-lg shadow-sm border p-4 ${getUrgencyColor(pickup.urgency)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{pickup.owner_name}</h3>
                        <p className="text-sm text-gray-500">{pickup.formatted_time}</p>
                        {pickup.urgency === 'high' && (
                          <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-1 rounded mt-1">
                            🚨 Urgent
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{pickup.expected_fee} XAF</p>
                        {pickup.location.distance_km && (
                          <p className="text-xs text-gray-500">{pickup.location.distance_km}km away</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start space-x-2">
                        <span className="text-sm">📍</span>
                        <p className="text-sm text-gray-600">{pickup.location.address}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🗑️</span>
                        <p className="text-sm text-gray-600">{pickup.waste_type}</p>
                      </div>
                      {pickup.estimated_weight && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">⚖️</span>
                          <p className="text-sm text-gray-600">{pickup.estimated_weight} kg</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptPickup(pickup.id)}
                        disabled={actionLoading === pickup.id}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {actionLoading === pickup.id ? '⏳ Accepting...' : '✅ Accept'}
                      </button>

                      <button
                        onClick={() => openMapsNavigation(pickup.location.latitude, pickup.location.longitude)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        🗺️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Completed Pickups */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              {completedPickups.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-gray-500">No completed pickups yet</p>
                </div>
              ) : (
                completedPickups.map((pickup) => (
                  <div key={pickup.id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{pickup.owner_name}</h3>
                        <p className="text-sm text-gray-500">
                          {pickup.completed_date} at {pickup.completed_time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{pickup.actual_fee} XAF</p>
                        {pickup.rating && (
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-sm text-gray-600 ml-1">{pickup.rating.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start space-x-2">
                        <span className="text-sm">📍</span>
                        <p className="text-sm text-gray-600">{pickup.location}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🗑️</span>
                        <p className="text-sm text-gray-600">{pickup.waste_type}</p>
                      </div>
                    </div>

                    {pickup.rating?.comment && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                        <div className="flex items-center mb-1">
                          <span className="text-yellow-500">💬</span>
                          <span className="text-sm font-medium text-yellow-700 ml-1">Customer Review</span>
                        </div>
                        <p className="text-sm text-yellow-600">"{pickup.rating.comment}"</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Proof: {pickup.pickup_proof.has_proof ? '✅ Submitted' : '❌ Missing'}
                      </span>
                      <span>Status: Completed</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto px-4 py-2">
            <div className="flex justify-around items-center">
              <Link href="/worker/dashboard" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">🏠</span>
                <span className="text-xs">Dashboard</span>
              </Link>

              <Link href="/worker/pickups" className="flex flex-col items-center py-2 text-green-600">
                <span className="text-xl mb-1">📋</span>
                <span className="text-xs font-medium">Pickups</span>
              </Link>

              <Link href="/worker/map" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">🗺️</span>
                <span className="text-xs">Map</span>
              </Link>

              <Link href="/worker/earnings" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">💰</span>
                <span className="text-xs">Earnings</span>
              </Link>

              <Link href="/worker/profile" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">👤</span>
                <span className="text-xs">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default WorkerPickups;