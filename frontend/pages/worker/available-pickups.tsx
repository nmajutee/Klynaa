import React, { useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import WorkerLayout from '../../components/WorkerLayout';
import { useAuthStore } from '../../stores';
import {
    MapIcon,
    ListBulletIcon,
    TruckIcon,
    ClockIcon,
    CurrencyDollarIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

// Dynamic import of ServiceCoverageMap to avoid SSR issues
const ServiceCoverageMap = dynamic(
    () => import('../../components/ui/ServiceCoverageMap'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading map...</p>
                </div>
            </div>
        )
    }
);

interface AvailablePickup {
    id: number;
    type: 'organic' | 'recyclable' | 'general' | 'hazardous';
    location: string;
    distance: number;
    reward: number;
    priority: 'low' | 'medium' | 'high';
    timePosted: string;
    estimatedTime: number;
    latitude: number;
    longitude: number;
}

const AvailablePickups = () => {
    const { user } = useAuthStore();
    const [viewMode, setViewMode] = useState<'map' | 'list'>('list');

    // Mock data - replace with actual API call
    const availablePickups: AvailablePickup[] = [
        {
            id: 1,
            type: 'general',
            location: 'Douala, Bonanjo - Avenue Charles de Gaulle',
            distance: 2.5,
            reward: 2500,
            priority: 'high',
            timePosted: '15 minutes ago',
            estimatedTime: 30,
            latitude: 4.0511,
            longitude: 9.7679
        },
        {
            id: 2,
            type: 'recyclable',
            location: 'Douala, Akwa - Rue Joffre',
            distance: 1.2,
            reward: 3000,
            priority: 'medium',
            timePosted: '22 minutes ago',
            estimatedTime: 25,
            latitude: 4.0521,
            longitude: 9.7689
        },
        {
            id: 3,
            type: 'organic',
            location: 'Douala, Makepe - Boulevard de la Liberté',
            distance: 4.1,
            reward: 2200,
            priority: 'low',
            timePosted: '1 hour ago',
            estimatedTime: 35,
            latitude: 4.0431,
            longitude: 9.7629
        }
    ];

    // Transform pickup data for map display
    const mapProviders = useMemo(() => {
        return availablePickups.map(pickup => ({
            id: pickup.id.toString(),
            name: `Pickup #${pickup.id}`,
            type: 'bin_owner' as const, // Use bin_owner as closest type for pickups
            lat: pickup.latitude,
            lng: pickup.longitude,
            rating: pickup.priority === 'high' ? 5 : pickup.priority === 'medium' ? 3 : 1,
            availability: 'available' as const,
            address: pickup.location,
            binType: pickup.type === 'general' ? 'residential' as const :
                     pickup.type === 'recyclable' ? 'recycling' as const :
                     'residential' as const, // fallback
            binStatus: 'full' as const, // Pickups are by definition full bins
            fillLevel: pickup.priority === 'high' ? 100 : pickup.priority === 'medium' ? 75 : 50,
            services: [pickup.type],
            distance: `${pickup.distance}km`,
            // Store original pickup data for access in callbacks
            _pickupData: {
                reward: pickup.reward,
                priority: pickup.priority,
                distance: pickup.distance,
                estimatedTime: pickup.estimatedTime,
                timePosted: pickup.timePosted,
                originalId: pickup.id
            }
        }));
    }, [availablePickups]);

    // Handle pickup acceptance from map
    const handleMapPickupAccept = useCallback((pickupId: number) => {
        handleAcceptPickup(pickupId);
    }, []);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'organic': return 'bg-green-100 text-green-800';
            case 'recyclable': return 'bg-blue-100 text-blue-800';
            case 'general': return 'bg-gray-100 text-gray-800';
            case 'hazardous': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-l-red-500';
            case 'medium': return 'border-l-yellow-500';
            case 'low': return 'border-l-green-500';
            default: return 'border-l-gray-500';
        }
    };

    const handleAcceptPickup = (pickupId: number) => {
        // TODO: Implement API call to accept pickup
        console.log('Accepting pickup:', pickupId);
        alert('Pickup request accepted! Check "My Pickups" for details.');
    };

    return (
        <WorkerLayout>
            <Head>
                <title>Available Pickups - Worker Portal</title>
            </Head>

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Available Pickups</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Find and accept waste collection jobs in your area
                        </p>
                    </div>

                    {/* View Toggle & Stats */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex rounded-lg bg-gray-100 p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        viewMode === 'list'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <ListBulletIcon className="mr-2 h-4 w-4" />
                                    List View
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        viewMode === 'map'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <MapIcon className="mr-2 h-4 w-4" />
                                    Map View
                                </button>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600">
                            {availablePickups.length} pickups available
                        </div>
                    </div>

                    {/* Content */}
                    {viewMode === 'list' ? (
                        <div className="space-y-4">
                            {availablePickups.map((pickup) => (
                                <div
                                    key={pickup.id}
                                    className={`bg-white rounded-lg shadow border-l-4 ${getPriorityColor(pickup.priority)} p-6`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(pickup.type)}`}>
                                                    {pickup.type.charAt(0).toUpperCase() + pickup.type.slice(1)}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    pickup.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                    pickup.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {pickup.priority.charAt(0).toUpperCase() + pickup.priority.slice(1)} Priority
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                Pickup #{pickup.id}
                                            </h3>

                                            <div className="flex items-center text-sm text-gray-600 mb-2">
                                                <MapPinIcon className="mr-1 h-4 w-4" />
                                                {pickup.location}
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <TruckIcon className="mr-1 h-4 w-4" />
                                                    {pickup.distance} km away
                                                </div>
                                                <div className="flex items-center">
                                                    <ClockIcon className="mr-1 h-4 w-4" />
                                                    ~{pickup.estimatedTime} min
                                                </div>
                                                <span>{pickup.timePosted}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="flex items-center text-lg font-semibold text-green-600">
                                                    <CurrencyDollarIcon className="mr-1 h-5 w-5" />
                                                    {pickup.reward.toLocaleString()} XAF
                                                </div>
                                                <p className="text-xs text-gray-500">Estimated earnings</p>
                                            </div>

                                            <button
                                                onClick={() => handleAcceptPickup(pickup.id)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                            >
                                                Accept Job
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="h-[600px] relative">
                                <ServiceCoverageMap
                                    providers={mapProviders}
                                    onProviderSelect={(provider: any) => {
                                        console.log('Pickup selected:', provider);
                                        // Show pickup details or accept directly
                                        if (provider._pickupData) {
                                            const pickupData = provider._pickupData;
                                            const confirmAccept = window.confirm(
                                                `Accept pickup #${pickupData.originalId}?\n` +
                                                `Location: ${provider.address}\n` +
                                                `Reward: ${pickupData.reward.toLocaleString()} XAF\n` +
                                                `Distance: ${pickupData.distance} km`
                                            );
                                            if (confirmAccept) {
                                                handleMapPickupAccept(pickupData.originalId);
                                            }
                                        }
                                    }}
                                />

                                {/* Map overlay with pickup count */}
                                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 z-[1000]">
                                    <div className="flex items-center space-x-2">
                                        <MapPinIcon className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                            {availablePickups.length} pickups available
                                        </span>
                                    </div>
                                </div>

                                {/* Map legend */}
                                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-[1000]">
                                    <div className="text-xs font-medium text-gray-900 mb-2">Priority Levels:</div>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span className="text-xs text-gray-600">High Priority</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <span className="text-xs text-gray-600">Medium Priority</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-xs text-gray-600">Low Priority</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {availablePickups.length === 0 && (
                        <div className="text-center py-12">
                            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No pickups available</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Check back later for new pickup opportunities.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </WorkerLayout>
    );
};

export default AvailablePickups;