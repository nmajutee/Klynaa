import React, { useState } from 'react';
import Head from 'next/head';
import WorkerLayout from '../../components/WorkerLayout';
import {
    BanknotesIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Earnings = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('this_month');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    // Mock earnings data
    const earningsData = {
        totalBalance: 125000,
        pendingPayments: 15000,
        todayEarnings: 8500,
        thisWeekEarnings: 47500,
        thisMonthEarnings: 125000,
        averagePerPickup: 2500,
        totalPickups: 50,
        recentTransactions: [
            {
                id: 1,
                type: 'pickup',
                amount: 3000,
                description: 'Waste collection - Bonanjo District',
                date: '2024-01-15',
                status: 'completed',
                customer: 'Marie Kouam'
            },
            {
                id: 2,
                type: 'pickup',
                amount: 2500,
                description: 'Waste collection - Akwa District',
                date: '2024-01-15',
                status: 'completed',
                customer: 'Jean Mbala'
            },
            {
                id: 3,
                type: 'bonus',
                amount: 1000,
                description: 'Performance bonus',
                date: '2024-01-14',
                status: 'completed',
                customer: null
            }
        ],
        withdrawalHistory: [
            {
                id: 1,
                amount: 50000,
                method: 'Orange Money',
                date: '2024-01-12',
                status: 'completed',
                reference: 'TXN789012'
            },
            {
                id: 2,
                amount: 75000,
                method: 'MTN Mobile Money',
                date: '2024-01-05',
                status: 'completed',
                reference: 'TXN456789'
            }
        ]
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircleIcon className="h-4 w-4" />;
            case 'pending':
                return <ClockIcon className="h-4 w-4" />;
            case 'failed':
                return <ExclamationTriangleIcon className="h-4 w-4" />;
            default:
                return <ClockIcon className="h-4 w-4" />;
        }
    };

    const handleWithdrawRequest = () => {
        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (parseFloat(withdrawAmount) > earningsData.totalBalance) {
            alert('Insufficient balance');
            return;
        }

        console.log('Withdrawal request:', withdrawAmount);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        alert('Withdrawal request submitted successfully!');
    };

    const periodData = {
        today: earningsData.todayEarnings,
        this_week: earningsData.thisWeekEarnings,
        this_month: earningsData.thisMonthEarnings
    };

    return (
        <WorkerLayout>
            <Head>
                <title>Earnings & Payments - Worker Portal</title>
            </Head>

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Earnings & Payments</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Track your earnings, view payment history, and manage withdrawals
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Balance Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                                    <div className="flex items-center">
                                        <BanknotesIcon className="h-8 w-8 mr-3" />
                                        <div>
                                            <p className="text-green-100 text-sm">Total Balance</p>
                                            <p className="text-2xl font-bold">{formatAmount(earningsData.totalBalance)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-6 border border-gray-200">
                                    <div className="flex items-center">
                                        <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
                                        <div>
                                            <p className="text-gray-600 text-sm">Pending</p>
                                            <p className="text-2xl font-bold text-gray-900">{formatAmount(earningsData.pendingPayments)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-6 border border-gray-200">
                                    <div className="flex items-center">
                                        <ArrowTrendingUpIcon className="h-8 w-8 text-blue-500 mr-3" />
                                        <div>
                                            <p className="text-gray-600 text-sm">Avg/Pickup</p>
                                            <p className="text-2xl font-bold text-gray-900">{formatAmount(earningsData.averagePerPickup)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Earnings Overview */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-medium text-gray-900">Earnings Overview</h2>
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) => setSelectedPeriod(e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="today">Today</option>
                                        <option value="this_week">This Week</option>
                                        <option value="this_month">This Month</option>
                                    </select>
                                </div>

                                <div className="text-center py-8">
                                    <div className="text-4xl font-bold text-gray-900 mb-2">
                                        {formatAmount(periodData[selectedPeriod as keyof typeof periodData])}
                                    </div>
                                    <p className="text-gray-600 capitalize">
                                        {selectedPeriod.replace('_', ' ')} earnings
                                    </p>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {earningsData.recentTransactions.map((transaction) => (
                                        <div key={transaction.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {transaction.description}
                                                        </p>
                                                        {transaction.customer && (
                                                            <p className="text-xs text-gray-500">
                                                                Customer: {transaction.customer}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-500">{transaction.date}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-green-600">
                                                        +{formatAmount(transaction.amount)}
                                                    </p>
                                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                                                        {getStatusIcon(transaction.status)}
                                                        <span className="capitalize">{transaction.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Withdrawal Request */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Withdraw Funds</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Available Balance
                                        </label>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatAmount(earningsData.totalBalance)}
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => setShowWithdrawModal(true)}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Request Withdrawal
                                    </button>
                                    
                                    <p className="text-xs text-gray-500">
                                        Minimum withdrawal: 10,000 XAF<br />
                                        Processing time: 24-48 hours
                                    </p>
                                </div>
                            </div>

                            {/* Withdrawal History */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">Withdrawal History</h2>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {earningsData.withdrawalHistory.map((withdrawal) => (
                                        <div key={withdrawal.id} className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatAmount(withdrawal.amount)}
                                                </p>
                                                <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(withdrawal.status)}`}>
                                                    {getStatusIcon(withdrawal.status)}
                                                    <span className="capitalize">{withdrawal.status}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500">{withdrawal.method}</p>
                                            <p className="text-xs text-gray-500">{withdrawal.date}</p>
                                            <p className="text-xs text-gray-400">Ref: {withdrawal.reference}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Withdrawal</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Withdrawal Amount (XAF)
                                </label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Available: {formatAmount(earningsData.totalBalance)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method
                                </label>
                                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="orange_money">Orange Money</option>
                                    <option value="mtn_momo">MTN Mobile Money</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleWithdrawRequest}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </WorkerLayout>
    );
};

export default Earnings;
