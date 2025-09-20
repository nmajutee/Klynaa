import React, { useEffect, useState } from 'react';
import { useWebSocketStore, selectActivePickups, selectUnreadNotifications } from '../../stores/websocketStore';
import { TruckIcon, MapPinIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

/**
 * Real-time Pickup Updates Component
 * Displays live pickup status changes, locations, and worker assignments
 */
export const LivePickupUpdates: React.FC = () => {
  const activePickups = useWebSocketStore(selectActivePickups);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);

  // Listen for pickup updates and track recent changes
  useEffect(() => {
    const unsubscribe = useWebSocketStore.subscribe(
      (state) => state.pickupUpdates,
      (pickupUpdates, prevPickupUpdates) => {
        // Find new or updated pickups
        Object.values(pickupUpdates).forEach(pickup => {
          const prevPickup = prevPickupUpdates[pickup.id];
          if (!prevPickup || prevPickup.updated_at !== pickup.updated_at) {
            setRecentUpdates(prev => [
              { ...pickup, updateType: prevPickup ? 'updated' : 'new', timestamp: new Date() },
              ...prev.slice(0, 19) // Keep last 20 updates
            ]);
          }
        });
      }
    );

    return unsubscribe;
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'assigned':
        return <UserIcon className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <TruckIcon className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Live Pickup Updates</h3>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {activePickups.length} Active
            </span>
            {recentUpdates.length > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Active Pickups Summary */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-4 gap-4 text-center">
          {['pending', 'assigned', 'in_progress', 'completed'].map(status => {
            const count = activePickups.filter(p => p.status === status).length;
            return (
              <div key={status} className="flex flex-col items-center space-y-1">
                {getStatusIcon(status)}
                <span className="text-sm font-medium text-gray-900">{count}</span>
                <span className="text-xs text-gray-500 capitalize">{status.replace('_', ' ')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Updates */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {recentUpdates.length === 0 ? (
          <div className="p-6 text-center">
            <TruckIcon className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No recent pickup updates</p>
            <p className="text-xs text-gray-400">Updates will appear here in real-time</p>
          </div>
        ) : (
          recentUpdates.map((pickup, index) => (
            <PickupUpdateItem key={`${pickup.id}-${index}`} pickup={pickup} />
          ))
        )}
      </div>
    </div>
  );
};

interface PickupUpdateItemProps {
  pickup: any;
}

const PickupUpdateItem: React.FC<PickupUpdateItemProps> = ({ pickup }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTime = () => {
      if (pickup.timestamp) {
        const seconds = Math.floor((new Date().getTime() - new Date(pickup.timestamp).getTime()) / 1000);
        if (seconds < 60) setTimeAgo(`${seconds}s ago`);
        else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
        else setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [pickup.timestamp]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'assigned':
        return <UserIcon className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <TruckIcon className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getStatusIcon(pickup.status)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              Pickup #{pickup.id}
              {pickup.updateType === 'new' && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  New
                </span>
              )}
            </p>
            <time className="text-xs text-gray-500">{timeAgo}</time>
          </div>

          <div className="mt-1 flex items-center space-x-4">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pickup.status)}`}>
              {pickup.status.replace('_', ' ')}
            </span>

            {pickup.worker_id && (
              <span className="text-xs text-gray-500">
                Worker #{pickup.worker_id}
              </span>
            )}

            {pickup.location && (
              <span className="inline-flex items-center text-xs text-gray-500">
                <MapPinIcon className="h-3 w-3 mr-1" />
                {pickup.location.latitude.toFixed(4)}, {pickup.location.longitude.toFixed(4)}
              </span>
            )}
          </div>

          {pickup.scheduled_time && (
            <p className="mt-1 text-xs text-gray-500">
              Scheduled: {new Date(pickup.scheduled_time).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};