import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Types
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface MapMarker {
  id: string;
  position: Location;
  title?: string;
  description?: string;
  type?: 'pickup' | 'bin' | 'route' | 'user' | 'custom';
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  onClick?: (marker: MapMarker) => void;
}

export interface RouteData {
  id: string;
  waypoints: Location[];
  distance?: number;
  duration?: number;
  status?: 'planned' | 'active' | 'completed';
  color?: string;
}

// Simple Map Container (for integration with map libraries)
const mapContainerVariants = cva(
  'relative overflow-hidden bg-neutral-100',
  {
    variants: {
      size: {
        sm: 'h-48',
        md: 'h-64',
        lg: 'h-80',
        xl: 'h-96',
        full: 'h-full',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
      },
    },
    defaultVariants: {
      size: 'md',
      rounded: 'md',
    },
  }
);

export interface MapContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mapContainerVariants> {
  markers?: MapMarker[];
  routes?: RouteData[];
  center?: Location;
  zoom?: number;
  onMapReady?: (mapInstance: any) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  onLocationSelect?: (location: Location) => void;
  interactive?: boolean;
  showControls?: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  size,
  rounded,
  markers = [],
  routes = [],
  center,
  zoom = 13,
  onMapReady,
  onMarkerClick,
  onLocationSelect,
  interactive = true,
  showControls = true,
  className,
  children,
  ...props
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Placeholder for actual map implementation
  // This would integrate with Leaflet, Google Maps, or other map providers
  useEffect(() => {
    // Simulated map initialization
    const timer = setTimeout(() => {
      setMapLoaded(true);
      onMapReady?.(mapRef.current);
    }, 1000);

    return () => clearTimeout(timer);
  }, [onMapReady]);

