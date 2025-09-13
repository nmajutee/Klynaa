/**
 * Worker Profile Page - Account Settings and Info
 * Mobile-first profile management for workers
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import PrivateRoute from '../../components/PrivateRoute';
import { enhancedWorkerDashboardApi } from '../../services/enhancedWorkerDashboardApi';

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  status: {
    status: string;
    label: string;
    color: string;
  };
  verification: {
    is_verified: boolean;
    documents_uploaded: boolean;
    background_check: boolean;
  };
  stats: {
    total_earnings: number;
    completed_pickups: number;
    average_rating: number;
    join_date: string;
  };
}

const WorkerProfile: React.FC = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await enhancedWorkerDashboardApi.getOverview();

      // Transform data to match ProfileData interface
      const profile = response.data.profile;
      const stats = response.data.overview_cards;

      setProfileData({
        name: profile.name,
        email: '', // Not provided by API
        phone: '', // Not provided by API
        profile_picture: profile.profile_picture || undefined,
        status: profile.status,
        verification: {
          is_verified: false, // Not provided by API
          documents_uploaded: true, // Mock data
          background_check: true, // Mock data
        },
        stats: {
          total_earnings: stats.total_earnings.value,
          completed_pickups: stats.completed_pickups.value,
          average_rating: stats.average_rating.value,
          join_date: '2024-01-01', // Mock data
        }
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_data');

    // Redirect to login
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load profile</p>
          <button
            onClick={loadProfile}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <PrivateRoute requiredRole="worker">
      <div className="min-h-screen bg-gray-50 pb-20">
        <Head>
          <title>Profile - Klynaa Worker</title>
        </Head>

        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-semibold text-gray-900">👤 Profile</h1>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          {/* Profile Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {profileData.profile_picture ? (
                    <Image
                      src={profileData.profile_picture}
                      alt={profileData.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-green-600 font-semibold text-2xl">
                      {profileData.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 text-lg">
                  {profileData.status.color}
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {profileData.name}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                {profileData.status.label}
              </p>

              {profileData.verification.is_verified && (
                <div className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  ✅ Verified Worker
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                <p className="text-sm text-gray-900">{profileData.email}</p>
              </div>

              {profileData.phone && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Phone</label>
                  <p className="text-sm text-gray-900">{profileData.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Your Stats</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {profileData.stats.total_earnings.toLocaleString()} XAF
                </p>
                <p className="text-xs text-gray-500">Total Earnings</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {profileData.stats.completed_pickups}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ⭐ {profileData.stats.average_rating}
                </p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {new Date(profileData.stats.join_date).getFullYear()}
                </p>
                <p className="text-xs text-gray-500">Member Since</p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Verification</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Identity Verified</span>
                <span className="text-green-600">✅</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Documents Uploaded</span>
                <span className="text-green-600">✅</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Background Check</span>
                <span className="text-green-600">✅</span>
              </div>
            </div>
          </div>

          {/* Settings Menu */}
          <div className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="divide-y divide-gray-100">
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">⚙️</span>
                  <span className="text-gray-900">Settings</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">💬</span>
                  <span className="text-gray-900">Help & Support</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📋</span>
                  <span className="text-gray-900">Terms & Privacy</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            🚪 Logout
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto px-4 py-2">
            <div className="flex justify-around items-center">
              <Link href="/worker/dashboard" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">🏠</span>
                <span className="text-xs">Dashboard</span>
              </Link>

              <Link href="/worker/pickups" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">📋</span>
                <span className="text-xs">Pickups</span>
              </Link>

              <Link href="/worker/map" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">🗺️</span>
                <span className="text-xs">Map</span>
              </Link>

              <Link href="/worker/earnings" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-xl mb-1">💰</span>
                <span className="text-xs">Earnings</span>
              </Link>

              <Link href="/worker/profile" className="flex flex-col items-center py-2 text-green-600">
                <span className="text-xl mb-1">👤</span>
                <span className="text-xs font-medium">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default WorkerProfile;