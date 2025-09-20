/**
 * Real-time Components for Klynaa Waste Management System
 *
 * These components provide live updates for:
 * - WebSocket connection status
 * - Pickup request updates
 * - Worker status and activity
 * - System notifications and alerts
 */

export { ConnectionStatusBadge } from './ConnectionStatus';
export { LivePickupUpdates } from './LivePickupUpdates';
export { WorkerStatusDashboard } from './WorkerStatusDashboard';
export { NotificationPanel } from './NotificationPanel';

import React from 'react';
import { ConnectionStatusBadge } from './ConnectionStatus';
import { LivePickupUpdates } from './LivePickupUpdates';
import { WorkerStatusDashboard } from './WorkerStatusDashboard';
import { NotificationPanel } from './NotificationPanel';

/**
 * Combined Real-time Dashboard Component
 * Integrates all real-time features into a single dashboard view
 */
export const RealtimeDashboard: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with connection status and notifications */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Real-time Dashboard</h1>
            <p className="text-gray-600">Live updates from the Klynaa waste management system</p>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectionStatusBadge />
            <NotificationPanel />
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Pickup Updates */}
        <div className="lg:col-span-1">
          <LivePickupUpdates />
        </div>

        {/* Worker Status Dashboard */}
        <div className="lg:col-span-1">
          <WorkerStatusDashboard />
        </div>
      </div>

      {/* Additional metrics or components can be added here */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Real-time</div>
            <div className="text-sm text-gray-500">Live Updates</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">WebSocket</div>
            <div className="text-sm text-gray-500">Connection</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">Dashboard</div>
            <div className="text-sm text-gray-500">Management</div>
          </div>
        </div>
      </div>
    </div>
  );
};