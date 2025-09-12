/**
 * Customer Dashboard - Main dashboard page for customers
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { customerDashboardApi, CustomerStats, PickupRequest } from '../../services/customerDashboardApi';
import { useAuthStore } from '../../stores';

interface DashboardCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change?: string;
  changeColor?: string;
}

const CustomerDashboard: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'customer') {
      router.push('/dashboard');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, user, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        customerDashboardApi.getDashboardStats(),
        customerDashboardApi.getRecentActivity()
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getDashboardCards = (): DashboardCard[] => {
    if (!stats) return [];

    return [
      {
        title: 'Total Bins',
        value: stats.total_bins,
        icon: '🗑️',
        color: 'bg-blue-500',
      },
      {
        title: 'Active Bins',
        value: stats.active_bins,
        icon: '✅',
        color: 'bg-green-500',
      },
      {
        title: 'Pending Pickups',
        value: stats.pending_pickups,
        icon: '⏳',
        color: 'bg-yellow-500',
      },
      {
        title: 'Total Spent',
        value: customerDashboardApi.formatCurrency(stats.total_spent),
        icon: '💰',
        color: 'bg-purple-500',
      },
      {
        title: 'This Month',
        value: `${stats.this_month_pickups} pickups`,
        icon: '📊',
        color: 'bg-indigo-500',
      },
      {
        title: 'Avg Rating Given',
        value: stats.average_rating_given ? `${stats.average_rating_given.toFixed(1)} ⭐` : 'N/A',
        icon: '⭐',
        color: 'bg-pink-500',
      }
    ];
  };

  const getStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
      'open': '🔄',
      'accepted': '👍',
      'picked': '🚛',
      'completed': '✅',
      'cancelled': '❌'
    };
    return icons[status] || '❓';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Try Again
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
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.first_name || 'Customer'}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your waste collection and track your environmental impact
                </p>
              </div>
              <button
                onClick={() => router.push('/customer/pickups/new')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <span>📋</span>
                Request Pickup
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {getDashboardCards().map((card, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                    {card.change && (
                      <p className={`text-sm mt-1 ${card.changeColor}`}>
                        {card.change}
                      </p>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/customer/pickups/new')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <span className="text-2xl">📋</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Request Pickup</div>
                  <div className="text-sm text-gray-600">Schedule waste collection</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/customer/bins')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl">🗑️</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Manage Bins</div>
                  <div className="text-sm text-gray-600">Add or edit bin locations</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/customer/pickups')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <span className="text-2xl">📊</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Pickup History</div>
                  <div className="text-sm text-gray-600">View past collections</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/customer/profile')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <span className="text-2xl">⚙️</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Settings</div>
                  <div className="text-sm text-gray-600">Profile and preferences</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button
                onClick={() => router.push('/customer/pickups')}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                View All →
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📋</div>
                <p className="text-gray-600">No recent activity</p>
                <button
                  onClick={() => router.push('/customer/pickups/new')}
                  className="mt-3 text-green-600 hover:text-green-700 font-medium"
                >
                  Request your first pickup
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((pickup) => (
                  <div key={pickup.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="text-2xl">
                      {getStatusIcon(pickup.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {pickup.bin_label || `Bin #${pickup.bin}`}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${customerDashboardApi.getStatusColor(pickup.status)}`}>
                          {pickup.status_display}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {pickup.bin_address}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customerDashboardApi.formatDateTime(pickup.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {customerDashboardApi.formatCurrency(pickup.expected_fee)}
                      </div>
                      {pickup.worker_info && (
                        <p className="text-sm text-gray-600">
                          {pickup.worker_info.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;