import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '../../components/ui/Icons';
import VerificationBadge, { getVerificationStatus } from '../../src/components/VerificationBadge';
import VerificationModal from '../../src/components/VerificationModal';

interface WorkerUser {
  id: string;
  email: string;
  name: string;
  role: 'worker';
  verification_status?: 'verified' | 'pending' | 'rejected';
}

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<WorkerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

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

  const handleVerificationSubmit = async (data: any) => {
    try {
      console.log('Submitting verification documents:', data);

      // In production, this would upload to your API
      // const formData = new FormData();
      // formData.append('id_type', data.id_type);
      // formData.append('id_document_front', data.id_document_front);
      // if (data.id_document_back) formData.append('id_document_back', data.id_document_back);
      // formData.append('address_verification', data.address_verification);
      // if (data.taxpayer_card) formData.append('taxpayer_card', data.taxpayer_card);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update user verification status to pending
      if (user) {
        const updatedUser = { ...user, verification_status: 'pending' as const };
        setUser(updatedUser);
        localStorage.setItem('klynaa_user', JSON.stringify(updatedUser));
      }

      alert('Verification documents submitted successfully! We will review them within 24-48 hours.');
    } catch (error) {
      console.error('Verification submission error:', error);
      alert('Failed to submit verification documents. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Verification Banner */}
          {router.query.verification === 'pending' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="CheckCircle" className="h-5 w-5 text-orange-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-800">
                    Complete your ID verification to start accepting premium jobs and unlock all features
                  </p>
                  <div className="mt-2">
                    <button className="text-sm text-orange-600 hover:text-orange-800 underline">
                      Complete verification now →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="opacity-90 text-lg">Ready to make a difference in waste management today?</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <Icon name="MapPin" className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-neutral-600">Available Pickups</p>
                  <p className="text-2xl font-bold text-neutral-900">12</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <Icon name="CheckCircle" className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-neutral-600">Completed Today</p>
                  <p className="text-2xl font-bold text-neutral-900">3</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <Icon name="CreditCard" className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-neutral-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-neutral-900">XAF 15,000</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center gap-3">
                <Icon name="Clock" className="w-8 h-8 text-orange-600" />
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
                      <Icon name="MapPin" className="w-5 h-5 text-neutral-400" />
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
                    <Icon name="CheckCircle" className="w-5 h-5 text-green-600" />
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

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        userType="worker"
        onSubmit={handleVerificationSubmit}
      />
    </div>
  );
}