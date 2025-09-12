/**
 * Interactive OpenStreetMap Component
 * Uses Leaflet.js for pickup locations, worker tracking, and navigation
 */

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different marker types
const workerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#10B981" stroke="#ffffff" stroke-width="2"
            d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#ffffff" cx="12.5" cy="12.5" r="6"/>
      <circle fill="#10B981" cx="12.5" cy="12.5" r="3"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

// Base (pending) pickup icon (red)
const pickupIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EF4444" stroke="#ffffff" stroke-width="2"
            d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#ffffff" cx="12.5" cy="12.5" r="6"/>
      <text x="12.5" y="17" text-anchor="middle" fill="#EF4444" font-size="10" font-weight="bold">📦</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

// Accepted (amber)
const acceptedIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#F59E0B" stroke="#ffffff" stroke-width="2" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#ffffff" cx="12.5" cy="12.5" r="6"/>
      <text x="12.5" y="17" text-anchor="middle" fill="#F59E0B" font-size="10" font-weight="bold">⏳</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

// In-progress (blue)
const inProgressIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#3B82F6" stroke="#ffffff" stroke-width="2" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#ffffff" cx="12.5" cy="12.5" r="6"/>
      <text x="12.5" y="17" text-anchor="middle" fill="#3B82F6" font-size="10" font-weight="bold">⚙</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

// Completed (green)
const completedIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#10B981" stroke="#ffffff" stroke-width="2" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#ffffff" cx="12.5" cy="12.5" r="6"/>
      <text x="12.5" y="17" text-anchor="middle" fill="#10B981" font-size="10" font-weight="bold">✓</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

// Problematic / issue reported (purple)
const problematicIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#9333EA" stroke="#ffffff" stroke-width="2" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#ffffff" cx="12.5" cy="12.5" r="6"/>
      <text x="12.5" y="17" text-anchor="middle" fill="#9333EA" font-size="10" font-weight="bold">!</text>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
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
  distance?: number; // in km
  created_at: string;
  waste_type: string;
}

interface WorkerMapProps {
  pickups: PickupLocation[];
  workerLocation?: { latitude: number; longitude: number };
  onPickupSelect?: (pickup: PickupLocation) => void;
  onLocationUpdate?: (lat: number, lng: number) => void;
  selectedPickupId?: number | null;
  focusOnSelect?: boolean;
  className?: string;
}

// Component to handle map events and location updates
const MapEventHandler = ({
  onLocationUpdate,
  workerLocation
}: {
  onLocationUpdate?: (lat: number, lng: number) => void;
  workerLocation?: { latitude: number; longitude: number };
}) => {
  const map = useMap();

  useMapEvents({
    locationfound: (e) => {
      const { lat, lng } = e.latlng;
      onLocationUpdate?.(lat, lng);
      if (!workerLocation) {
        map.setView([lat, lng], 13);
      }
    },
  });

  useEffect(() => {
    // Try to get user's current location
    map.locate({ setView: false, maxZoom: 16 });
  }, [map]);

  return null;
};

// Highlight icon for selected pickup
const selectedIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="34" height="52" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path filter="url(#glow)" fill="#2563EB" stroke="#ffffff" stroke-width="2" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#ffffff" cx="12.5" cy="12.5" r="6"/>
      <text x="12.5" y="17" text-anchor="middle" fill="#2563EB" font-size="10" font-weight="bold">★</text>
    </svg>
  `),
  iconSize: [34, 52],
  iconAnchor: [17, 52],
  popupAnchor: [0, -52],
});

const WorkerMap: React.FC<WorkerMapProps> = ({
  pickups = [],
  workerLocation,
  onPickupSelect,
  onLocationUpdate,
  selectedPickupId = null,
  focusOnSelect = true,
  className = ''
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([3.848, 11.502]); // Yaoundé, Cameroon
  const [mapZoom, setMapZoom] = useState(11);
  const mapRef = useRef<L.Map>(null);

  // NOTE: For future clustering we can wrap markers with a library like
  // react-leaflet-cluster (or @changey/react-leaflet-markercluster). We would
  // dynamically choose between single Marker vs cluster layer depending on
  // pickups.length threshold. Placeholder left intentionally minimal to avoid
  // adding dependency prematurely.

  // Calculate distance between two points (Haversine formula)
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

  // Update pickup distances when worker location changes
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

  // Sort pickups by distance if worker location available
  const sortedPickups = workerLocation
    ? pickupsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    : pickupsWithDistance;

  // Get appropriate icon for pickup status
  const getPickupIcon = (status: string) => {
    switch (status) {
      case 'completed': return completedIcon;
      case 'accepted': return acceptedIcon;
      case 'in_progress': return inProgressIcon;
      case 'problematic': return problematicIcon;
      case 'pending': default: return pickupIcon;
    }
  };

  // Handle navigation to location
  const handleNavigate = (lat: number, lng: number) => {
    const url = `https://www.openstreetmap.org/directions?from=${workerLocation?.latitude},${workerLocation?.longitude}&to=${lat},${lng}&engine=graphhopper_foot`;
    window.open(url, '_blank');
  };

  // Center map on worker location when available
  useEffect(() => {
    if (workerLocation) {
      setMapCenter([workerLocation.latitude, workerLocation.longitude]);
      setMapZoom(13);
    }
  }, [workerLocation]);

  // Focus map when selected pickup changes
  useEffect(() => {
    if (!focusOnSelect || !selectedPickupId || !mapRef.current) return;
    const target = pickups.find(p => p.id === selectedPickupId);
    if (target) {
      mapRef.current.setView([target.latitude, target.longitude], 15, { animate: true });
    }
  }, [selectedPickupId, focusOnSelect, pickups]);

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEventHandler
          onLocationUpdate={onLocationUpdate}
          workerLocation={workerLocation}
        />

        {/* Worker location marker */}
        {workerLocation && (
          <Marker
            position={[workerLocation.latitude, workerLocation.longitude]}
            icon={workerIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
                <br />
                <small>Lat: {workerLocation.latitude.toFixed(6)}</small>
                <br />
                <small>Lng: {workerLocation.longitude.toFixed(6)}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pickup markers */}
        {sortedPickups.map((pickup) => {
          const isSelected = pickup.id === selectedPickupId;
          return (
          <Marker
            key={pickup.id}
            position={[pickup.latitude, pickup.longitude]}
            icon={isSelected ? selectedIcon : getPickupIcon(pickup.status)}
            eventHandlers={{
              click: () => onPickupSelect?.(pickup),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-sm flex items-center gap-1">{pickup.customer_name} {isSelected && <span className="text-blue-600 text-xs font-medium">(Selected)</span>}</strong>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pickup.status === 'completed' ? 'bg-green-100 text-green-800' :
                    pickup.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    pickup.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pickup.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mb-2">{pickup.address}</p>

                {pickup.distance && (
                  <p className="text-xs text-blue-600 font-medium mb-2">
                    📍 {pickup.distance.toFixed(1)} km away
                  </p>
                )}

                <div className="flex gap-2 mt-2">
                  {pickup.phone && (
                    <a
                      href={`tel:${pickup.phone}`}
                      className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-xs text-center"
                    >
                      📞 Call
                    </a>
                  )}

                  <button
                    onClick={() => handleNavigate(pickup.latitude, pickup.longitude)}
                    className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  >
                    🧭 Navigate
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )})}
      </MapContainer>

      {/* Distance legend */}
      {workerLocation && pickups.length > 0 && (
        <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg p-2 text-xs">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>You ({workerLocation.latitude.toFixed(3)}, {workerLocation.longitude.toFixed(3)})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Pickups ({pickups.length})</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerMap;