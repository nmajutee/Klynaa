import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '../../components/ui/Icons';
import VerificationBadge, { mockVerificationStatus } from '../../src/components/VerificationBadge';
import VerificationModal from '../../src/components/VerificationModal';

export default function BinOwnerDashboard() {
  const router = useRouter();
  const { verification, setup } = router.query;
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Mock verification status for demo
  const verificationStatus = mockVerificationStatus('bin_owner');

  const handleVerificationSubmit = async (data: any) => {
    try {
      console.log('Submitting bin owner verification documents:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Verification documents submitted successfully! We will review them within 24-48 hours.');
      setIsVerificationModalOpen(false);
    } catch (error) {
      console.error('Verification submission error:', error);
      alert('Failed to submit verification documents. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification/Setup Banners */}
        {verification === 'pending' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="MapPin" className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  Complete your service setup to start receiving waste collection requests
                </p>
              </div>
            </div>
          </div>
        )}

        {setup === 'pending' && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Icon name="Settings" className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Complete your service setup to access all features
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="Trash2" className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bins</dt>
                    <dd className="text-lg font-medium text-gray-900">12</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="Calendar" className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Scheduled Pickups</dt>
                    <dd className="text-lg font-medium text-gray-900">8</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="DollarSign" className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Cost</dt>
                    <dd className="text-lg font-medium text-gray-900">$240</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="TrendingUp" className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Efficiency</dt>
                    <dd className="text-lg font-medium text-gray-900">94%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bin Status */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Bin Status</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                  <Icon name="Plus" size={16} className="inline mr-1" />
                  Add Bin
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Bin #001 - Kitchen</span>
                  </div>
                  <span className="text-sm text-red-600 font-medium">95% Full</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Bin #002 - Office</span>
                  </div>
                  <span className="text-sm text-yellow-600 font-medium">70% Full</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Bin #003 - Lobby</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">30% Full</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Icon name="Trash2" size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Bin #001 collected</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Icon name="Calendar" size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Pickup scheduled for tomorrow</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <Icon name="Users" size={16} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">New worker assigned</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        userType="bin_owner"
        onSubmit={handleVerificationSubmit}
      />
    </div>
  );
}