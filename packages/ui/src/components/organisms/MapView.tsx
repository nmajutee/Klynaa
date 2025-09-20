import React from 'react';
import { cn } from '../../utils/cn';

export interface MapViewProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title?: string;
    content?: React.ReactNode;
  }>;
  onMarkerClick?: (markerId: string) => void;
  onMapClick?: (position: [number, number]) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  className,
  center = [0, 0],
  zoom = 10,
  markers = [],
  onMarkerClick,
  onMapClick
}) => {
  // Simple placeholder map component
  // In a real implementation, this would integrate with Leaflet, Google Maps, etc.

  return (
    <div className={cn(
      'relative w-full h-64 bg-gray-200 rounded-lg border border-gray-300',
      className
    )}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🗺️</div>
          <p>Interactive Map</p>
          <p className="text-sm">Center: {center[0]}, {center[1]}</p>
          <p className="text-sm">Zoom: {zoom}</p>
          {markers.length > 0 && (
            <p className="text-sm">{markers.length} markers</p>
          )}
        </div>
      </div>

      {/* Marker indicators */}
      {markers.map((marker, index) => (
        <div
          key={marker.id}
          className="absolute w-4 h-4 bg-red-500 rounded-full cursor-pointer transform -translate-x-2 -translate-y-2 hover:bg-red-600"
          style={{
            left: `${20 + index * 15}%`,
            top: `${30 + index * 10}%`
          }}
          onClick={() => onMarkerClick?.(marker.id)}
          title={marker.title}
        />
      ))}
    </div>
  );
};