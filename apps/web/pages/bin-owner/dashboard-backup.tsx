import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '../../components/ui/Icons';

interface BinOwnerUser {
  id: string;
  email: string;
  name: string;
  role: 'bin-owner' | 'customer';
}

export default function BinOwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<BinOwnerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('klynaa_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === 'bin-owner' || parsedUser.role === 'customer') {
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
          <h2 className="text-2xl font-bold">Klynaa Bin Owner</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <a className="flex items-center p-2 rounded bg-indigo-600 text-white" href="#">
            <Icon name="BarChart3" className="w-5 h-5 mr-3" />
            Overview
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="Trash2" className="w-5 h-5 mr-3" />
            Bin Management
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="FileText" className="w-5 h-5 mr-3" />
            Pickup Requests
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="CreditCard" className="w-5 h-5 mr-3" />
            Payments
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="Star" className="w-5 h-5 mr-3" />
            Ratings & Reviews
          </a>
          <a className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors" href="#">
            <Icon name="User" className="w-5 h-5 mr-3" />
            Profile Settings
          </a>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
              <Icon name="User" className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">John Doe</p>
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bin Owner Dashboard</h2>
          <div className="flex items-center space-x-4">
            <Icon name="Bell" className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
              Request Pickup
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Registered Bins</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">2</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Requests</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">1</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Payment Status</h3>
              <p className="text-3xl font-bold text-green-500">Paid</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg. Response</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">2.5 hrs</p>
            </div>
          </div>

          {/* My Bins */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Bins</h3>
              <button className="text-indigo-600 hover:text-indigo-800 flex items-center transition-colors">
                <Icon name="Plus" className="w-4 h-4 mr-1" />
                Add Bin
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Main Residential Bin</p>
                  <p className="text-sm">
                    <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">
                      Full
                    </span>
                  </p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Request Pickup
                </button>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Recycling Bin</p>
                  <p className="text-sm">
                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
                      Empty
                    </span>
                  </p>
                </div>
                <button className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg cursor-not-allowed" disabled>
                  Request Pickup
                </button>
              </div>
            </div>
          </div>

          {/* Pickup History */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pickup History</h3>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="font-semibold text-gray-900 dark:text-white">Request #KLYN7890</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: <span className="text-yellow-500 font-medium">In-Progress</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                Worker: Jane S. (4.8 <Icon name="Star" className="w-4 h-4 text-yellow-400 ml-1 fill-current" />)
              </p>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className="h-2 bg-indigo-600 rounded-full" style={{width: '66%'}}></div>
              </div>
              <p className="text-xs text-right mt-1 text-gray-600 dark:text-gray-400">Collected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}