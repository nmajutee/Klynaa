import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'worker',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('notifications.')) {
      const notifField = field.split('.')[1];
      setFormData((prev: any) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notifField]: value
        }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <>
      <Head>
        <title>Profile - Klynaa</title>
        <meta name="description" content="Manage your Klynaa account profile, settings, and preferences." />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-klynaa-darkgreen py-12 text-center text-white">
          <h1 className="text-3xl klynaa-heading text-white mb-2">My Profile</h1>
          <p className="text-green-100 klynaa-body">Manage your account settings and preferences</p>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'personal', label: 'Personal Info' },
                  { id: 'security', label: 'Security' },
                  { id: 'notifications', label: 'Notifications' },
                  { id: 'activity', label: 'Activity' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-klynaa-primary">
                        {formData.firstName[0]}{formData.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-klynaa-dark">Profile Picture</h3>
                      <p className="text-sm text-klynaa-graylabel">Update your avatar</p>
                      <button className="mt-2 klynaa-btn-secondary text-sm">
                        Upload Photo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-green-800">Account Verified</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">Your account is fully verified and active.</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                      Update Password
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                        { key: 'sms', label: 'SMS Notifications', description: 'Receive text message alerts' },
                        { key: 'push', label: 'Push Notifications', description: 'Browser and mobile app notifications' }
                      ].map((option) => (
                        <div key={option.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{option.label}</h4>
                            <p className="text-sm text-gray-500">{option.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={formData.notifications[option.key as keyof typeof formData.notifications]}
                              onChange={(e) => handleInputChange(`notifications.${option.key}`, e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {[
                        { action: 'Completed pickup', location: 'Downtown Bin #123', time: '2 hours ago' },
                        { action: 'Updated profile', location: 'Personal information', time: '1 day ago' },
                        { action: 'Verified pickup', location: 'Riverside Bin #456', time: '2 days ago' },
                        { action: 'Changed password', location: 'Security settings', time: '1 week ago' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-500">{activity.location}</p>
                          </div>
                          <span className="text-sm text-gray-400">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 text-gray-300 py-8">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">© {new Date().getFullYear()} Klynaa. All rights reserved.</p>
            <div className="flex space-x-6 text-sm">
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
