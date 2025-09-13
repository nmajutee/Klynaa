/**
 * Admin Dashboard - Comprehensive admin controls and system management
 * Features: User management, system statistics, platform controls, analytics
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  UserGroupIcon,
  TruckIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  UserGroupIcon as UserGroupIconSolid,
  TruckIcon as TruckIconSolid,
  TrashIcon as TrashIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid
} from '@heroicons/react/24/solid';
import PrivateRoute from '../../components/PrivateRoute';
import { useAuthStore } from '../../stores';
import { analyticsApi } from '../../services/api';

interface AdminStats {
  totalUsers: number;
  totalWorkers: number;
  totalCustomers: number;
  totalBins: number;
  totalPickups: number;
  completedPickups: number;
  pendingPickups: number;
  totalRevenue: number;
  todayRevenue: number;
  activeIssues: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'pickup_completed' | 'system_alert' | 'payment_processed';
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

interface StatsCard {
  title: string;
  value: number | string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  solidIcon: React.ComponentType<any>;
  color: string;
  route?: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats cards configuration
  const statsCards: StatsCard[] = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: '+12%',
      changeType: 'increase',
      icon: UserGroupIcon,
      solidIcon: UserGroupIconSolid,
      color: 'from-blue-500 to-blue-600',
      route: '/admin/users'
    },
    {
      title: 'Active Workers',
      value: stats?.totalWorkers || 0,
      change: '+5%',
      changeType: 'increase',
      icon: TruckIcon,
      solidIcon: TruckIconSolid,
      color: 'from-green-500 to-green-600',
      route: '/admin/workers'
    },
    {
      title: 'Total Bins',
      value: stats?.totalBins || 0,
      change: '+3%',
      changeType: 'increase',
      icon: TrashIcon,
      solidIcon: TrashIconSolid,
      color: 'from-purple-500 to-purple-600',
      route: '/admin/bins'
    },
    {
      title: 'Revenue (Today)',
      value: `${stats?.todayRevenue?.toLocaleString() || 0} XAF`,
      change: '+18%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      solidIcon: CurrencyDollarIconSolid,
      color: 'from-green-500 to-emerald-600',
      route: '/admin/revenue'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, workers, and customer accounts',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      route: '/admin/users'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings and preferences',
      icon: Cog6ToothIcon,
      color: 'bg-gray-600',
      route: '/admin/settings'
    },
    {
      title: 'Reports & Analytics',
      description: 'View detailed reports and system analytics',
      icon: ChartBarIcon,
      color: 'bg-indigo-500',
      route: '/admin/reports'
    },
    {
      title: 'Security Center',
      description: 'Monitor security and access controls',
      icon: ShieldCheckIcon,
      color: 'bg-red-500',
      route: '/admin/security'
    }
  ];

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        // Mock data for now - replace with actual API calls
        const mockStats: AdminStats = {
          totalUsers: 1247,
          totalWorkers: 89,
          totalCustomers: 1158,
          totalBins: 456,
          totalPickups: 3428,
          completedPickups: 3201,
          pendingPickups: 227,
          totalRevenue: 2847650,
          todayRevenue: 125400,
          activeIssues: 3,
          systemHealth: 'good'
        };

        const mockActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'user_registration',
            description: 'New worker John Doe registered',
            timestamp: '2 minutes ago',
            priority: 'medium'
          },
          {
            id: '2',
            type: 'pickup_completed',
            description: 'Pickup #1234 completed successfully',
            timestamp: '5 minutes ago',
            priority: 'low'
          },
          {
            id: '3',
            type: 'system_alert',
            description: 'High server load detected',
            timestamp: '10 minutes ago',
            priority: 'high'
          },
          {
            id: '4',
            type: 'payment_processed',
            description: 'Payment of 15,000 XAF processed',
            timestamp: '15 minutes ago',
            priority: 'low'
          }
        ];

        setStats(mockStats);
        setRecentActivity(mockActivity);
      } catch (err) {
        console.error('Failed to load admin data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration':
        return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
      case 'pickup_completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'system_alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'payment_processed':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-600" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: RecentActivity['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <PrivateRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  if (error) {
    return (
      <PrivateRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute requiredRole="admin">
      <Head>
        <title>Admin Dashboard - Klynaa</title>
        <meta name="description" content="Klynaa Admin Dashboard - System management and controls" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Welcome back, {user?.first_name}! Here's your platform overview.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  stats?.systemHealth === 'good' ? 'bg-green-100 text-green-800' :
                  stats?.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    stats?.systemHealth === 'good' ? 'bg-green-500' :
                    stats?.systemHealth === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  System {stats?.systemHealth === 'good' ? 'Healthy' : stats?.systemHealth === 'warning' ? 'Warning' : 'Critical'}
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => card.route && router.push(card.route)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">{card.title}</h3>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                      {card.change && (
                        <div className={`flex items-center text-sm ${
                          card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <span>{card.change} from last month</span>
                        </div>
                      )}
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                      <card.solidIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      onClick={() => router.push(action.route)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Overview */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats?.completedPickups}</div>
                    <div className="text-sm text-gray-600">Completed Pickups</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats?.pendingPickups}</div>
                    <div className="text-sm text-gray-600">Pending Pickups</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats?.activeIssues}</div>
                    <div className="text-sm text-gray-600">Active Issues</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-3 border-l-4 rounded-r-lg ${getPriorityColor(activity.priority)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default AdminDashboard;