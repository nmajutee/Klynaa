import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User, LogOut, Home, Trash2, CreditCard, Calendar, MapPin, AlertTriangle } from 'lucide-react';

interface CustomerUser {
  id: string;
  email: string;
  name: string;
  role: 'customer';
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('klynaa_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === 'customer') {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <Home className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-neutral-900">Bin Owner Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-neutral-600" />
                <span className="text-sm font-medium text-neutral-900">{user.name}</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                  Bin Owner
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
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="opacity-90 text-lg">Manage your waste collection and keep your space clean.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <Trash2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-neutral-600">Active Bins</p>
                  <p className="text-2xl font-bold text-neutral-900">5</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-neutral-600">Pending Pickups</p>
                  <p className="text-2xl font-bold text-neutral-900">2</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-neutral-600">This Month's Bill</p>
                  <p className="text-2xl font-bold text-neutral-900">XAF 15,000</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-neutral-600">Overdue Bills</p>
                  <p className="text-2xl font-bold text-neutral-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bins Status */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Your Bins</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "BIN001", location: "Front Entrance", status: "Full", lastEmpty: "2 days ago", fillLevel: 95 },
                  { id: "BIN002", location: "Back Yard", status: "Medium", lastEmpty: "1 week ago", fillLevel: 65 },
                  { id: "BIN003", location: "Side Gate", status: "Empty", lastEmpty: "Today", fillLevel: 10 },
                  { id: "BIN004", location: "Garage", status: "Full", lastEmpty: "3 days ago", fillLevel: 90 },
                  { id: "BIN005", location: "Kitchen Exit", status: "Medium", lastEmpty: "4 days ago", fillLevel: 70 }
                ].map((bin) => (
                  <div key={bin.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-neutral-900">{bin.id}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bin.status === 'Full' ? 'text-red-600 bg-red-100' :
                        bin.status === 'Medium' ? 'text-orange-600 bg-orange-100' :
                        'text-green-600 bg-green-100'
                      }`}>
                        {bin.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">📍 {bin.location}</p>
                    <p className="text-xs text-neutral-500">Last emptied: {bin.lastEmpty}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                        <span>Fill Level</span>
                        <span>{bin.fillLevel}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            bin.fillLevel >= 90 ? 'bg-red-600' :
                            bin.fillLevel >= 60 ? 'bg-orange-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${bin.fillLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scheduled Pickups */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Scheduled Pickups</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { date: "Today, 2:00 PM", bins: ["BIN001", "BIN004"], worker: "Jean-Claude Kamga", status: "Confirmed" },
                  { date: "Tomorrow, 10:00 AM", bins: ["BIN002", "BIN005"], worker: "TBD", status: "Pending" },
                  { date: "Friday, 3:00 PM", bins: ["BIN003"], worker: "Marie Dubois", status: "Scheduled" }
                ].map((pickup, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900">{pickup.date}</p>
                        <p className="text-sm text-neutral-600">Bins: {pickup.bins.join(", ")} • Worker: {pickup.worker}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pickup.status === 'Confirmed' ? 'text-green-600 bg-green-100' :
                      pickup.status === 'Pending' ? 'text-orange-600 bg-orange-100' :
                      'text-blue-600 bg-blue-100'
                    }`}>
                      {pickup.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-colors text-left">
              <Calendar className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-medium text-neutral-900 mb-2">Schedule Pickup</h4>
              <p className="text-sm text-neutral-600">Request additional waste collection</p>
            </button>

            <button className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-colors text-left">
              <CreditCard className="w-8 h-8 text-green-600 mb-3" />
              <h4 className="font-medium text-neutral-900 mb-2">Pay Bills</h4>
              <p className="text-sm text-neutral-600">View and pay your waste management bills</p>
            </button>

            <button className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-colors text-left">
              <MapPin className="w-8 h-8 text-purple-600 mb-3" />
              <h4 className="font-medium text-neutral-900 mb-2">Add New Bin</h4>
              <p className="text-sm text-neutral-600">Register additional waste bins</p>
            </button>
          </div>

          {/* Testing Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              🧪 Bin Owner Dashboard - Testing Mode
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Current User:</strong> {user.email} (Bin Owner)</p>
              <p><strong>Features:</strong> Bin monitoring, pickup scheduling, billing management</p>
              <p><strong>Mock Data:</strong> All bin statuses and pickups are simulated for testing</p>
              <p><strong>Next:</strong> Test Admin dashboard with admin@klynaa.com / admin123</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}