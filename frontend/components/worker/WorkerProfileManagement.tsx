/**
 * Worker Profile and Status Management Component
 * Handles profile settings, status updates, and account management
 */

import React, { useState } from 'react';
import {
  UserCircleIcon,
  CameraIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  ShieldCheckIcon,
  BellIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface WorkerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  profile_picture?: string;
  address: string;
  service_areas: string[];
  verification_status: 'pending' | 'verified' | 'rejected';
  status: 'active' | 'offline' | 'disabled';
  rating: number;
  total_reviews: number;
  date_joined: string;
  documents: {
    id_card?: string;
    drivers_license?: string;
    proof_of_residence?: string;
  };
  notifications: {
    pickup_requests: boolean;
    earnings_updates: boolean;
    system_messages: boolean;
    marketing_emails: boolean;
  };
}

interface WorkerProfileProps {
  profile: WorkerProfile;
  onUpdateProfile?: (data: Partial<WorkerProfile>) => Promise<void>;
  className?: string;
}

const WorkerProfileManagement: React.FC<WorkerProfileProps> = ({
  profile,
  onUpdateProfile,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'documents' | 'reviews'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    service_areas: profile.service_areas
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await onUpdateProfile?.(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'offline') => {
    try {
      await onUpdateProfile?.({ status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-400';
      case 'disabled':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIconSolid
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
    { id: 'documents', name: 'Documents', icon: ShieldCheckIcon },
    { id: 'reviews', name: 'Reviews', icon: StarIcon },
  ];

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header with Profile Summary */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profile.profile_picture ? (
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={profile.profile_picture}
                  alt={profile.name}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserCircleIcon className="h-10 w-10 text-gray-500" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow">
                <CameraIcon className="h-4 w-4 text-gray-600" />
              </button>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(profile.status)}`}></div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getVerificationColor(profile.verification_status)}`}>
                  {profile.verification_status === 'verified' ? '✓ Verified' : profile.verification_status}
                </span>
              </div>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1">
                  {renderStars(profile.rating)}
                  <span className="text-sm text-gray-600">
                    {profile.rating} ({profile.total_reviews} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  Joined {new Date(profile.date_joined).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={profile.status}
              onChange={(e) => handleStatusChange(e.target.value as 'active' | 'offline')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="active">🟢 Active</option>
              <option value="offline">⚫ Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="px-6 flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2 flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-500" />
                    {profile.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2 flex items-start">
                    <MapPinIcon className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                    {profile.address}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Areas
              </label>
              <div className="flex flex-wrap gap-2">
                {profile.service_areas.map((area, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>

            <div className="space-y-4">
              {Object.entries(profile.notifications).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Receive notifications about {key.replace('_', ' ')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      className="sr-only peer"
                      onChange={(e) => {
                        // Handle notification setting change
                        console.log(`Toggle ${key}:`, e.target.checked);
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <hr />

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Security</h4>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Change Password</span>
                    <span className="text-gray-500">→</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Two-Factor Authentication</span>
                    <span className="text-green-600 text-sm">Enabled</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Verification Documents</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(profile.documents).map(([docType, url]) => (
                <div key={docType} className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {docType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </h4>
                    {url ? (
                      <span className="text-green-600 text-sm">✓ Uploaded</span>
                    ) : (
                      <span className="text-red-600 text-sm">! Required</span>
                    )}
                  </div>
                  {url ? (
                    <div className="space-y-2">
                      <img src={url} alt={docType} className="w-full h-32 object-cover rounded" />
                      <button className="text-green-600 text-sm hover:underline">
                        View Document
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <p className="text-gray-500 mb-2">Upload your {docType.replace('_', ' ')}</p>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                        Upload File
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  {renderStars(profile.rating)}
                </div>
                <p className="text-sm text-gray-600">
                  {profile.rating} average from {profile.total_reviews} reviews
                </p>
              </div>
            </div>

            {/* Mock reviews */}
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">Customer {i + 1}</h4>
                      <div className="flex items-center space-x-1">
                        {renderStars(5)}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-gray-600">
                    Excellent service! The worker was punctual, professional, and handled our waste collection efficiently. Highly recommend!
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerProfileManagement;