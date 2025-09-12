import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    MapPinIcon,
    ClockIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import { workerDashboardApi } from '../../services/workerDashboardApi';
import { useAuthStore } from '../../stores';
import Layout from '../../components/Layout';
import type { PickupTask, ApiResponse } from '../../types';

const WorkerTasksPage: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [availableTasks, setAvailableTasks] = useState<PickupTask[]>([]);
    const [myTasks, setMyTasks] = useState<PickupTask[]>([]);
    const [activeTab, setActiveTab] = useState<'available' | 'my-tasks'>('available');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'worker') {
            router.push('/auth/login');
            return;
        }
        loadTasks();
    }, [isAuthenticated, user, router, activeTab, statusFilter]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            setError(null);

            if (activeTab === 'available') {
                const response = await workerDashboardApi.getAvailablePickups();
                setAvailableTasks(response);
            } else {
                // For now, filter available pickups to show accepted ones
                // TODO: Implement proper getMyTasks API endpoint
                const response = await workerDashboardApi.getAvailablePickups();
                const myTasksFiltered = response.filter((task: PickupTask) =>
                    task.status !== 'open' && (statusFilter === 'all' || task.status === statusFilter)
                );
                setMyTasks(myTasksFiltered);
            }
        } catch (err: any) {
            console.error('Failed to load tasks:', err);
            setError(err.message || 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const acceptPickup = async (pickupId: string) => {
        try {
            await workerDashboardApi.acceptPickup(pickupId);
            // Refresh tasks
            loadTasks();
            // Show success message
            alert('Pickup accepted successfully!');
        } catch (err: any) {
            console.error('Failed to accept pickup:', err);
            alert('Failed to accept pickup: ' + err.message);
        }
    };

    const startPickup = async (pickupId: string) => {
        try {
            await workerDashboardApi.acceptPickup(pickupId);
            loadTasks();
            alert('Pickup started successfully!');
        } catch (err: any) {
            console.error('Failed to start pickup:', err);
            alert('Failed to start pickup: ' + err.message);
        }
    };

    const completePickup = async (pickupId: string) => {
        try {
            // Navigate to completion page with proof upload
            router.push(`/worker/pickup/${pickupId}/complete`);
        } catch (err: any) {
            console.error('Failed to navigate to completion:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'accepted': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'in_progress': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'completed': return 'text-green-600 bg-green-50 border-green-200';
            case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        return workerDashboardApi.calculateDistance(lat1, lng1, lat2, lng2);
    };

    const getDistanceToPickup = (task: PickupTask): string => {
        if (!user?.latitude || !user?.longitude || !task.bin_latitude || !task.bin_longitude) {
            return 'Unknown';
        }
        const distance = calculateDistance(user.latitude, user.longitude, task.bin_latitude, task.bin_longitude);
        return `${distance.toFixed(1)} km`;
    };

    const filteredTasks = (activeTab === 'available' ? availableTasks : myTasks).filter(task =>
        task.bin_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.waste_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderTaskCard = (task: PickupTask) => (
        <div key={task.id} className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Pickup #{task.id}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.waste_type || 'General Waste'}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>{task.bin_address}</span>
                    {activeTab === 'available' && (
                        <span className="ml-2 text-xs text-blue-600">
                            ({getDistanceToPickup(task)} away)
                        </span>
                    )}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{task.time_window ? `${new Date(task.time_window.start).toLocaleString()} - ${new Date(task.time_window.end).toLocaleString()}` : new Date(task.created_at).toLocaleString()}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium text-green-600">
                        {formatCurrency(Number(task.expected_fee))}
                    </span>
                </div>
            </div>

            {task.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                        <strong>Instructions:</strong> {task.notes}
                    </p>
                </div>
            )}

            {/* Action buttons based on status and tab */}
            <div className="flex space-x-2">
                {activeTab === 'available' && task.status === 'open' && (
                    <button
                        onClick={() => acceptPickup(task.id)}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Accept Pickup
                    </button>
                )}

                {activeTab === 'my-tasks' && task.status === 'accepted' && (
                    <button
                        onClick={() => startPickup(task.id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Start Pickup
                    </button>
                )}

                {activeTab === 'my-tasks' && task.status === 'in_progress' && (
                    <button
                        onClick={() => completePickup(task.id)}
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Complete Pickup
                    </button>
                )}

                {activeTab === 'my-tasks' && (
                    <button
                        onClick={() => router.push(`/worker/chat?pickup=${task.id}`)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Chat
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="px-4 py-6">
                        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>

                        {/* Tabs */}
                        <div className="flex space-x-1 mt-4 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('available')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === 'available'
                                        ? 'bg-white text-green-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Available Tasks
                            </button>
                            <button
                                onClick={() => setActiveTab('my-tasks')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === 'my-tasks'
                                        ? 'bg-white text-green-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                My Tasks
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="px-4 py-4 bg-white border-b">
                    <div className="flex space-x-4">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by location or waste type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {activeTab === 'my-tasks' && (
                            <div className="flex items-center space-x-2">
                                <FunnelIcon className="h-5 w-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tasks List */}
                <div className="px-4 py-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={loadTasks}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">
                                {activeTab === 'available'
                                    ? 'No available pickups at the moment'
                                    : 'You have no tasks yet'
                                }
                            </p>
                        </div>
                    ) : (
                        <div>
                            {filteredTasks.map(renderTaskCard)}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default WorkerTasksPage;