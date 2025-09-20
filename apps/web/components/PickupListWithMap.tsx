/**
 * Pickup List Component with Map Integration
 * Shows pickup requests with sorting by distance and status
 */

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const WorkerMap = dynamic(() => import('./WorkerMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse" />
});

interface PickupLocation {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  address: string;
  customer_name: string;
  phone?: string;
  distance?: number;
  created_at: string;
  scheduled_time?: string;
  waste_type: string;
  estimated_weight?: number;
}

interface PickupListWithMapProps {
  pickups: PickupLocation[];
  onPickupAction: (pickupId: number, action: 'accept' | 'start' | 'complete') => void;
  onPickupSelect?: (pickup: PickupLocation) => void;
  className?: string;
}

const PickupListWithMap: React.FC<PickupListWithMapProps> = ({
  pickups,
  onPickupAction,
  onPickupSelect,
  className = ''
}) => {
  const [workerLocation, setWorkerLocation] = useState<{latitude: number; longitude: number} | undefined>();
  const [selectedPickup, setSelectedPickup] = useState<PickupLocation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'both'>('both');
  const [sortBy, setSortBy] = useState<'distance' | 'status' | 'time'>('distance');

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setWorkerLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Default to Yaoundé if location access denied
          setWorkerLocation({ latitude: 3.848, longitude: 11.502 });
        }
      );
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Add distance to pickups
  const pickupsWithDistance = pickups.map(pickup => ({
    ...pickup,
    distance: workerLocation
      ? calculateDistance(
          workerLocation.latitude,
          workerLocation.longitude,
          pickup.latitude,
          pickup.longitude
        )
      : undefined
  }));

  // Sort pickups based on selected criteria
  const sortedPickups = [...pickupsWithDistance].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        if (!a.distance || !b.distance) return 0;
        return a.distance - b.distance;
      case 'status':
        const statusOrder = { pending: 0, accepted: 1, in_progress: 2, completed: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'time':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default:
        return 0;
    }
  });

  const handlePickupSelect = (pickup: PickupLocation) => {
    setSelectedPickup(pickup);
    onPickupSelect?.(pickup);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionButton = (pickup: PickupLocation) => {
    switch (pickup.status) {
      case 'pending':
        return (
          <button
            onClick={() => onPickupAction(pickup.id, 'accept')}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Accept Pickup
          </button>
        );
      case 'accepted':
        return (
          <button
            onClick={() => onPickupAction(pickup.id, 'start')}
            className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Start Collection
          </button>
        );
      case 'in_progress':
        return (
          <button
            onClick={() => onPickupAction(pickup.id, 'complete')}
            className="w-full bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Mark Complete
          </button>
        );
      case 'completed':
        return (
          <div className="w-full bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium text-center">
            ✓ Completed
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${className}`}>
      {/* Header with controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Pickup Requests ({pickups.length})
          </h2>

          <div className="flex flex-wrap gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'
                }`}
              >
                🗺️ Map
              </button>
              <button
                onClick={() => setViewMode('both')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'both' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'
                }`}
              >
                📋🗺️ Both
              </button>
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 text-sm border rounded-lg bg-white"
            >
              <option value="distance">Sort by Distance</option>
              <option value="status">Sort by Status</option>
              <option value="time">Sort by Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${
        viewMode === 'both' ? 'lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        {/* Pickup List */}
        {(viewMode === 'list' || viewMode === 'both') && (
          <div className="space-y-3">
            {sortedPickups.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-gray-600">No pickup requests available</p>
              </div>
            ) : (
              sortedPickups.map((pickup, index) => (
                <div
                  key={pickup.id}
                  className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    selectedPickup?.id === pickup.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handlePickupSelect(pickup)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{pickup.customer_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{pickup.address}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pickup.status)}`}>
                        {pickup.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {pickup.distance && (
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          📍 {pickup.distance.toFixed(1)} km
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Waste Type:</span><br />
                      {pickup.waste_type}
                    </div>
                    <div>
                      <span className="font-medium">Est. Weight:</span><br />
                      {pickup.estimated_weight ? `${pickup.estimated_weight}kg` : 'Not specified'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {pickup.phone && (
                      <a
                        href={`tel:${pickup.phone}`}
                        className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium text-center hover:bg-green-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📞 Call
                      </a>
                    )}
                    <div className="flex-2">
                      {getActionButton(pickup)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Map View */}
        {(viewMode === 'map' || viewMode === 'both') && (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="h-96 lg:h-[600px]">
              <WorkerMap
                pickups={sortedPickups}
                workerLocation={workerLocation}
                onPickupSelect={handlePickupSelect}
                onLocationUpdate={(lat, lng) => setWorkerLocation({ latitude: lat, longitude: lng })}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Selected pickup details modal/sidebar */}
      {selectedPickup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div
            className="bg-white rounded-t-lg sm:rounded-lg p-6 w-full sm:w-96 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Pickup Details</h3>
              <button
                onClick={() => setSelectedPickup(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedPickup.customer_name}</h4>
                <p className="text-sm text-gray-600">{selectedPickup.address}</p>
                {selectedPickup.distance && (
                  <p className="text-sm text-blue-600 font-medium">
                    📍 {selectedPickup.distance.toFixed(1)} km away
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedPickup.status)}`}>
                    {selectedPickup.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Waste Type:</span>
                  <p className="mt-1">{selectedPickup.waste_type}</p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedPickup.phone && (
                  <a
                    href={`tel:${selectedPickup.phone}`}
                    className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-green-700 transition-colors"
                  >
                    📞 Call Customer
                  </a>
                )}

                <button
                  onClick={() => {
                    const url = `https://www.openstreetmap.org/directions?from=${workerLocation?.latitude},${workerLocation?.longitude}&to=${selectedPickup.latitude},${selectedPickup.longitude}&engine=graphhopper_foot`;
                    window.open(url, '_blank');
                  }}
                  className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                >
                  🧭 Get Directions
                </button>

                <div className="pt-2">
                  {getActionButton(selectedPickup)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupListWithMap;
