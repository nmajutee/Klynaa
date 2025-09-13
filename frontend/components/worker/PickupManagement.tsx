/**
 * Pickup Management Component - Agricultural Field Management Style
 * Handles pickup requests, status updates, and actions
 */

import React, { useState, useEffect } from 'react';
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { enhancedWorkerDashboardApi, type AvailablePickup } from '../../services/enhancedWorkerDashboardApi';

interface PickupRequest {
  id: number;
  customer_name: string;
  address: string;
  waste_type: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  estimated_earnings: number;
  distance?: number;
  phone?: string;
  created_at: string;
  latitude: number;
  longitude: number;
}

interface PickupManagementProps {
  selectedPickup?: PickupRequest | AvailablePickup | null;
  onPickupAction?: (pickupId: number, action: 'accept' | 'decline' | 'complete') => void;
  onClose?: () => void;
}

const PickupManagement: React.FC<PickupManagementProps> = ({
  selectedPickup,
  onPickupAction,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [nearbyPickups, setNearbyPickups] = useState<AvailablePickup[]>([]);

  useEffect(() => {
    loadNearbyPickups();
  }, []);

  const loadNearbyPickups = async () => {
    try {
      const response = await enhancedWorkerDashboardApi.getAvailablePickups();
      setNearbyPickups(response.data.available_pickups || []);
    } catch (error) {
      console.error('Failed to load pickups:', error);
    }
  };

  const handleAction = async (pickupId: number, action: 'accept' | 'decline' | 'complete') => {
    try {
      setLoading(true);

      if (action === 'accept') {
        await enhancedWorkerDashboardApi.acceptPickup(pickupId);
      } else if (action === 'complete') {
        await enhancedWorkerDashboardApi.completePickup(pickupId, {
          notes: 'Pickup completed successfully'
        });
      }

      onPickupAction?.(pickupId, action);
      await loadNearbyPickups();
    } catch (error) {
      console.error(`Failed to ${action} pickup:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  if (selectedPickup) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
        <div className="bg-white rounded-t-lg sm:rounded-lg p-6 w-full sm:w-96 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pickup Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Customer Info */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900">
                {'customer_name' in selectedPickup ? selectedPickup.customer_name : selectedPickup.owner_name}
              </h4>
              <p className="text-sm text-gray-600 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {'address' in selectedPickup ? selectedPickup.address : selectedPickup.location.address}
              </p>
              {(() => {
                if ('distance' in selectedPickup && selectedPickup.distance) {
                  return (
                    <p className="text-sm text-blue-600">
                      📍 {formatDistance(selectedPickup.distance as number)} away
                    </p>
                  );
                } else if ('location' in selectedPickup && selectedPickup.location.distance_km) {
                  return (
                    <p className="text-sm text-blue-600">
                      📍 {formatDistance(selectedPickup.location.distance_km)} away
                    </p>
                  );
                }
                return null;
              })()}
            </div>

            {/* Pickup Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Waste Type
                </label>
                <p className="mt-1 text-sm text-gray-900">{selectedPickup.waste_type}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Earnings
                </label>
                <p className="mt-1 text-sm font-semibold text-green-600">
                  {'estimated_earnings' in selectedPickup ? selectedPickup.estimated_earnings : selectedPickup.expected_fee} XAF
                </p>
              </div>
            </div>

            {/* Status - only show for PickupRequest */}
            {'status' in selectedPickup && (
              <div>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPickup.status)}`}>
                  {selectedPickup.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              {'phone' in selectedPickup && selectedPickup.phone && (
                <a
                  href={`tel:${selectedPickup.phone}`}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <PhoneIcon className="h-4 w-4 inline mr-1" />
                  Call
                </a>
              )}
              <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-1" />
                Message
              </button>
            </div>

            {'status' in selectedPickup && selectedPickup.status === 'pending' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAction(selectedPickup.id, 'decline')}
                  disabled={loading}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAction(selectedPickup.id, 'accept')}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Accepting...' : 'Accept Pickup'}
                </button>
              </div>
            )}

            {'status' in selectedPickup && selectedPickup.status === 'accepted' && (
              <button
                onClick={() => handleAction(selectedPickup.id, 'complete')}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Completing...' : 'Mark as Completed'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Available Pickups</h3>
        <p className="text-sm text-gray-500">Pickup requests near you</p>
      </div>

      <div className="divide-y divide-gray-200">
        {nearbyPickups.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <MapPinIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No pickup requests available</p>
            <p className="text-sm">Check back later for new requests</p>
          </div>
        ) : (
          nearbyPickups.map((pickup) => (
            <div key={pickup.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {('customer_name' in pickup ? pickup.customer_name : pickup.owner_name) as string}
                    </h4>
                    {'status' in pickup && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pickup.status as string)}`}>
                        {pickup.status as string}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 flex items-center mb-1">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {('address' in pickup ? pickup.address : pickup.location.address) as string}
                  </p>
                  {(() => {
                    if ('distance' in pickup && pickup.distance) {
                      return (
                        <p className="text-sm text-blue-600 mb-2">
                          📍 {formatDistance(pickup.distance as number)} away
                        </p>
                      );
                    } else if ('location' in pickup && pickup.location.distance_km) {
                      return (
                        <p className="text-sm text-blue-600 mb-2">
                          📍 {formatDistance(pickup.location.distance_km)} away
                        </p>
                      );
                    }
                    return null;
                  })()}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {new Date(pickup.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      📦 {pickup.waste_type}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-green-600">
                    {('estimated_earnings' in pickup ? pickup.estimated_earnings : pickup.expected_fee) as number} XAF
                  </p>
                  {'status' in pickup && pickup.status === 'pending' && (
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleAction(pickup.id, 'accept')}
                        disabled={loading}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PickupManagement;