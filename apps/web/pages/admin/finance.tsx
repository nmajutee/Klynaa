import React from 'react';
import Link from 'next/link';
import { Icon } from '../../components/ui/Icons';
import WorkingThemeToggle from '../../src/components/ui/WorkingThemeToggle';

export default function AdminFinance() {
  return (
    <div className="flex h-screen bg-klynaa-lightgray dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 text-white flex flex-col shadow-xl border-r border-neutral-600" style={{ backgroundColor: '#2E7D32' }}>
        {/* Header */}
        <div className="p-4 border-b border-green-600">
          <h2 className="text-2xl font-bold text-white">Klynaa Admin</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="BarChart3" className="w-5 h-5 mr-3" />
            Overview
          </Link>
          <Link href="/admin/users" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="Users" className="w-5 h-5 mr-3" />
            User Management
          </Link>
          <Link href="/admin/pickups" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="Truck" className="w-5 h-5 mr-3" />
            Pickup Management
          </Link>
          <Link href="/admin/finance" className="flex items-center p-3 rounded-lg font-medium transition-colors bg-white" style={{ color: '#4CAF50' }}>
            <Icon name="CreditCard" className="w-5 h-5 mr-3" />
            Payment & Finance
          </Link>
          <Link href="/admin/reports" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="FileText" className="w-5 h-5 mr-3" />
            Reports
          </Link>
          <Link href="/admin/disputes" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="MessageSquare" className="w-5 h-5 mr-3" />
            Reviews & Disputes
          </Link>
          <Link href="/admin/settings" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="Settings" className="w-5 h-5 mr-3" />
            System Settings
          </Link>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-green-600">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
              <Icon name="User" className="w-6 h-6" style={{ color: '#4CAF50' }} />
            </div>
            <div>
              <p className="font-semibold text-white">Admin User</p>
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
          <h2 className="text-xl font-semibold" style={{ color: '#1C1C1C' }}>Payment & Finance</h2>
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
              Process Payouts
            </button>
          </div>
        </div>        {/* Content */}
        <div className="p-6 flex-1 bg-klynaa-lightgray dark:bg-neutral-900 overflow-y-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1C1C1C' }}>Financial Overview</h3>
            <p className="text-gray-600">Monitor payments, process worker payouts, and track financial metrics.</p>

            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-lg" style={{ color: '#4CAF50' }}>Total Revenue</h4>
                  <p className="text-2xl font-bold">$12,450</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-lg" style={{ color: '#4CAF50' }}>Pending Payouts</h4>
                  <p className="text-2xl font-bold">$3,250</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-lg" style={{ color: '#4CAF50' }}>Platform Fees</h4>
                  <p className="text-2xl font-bold">$1,890</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}