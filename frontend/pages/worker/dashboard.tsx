import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    MapPinIcon,
    CurrencyDollarIcon,
    ClockIcon,
    TruckIcon,
    ChatBubbleLeftIcon,
    BellIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { workerDashboardApi } from '../../services/workerDashboardApi';
import { useAuthStore } from '../../stores';
import Layout from '../../components/Layout';
import type { WorkerStats, PickupTask } from '../../types';

const WorkerDashboard: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [stats, setStats] = useState<WorkerStats | null>(null);
    const [recentTasks, setRecentTasks] = useState<PickupTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'worker') {
            router.push('/auth/login');
            return;
        }
        loadDashboardData();
    }, [isAuthenticated, user, router]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load stats and recent tasks in parallel
            const [statsResponse, tasksResponse] = await Promise.all([
                workerDashboardApi.getWorkerStats(),
                workerDashboardApi.getMyPickups({ status: 'all', limit: 5 })
            ]);

            setStats(statsResponse);
            setRecentTasks(tasksResponse.results);
        } catch (err: any) {
            console.error('Failed to load dashboard data:', err);
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        try {
            await workerDashboardApi.toggleWorkerStatus(!user?.is_available);
            // Refresh user data or update local state
            window.location.reload(); // Simple refresh for now
        } catch (err: any) {
            console.error('Failed to update availability:', err);
            alert('Failed to update availability: ' + err.message);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'accepted': return 'text-blue-600 bg-blue-50';
            case 'in_progress': return 'text-purple-600 bg-purple-50';
            case 'completed': return 'text-green-600 bg-green-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={loadDashboardData}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Welcome, {user?.first_name}!
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {user?.is_available ? 'You are available for pickups' : 'You are currently offline'}
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button className="p-2 text-gray-600 hover:text-gray-900">
                                    <BellIcon className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={toggleAvailability}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        user?.is_available
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    {user?.is_available ? 'Go Offline' : 'Go Online'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="px-4 py-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <TruckIcon className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Total Pickups</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats?.total_pickups || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(Number(stats?.total_earnings) || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <ClockIcon className="h-8 w-8 text-purple-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">This Week</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats?.this_week_pickups || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-8 w-8 text-yellow-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Rating</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {user?.rating_average?.toFixed(1) || '0.0'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Link href="/worker/tasks">
                            <a className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-center">
                                    <TruckIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <p className="font-medium text-gray-900">View Tasks</p>
                                    <p className="text-sm text-gray-600">Available pickups</p>
                                </div>
                            </a>
                        </Link>

                        <Link href="/worker/map">
                            <a className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-center">
                                    <MapPinIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="font-medium text-gray-900">Map View</p>
                                    <p className="text-sm text-gray-600">See nearby jobs</p>
                                </div>
                            </a>
                        </Link>

                        <Link href="/worker/chat">
                            <a className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-center">
                                    <ChatBubbleLeftIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                    <p className="font-medium text-gray-900">Messages</p>
                                    <p className="text-sm text-gray-600">Customer chat</p>
                                </div>
                            </a>
                        </Link>

                        <Link href="/worker/earnings">
                            <a className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-center">
                                    <CurrencyDollarIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                                    <p className="font-medium text-gray-900">Earnings</p>
                                    <p className="text-sm text-gray-600">Payment history</p>
                                </div>
                            </a>
                        </Link>
                    </div>

                    {/* Recent Tasks */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Recent Tasks</h2>
                        </div>
                        <div className="p-4">
                            {recentTasks.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No recent tasks</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentTasks.map((task) => (
                                        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    Pickup #{task.id}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {task.pickup_location}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(task.pickup_time).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="ml-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                                                    {task.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {recentTasks.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-200">
                                <Link href="/worker/tasks">
                                    <a className="text-green-600 text-sm font-medium hover:text-green-700">
                                        View all tasks →
                                    </a>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default WorkerDashboard;