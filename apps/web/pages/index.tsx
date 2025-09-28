import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Icon } from '../components/ui/Icons';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      {/* Hero Section */}
      <section className="px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 lg:text-6xl">
            Smart Waste Management</h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
            Connect waste collectors with bin owners for efficient, sustainable waste management
            across Cameroon and beyond.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Get Started
              <Icon name="ArrowRight" className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-4 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Login to Dashboard
            </Link>
          </div>

          {/* Demo Links */}
          <div className="mt-12 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-4 text-center">
              🎯 Quick Dashboard Demos
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/demo-admin" className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                Admin Dashboard
              </Link>
              <Link href="/demo-worker" className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                Worker Dashboard
              </Link>
              <Link href="/demo-binowner" className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                Bin Owner Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-neutral-100 mb-12">
            How Klynaa Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Workers */}
            <div className="p-8 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-4">
                <Icon name="User" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">For Waste Workers</h3>
              <ul className="text-neutral-600 dark:text-neutral-300 space-y-2">
                <li>• Find nearby pickup opportunities</li>
                <li>• Track your earnings and performance</li>
                <li>• Get verified and build your reputation</li>
                <li>• Manage your work schedule flexibly</li>
              </ul>
              <Link
                href="/auth/register/worker"
                className="inline-block mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Join as Worker
              </Link>
            </div>

            {/* For Bin Owners */}
            <div className="p-8 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Icon name="Home" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">For Bin Owners</h3>
              <ul className="text-neutral-600 dark:text-neutral-300 space-y-2">
                <li>• Schedule regular waste pickups</li>
                <li>• Monitor bin fill levels remotely</li>
                <li>• Manage payments and subscriptions</li>
                <li>• Get reliable, consistent service</li>
              </ul>
              <Link
                href="/auth/register/bin-owner"
                className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join as Bin Owner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">
            🧪 Testing Environment
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300 mb-6">
            This is a development environment. Test the authentication system with these demo credentials:
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg border-2 border-red-200 dark:border-red-800">
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">Customer Login</h3>
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                customer@test.com / password
              </p>
              <Link
                href="/auth?type=customer"
                className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white px-4 py-2 rounded-lg inline-block transition-colors"
              >
                Test Customer Portal
              </Link>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="text-2xl mb-2">🚛</div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Worker Login</h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm mb-4">
                worker@test.com / password
              </p>
              <Link
                href="/auth?type=worker"
                className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg inline-block transition-colors"
              >
                Test Worker Portal
              </Link>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg border-2 border-green-200 dark:border-green-800">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Admin Login</h3>
              <p className="text-green-600 dark:text-green-400 text-sm mb-4">
                admin@test.com / password
              </p>
              <Link
                href="/auth?type=admin"
                className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white px-4 py-2 rounded-lg inline-block transition-colors"
              >
                Test Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 dark:bg-neutral-950 text-white py-8 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-neutral-400 dark:text-neutral-500">
            © 2025 Klynaa. Smart waste management for a cleaner future.
          </p>
        </div>
      </footer>
    </div>
  );
}