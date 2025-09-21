import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User, LogOut, MapPin, Truck, DollarSign, Clock, CheckCircle } from 'lucide-react';

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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-emerald-600" />
              <h1 className="text-xl font-semibold text-neutral-900">Worker Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-neutral-600" />
                <span className="text-sm font-medium text-neutral-900">{user.name}</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium text-emerald-600 bg-emerald-100">
                  Worker
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="opacity-90 text-lg">Ready to make a difference in waste management today?</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-neutral-600">Available Pickups</p>
                  <p className="text-2xl font-bold text-neutral-900">12</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-neutral-600">Completed Today</p>
                  <p className="text-2xl font-bold text-neutral-900">3</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-neutral-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-neutral-900">XAF 15,000</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-neutral-600">Hours Worked</p>
                  <p className="text-2xl font-bold text-neutral-900">6.5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Available Pickups */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Available Pickups Near You</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { id: 1, address: "123 Rue de la Paix, Yaoundé", distance: "0.5 km", reward: "XAF 2,500", bins: 3 },
                  { id: 2, address: "456 Avenue Kennedy, Douala", distance: "1.2 km", reward: "XAF 1,800", bins: 2 },
                  { id: 3, address: "789 Boulevard de la Liberté, Bafoussam", distance: "2.1 km", reward: "XAF 3,200", bins: 4 }
                ].map((pickup) => (
                  <div key={pickup.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                    <div className="flex items-center gap-4">
                      <MapPin className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900">{pickup.address}</p>
                        <p className="text-sm text-neutral-600">{pickup.distance} away • {pickup.bins} bins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-emerald-600">{pickup.reward}</span>
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { time: "2 hours ago", action: "Completed pickup at Avenue de la Réunification", reward: "XAF 2,100" },
                  { time: "4 hours ago", action: "Completed pickup at Rue de la République", reward: "XAF 1,900" },
                  { time: "6 hours ago", action: "Completed pickup at Boulevard du 20 Mai", reward: "XAF 2,800" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">{activity.action}</p>
                      <p className="text-xs text-neutral-600">{activity.time}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">+{activity.reward}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testing Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              🧪 Worker Dashboard - Testing Mode
            </h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>Current User:</strong> {user.email} (Worker)</p>
              <p><strong>Features:</strong> Pickup management, earnings tracking, location services</p>
              <p><strong>Mock Data:</strong> All statistics and pickups are simulated for testing</p>
              <p><strong>Next:</strong> Test other roles by logging out and using different credentials</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}