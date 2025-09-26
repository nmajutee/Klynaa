import React from 'react';
import Link from 'next/link';
import { Icon } from '../components/ui/Icons';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Link
            href="/auth/login"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            ← Back to Login
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Icon name="Settings" className="w-4 h-4" />
            Settings
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
          User Profile
        </h1>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Profile Overview */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="User" className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                John Doe
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300">
                Bin Owner
              </p>
              <div className="mt-4 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                Verified
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
              Contact Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Icon name="Mail" className="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-1" />
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Email</p>
                  <p className="text-neutral-900 dark:text-neutral-100">john.doe@example.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Icon name="Phone" className="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-1" />
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Phone</p>
                  <p className="text-neutral-900 dark:text-neutral-100">+237 123 456 789</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Icon name="MapPin" className="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-1" />
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Location</p>
                  <p className="text-neutral-900 dark:text-neutral-100">Yaoundé, Cameroon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
              Account Statistics
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-300">Total Pickups</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">24</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-300">Active Bins</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">3</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-300">Member Since</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Jan 2024</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-300">Rating</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">4.8/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="mt-8 text-center">
          <button className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}