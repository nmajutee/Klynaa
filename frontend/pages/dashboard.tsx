import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuthStore, useDashboardStore } from '../stores';
import { analyticsApi } from '../services/api';
import {
    TrashIcon,
    TruckIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
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

const Dashboard: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { stats, workerStats, setStats, setWorkerStats, setLoading, setError } = useDashboardStore();
    const [loading, setLocalLoading] = useState(true);

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        // Load dashboard data based on user role
        const loadDashboardData = async () => {
            try {
                setLoading(true);

                if (user?.role === 'admin') {
                    const dashboardStats = await analyticsApi.getDashboardStats();
                    setStats(dashboardStats);
                } else if (user?.role === 'worker') {
                    const workerData = await analyticsApi.getWorkerStats();
                    setWorkerStats(workerData);
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
                setLocalLoading(false);
            }
        };

        loadDashboardData();
    }, [user, isAuthenticated, router, setStats, setWorkerStats, setLoading, setError]);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="spinner" />
                    <span className="ml-2 text-gray-600">Loading dashboard...</span>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return null;
    }

    const AdminDashboard = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Welcome back, {user.first_name}! Here's what's happening with your waste management platform.
                </p>
            </div>

            {stats && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Pickups"
                        value={stats.total_pickups}
                        icon={TruckIcon}
                        color="bg-blue-500"
                        subtitle="All time"
                    />
                    <StatCard
                        title="Active Bins"
                        value={stats.active_bins}
                        icon={TrashIcon}
                        color="bg-green-500"
                        subtitle="Currently monitored"
                    />
                    <StatCard
                        title="Workers"
                        value={stats.total_workers}
                        icon={UserGroupIcon}
                        color="bg-purple-500"
                        subtitle="Active workers"
                    />
                    <StatCard
                        title="Customers"
                        value={stats.total_customers}
                        icon={UserGroupIcon}
                        color="bg-indigo-500"
                        subtitle="Registered customers"
                    />
                </div>
            )}

            {stats && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <StatCard
                        title="Today's Revenue"
                        value={`${stats.revenue_today} XAF`}
                        icon={CurrencyDollarIcon}
                        color="bg-green-600"
                    />
                    <StatCard
                        title="Weekly Revenue"
                        value={`${stats.revenue_week} XAF`}
                        icon={ChartBarIcon}
                        color="bg-blue-600"
                    />
                    <StatCard
                        title="Monthly Revenue"
                        value={`${stats.revenue_month} XAF`}
                        icon={ChartBarIcon}
                        color="bg-purple-600"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                                <TruckIcon className="h-5 w-5 text-blue-500 mr-3" />
                                <span className="text-sm text-gray-900">New pickup request</span>
                            </div>
                            <span className="text-xs text-gray-500">2 minutes ago</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                                <UserGroupIcon className="h-5 w-5 text-green-500 mr-3" />
                                <span className="text-sm text-gray-900">New worker registered</span>
                            </div>
                            <span className="text-xs text-gray-500">1 hour ago</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                                <TrashIcon className="h-5 w-5 text-orange-500 mr-3" />
                                <span className="text-sm text-gray-900">Bin needs maintenance</span>
                            </div>
                            <span className="text-xs text-gray-500">3 hours ago</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/bins')}
                            className="w-full text-left btn-primary"
                        >
                            Manage Bins
                        </button>
                        <button
                            onClick={() => router.push('/pickups')}
                            className="w-full text-left btn-secondary"
                        >
                            View All Pickups
                        </button>
                        <button
                            onClick={() => router.push('/users')}
                            className="w-full text-left btn-secondary"
                        >
                            Manage Users
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const WorkerDashboard = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Welcome back, {user.first_name}! Ready to make a difference today?
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
                            <button className="btn-primary text-xs px-3 py-1">
                                Accept
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Recycling pickup</p>
                                <p className="text-xs text-gray-500">Douala, Akwa - 1.2km away</p>
                            </div>
                            <button className="btn-primary text-xs px-3 py-1">
                                Accept
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/pickups/available')}
                        className="mt-4 w-full btn-secondary text-sm"
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
                        className="mt-4 w-full btn-secondary text-sm"
                    >
                        View All My Pickups
                    </button>
                </div>
            </div>
        </div>
    );

    const CustomerDashboard = () => (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Welcome back, {user.first_name}! Manage your waste efficiently.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">My Bins</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                                <TrashIcon className="h-5 w-5 text-green-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Kitchen Bin</p>
                                    <p className="text-xs text-gray-500">Fill level: 45%</p>
                                </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Normal
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                                <TrashIcon className="h-5 w-5 text-orange-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Garden Bin</p>
                                    <p className="text-xs text-gray-500">Fill level: 85%</p>
                                </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Nearly Full
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/bins')}
                        className="mt-4 w-full btn-secondary text-sm"
                    >
                        Manage All Bins
                    </button>
                </div>

                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Pickups</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Pickup #1235</p>
                                <p className="text-xs text-gray-500">Completed yesterday</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Pickup #1234</p>
                                <p className="text-xs text-gray-500">Scheduled for today</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Scheduled
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/pickups/mine')}
                        className="mt-4 w-full btn-secondary text-sm"
                    >
                        View All Pickups
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                        onClick={() => router.push('/pickups/request')}
                        className="btn-primary"
                    >
                        Request Pickup
                    </button>
                    <button
                        onClick={() => router.push('/bins')}
                        className="btn-secondary"
                    >
                        Add New Bin
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDashboard = () => {
        switch (user.role) {
            case 'admin':
                return <AdminDashboard />;
            case 'worker':
                return <WorkerDashboard />;
            case 'customer':
                return <CustomerDashboard />;
            default:
                return (
                    <div className="text-center">
                        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Unknown user role</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Please contact support for assistance.
                        </p>
                    </div>
                );
        }
    };

    return (
        <Layout>
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {renderDashboard()}
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
