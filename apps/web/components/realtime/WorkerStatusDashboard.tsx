import React, { useEffect, useState } from 'react';
import { useWebSocketStore, selectOnlineWorkers } from '../../stores/websocketStore';
import { UserIcon, MapPinIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

/**
 * Worker Status Dashboard Component
 * Shows real-time worker locations, status, and activity
 */
export const WorkerStatusDashboard: React.FC = () => {
  const onlineWorkers = useWebSocketStore(selectOnlineWorkers);
  const workerUpdates = useWebSocketStore(state => state.workerUpdates);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Track recent worker activity
  useEffect(() => {
    const unsubscribe = useWebSocketStore.subscribe(
      (state) => state.workerUpdates,
      (currentUpdates, prevUpdates) => {
        Object.values(currentUpdates).forEach(worker => {
          const prevWorker = prevUpdates[worker.id];
          if (!prevWorker ||
              prevWorker.status !== worker.status ||
              prevWorker.updated_at !== worker.updated_at) {
            setRecentActivity(prev => [
              {
                ...worker,
                activityType: prevWorker ? 'status_change' : 'came_online',
                timestamp: new Date(),
                previousStatus: prevWorker?.status
              },
              ...prev.slice(0, 19) // Keep last 20 activities
            ]);
          }
        });
      }
    );

    return unsubscribe;
  }, []);

  const getWorkerStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'busy':
        return <TruckIcon className="h-4 w-4 text-orange-500" />;
      case 'offline':
        return <ExclamationCircleIcon className="h-4 w-4 text-gray-400" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-orange-100 text-orange-800';
      case 'offline': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const allWorkers = Object.values(workerUpdates);
  const onlineCount = allWorkers.filter(w => w.status === 'online').length;
  const busyCount = allWorkers.filter(w => w.status === 'busy').length;
  const offlineCount = allWorkers.filter(w => w.status === 'offline').length;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Worker Status</h3>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {onlineCount + busyCount} Available
            </span>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center space-y-1">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span className="text-lg font-semibold text-gray-900">{onlineCount}</span>
            <span className="text-xs text-gray-500">Online</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <TruckIcon className="h-5 w-5 text-orange-500" />
            <span className="text-lg font-semibold text-gray-900">{busyCount}</span>
            <span className="text-xs text-gray-500">Busy</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <ExclamationCircleIcon className="h-5 w-5 text-gray-400" />
            <span className="text-lg font-semibold text-gray-900">{offlineCount}</span>
            <span className="text-xs text-gray-500">Offline</span>
          </div>
        </div>
      </div>

      {/* Worker List */}
      <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
        {allWorkers.length === 0 ? (
          <div className="p-6 text-center">
            <UserIcon className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No workers found</p>
            <p className="text-xs text-gray-400">Worker status will appear here</p>
          </div>
        ) : (
          allWorkers
            .sort((a, b) => {
              // Sort by status priority: online > busy > offline
              const statusPriority = { online: 3, busy: 2, offline: 1 };
              return (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0);
            })
            .map(worker => (
              <WorkerStatusItem key={worker.id} worker={worker} />
            ))
        )}
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <>
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700">Recent Activity</h4>
          </div>
          <div className="divide-y divide-gray-200 max-h-40 overflow-y-auto">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <WorkerActivityItem key={`${activity.id}-${index}`} activity={activity} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface WorkerStatusItemProps {
  worker: {
    id: number;
    status: string;
    current_location?: {
      latitude: number;
      longitude: number;
    };
    active_pickups?: number[];
    updated_at: string;
  };
}

const WorkerStatusItem: React.FC<WorkerStatusItemProps> = ({ worker }) => {
  const getWorkerStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'busy':
        return <TruckIcon className="h-4 w-4 text-orange-500" />;
      case 'offline':
        return <ExclamationCircleIcon className="h-4 w-4 text-gray-400" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-orange-100 text-orange-800';
      case 'offline': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-3 hover:bg-gray-50 transition-colors duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getWorkerStatusIcon(worker.status)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Worker #{worker.id}</p>
            <div className="flex items-center space-x-3 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(worker.status)}`}>
                {worker.status}
              </span>
              {worker.active_pickups && worker.active_pickups.length > 0 && (
                <span className="text-xs text-gray-500">
                  {worker.active_pickups.length} active pickup{worker.active_pickups.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {worker.current_location && (
          <div className="text-right">
            <div className="inline-flex items-center text-xs text-gray-500">
              <MapPinIcon className="h-3 w-3 mr-1" />
              {worker.current_location.latitude.toFixed(4)}, {worker.current_location.longitude.toFixed(4)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface WorkerActivityItemProps {
  activity: {
    id: number;
    status: string;
    activityType: string;
    timestamp: Date;
    previousStatus?: string;
  };
}

const WorkerActivityItem: React.FC<WorkerActivityItemProps> = ({ activity }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const seconds = Math.floor((new Date().getTime() - activity.timestamp.getTime()) / 1000);
      if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      else setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [activity.timestamp]);

  const getActivityDescription = () => {
    switch (activity.activityType) {
      case 'status_change':
        return `changed status from ${activity.previousStatus} to ${activity.status}`;
      case 'came_online':
        return `came online`;
      default:
        return `updated status to ${activity.status}`;
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <p className="text-xs text-gray-600">
            <span className="font-medium">Worker #{activity.id}</span> {getActivityDescription()}
          </p>
        </div>
        <time className="text-xs text-gray-400">{timeAgo}</time>
      </div>
    </div>
  );
};