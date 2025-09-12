import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    CurrencyDollarIcon,
    CalendarDaysIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { workerDashboardApi } from '../../services/workerDashboardApi';
import { useAuthStore } from '../../stores';
import Layout from '../../components/Layout';
import type { WorkerEarning, WorkerStats, ApiResponse } from '../../types';

const WorkerEarningsPage: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [earnings, setEarnings] = useState<WorkerEarning[]>([]);
    const [stats, setStats] = useState<WorkerStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'worker') {
            router.push('/auth/login');
            return;
        }
        loadEarningsData();
    }, [isAuthenticated, user, router, selectedPeriod]);

    const loadEarningsData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load earnings and stats
            const [earningsResponse, statsResponse] = await Promise.all([
                workerDashboardApi.getWorkerEarnings({ period: selectedPeriod }),
                workerDashboardApi.getWorkerStats()
            ]);

            setEarnings(earningsResponse.results);
            setStats(statsResponse);
        } catch (err: any) {
            console.error('Failed to load earnings data:', err);
            setError(err.message || 'Failed to load earnings');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(numAmount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'paid': return 'text-green-600 bg-green-50 border-green-200';
            case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'failed': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'mobile_money': return '📱';
            case 'bank_transfer': return '🏦';
            case 'cash': return '💵';
            default: return '💳';
        }
    };

    const calculateTotalEarnings = () => {
        return earnings
            .filter(earning => earning.status === 'paid')
            .reduce((total, earning) => total + parseFloat(earning.total_amount), 0);
    };

    const calculatePendingEarnings = () => {
        return earnings
            .filter(earning => earning.status === 'pending')
            .reduce((total, earning) => total + parseFloat(earning.total_amount), 0);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="px-4 py-6">
                        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>

                        {/* Period Filter */}
                        <div className="inline-flex space-x-1 mt-4 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setSelectedPeriod('week')}
                                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    selectedPeriod === 'week'
                                        ? 'bg-white text-green-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                This Week
                            </button>
                            <button
                                onClick={() => setSelectedPeriod('month')}
                                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    selectedPeriod === 'month'
                                        ? 'bg-white text-green-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                This Month
                            </button>
                            <button
                                onClick={() => setSelectedPeriod('all')}
                                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                    selectedPeriod === 'all'
                                        ? 'bg-white text-green-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                All Time
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Total Earned</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(calculateTotalEarnings())}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <ClockIcon className="h-8 w-8 text-yellow-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(calculatePendingEarnings())}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <TrendingUpIcon className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(stats?.earnings_month || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <BanknotesIcon className="h-8 w-8 text-purple-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.total_pickups || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Earnings List */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={loadEarningsData}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : earnings.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">No earnings yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {earnings.map((earning) => (
                                    <div key={earning.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <span className="text-lg mr-2">
                                                        {getPaymentMethodIcon(earning.payout_method)}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            Pickup #{earning.pickup_request_id}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Earning from pickup
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(earning.earned_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {formatCurrency(earning.total_amount)}
                                                </p>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(earning.status)}`}>
                                                    {earning.status === 'paid' && (
                                                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                    )}
                                                    {earning.status.toUpperCase()}
                                                </span>
                                                {earning.platform_fee && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Fee: {formatCurrency(earning.platform_fee)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {earning.notes && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                                <p className="text-sm text-gray-700">{earning.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment Methods Info */}
                    <div className="bg-white rounded-lg shadow-sm mt-6">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Payment Information</h2>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Payment Schedule</h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        • Payments are processed every Tuesday
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">
                                        • Minimum payout: {formatCurrency(100)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        • Processing time: 1-3 business days
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Platform Fees</h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        • Service fee: 10% per pickup
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">
                                        • Payment processing: Free
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        • No hidden charges
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default WorkerEarningsPage;