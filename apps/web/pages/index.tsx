import React from 'react';
import Link from 'next/link';
import { Home, User, Settings, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8 text-emerald-600" />
              <h1 className="text-xl font-semibold text-neutral-900">Klynaa</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-neutral-900 mb-6">
            Smart Waste Management
            <span className="block text-emerald-600">Made Simple</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Connect waste collectors with bin owners for efficient, sustainable waste management
            across Cameroon and beyond.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
            How Klynaa Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Workers */}
            <div className="p-8 border border-neutral-200 rounded-xl">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">For Waste Workers</h3>
              <ul className="text-neutral-600 space-y-2">
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
            <div className="p-8 border border-neutral-200 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">For Bin Owners</h3>
              <ul className="text-neutral-600 space-y-2">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-yellow-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">
            🧪 Testing Environment
          </h2>
          <p className="text-yellow-700 mb-6">
            This is a development environment. Test the authentication system with these features:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-neutral-900 mb-2">Login Testing</h4>
              <p className="text-sm text-neutral-600 mb-3">Test with mock credentials for different user roles</p>
              <Link
                href="/auth/login"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                Test Login →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-neutral-900 mb-2">Registration Flow</h4>
              <p className="text-sm text-neutral-600 mb-3">Complete multi-step registration for workers and bin owners</p>
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Test Registration →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-neutral-900 mb-2">Dashboard Demo</h4>
              <p className="text-sm text-neutral-600 mb-3">Explore role-specific dashboards and features</p>
              <Link
                href="/dashboard"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                View Demo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-neutral-400">
            © 2025 Klynaa. Smart waste management for a cleaner future.
          </p>
        </div>
      </footer>
    </div>
  );
}