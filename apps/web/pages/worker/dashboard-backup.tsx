import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '../../components/ui/Icons';

interface WorkerUser {
  id: string;
  email: string;
  name: string;
  role: 'worker';
}

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<WorkerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('klynaa_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === 'worker') {
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
          <h2 className="text-2xl font-bold">Klynaa Worker</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <a className="flex items-center p-2 rounded bg-indigo-600 text-white" href="#">
            <Icon name="BarChart3" className="w-5 h-5 mr-3" />
            Overview
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="CheckSquare" className="w-5 h-5 mr-3" />
            Available Pickups
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="Navigation" className="w-5 h-5 mr-3" />
            Active Pickups
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="Wallet" className="w-5 h-5 mr-3" />
            Earnings
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="Star" className="w-5 h-5 mr-3" />
            Performance
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="User" className="w-5 h-5 mr-3" />
            Profile
          </a>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
              <Icon name="User" className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">Jane Smith</p>
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Worker Dashboard</h2>
          <div className="flex items-center space-x-4">
            <Icon name="Bell" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
              Request Payout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending Pickups</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed Today</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Earnings</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">$256.50</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Rating</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                4.8 <Icon name="Star" className="w-6 h-6 text-yellow-400 ml-1 fill-current" />
              </p>
            </div>
          </div>

          {/* Available Pickups */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Available Pickups</h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Residential Bin - 123 Main St</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2.5km away | Urgent</p>
                </div>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Accept
                </button>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Commercial Dumpster - 456 Oak Ave</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">5.1km away | Standard</p>
                </div>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Accept
                </button>
              </div>
            </div>
          </div>

          {/* Active Pickups */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Active Pickups</h3>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Recycling Bin - 789 Pine Ln</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status: In Progress</p>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 flex items-center transition-colors">
                  <Icon name="Navigation" className="w-4 h-4 mr-1" />
                  Map
                </button>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors">
                  Mark as Collected
                </button>
                <button className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm cursor-not-allowed" disabled>
                  Awaiting Payment
                </button>
                <button className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm cursor-not-allowed" disabled>
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}