import React from 'react';
import Link from 'next/link';
import { Icon } from '../../components/ui/Icons';
import WorkingThemeToggle from '../../src/components/ui/WorkingThemeToggle';

export default function WorkerProfile() {
  return (
    <div className="flex h-screen bg-klynaa-lightgray dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 text-white flex flex-col shadow-xl border-r border-neutral-600" style={{ backgroundColor: '#2E7D32' }}>
        {/* Header */}
        <div className="p-4 border-b border-green-600">
          <h2 className="text-2xl font-bold text-white">Klynaa Worker</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/worker/dashboard" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="BarChart3" className="w-5 h-5 mr-3" />
            Overview
          </Link>
          <Link href="/worker/jobs" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="CheckSquare" className="w-5 h-5 mr-3" />
            Available Pickups
          </Link>
          <Link href="/worker/routes" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="Navigation" className="w-5 h-5 mr-3" />
            Active Pickups
          </Link>
          <Link href="/worker/earnings" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="Wallet" className="w-5 h-5 mr-3" />
            Earnings
          </Link>
          <Link href="/worker/performance" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="Star" className="w-5 h-5 mr-3" />
            Performance
          </Link>
          <Link href="/worker/profile" className="flex items-center p-3 rounded-lg font-medium transition-colors bg-white" style={{ color: '#4CAF50' }}>
            <Icon name="User" className="w-5 h-5 mr-3" />
            Profile
          </Link>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-green-600">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
              <Icon name="User" className="w-6 h-6" style={{ color: '#4CAF50' }} />
            </div>
            <div>
              <p className="font-semibold text-white">Worker User</p>
              <Link href="/demo-login" className="text-sm text-green-200 hover:text-white transition-colors">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold" style={{ color: '#1C1C1C' }}>Worker Profile</h2>
          <div className="flex items-center space-x-4">
            <WorkingThemeToggle />
            <button
              className="px-4 py-2 rounded-lg transition-colors font-medium hover:shadow-md border-2"
              style={{
                backgroundColor: 'white',
                color: '#4CAF50',
                borderColor: '#4CAF50'
              }}
            >
              Edit Profile
            </button>
          </div>
        </div>        {/* Content */}
        <div className="p-6 flex-1 bg-klynaa-lightgray dark:bg-neutral-900 overflow-y-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1C1C1C' }}>Profile Information</h3>
            <p className="text-gray-600">Manage your profile settings and worker information.</p>

            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-lg mb-2" style={{ color: '#4CAF50' }}>Personal Info</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> Worker User</p>
                    <p><span className="font-medium">Email:</span> worker@example.com</p>
                    <p><span className="font-medium">Phone:</span> +1 (555) 123-4567</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-2" style={{ color: '#4CAF50' }}>Work Stats</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Completed Pickups:</span> 156</p>
                    <p><span className="font-medium">Rating:</span> 4.8/5</p>
                    <p><span className="font-medium">Total Earnings:</span> $2,450</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}