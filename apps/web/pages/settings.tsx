import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '../components/ui/Icons';
import { Button } from '../src/design-system/components/Button';
import { Card } from '../src/design-system/components/Card';
import { Input, Label, Field } from '../src/design-system/components/Form';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    pickupReminders: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    locationSharing: true,
    dataCollection: false
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/profile"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            ← Back to Profile
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
          Settings
        </h1>

        <div className="space-y-8">
          {/* Notifications */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="Bell" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Notifications
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card interactive className="p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-neutral-700 dark:text-neutral-300">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                  onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                </label>
              </Card>

              <Card interactive className="p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-neutral-700 dark:text-neutral-300">SMS Notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
              </Card>

              <Card interactive className="p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-neutral-700 dark:text-neutral-300">Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
              </Card>

              <Card interactive className="p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-neutral-700 dark:text-neutral-300">Pickup Reminders</span>
                  <input
                    type="checkbox"
                    checked={notifications.pickupReminders}
                    onChange={(e) => setNotifications({...notifications, pickupReminders: e.target.checked})}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
              </Card>
            </div>
          </Card>

          {/* Privacy & Security */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="Shield" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Privacy & Security
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">Profile Visibility</span>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Control who can see your profile</p>
                </div>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                  className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="workers-only">Workers Only</option>
                </select>
              </div>

              <label className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">Location Sharing</span>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Allow workers to see your location</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.locationSharing}
                  onChange={(e) => setPrivacy({...privacy, locationSharing: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">Data Collection</span>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Allow usage analytics</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.dataCollection}
                  onChange={(e) => setPrivacy({...privacy, dataCollection: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="User" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Account Management
              </h2>
            </div>

            <div className="space-y-4">
              <button className="w-full flex items-center gap-3 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left">
                <Icon name="Globe" className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                <div>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">Change Password</span>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Update your account password</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left">
                <Icon name="Moon" className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                <div>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">Download Data</span>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Export your account data</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                <Icon name="Trash2" className="w-5 h-5 text-red-500 dark:text-red-400" />
                <div>
                  <span className="text-red-700 dark:text-red-300 font-medium">Delete Account</span>
                  <p className="text-sm text-red-500 dark:text-red-400">Permanently delete your account</p>
                </div>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
              <Icon name="Save" className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}