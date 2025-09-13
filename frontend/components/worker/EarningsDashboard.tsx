/**
 * Enhanced Earnings Dashboard - Agricultural Field Management Style
 * Displays earnings statistics, transactions, and payout options
 */

import React, { useState } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface EarningsStats {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  averagePerPickup: number;
  totalPickups: number;
}

interface Transaction {
  id: number;
  pickup_id: number;
  customer_name: string;
  amount: number;
  status: 'pending' | 'paid' | 'processing';
  date: string;
  location: string;
}

interface EarningsDashboardProps {
  stats: EarningsStats;
  transactions: Transaction[];
  className?: string;
}

const EarningsDashboard: React.FC<EarningsDashboardProps> = ({
  stats,
  transactions,
  className = ''
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const periodData = {
    today: { amount: stats.todayEarnings, label: 'Today' },
    week: { amount: stats.weekEarnings, label: 'This Week' },
    month: { amount: stats.monthEarnings, label: 'This Month' },
    all: { amount: stats.totalEarnings, label: 'All Time' }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.totalEarnings.toLocaleString()} XAF
              </p>
              <p className="text-xs text-green-700">From {stats.totalPickups} pickups</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">This Week</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.weekEarnings.toLocaleString()} XAF
              </p>
              <p className="text-xs text-blue-700">+12% from last week</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Average per Pickup</p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.averagePerPickup.toLocaleString()} XAF
              </p>
              <p className="text-xs text-purple-700">Per completed pickup</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Today</p>
              <p className="text-2xl font-bold text-orange-900">
                {stats.todayEarnings.toLocaleString()} XAF
              </p>
              <p className="text-xs text-orange-700">Current day earnings</p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Period Selector & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {(['today', 'week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {periodData[period].label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowPayoutModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
        >
          <CreditCardIcon className="h-4 w-4 mr-2" />
          Request Payout
        </button>
      </div>

      {/* Earnings Chart Placeholder */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Earnings - {periodData[selectedPeriod].label}
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {periodData[selectedPeriod].amount.toLocaleString()} XAF
            </p>
          </div>
          <CalendarIcon className="h-6 w-6 text-gray-400" />
        </div>

        {/* Simple visual representation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress to monthly goal</span>
            <span className="font-medium">
              {Math.round((stats.monthEarnings / 100000) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((stats.monthEarnings / 100000) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            Goal: 100,000 XAF | Current: {stats.monthEarnings.toLocaleString()} XAF
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <p className="text-sm text-gray-500">Your latest pickup earnings</p>
        </div>

        <div className="divide-y divide-gray-200">
          {transactions.slice(0, 10).map((transaction) => (
            <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-900">Pickup #{transaction.pickup_id}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{transaction.customer_name}</p>
                  <p className="text-xs text-gray-500">{transaction.location}</p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {transaction.amount.toLocaleString()} XAF
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.status === 'paid' ? 'Paid' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Payout</h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Balance
                </label>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-900">
                    {stats.totalEarnings.toLocaleString()} XAF
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Method
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option value="mtn_money">MTN Mobile Money</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your mobile money number"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Request Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsDashboard;