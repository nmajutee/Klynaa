import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import WorkerLayout from '../../components/WorkerLayout';
import { useAuthStore, useDashboardStore } from '../../stores';
import { analyticsApi } from '../../services/api';
import {
    TrashIcon,
    TruckIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color, trend }) => {
    return (
        <div className="card">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <div className={`inline-flex items-center justify-center p-3 ${color} rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">{value}</div>
                            {trend && (
                                <div className={`ml-2 flex items-baseline text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {trend.isPositive ? '+' : ''}{trend.value}
                                </div>
                            )}
                        </dd>
                        {subtitle && (
                            <dd className="text-sm text-gray-500">{subtitle}</dd>
                        )}
                    </dl>
                </div>
            </div>
        </div>
    );
};

const WorkerDashboard = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { workerStats, setWorkerStats, setLoading } = useDashboardStore();
    const [loading, setLocalLoading] = useState(true);

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        loadWorkerData();

        async function loadWorkerData() {
            try {
                setLoading(true);
                // For now, use mock data since we might not have the API endpoint
                const mockWorkerStats = {
                    total_earnings: 340000,
                    pending_pickups: 4,
                    completed_today: 3,
                    completed_this_week: 12,
                    completed_this_month: 38,
                    avg_rating: 4.7,
                    total_distance_today: 25,
                    active_routes: 1,
                    total_pickups: 42,
                    completed_pickups: 38,
                    rating: 4.7,
                    earnings_today: 15000,
                    earnings_week: 85000,
                    earnings_month: 340000,
                    completion_rate: 90.5
                };
                setWorkerStats(mockWorkerStats);
            } catch (error) {
                console.error('Failed to load worker data:', error);
            } finally {
                setLoading(false);
                setLocalLoading(false);
            }
        }
    }, [isAuthenticated, router, setWorkerStats, setLoading]);

    if (loading) {
        return (
            <WorkerLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span className="ml-2 text-gray-600">Loading dashboard...</span>
                </div>
            </WorkerLayout>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <WorkerLayout>
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Head>
                        <title>Worker Dashboard - Klynaa</title>
                    </Head>

                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Welcome back, {user?.first_name || 'Worker'}! Ready to make a difference today?
                            </p>
                        </div>

                        {workerStats && (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <StatCard
                                    title="Total Pickups"
                                    value={workerStats.total_pickups}
                                    icon={TruckIcon}
                                    color="bg-blue-500"
                                    subtitle="All time"
                                />
                                <StatCard
                                    title="Completed"
                                    value={workerStats.completed_pickups}
                                    icon={TruckIcon}
                                    color="bg-green-500"
                                    subtitle="Successfully completed"
                                />
                                <StatCard
                                    title="Rating"
                                    value={workerStats.rating.toFixed(1)}
                                    icon={ChartBarIcon}
                                    color="bg-yellow-500"
                                    subtitle="Customer rating"
                                />
                                <StatCard
                                    title="Today's Earnings"
                                    value={`${workerStats.earnings_today} XAF`}
                                    icon={CurrencyDollarIcon}
                                    color="bg-green-600"
                                />
                            </div>
                        )}

                        {workerStats && (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <StatCard
                                    title="Weekly Earnings"
                                    value={`${workerStats.earnings_week} XAF`}
                                    icon={ChartBarIcon}
                                    color="bg-blue-600"
                                />
                                <StatCard
                                    title="Monthly Earnings"
                                    value={`${workerStats.earnings_month} XAF`}
                                    icon={ChartBarIcon}
                                    color="bg-purple-600"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="card">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Available Pickups</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">General waste pickup</p>
                                            <p className="text-xs text-gray-500">Douala, Bonanjo - 2.5km away</p>
                                        </div>
                                        <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded">
                                            Accept
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Recycling pickup</p>
                                            <p className="text-xs text-gray-500">Douala, Akwa - 1.2km away</p>
                                        </div>
                                        <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded">
                                            Accept
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/pickups/available')}
                                    className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded text-sm"
                                >
                                    View All Available Pickups
                                </button>
                            </div>

                            <div className="card">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">My Active Pickups</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Pickup #1234</p>
                                            <p className="text-xs text-gray-500">In Progress - ETA: 30 minutes</p>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Active
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/pickups/mine')}
                                    className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded text-sm"
                                >
                                    View All My Pickups
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WorkerLayout>
    );
};

export default WorkerDashboard;
