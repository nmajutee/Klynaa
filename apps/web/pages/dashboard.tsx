import React from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, Bell, Home } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Home className="w-8 h-8 text-emerald-600" />
              <h1 className="text-xl font-semibold text-neutral-900">Klynaa Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-neutral-400" />
              <Settings className="w-5 h-5 text-neutral-400" />
              <Link href="/auth/login" className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900">
                <LogOut className="w-5 h-5" />
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="col-span-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Welcome to Klynaa!</h2>
            <p className="opacity-90">Your waste management dashboard is ready to use.</p>
          </div>

          {/* Registration Test Cards */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-8 h-8 text-emerald-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Worker Registration</h3>
            </div>
            <p className="text-neutral-600 mb-4">Test the worker onboarding flow with 5 steps.</p>
            <Link
              href="/auth/register/worker"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Test Worker Flow
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center gap-3 mb-4">
              <Home className="w-8 h-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Bin Owner Registration</h3>
            </div>
            <p className="text-neutral-600 mb-4">Test the bin owner onboarding flow.</p>
            <Link
              href="/auth/register/bin-owner"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Test Bin Owner Flow
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-8 h-8 text-neutral-600" />
              <h3 className="text-lg font-semibold text-neutral-900">API Testing</h3>
            </div>
            <p className="text-neutral-600 mb-4">Test API connections and authentication.</p>
            <Link
              href="/auth-test"
              className="inline-block bg-neutral-600 hover:bg-neutral-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Test API
            </Link>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Testing Instructions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Registration Flow Testing:</h4>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Worker registration has 5 steps: Basics, Profile, Verification, Earnings, Confirmation</li>
                <li>• Bin Owner registration has 4 steps: Basics, Details, Billing, Confirmation</li>
                <li>• Forms include validation, file uploads, and OTP verification</li>
                <li>• State persists across page refreshes using Zustand</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Available Routes:</h4>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• <code className="bg-neutral-100 px-1 rounded">/auth/register</code> - Account type selection</li>
                <li>• <code className="bg-neutral-100 px-1 rounded">/auth/login</code> - Login page</li>
                <li>• <code className="bg-neutral-100 px-1 rounded">/auth-test</code> - API testing interface</li>
                <li>• <code className="bg-neutral-100 px-1 rounded">/dashboard</code> - This page</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}