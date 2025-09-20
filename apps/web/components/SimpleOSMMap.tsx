'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface BinLocation {
  id: string;
  lat: number;
  lng: number;
  owner_name: string;
  address: string;
  waste_type: string;
  fill_level: number;
  status: string;
}

interface SimpleOSMMapProps {
  bins: BinLocation[];
  selectedBinId?: string | null;
  onBinSelect?: (binId: string) => void;
}

const SimpleOSMMap: React.FC<SimpleOSMMapProps> = ({
  bins,
  selectedBinId,
  onBinSelect
}) => {
  // Center on Douala, Cameroon
  const center: [number, number] = [4.0511, 9.7679];

  // Worker icon
  const workerIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.716 0 0 6.716 0 15C0 26.25 15 36 15 36C15 36 30 26.25 30 15C30 6.716 23.284 0 15 0Z" fill="#0FA6A6"/>
        <circle cx="15" cy="15" r="9" fill="white"/>
        <path d="M15 8C11.686 8 9 10.686 9 14C9 17.314 11.686 20 15 20C18.314 20 21 17.314 21 14C21 10.686 18.314 8 15 8ZM15 12C16.105 12 17 12.895 17 14C17 15.105 16.105 16 15 16C13.895 16 13 15.105 13 14C13 12.895 13.895 12 15 12Z" fill="#0FA6A6"/>
      </svg>
    `,
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, -36]
  });

  // Icon for normal bins
  const fullBinIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12C0 21 12 30 12 30C12 30 24 21 24 12C24 5.373 18.627 0 12 0Z" fill="#EF4444"/>
        <circle cx="12" cy="12" r="8" fill="white"/>
        <path d="M8 9H16V15H8V9Z" fill="#EF4444"/>
        <path d="M9 7H15V9H9V7Z" fill="#EF4444"/>
      </svg>
    `,
    iconSize: [24, 30],
    iconAnchor: [12, 30],
    popupAnchor: [0, -30]
  });

  // Icon for selected bin (highlighted)
  const selectedBinIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative;">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.163 24.837 0 16 0Z" fill="#0FA6A6" stroke="#0FA6A6" stroke-width="3"/>
          <circle cx="16" cy="16" r="10" fill="white"/>
          <path d="M11 12H21V20H11V12Z" fill="#0FA6A6"/>
          <path d="M13 10H19V12H13V10Z" fill="#0FA6A6"/>
        </svg>
        <div style="position: absolute; top: -8px; right: -8px; width: 16px; height: 16px; background: #10B981; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
            <path d="M3 5.5L1.5 4L0.5 5L3 7.5L7.5 3L6.5 2L3 5.5Z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  });

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Worker location - fixed for demo */}
        <Marker position={[4.0511, 9.7679]} icon={workerIcon}>
          <Popup>
            <div className="text-center">
              <strong>Your Location</strong>
              <br />
              <small>Worker Position</small>
            </div>
          </Popup>
        </Marker>

        {/* Bin markers */}
        {bins.map((bin) => (
          <Marker
            key={bin.id}
            position={[bin.lat, bin.lng]}
            icon={selectedBinId === bin.id ? selectedBinIcon : fullBinIcon}
            eventHandlers={{
              click: () => onBinSelect?.(bin.id),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-sm">{bin.owner_name}</strong>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    bin.status === 'full' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {bin.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mb-2">{bin.address}</p>

                <div className="text-xs mb-2">
                  <div>Type: <strong>{bin.waste_type}</strong></div>
                  <div>Fill Level: <strong>{bin.fill_level}%</strong></div>
                </div>

                <button
                  onClick={() => onBinSelect?.(bin.id)}
                  className="w-full bg-teal-600 text-white px-3 py-1 rounded text-xs hover:bg-teal-700"
                >
                  Select Bin
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000] text-xs">
        <div className="font-semibold mb-2">Legend</div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 bg-teal-600 rounded mr-2"></div>
          <span>Your Location</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span>Bins to Collect</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-teal-600 rounded mr-2 border-2 border-green-500"></div>
          <span>Selected Bin</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleOSMMap;