/**
 * Worker Earnings Page - Mobile-First Design
 * Shows earnings summary, transactions, and payout options
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PrivateRoute from '../../components/PrivateRoute';
import { enhancedWorkerDashboardApi } from '../../services/enhancedWorkerDashboardApi';
import type { EarningsSummary } from '../../services/enhancedWorkerDashboardApi';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'all';

const WorkerEarnings: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all');
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('mtn_money');
  const [payoutDetails, setPayoutDetails] = useState({
    phone: '',
    name: '',
  });

  useEffect(() => {
    loadEarnings();
  }, [selectedPeriod]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const response = await enhancedWorkerDashboardApi.getEarnings(selectedPeriod);
      setEarnings(response.data);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    try {
      await enhancedWorkerDashboardApi.requestPayout({
        method: payoutMethod,
        details: payoutDetails,
      });

      setShowPayoutModal(false);
      alert('Payout request submitted successfully! You will be contacted within 24 hours.');
      loadEarnings(); // Refresh data
    } catch (error) {
      console.error('Failed to request payout:', error);
      alert('Failed to request payout. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'payout_requested': return 'bg-blue-100 text-blue-800';
      case 'held': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load earnings</p>
          <button
            onClick={loadEarnings}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <PrivateRoute requiredRole="worker">
      <div className="min-h-screen bg-gray-50 pb-20">
        <Head>
          <title>Earnings - Klynaa Worker</title>
        </Head>

        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Earnings</h1>
              <button
                onClick={loadEarnings}
                className="p-2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                🔄
              </button>
            </div>
          </div>
        </div>

        {/* Period Filter */}
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex bg-gray-100 rounded-lg p-1 overflow-x-auto">
            {[
              { key: 'daily', label: 'Today' },
              { key: 'weekly', label: 'Week' },
              { key: 'monthly', label: 'Month' },
              { key: 'all', label: 'All Time' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key as PeriodType)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedPeriod === key
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-md mx-auto px-4">
          {/* Earnings Summary */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white mb-6">
            <div className="text-center">
              <h2 className="text-lg font-medium opacity-90">Total Earnings</h2>
              <p className="text-3xl font-bold mt-1">{earnings.summary.total_earnings.formatted}</p>
              <p className="text-sm opacity-75 mt-1">
                Period: {earnings.period === 'all' ? 'All Time' : earnings.period}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center">
                <p className="text-sm opacity-75">Pending</p>
                <p className="text-lg font-semibold">{earnings.summary.pending_earnings.formatted}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-75">Paid Out</p>
                <p className="text-lg font-semibold">{earnings.summary.paid_earnings.formatted}</p>
              </div>
            </div>
          </div>

          {/* Payout Button */}
          {earnings.can_request_payout && (
            <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Ready for Payout</h3>
                  <p className="text-sm text-gray-600">
                    {earnings.summary.pending_earnings.formatted} available
                  </p>
                </div>
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Request Payout
                </button>
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Transaction History</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {earnings.transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💰</div>
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              ) : (
                earnings.transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            Pickup #{transaction.pickup_id}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{transaction.customer_name}</p>
                        <p className="text-xs text-gray-500">{transaction.location}</p>
                        <p className="text-xs text-gray-500">{transaction.formatted_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {transaction.amount_xaf.toLocaleString()} XAF
                        </p>
                        {transaction.payout_date && (
                          <p className="text-xs text-green-600">
                            Paid: {new Date(transaction.payout_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Payout Modal */}
        {showPayoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Request Payout</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payout Method
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="mtn_money">MTN Mobile Money</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {payoutMethod === 'bank_transfer' ? 'Account Holder Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={payoutDetails.name}
                    onChange={(e) => setPayoutDetails({...payoutDetails, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {payoutMethod === 'bank_transfer' ? 'Account Number' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={payoutDetails.phone}
                    onChange={(e) => setPayoutDetails({...payoutDetails, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder={payoutMethod === 'bank_transfer' ? '1234567890' : '+237 6XX XXX XXX'}
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    <strong>Amount:</strong> {earnings.summary.pending_earnings.formatted}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Processing time: 2-3 business days
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestPayout}
                  disabled={!payoutDetails.name || !payoutDetails.phone}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto px-4 py-2">
            <div className="flex justify-around items-center">
              <Link href="/worker/dashboard" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">🏠</span>
                <span className="text-xs">Dashboard</span>
              </Link>

              <Link href="/worker/pickups" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">📋</span>
                <span className="text-xs">Pickups</span>
              </Link>

              <Link href="/worker/map" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">🗺️</span>
                <span className="text-xs">Map</span>
              </Link>

              <Link href="/worker/earnings" className="flex flex-col items-center py-2 text-green-600">
                <span className="text-xl mb-1">💰</span>
                <span className="text-xs font-medium">Earnings</span>
              </Link>

              <Link href="/worker/profile" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">👤</span>
                <span className="text-xs">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default WorkerEarnings;