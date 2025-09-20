import React, { useEffect, useState } from 'react';
import { useWebSocketStore, selectUnreadNotifications } from '../../stores/websocketStore';
import { BellIcon, XMarkIcon, CheckIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

/**
 * Real-time Notification Panel Component
 * Displays system notifications, alerts, and messages in real-time
 */
export const NotificationPanel: React.FC = () => {
  const notifications = useWebSocketStore(state => state.notifications);
  const unreadNotifications = useWebSocketStore(selectUnreadNotifications);
  const soundEnabled = useWebSocketStore(state => state.soundEnabled);
  const toggleSound = useWebSocketStore(state => state.toggleSound);
  const markNotificationRead = useWebSocketStore(state => state.markNotificationRead);
  const clearNotifications = useWebSocketStore(state => state.clearNotifications);

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'error' | 'success' | 'warning' | 'info'>('all');

  // Auto-close panel when no unread notifications
  useEffect(() => {
    if (unreadNotifications.length === 0 && isOpen) {
      const timer = setTimeout(() => setIsOpen(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadNotifications.length, isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-400';
      case 'error': return 'border-l-red-400';
      case 'warning': return 'border-l-yellow-400';
      case 'info':
      default: return 'border-l-blue-400';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
      >
        <BellIcon className="h-6 w-6" />
        {unreadNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Notifications
                {unreadNotifications.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {unreadNotifications.length} new
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {/* Sound Toggle */}
                <button
                  onClick={toggleSound}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                >
                  {soundEnabled ? (
                    <SpeakerWaveIcon className="h-4 w-4" />
                  ) : (
                    <SpeakerXMarkIcon className="h-4 w-4" />
                  )}
                </button>
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-2 flex space-x-1">
              {(['all', 'unread', 'error', 'warning', 'success', 'info'] as const).map(filterType => {
                const count = filterType === 'all'
                  ? notifications.length
                  : filterType === 'unread'
                  ? unreadNotifications.length
                  : notifications.filter(n => n.type === filterType).length;

                return (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      filter === filterType
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    {count > 0 && ` (${count})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="border-b border-gray-200 px-4 py-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {filteredNotifications.length} of {notifications.length} notifications
                </span>
                <div className="flex space-x-2">
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={() => {
                        unreadNotifications.forEach(notif => markNotificationRead(notif.id));
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification List */}
          <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <BellIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
                </p>
                <p className="text-xs text-gray-400">
                  {filter === 'all'
                    ? 'Notifications will appear here in real-time'
                    : `Switch to "All" to see other notifications`
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => markNotificationRead(notification.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read?: boolean;
  };
  onMarkRead: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const seconds = Math.floor((new Date().getTime() - new Date(notification.timestamp).getTime()) / 1000);
      if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      else if (seconds < 86400) setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
      else setTimeAgo(`${Math.floor(seconds / 86400)}d ago`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [notification.timestamp]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-400';
      case 'error': return 'border-l-red-400';
      case 'warning': return 'border-l-yellow-400';
      case 'info':
      default: return 'border-l-blue-400';
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors duration-150 border-l-4 ${getBorderColor(notification.type)} ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
                {!notification.read && (
                  <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </p>
              <p className={`mt-1 text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                {notification.message}
              </p>
            </div>

            <div className="flex items-center space-x-2 ml-3">
              <time className="text-xs text-gray-400 whitespace-nowrap">{timeAgo}</time>
              {!notification.read && (
                <button
                  onClick={onMarkRead}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Mark as read"
                >
                  <CheckIcon className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};