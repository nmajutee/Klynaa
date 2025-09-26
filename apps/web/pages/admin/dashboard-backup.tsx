import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Icon } from '../../components/ui/Icons';
import { Card } from '../../src/design-system/components/Card';
import { Button } from '../../src/design-system/components/Button';
import { Badge } from '../../src/design-system/components/Badge';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

interface SystemMetrics {
  totalUsers: number;
  activePickups: number;
  totalRevenue: number;
  disputesPending: number;
}

interface UserData {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Pending' | 'Banned';
  email: string;
  joinDate: string;
}

// Mock data that would typically come from backend
const mockMetrics: SystemMetrics = {
  totalUsers: 1250,
  activePickups: 82,
  totalRevenue: 12450,
  disputesPending: 5,
};

const mockUsers: UserData[] = [
  { id: '1', name: 'John Doe', role: 'Bin Owner', status: 'Active', email: 'john@email.com', joinDate: '2024-01-15' },
  { id: '2', name: 'Jane Smith', role: 'Worker', status: 'Pending', email: 'jane@email.com', joinDate: '2024-02-20' },
  { id: '3', name: 'Sam Wilson', role: 'Worker', status: 'Banned', email: 'sam@email.com', joinDate: '2024-01-10' },
  { id: '4', name: 'Mary Johnson', role: 'Bin Owner', status: 'Active', email: 'mary@email.com', joinDate: '2024-03-05' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('klynaa_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === 'admin') {
        setUser(parsedUser);
      } else {
        router.push(`/${parsedUser.role}/dashboard`);
        return;
      }
    } else {
      router.push('/auth/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('klynaa_user');
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 dark:bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Klynaa Admin</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <a className="flex items-center p-2 rounded bg-indigo-600 text-white" href="#">
            <Icon name="BarChart3" className="w-5 h-5 mr-3" />
            Overview
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="Users" className="w-5 h-5 mr-3" />
            User Management
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="Truck" className="w-5 h-5 mr-3" />
            Pickup Management
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="CreditCard" className="w-5 h-5 mr-3" />
            Payment & Finance
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="FileText" className="w-5 h-5 mr-3" />
            Reports
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="MessageSquare" className="w-5 h-5 mr-3" />
            Reviews & Disputes
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="Settings" className="w-5 h-5 mr-3" />
            System Settings
          </a>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
              <Icon name="User" className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">Admin User</p>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h2>
          <div className="flex items-center space-x-4">
            <Icon name="Bell" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
              Create Report
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">1,250</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Pickups</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">82</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">$12,450</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Disputes Pending</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">5</p>
            </div>
          </div>

          {/* Pickup Management Map */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pickup Management</h3>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Icon name="Map" className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Interactive Map View</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Pickup locations and routes</p>
              </div>
            </div>
          </div>

          {/* User Management Table */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="p-2 text-gray-600 dark:text-gray-400 font-medium">Name</th>
                    <th className="p-2 text-gray-600 dark:text-gray-400 font-medium">Role</th>
                    <th className="p-2 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                    <th className="p-2 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900 dark:text-white">
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-2">John Doe</td>
                    <td className="p-2">Bin Owner</td>
                    <td className="p-2">
                      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
                        Active
                      </span>
                    </td>
                    <td className="p-2">
                      <button className="text-indigo-600 hover:text-indigo-800 transition-colors">View</button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-2">Jane Smith</td>
                    <td className="p-2">Worker</td>
                    <td className="p-2">
                      <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">
                        Pending
                      </span>
                    </td>
                    <td className="p-2">
                      <button className="text-indigo-600 hover:text-indigo-800 transition-colors">Verify</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">Sam Wilson</td>
                    <td className="p-2">Worker</td>
                    <td className="p-2">
                      <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">
                        Banned
                      </span>
                    </td>
                    <td className="p-2">
                      <button className="text-indigo-600 hover:text-indigo-800 transition-colors">Details</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}