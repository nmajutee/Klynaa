import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '../../components/ui/Icons';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

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
        // Redirect to appropriate dashboard
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="opacity-90 text-lg">Monitor and manage the entire Klynaa ecosystem.</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <Icon name="Users" className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-neutral-600">Total Users</p>
                  <p className="text-2xl font-bold text-neutral-900">1,247</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Icon name="TrendingUp" className="w-3 h-3" />
                    +12% this month
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <Icon name="Users" className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-neutral-600">Active Workers</p>
                  <p className="text-2xl font-bold text-neutral-900">89</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Icon name="TrendingUp" className="w-3 h-3" />
                    +5 new this week
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <Icon name="DollarSign" className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-neutral-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-neutral-900">XAF 2.5M</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Icon name="TrendingUp" className="w-3 h-3" />
                    +18% vs last month
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <Icon name="AlertTriangle" className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-neutral-600">Active Issues</p>
                  <p className="text-2xl font-bold text-neutral-900">3</p>
                  <p className="text-xs text-red-600">Requires attention</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900">Recent System Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { time: "5 minutes ago", action: "New worker registered", user: "Jean-Marie Foko", type: "success" },
                    { time: "12 minutes ago", action: "Payment processed", user: "Marie Nkomo", type: "success" },
                    { time: "30 minutes ago", action: "Service complaint filed", user: "Paul Mbida", type: "warning" },
                    { time: "1 hour ago", action: "Worker verification completed", user: "Sophie Talla", type: "success" },
                    { time: "2 hours ago", action: "System backup completed", user: "System", type: "info" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg border border-neutral-100">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-600' :
                        activity.type === 'warning' ? 'bg-orange-600' :
                        activity.type === 'error' ? 'bg-red-600' :
                        'bg-blue-600'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{activity.action}</p>
                        <p className="text-xs text-neutral-600">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900">Performance Metrics</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-900">System Uptime</span>
                      <span className="text-sm text-green-600 font-semibold">99.8%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.8%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-900">Worker Utilization</span>
                      <span className="text-sm text-blue-600 font-semibold">87%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-900">Customer Satisfaction</span>
                      <span className="text-sm text-emerald-600 font-semibold">94%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-900">Payment Success Rate</span>
                      <span className="text-sm text-purple-600 font-semibold">96%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Management Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Management Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-left">
                  <Icon name="Users" className="w-6 h-6 text-blue-600 mb-2" />
                  <h4 className="font-medium text-neutral-900">Manage Users</h4>
                  <p className="text-sm text-neutral-600">View and manage all platform users</p>
                </button>

                <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-left">
                  <Icon name="BarChart3" className="w-6 h-6 text-emerald-600 mb-2" />
                  <h4 className="font-medium text-neutral-900">Analytics</h4>
                  <p className="text-sm text-neutral-600">View detailed system analytics</p>
                </button>

                <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-left">
                  <Icon name="DollarSign" className="w-6 h-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-neutral-900">Financial Reports</h4>
                  <p className="text-sm text-neutral-600">Generate financial reports</p>
                </button>

                <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-left">
                  <Icon name="MapPin" className="w-6 h-6 text-purple-600 mb-2" />
                  <h4 className="font-medium text-neutral-900">Service Areas</h4>
                  <p className="text-sm text-neutral-600">Manage coverage areas and zones</p>
                </button>
              </div>
            </div>
          </div>

          {/* Testing Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-purple-800 mb-2">
              🧪 Admin Dashboard - Testing Mode
            </h3>
            <div className="text-sm text-purple-700 space-y-1">
              <p><strong>Current User:</strong> {user.email} (Administrator)</p>
              <p><strong>Features:</strong> System monitoring, user management, analytics, financial oversight</p>
              <p><strong>Mock Data:</strong> All metrics and activities are simulated for testing</p>
              <p><strong>Complete Testing:</strong> You've now tested all three user roles! 🎉</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}