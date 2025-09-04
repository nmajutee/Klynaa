import React, { useEffect, useRef } from 'react';
import L, { Map as LeafletMap, TileLayer } from 'leaflet';
import 'leaflet.markercluster';

export interface Provider {
  id: string;
  name: string;
  type: 'worker' | 'bin_owner';
  lat: number;
  lng: number;
  avatar?: string;
  rating: number;
  phone?: string;
  services?: string[];
  availability: 'available' | 'busy' | 'offline';
  distance?: string;
}

export interface ServiceMapLeafletProps {
  providers: Provider[];
  center: [number, number];
  zoom: number;
  theme: 'light' | 'dark';
  userLocation: [number, number] | null;
  selectedProvider: Provider | null;
  onProviderClick: (p: Provider) => void;
  onPopupClose: () => void;
}

const tileUrls = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

const tileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const ServiceMapLeaflet: React.FC<ServiceMapLeafletProps> = ({
  providers,
  center,
  zoom,
  theme,
  userLocation,
  selectedProvider,
  onProviderClick,
  onPopupClose,
}) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const baseLayerRef = useRef<TileLayer | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Helper function to truncate names for pin display
  const truncateName = (name: string, maxLength: number = 12): string => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  // Helper function to generate initials from name
  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Create marker icon with inline labels
  const createLabeledMarker = (p: Provider) => {
    const isWorker = p.type === 'worker';
    const bgColor = isWorker ? 'var(--color-secondary)' : 'var(--color-success)';
    const roleText = isWorker ? 'Worker' : 'Bin Owner';
    const truncatedName = truncateName(p.name);

    return L.divIcon({
      className: 'custom-labeled-marker',
      html: `
        <div class="marker-container">
          <div class="marker-label" style="background-color: ${bgColor};">
            <div class="marker-name">${truncatedName}</div>
            <div class="marker-role">${roleText}</div>
          </div>
          <div class="marker-pin" style="background-color: ${bgColor};">
            <div class="marker-icon">${isWorker ? '🧑‍🔧' : '🗑️'}</div>
          </div>
        </div>
      `,
      iconSize: [120, 60],
      iconAnchor: [60, 60],
      popupAnchor: [0, -55]
    });
  };

  // Create enhanced popup content
  const createPopupContent = (p: Provider): string => {
    const isWorker = p.type === 'worker';
    const badgeColor = isWorker ? 'var(--color-secondary)' : 'var(--color-success)';
    const badgeText = isWorker ? 'Worker' : 'Bin Owner';
    const initials = getInitials(p.name);

    // Create star rating HTML with gold stars
    const createStarRating = (rating: number): string => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      let starsHTML = '';

      // Full stars
      for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span class="star-full">★</span>';
      }

      // Half star
      if (hasHalfStar) {
        starsHTML += '<span class="star-half">☆</span>';
      }

      // Empty stars
      const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      for (let i = 0; i < remainingStars; i++) {
        starsHTML += '<span class="star-empty">☆</span>';
      }

      return starsHTML;
    };

    const serviceText = p.services && p.services[0] ? p.services[0] : 'General Service';
    const statusText = p.availability === 'available' ? 'Available' :
      p.availability === 'busy' ? 'Busy' : 'Offline';
    const statusColor = p.availability === 'available' ? 'var(--color-success)' :
      p.availability === 'busy' ? 'var(--color-warning, #F59E0B)' : 'var(--color-error, #EF4444)';

    return `
      <div class="custom-popup">
        <div class="popup-header">
          <div class="popup-avatar">
            <span class="avatar-initials">${initials}</span>
          </div>
          <div class="popup-info">
            <h3 class="popup-name">${p.name}</h3>
            <span class="popup-badge" style="background-color: ${badgeColor};">${badgeText}</span>
          </div>
        </div>

        <div class="popup-rating">
          <div class="stars-container">
            ${createStarRating(p.rating)}
          </div>
          <span class="rating-value">${p.rating}</span>
        </div>

        <div class="popup-details">
          <div class="popup-status" style="color: ${statusColor};">
            <span class="status-dot" style="background-color: ${statusColor};"></span>
            ${statusText}
          </div>
          <div class="popup-distance">${p.distance || '-- km'} away</div>
        </div>

        <div class="popup-service">
          <strong>Service:</strong> ${serviceText}
        </div>
      </div>
    `;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
    });
    mapRef.current = map;

    // Base layer
    const base = L.tileLayer(tileUrls[theme], { attribution: tileAttribution, detectRetina: true });
    base.addTo(map);
    baseLayerRef.current = base;

    // Controls
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Cluster group
    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      chunkedLoading: true,
      removeOutsideVisibleBounds: true,
    });
    cluster.addTo(map);
    clusterGroupRef.current = cluster;

    return () => {
      map.remove();
      mapRef.current = null;
      clusterGroupRef.current = null;
      baseLayerRef.current = null;
    };
  }, []);

  // Update tile layer on theme change
  useEffect(() => {
    if (!mapRef.current) return;
    if (baseLayerRef.current) {
      baseLayerRef.current.setUrl(tileUrls[theme]);
    }
  }, [theme]);

  // Add/update markers when providers change
  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;

    const cluster = clusterGroupRef.current;
    cluster.clearLayers();

    const markers = providers.map((p) => {
      const icon = createLabeledMarker(p);
      const marker = L.marker([p.lat, p.lng], { icon });

      // Create popup content
      const popupHtml = createPopupContent(p);

      marker.on('click', () => onProviderClick(p));
      marker.bindPopup(popupHtml, {
        className: 'leaflet-custom-popup',
        autoPanPadding: [16, 16],
        maxWidth: 220,
        closeButton: true
      });

      return marker;
    });

    markers.forEach((m) => cluster.addLayer(m));
  }, [providers]);

  // User location marker
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing location layer if any by storing on map instance
    const map = mapRef.current as any;
    if (map.__userLocationLayer) {
      map.removeLayer(map.__userLocationLayer);
      map.__userLocationLayer = null;
    }

    if (userLocation) {
      const layer = L.circleMarker(userLocation, {
        radius: 8,
        color: 'var(--color-secondary)',
        fillColor: 'var(--color-secondary)',
        fillOpacity: 0.4,
        weight: 2,
      } as any);
      layer.addTo(map);
      map.__userLocationLayer = layer;
    }
  }, [userLocation]);

  // Open popup for selected provider (desktop)
  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;
    if (!selectedProvider) {
      // Close any open popup
      mapRef.current.closePopup();
      return;
    }

    // Find marker by matching lat/lng and open its popup
    const cluster = clusterGroupRef.current;
    cluster.eachLayer((layer: any) => {
      if (layer.getLatLng && selectedProvider) {
        const ll = layer.getLatLng();
        if (ll.lat === selectedProvider.lat && ll.lng === selectedProvider.lng) {
          layer.openPopup();
        }
      }
    });
  }, [selectedProvider]);

  return <div ref={mapContainerRef} className="leaflet-map-container" style={{ height: '100%', width: '100%' }} />;
};

export default ServiceMapLeaflet;
