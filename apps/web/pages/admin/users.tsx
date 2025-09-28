import React from 'react';
import Link from 'next/link';
import { Icon } from '../../components/ui/Icons';
import WorkingThemeToggle from '../../src/components/ui/WorkingThemeToggle';

export default function AdminUsers() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-neutral-900 overflow-hidden">
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
          <Link href="/admin/users" className="flex items-center p-3 rounded-lg font-medium transition-colors bg-white" style={{ color: '#4CAF50' }}>
            <Icon name="Users" className="w-5 h-5 mr-3" />
            User Management
          </Link>
          <Link href="/admin/pickups" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
            <Icon name="Truck" className="w-5 h-5 mr-3" />
            Pickup Management
          </Link>
          <Link href="/admin/finance" className="flex items-center p-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-20 transition-colors text-white">
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>
          <div className="flex items-center space-x-4">
            <WorkingThemeToggle />
            <button className="px-4 py-2 rounded-lg transition-colors font-medium hover:shadow-md border-2 bg-white dark:bg-neutral-800 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-neutral-700">
              Add New User
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 bg-gray-50 dark:bg-neutral-900 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Management</h3>
            <p className="text-gray-600 dark:text-gray-300">Manage users, approve workers, and handle user-related operations from this page.</p>

            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-lg" style={{ color: '#4CAF50' }}>Total Users</h4>
                  <p className="text-2xl font-bold">1,250</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-lg" style={{ color: '#4CAF50' }}>Pending Workers</h4>
                  <p className="text-2xl font-bold">15</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-lg" style={{ color: '#4CAF50' }}>Active Today</h4>
                  <p className="text-2xl font-bold">342</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}