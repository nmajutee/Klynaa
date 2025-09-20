import React, { useEffect, useRef, useCallback } from 'react';
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
  // Bin-specific properties
  binStatus?: 'empty' | 'partially_full' | 'full';
  fillLevel?: number; // 0-100 percentage
  lastEmptied?: string; // ISO date string
  timesFull?: string; // e.g., "2h 15m"
  binType?: 'residential' | 'commercial' | 'recycling';
  ownerPhoto?: string;
  address?: string;
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

  // Create marker icon with inline labels and React-style icons
  const createLabeledMarker = useCallback((p: Provider) => {
    const isWorker = p.type === 'worker';
    const isBinOwner = p.type === 'bin_owner';
    const isFullBin = isBinOwner && p.binStatus === 'full';

    // Colors for different types
    let bgColor: string;
    let roleText: string;

    if (isFullBin) {
      bgColor = '#EF4444'; // Red for full bins (urgent)
      roleText = 'Full Bin';
    } else if (isWorker) {
      bgColor = 'var(--color-secondary)'; // Blue for workers
      roleText = 'Worker';
    } else {
      bgColor = 'var(--color-success)'; // Green for regular bin owners
      roleText = 'Bin Owner';
    }

    const truncatedName = truncateName(p.name);

    // SVG icons matching Lucide React icons
    const userIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    const trashIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>`;
    const alertIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>`;

    let iconSvg: string;
    if (isFullBin) {
      iconSvg = alertIcon; // Alert icon for full bins
    } else if (isWorker) {
      iconSvg = userIcon;
    } else {
      iconSvg = trashIcon;
    }

    // Add pulsing animation class for full bins
    const markerClass = isFullBin ? 'custom-labeled-marker full-bin-marker' : 'custom-labeled-marker';

    return L.divIcon({
      className: markerClass,
      html: `
        <div class="marker-container ${isFullBin ? 'urgent-bin' : ''}">
          <div class="marker-label" style="background-color: ${bgColor};">
            <div class="marker-name">${truncatedName}</div>
            <div class="marker-role">${roleText}</div>
            ${isFullBin ? '<div class="urgent-indicator">URGENT</div>' : ''}
          </div>
          <div class="marker-pin" style="background-color: ${bgColor};">
            <div class="marker-icon">${iconSvg}</div>
          </div>
        </div>
      `,
      iconSize: [120, isFullBin ? 75 : 60], // Larger for full bins
      iconAnchor: [60, isFullBin ? 75 : 60],
      popupAnchor: [0, isFullBin ? -70 : -55]
    });
  }, []);

  // Create enhanced popup content
  const createPopupContent = useCallback((p: Provider): string => {
    const isBinOwner = p.type === 'bin_owner';
    const isFullBin = isBinOwner && p.binStatus === 'full';

    if (isFullBin) {
      // Full bin popup content
      const initials = getInitials(p.name);
      const createStarRating = (rating: number): string => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) {
          starsHTML += '<span class="star-full">★</span>';
        }

        if (hasHalfStar) {
          starsHTML += '<span class="star-half">☆</span>';
        }

        const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remainingStars; i++) {
          starsHTML += '<span class="star-empty">☆</span>';
        }

        return starsHTML;
      };

      const binTypeDisplay = p.binType ? p.binType.charAt(0).toUpperCase() + p.binType.slice(1) : 'Standard';
      const fillLevel = p.fillLevel || 100;
      const fillLevelColor = fillLevel >= 95 ? '#EF4444' : fillLevel >= 80 ? '#F59E0B' : '#10B981';

      return `
        <div class="custom-popup full-bin-popup">
          <div class="popup-header">
            <div class="popup-avatar">
              <img src="${p.ownerPhoto || '/api/placeholder/50/50'}" alt="${p.name}" class="avatar-image" />
            </div>
            <div class="popup-info">
              <h3 class="popup-name">${p.name}</h3>
              <span class="popup-badge bin-owner-badge">Bin Owner</span>
            </div>
          </div>

          <div class="popup-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${p.address || 'Location not specified'}</span>
          </div>

          <div class="bin-status-section">
            <div class="fill-level-container">
              <div class="fill-level-label">Fill Level</div>
              <div class="fill-level-bar">
                <div class="fill-level-progress" style="width: ${fillLevel}%; background-color: ${fillLevelColor};"></div>
              </div>
              <div class="fill-level-text">${fillLevel}% Full</div>
            </div>

            <div class="time-full">
              <span class="time-icon">⏰</span>
              Full for: <strong>${p.timesFull || 'Unknown'}</strong>
            </div>

            <div class="bin-type">
              <span class="bin-icon">🗑️</span>
              Type: <strong>${binTypeDisplay} Bin</strong>
            </div>
          </div>

          <div class="popup-rating">
            <div class="stars-container">
              ${createStarRating(p.rating)}
            </div>
            <span class="rating-value">${p.rating}</span>
          </div>

          <div class="popup-actions">
            <button class="pickup-btn primary" onclick="requestPickup('${p.id}')">
              🚛 Request Pickup
            </button>
            ${p.phone ? `<button class="contact-btn secondary" onclick="contactOwner('${p.phone}')">
              📞 Contact Owner
            </button>` : ''}
          </div>
        </div>
      `;
    } else {
      // Original worker/bin owner popup content
      const badgeColor = p.type === 'worker' ? 'var(--color-secondary)' : 'var(--color-success)';
      const badgeText = p.type === 'worker' ? 'Worker' : 'Bin Owner';
      const initials = getInitials(p.name);

      const createStarRating = (rating: number): string => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) {
          starsHTML += '<span class="star-full">★</span>';
        }

        if (hasHalfStar) {
          starsHTML += '<span class="star-half">☆</span>';
        }

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
    }
  }, []);

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
  }, [center, zoom, theme]);

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
  }, [providers, createLabeledMarker, createPopupContent, onProviderClick]);

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

  // Add global functions for popup interactions
  useEffect(() => {
    // Add global functions to window for popup button interactions
    (window as any).requestPickup = (binId: string) => {
      console.log('Requesting pickup for bin:', binId);
      // TODO: Implement actual pickup request functionality
      alert(`Pickup requested for bin ${binId}. A worker will be assigned shortly!`);
    };

    (window as any).contactOwner = (phone: string) => {
      console.log('Contacting bin owner:', phone);
      // Open phone dialer
      window.location.href = `tel:${phone}`;
    };

    // Cleanup
    return () => {
      delete (window as any).requestPickup;
      delete (window as any).contactOwner;
    };
  }, []);

  return <div ref={mapContainerRef} className="leaflet-map-container" style={{ height: '100%', width: '100%' }} />;
};

export default ServiceMapLeaflet;