  return (
    <div
      ref={mapRef}
      className={cn(mapContainerVariants({ size, rounded }), className)}
      {...props}
    >
      {/* Map Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-2">
              <Icons.Settings className="h-full w-full" />
            </div>
            <p className="text-sm text-neutral-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      {showControls && mapLoaded && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
          <button className="p-2 bg-white rounded-md shadow-md border border-neutral-200 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <Icons.Plus className="h-4 w-4" />
          </button>
          <button className="p-2 bg-white rounded-md shadow-md border border-neutral-200 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <Icons.Filter className="h-4 w-4" />
          </button>
          <button className="p-2 bg-white rounded-md shadow-md border border-neutral-200 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <Icons.Home className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Placeholder map content */}
      {mapLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
          <div className="absolute inset-4 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center">
            <div className="text-center text-neutral-500">
              <Icons.MapPin className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Map integration placeholder</p>
              <p className="text-xs mt-1">{markers.length} markers, {routes.length} routes</p>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

// Location Picker Component
export interface LocationPickerProps {
  value?: Location;
  onChange?: (location: Location) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Search for a location...",
  disabled = false,
  required = false,
  error,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulated location search
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Simulated API call
    setTimeout(() => {
      const mockSuggestions: Location[] = [
        { lat: 40.7128, lng: -74.0060, address: `${query} - New York, NY`, name: 'New York Location' },
        { lat: 34.0522, lng: -118.2437, address: `${query} - Los Angeles, CA`, name: 'Los Angeles Location' },
        { lat: 41.8781, lng: -87.6298, address: `${query} - Chicago, IL`, name: 'Chicago Location' },
      ];

      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    if (searchTerm && searchTerm !== value?.address) {
      searchLocations(searchTerm);
    }
  }, [searchTerm, searchLocations, value?.address]);

  const handleSelect = (location: Location) => {
    setSearchTerm(location.address || '');
    onChange?.(location);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error
              ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500'
              : 'border-neutral-300',
            disabled && 'bg-neutral-50 cursor-not-allowed'
          )}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <div className="animate-spin h-4 w-4 text-neutral-400">
              <Icons.Settings className="h-full w-full" />
            </div>
          ) : (
            <Icons.Search className="h-4 w-4 text-neutral-400" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((location, index) => (
              <button
                key={index}
                onClick={() => handleSelect(location)}
                className="w-full px-3 py-2 text-left hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none first:rounded-t-md last:rounded-b-md"
              >
                <div className="flex items-center space-x-2">
                  <Icons.MapPin className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {location.name || location.address}
                    </p>
                    {location.name && location.address && (
                      <p className="text-xs text-neutral-500 truncate">
                        {location.address}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};

// Route Display Component
export interface RouteDisplayProps {
  route: RouteData;
  showDetails?: boolean;
  interactive?: boolean;
  onWaypointClick?: (waypoint: Location, index: number) => void;
  className?: string;
}

export const RouteDisplay: React.FC<RouteDisplayProps> = ({
  route,
  showDetails = true,
  interactive = true,
  onWaypointClick,
  className,
}) => {
  const getStatusColor = () => {
    switch (route.status) {
      case 'planned':
        return 'text-neutral-600 bg-neutral-100';
      case 'active':
        return 'text-primary-600 bg-primary-100';
      case 'completed':
        return 'text-success-600 bg-success-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getStatusIcon = () => {
    switch (route.status) {
      case 'planned':
        return Icons.Clock;
      case 'active':
        return Icons.Settings; // Using as play icon
      case 'completed':
        return Icons.CheckCircle;
      default:
        return Icons.Clock;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className={cn('bg-white border border-neutral-200 rounded-lg p-4', className)}>
      {/* Route Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon className="h-5 w-5 text-current" />
          <h3 className="text-sm font-medium text-neutral-900">
            Route {route.id}
          </h3>
        </div>

        <span
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            getStatusColor()
          )}
        >
          {route.status}
        </span>
      </div>

      {/* Route Details */}
      {showDetails && (route.distance || route.duration) && (
        <div className="flex items-center space-x-4 mb-3 text-sm text-neutral-600">
          {route.distance && (
            <div className="flex items-center space-x-1">
              <Icons.MapPin className="h-4 w-4" />
              <span>{route.distance} km</span>
            </div>
          )}
          {route.duration && (
            <div className="flex items-center space-x-1">
              <Icons.Clock className="h-4 w-4" />
              <span>{route.duration} min</span>
            </div>
          )}
        </div>
      )}

      {/* Waypoints */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-neutral-700 uppercase tracking-wide">
          Waypoints ({route.waypoints.length})
        </h4>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {route.waypoints.map((waypoint, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center space-x-2 p-2 rounded-md text-sm',
                interactive
                  ? 'hover:bg-neutral-50 cursor-pointer'
                  : 'bg-neutral-50'
              )}
              onClick={() => interactive && onWaypointClick?.(waypoint, index)}
            >
              <div className="flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-primary-600"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-neutral-900 truncate">
                  {waypoint.name || waypoint.address || `${waypoint.lat}, ${waypoint.lng}`}
                </p>
              </div>
              <div className="flex-shrink-0 text-xs text-neutral-500">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Pickup Tracker Component
export interface PickupTrackingProps {
  pickup: {
    id: string;
    address: string;
    status: 'scheduled' | 'en-route' | 'arrived' | 'in-progress' | 'completed' | 'cancelled';
    scheduledTime?: string;
    estimatedArrival?: string;
    worker?: {
      name: string;
      phone?: string;
      avatar?: string;
    };
    location?: Location;
    notes?: string;
  };
  showMap?: boolean;
  onContactWorker?: () => void;
  onCancelPickup?: () => void;
  className?: string;
}

export const PickupTracker: React.FC<PickupTrackingProps> = ({
  pickup,
  showMap = true,
  onContactWorker,
  onCancelPickup,
  className,
}) => {
  const getStatusInfo = () => {
    switch (pickup.status) {
      case 'scheduled':
        return {
          color: 'text-neutral-600 bg-neutral-100',
          icon: Icons.Clock,
          message: 'Pickup scheduled',
          progress: 20,
        };
      case 'en-route':
        return {
          color: 'text-primary-600 bg-primary-100',
          icon: Icons.MapPin,
          message: 'Worker is on the way',
          progress: 40,
        };
      case 'arrived':
        return {
          color: 'text-warning-600 bg-warning-100',
          icon: Icons.MapPin,
          message: 'Worker has arrived',
          progress: 60,
        };
      case 'in-progress':
        return {
          color: 'text-primary-600 bg-primary-100',
          icon: Icons.Settings,
          message: 'Pickup in progress',
          progress: 80,
        };
      case 'completed':
        return {
          color: 'text-success-600 bg-success-100',
          icon: Icons.CheckCircle,
          message: 'Pickup completed',
          progress: 100,
        };
      case 'cancelled':
        return {
          color: 'text-danger-600 bg-danger-100',
          icon: Icons.XCircle,
          message: 'Pickup cancelled',
          progress: 0,
        };
      default:
        return {
          color: 'text-neutral-600 bg-neutral-100',
          icon: Icons.Clock,
          message: 'Unknown status',
          progress: 0,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const canCancel = ['scheduled', 'en-route'].includes(pickup.status);

  return (
    <div className={cn('bg-white border border-neutral-200 rounded-lg overflow-hidden', className)}>
      {/* Map Section */}
      {showMap && pickup.location && (
        <div className="h-48">
          <MapContainer
            size="full"
            rounded="none"
            center={pickup.location}
            markers={[
              {
                id: pickup.id,
                position: pickup.location,
                title: pickup.address,
                type: 'pickup',
                status: pickup.status === 'completed' ? 'completed' : 'pending',
              },
            ]}
            interactive={false}
            showControls={false}
          />
        </div>
      )}

      <div className="p-4">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-full', statusInfo.color)}>
              <StatusIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-900">
                Pickup #{pickup.id}
              </h3>
              <p className="text-sm text-neutral-600">{statusInfo.message}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {pickup.status !== 'cancelled' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-neutral-600 mb-1">
              <span>Progress</span>
              <span>{statusInfo.progress}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${statusInfo.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Pickup Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start space-x-2">
            <Icons.MapPin className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-neutral-900">{pickup.address}</p>
            </div>
          </div>

          {pickup.scheduledTime && (
            <div className="flex items-center space-x-2">
              <Icons.Calendar className="h-4 w-4 text-neutral-400" />
              <p className="text-sm text-neutral-600">
                Scheduled: {pickup.scheduledTime}
              </p>
            </div>
          )}

          {pickup.estimatedArrival && pickup.status === 'en-route' && (
            <div className="flex items-center space-x-2">
              <Icons.Clock className="h-4 w-4 text-neutral-400" />
              <p className="text-sm text-neutral-600">
                ETA: {pickup.estimatedArrival}
              </p>
            </div>
          )}

          {pickup.worker && (
            <div className="flex items-center space-x-2">
              <Icons.User className="h-4 w-4 text-neutral-400" />
              <p className="text-sm text-neutral-600">
                Worker: {pickup.worker.name}
              </p>
            </div>
          )}

          {pickup.notes && (
            <div className="flex items-start space-x-2">
              <Icons.Info className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-neutral-600">{pickup.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {(onContactWorker || (onCancelPickup && canCancel)) && (
          <div className="flex space-x-2">
            {onContactWorker && pickup.worker && (
              <button
                onClick={onContactWorker}
                className="flex-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Contact Worker
              </button>
            )}

            {onCancelPickup && canCancel && (
              <button
                onClick={onCancelPickup}
                className="px-3 py-2 text-sm font-medium text-danger-700 bg-danger-50 hover:bg-danger-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger-500"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapContainer;