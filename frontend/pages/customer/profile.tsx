/**
 * Customer Profile - Profile management and settings for customers
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { customerDashboardApi, CustomerProfile, PaymentMethod } from '../../services/customerDashboardApi';
import { useAuthStore } from '../../stores';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  latitude: number;
  longitude: number;
}

interface LocationState {
  loading: boolean;
  address: string;
}

const CustomerProfilePage: React.FC = () => {
  const router = useRouter();
    const { user, isAuthenticated, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    phone_number: '',
    latitude: 0,
    longitude: 0
  });

  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [locationState, setLocationState] = useState<LocationState>({
    loading: false,
    address: ''
  });

  const loadAddressFromCoordinates = React.useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        setLocationState(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (err) {
      console.error('Failed to load address:', err);
    }
  }, []);

  const loadProfileData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [profileData, paymentData] = await Promise.all([
        customerDashboardApi.getProfile(),
        customerDashboardApi.getPaymentMethods()
      ]);

      setProfile(profileData);
      setPaymentMethods(paymentData);

      // Populate form
      setProfileForm({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_number: profileData.phone_number || '',
        latitude: profileData.latitude || 0,
        longitude: profileData.longitude || 0
      });

      // Load address if coordinates exist
      if (profileData.latitude && profileData.longitude) {
        loadAddressFromCoordinates(profileData.latitude, profileData.longitude);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [loadAddressFromCoordinates]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'customer') {
      router.push('/dashboard');
      return;
    }

    loadProfileData();
  }, [isAuthenticated, user, router, loadProfileData]);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    setLocationState(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setProfileForm(prev => ({ ...prev, latitude, longitude }));

        // Update location on server
        try {
          const updatedProfile = await customerDashboardApi.updateLocation(latitude, longitude);
          setProfile(updatedProfile);
          await loadAddressFromCoordinates(latitude, longitude);
        } catch (err) {
          console.error('Failed to update location:', err);
        }

        setLocationState(prev => ({ ...prev, loading: false }));
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get your location. Please try again.');
        setLocationState(prev => ({ ...prev, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    );
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!profileForm.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!profileForm.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (profileForm.phone_number && !/^\+?[\d\s\-\(\)]+$/.test(profileForm.phone_number)) {
      errors.phone_number = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setFormErrors({});

      const updatedProfile = await customerDashboardApi.updateProfile({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone_number: profileForm.phone_number || undefined,
        latitude: profileForm.latitude || undefined,
        longitude: profileForm.longitude || undefined
      });

      setProfile(updatedProfile);

      // Update auth store
      if (updateUser) {
        updateUser({
          first_name: updatedProfile.first_name,
          last_name: updatedProfile.last_name,
          phone_number: updatedProfile.phone_number
        });
      }

      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error('Failed to update profile:', err);

      if (err.response?.data) {
        const backendErrors: Record<string, string> = {};
        Object.keys(err.response.data).forEach(key => {
          backendErrors[key] = Array.isArray(err.response.data[key])
            ? err.response.data[key][0]
            : err.response.data[key];
        });
        setFormErrors(backendErrors);
      } else {
        setFormErrors({ general: 'Failed to update profile. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{error || 'Profile not found'}</p>
            <button
              onClick={loadProfileData}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
                <p className="text-gray-600 mt-1">
                  Manage your account information and preferences
                </p>
              </div>
              <button
                onClick={() => router.push('/customer/dashboard')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>

                {formErrors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700">{formErrors.general}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 ${formErrors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {formErrors.first_name && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.first_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={profileForm.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 ${formErrors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {formErrors.last_name && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 ${formErrors.phone_number ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="e.g., +256 700 123 456"
                    />
                    {formErrors.phone_number && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.phone_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              {/* Location Settings */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Location Settings</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Current Location
                      </label>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationState.loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {locationState.loading ? '📍 Updating...' : '📍 Update Location'}
                      </button>
                    </div>

                    {locationState.address ? (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{locationState.address}</p>
                      </div>
                    ) : profile.latitude && profile.longitude ? (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          Coordinates: {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-700">
                          📍 No location set. Update your location for better service.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={profileForm.latitude || ''}
                        onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0.000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={profileForm.longitude || ''}
                        onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0.000000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Verification Status</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      profile.is_verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {profile.is_verified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-medium">
                      {customerDashboardApi.formatDate(profile.date_joined)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="text-sm font-medium">
                      {profile.last_login ? customerDashboardApi.formatDate(profile.last_login) : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-gray-400 text-2xl mb-2">💳</div>
                    <p className="text-sm text-gray-600">No payment methods configured</p>
                    <button className="mt-2 text-green-600 hover:text-green-700 font-medium text-sm">
                      Add Payment Method
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map(method => (
                      <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {method.id === 'mobile_money' ? '📱' :
                             method.id === 'card' ? '💳' : '💰'}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{method.name}</p>
                            {method.is_default && (
                              <p className="text-xs text-green-600">Default</p>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          method.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {method.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/customer/pickups')}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📋</span>
                      <div>
                        <div className="font-medium text-sm">View Pickups</div>
                        <div className="text-xs text-gray-600">Check pickup history</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/customer/bins')}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🗑️</span>
                      <div>
                        <div className="font-medium text-sm">Manage Bins</div>
                        <div className="text-xs text-gray-600">Add or edit bins</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/customer/pickups/new')}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">➕</span>
                      <div>
                        <div className="font-medium text-sm">Request Pickup</div>
                        <div className="text-xs text-gray-600">Schedule collection</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerProfilePage;