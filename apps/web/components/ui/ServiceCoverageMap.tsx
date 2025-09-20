import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
    MapPinIcon,
    TruckIcon,
    UserGroupIcon,
    XMarkIcon,
    MapIcon,
    PhoneIcon,
    StarIcon
} from '@heroicons/react/24/outline';

import type { ServiceMapLeafletProps, Provider as LeafletProvider } from './ServiceMapLeaflet';

// Leaflet imports - dynamically loaded to avoid SSR issues
const DynamicMap = dynamic<ServiceMapLeafletProps>(() => import('./ServiceMapLeaflet'), {
    ssr: false,
    loading: () => (
        <div className="service-map-skeleton">
            <div className="skeleton-content">
                <div className="skeleton-shimmer"></div>
                <p className="skeleton-text">Loading coverage map...</p>
            </div>
        </div>
    )
});

export interface ServiceProvider extends LeafletProvider { }

interface ServiceCoverageMapProps {
    providers: ServiceProvider[];
    center?: [number, number];
    zoom?: number;
    height?: string;
    onProviderSelect?: (provider: ServiceProvider) => void;
    showUserLocation?: boolean;
    className?: string;
}

export const ServiceCoverageMap: React.FC<ServiceCoverageMapProps> = ({
    providers = [],
    center = [43.7001, -79.4163], // Toronto by default
    zoom = 12,
    height = '500px',
    onProviderSelect,
    showUserLocation = true,
    className = ''
}) => {
    const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Detect theme from CSS or localStorage
        const detectTheme = () => {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
            setTheme(isDark ? 'dark' : 'light');
        };

        detectTheme();

        // Listen for theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', detectTheme);

        return () => mediaQuery.removeEventListener('change', detectTheme);
    }, []);

    useEffect(() => {
        // Get user location if permission granted
        if (showUserLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.log('Location access denied or unavailable');
                }
            );
        }
    }, [showUserLocation]);

    const handleProviderClick = (provider: ServiceProvider) => {
        setSelectedProvider(provider);
        onProviderSelect?.(provider);
    };

    const closePopup = () => {
        setSelectedProvider(null);
    };

    return (
        <div className={`service-coverage-map ${className}`} style={{ height }}>
            <DynamicMap
                providers={providers}
                center={center}
                zoom={zoom}
                theme={theme}
                userLocation={userLocation}
                selectedProvider={selectedProvider}
                onProviderClick={handleProviderClick}
                onPopupClose={closePopup}
            />

            {/* Note: No bottom overlay panel per spec. Popups show inline on map. */}
        </div>
    );
};

export default ServiceCoverageMap;
