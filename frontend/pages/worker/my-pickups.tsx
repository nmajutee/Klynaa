import React, { useState } from 'react';
import Head from 'next/head';
import WorkerLayout from '../../components/WorkerLayout';
import { useAuthStore } from '../../stores';
import {
    TruckIcon,
    ClockIcon,
    CheckCircleIcon,
    CurrencyDollarIcon,
    MapPinIcon,
    StarIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Pickup {
    id: number;
    type: 'organic' | 'recyclable' | 'general' | 'hazardous';
    location: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    customerName: string;
    acceptedAt: string;
    completedAt?: string;
    earnings: number;
    rating?: number;
    customerFeedback?: string;
    estimatedTime: number;
    actualTime?: number;
}

const MyPickups = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    // Mock data - replace with actual API call
    const pickups: Pickup[] = [
        {
            id: 1234,
            type: 'general',
            location: 'Douala, Bonanjo - Avenue Charles de Gaulle',
            status: 'in_progress',
            customerName: 'Marie Ngando',
            acceptedAt: '2 hours ago',
            earnings: 2500,
            estimatedTime: 30
        },
        {
            id: 1235,
            type: 'recyclable',
            location: 'Douala, Akwa - Rue Joffre',
            status: 'pending',
            customerName: 'Jean Baptiste',
            acceptedAt: '1 hour ago',
            earnings: 3000,
            estimatedTime: 25
        },
        {
            id: 1236,
            type: 'organic',
            location: 'Douala, New Bell - Marché Central',
            status: 'completed',
            customerName: 'Fatou Diallo',
            acceptedAt: 'Yesterday',
            completedAt: 'Yesterday at 4:30 PM',
            earnings: 1800,
            estimatedTime: 45,
            actualTime: 38,
            rating: 5,
            customerFeedback: 'Excellent service! Very professional and punctual.'
        },
        {
            id: 1237,
            type: 'general',
            location: 'Douala, Bassa - Rond Point Deido',
            status: 'completed',
            customerName: 'Paul Mbarga',
            acceptedAt: '3 days ago',
            completedAt: '3 days ago at 2:15 PM',
            earnings: 2200,
            estimatedTime: 35,
            actualTime: 42,
            rating: 4,
            customerFeedback: 'Good service, arrived a bit late but handled everything professionally.'
        }
    ];

    const pendingPickups = pickups.filter(p => p.status === 'pending' || p.status === 'in_progress');
    const completedPickups = pickups.filter(p => p.status === 'completed');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'organic': return 'bg-green-100 text-green-800';
            case 'recyclable': return 'bg-blue-100 text-blue-800';
            case 'general': return 'bg-gray-100 text-gray-800';
            case 'hazardous': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleCompletePickup = (pickupId: number) => {
        // TODO: Implement API call to mark pickup as completed
        console.log('Completing pickup:', pickupId);
        alert('Pickup marked as completed! Customer will be notified.');
    };

    const handleCancelPickup = (pickupId: number) => {
        // TODO: Implement API call to cancel pickup
        if (confirm('Are you sure you want to cancel this pickup?')) {
            console.log('Cancelling pickup:', pickupId);
            alert('Pickup has been cancelled.');
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <WorkerLayout>
            <Head>
                <title>My Pickups - Worker Portal</title>
            </Head>

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">My Pickups</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Track your accepted and completed pickup jobs
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'pending'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Active Pickups ({pendingPickups.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('completed')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'completed'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Completed ({completedPickups.length})
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {activeTab === 'pending' && (
                            <div>
                                {pendingPickups.length === 0 ? (
                                    <div className="text-center py-12">
                                        <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No active pickups</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Accept some pickup jobs to get started.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingPickups.map((pickup) => (
                                            <div key={pickup.id} className="bg-white rounded-lg shadow border p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(pickup.type)}`}>
                                                                {pickup.type.charAt(0).toUpperCase() + pickup.type.slice(1)}
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pickup.status)}`}>
                                                                {pickup.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                                            </span>
                                                            {pickup.status === 'in_progress' && (
                                                                <span className="flex items-center text-xs text-orange-600">
                                                                    <ExclamationTriangleIcon className="mr-1 h-3 w-3" />
                                                                    ETA: 30 minutes
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                            Pickup #{pickup.id}
                                                        </h3>

                                                        <div className="space-y-1 text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <MapPinIcon className="mr-2 h-4 w-4" />
                                                                {pickup.location}
                                                            </div>
                                                            <div>Customer: {pickup.customerName}</div>
                                                            <div>Accepted: {pickup.acceptedAt}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-right">
                                                            <div className="flex items-center text-lg font-semibold text-green-600">
                                                                <CurrencyDollarIcon className="mr-1 h-5 w-5" />
                                                                {pickup.earnings.toLocaleString()} XAF
                                                            </div>
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <ClockIcon className="mr-1 h-3 w-3" />
                                                                ~{pickup.estimatedTime} min
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col space-y-2">
                                                            {pickup.status === 'pending' && (
                                                                <button
                                                                    onClick={() => handleCompletePickup(pickup.id)}
                                                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                                                                >
                                                                    Start Job
                                                                </button>
                                                            )}
                                                            {pickup.status === 'in_progress' && (
                                                                <button
                                                                    onClick={() => handleCompletePickup(pickup.id)}
                                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                                                                >
                                                                    Complete
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleCancelPickup(pickup.id)}
                                                                className="text-red-600 border border-red-300 px-3 py-1 rounded text-sm font-medium hover:bg-red-50 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button className="text-blue-600 border border-blue-300 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors flex items-center">
                                                                <ChatBubbleLeftRightIcon className="mr-1 h-3 w-3" />
                                                                Chat
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'completed' && (
                            <div>
                                {completedPickups.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No completed pickups</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Your completed pickup history will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {completedPickups.map((pickup) => (
                                            <div key={pickup.id} className="bg-white rounded-lg shadow border p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(pickup.type)}`}>
                                                                {pickup.type.charAt(0).toUpperCase() + pickup.type.slice(1)}
                                                            </span>
                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pickup.status)}`}>
                                                                Completed
                                                            </span>
                                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                                        </div>

                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                            Pickup #{pickup.id}
                                                        </h3>

                                                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                                                            <div className="flex items-center">
                                                                <MapPinIcon className="mr-2 h-4 w-4" />
                                                                {pickup.location}
                                                            </div>
                                                            <div>Customer: {pickup.customerName}</div>
                                                            <div>Completed: {pickup.completedAt}</div>
                                                            <div className="flex items-center">
                                                                Time taken: {pickup.actualTime} min
                                                                {pickup.actualTime! <= pickup.estimatedTime && (
                                                                    <span className="ml-2 text-green-600 text-xs">On time!</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {pickup.rating && (
                                                            <div className="border-t pt-3">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    {renderStars(pickup.rating)}
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {pickup.rating}/5
                                                                    </span>
                                                                </div>
                                                                {pickup.customerFeedback && (
                                                                    <p className="text-sm text-gray-600 italic">
                                                                        "{pickup.customerFeedback}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="flex items-center text-lg font-semibold text-green-600">
                                                            <CurrencyDollarIcon className="mr-1 h-5 w-5" />
                                                            {pickup.earnings.toLocaleString()} XAF
                                                        </div>
                                                        <p className="text-xs text-gray-500">Earned</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </WorkerLayout>
    );
};

export default MyPickups;