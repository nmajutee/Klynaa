/**
 * Enhancement Widgets - Enterprise Grade
 * Collection of dashboard enhancement widgets: notifications, activity, profile
 */

import React, { useState, useMemo } from 'react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserIcon,
  Cog6ToothIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { colors, spacing, borderRadius } from '../../design-system/tokens';

// Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface ActivityData {
  date: string;
  pickups: number;
  earnings: number;
  ratings: number;
}

export interface WorkerProfile {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'offline' | 'busy';
  rating: number;
  totalReviews: number;
  completedPickups: number;
  joinDate: string;
  badges: string[];
}

/**
 * Notifications Widget Component
 */
export interface NotificationsWidgetProps {
  notifications: Notification[];
  isLoading?: boolean;
  className?: string;
  maxNotifications?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationsWidget: React.FC<NotificationsWidgetProps> = ({
  notifications,
  isLoading = false,
  className = '',
  maxNotifications = 5,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = notifications.slice(0, maxNotifications);

  const getNotificationIcon = (type: Notification['type']) => {
    const iconProps = "w-5 h-5";
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconProps} text-green-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconProps} text-yellow-500`} />;
      case 'error':
        return <ExclamationTriangleIcon className={`${iconProps} text-red-500`} />;
      default:
        return <InformationCircleIcon className={`${iconProps} text-blue-500`} />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-300 rounded w-1/2 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 mb-4">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="relative">
              {unreadCount > 0 ? (
                <BellIconSolid className="w-5 h-5 text-blue-600" />
              ) : (
                <BellIcon className="w-5 h-5 text-gray-400" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">
              Notifications
            </h3>
          </div>

          {unreadCount > 0 && onMarkAllAsRead && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {displayedNotifications.length > 0 ? (
          <div className="space-y-4">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start p-3 rounded-lg border transition-colors ${
                  notification.read
                    ? 'bg-white border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                } ${
                  onNotificationClick ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
                onClick={() => onNotificationClick?.(notification)}
              >
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${
                      notification.read ? 'text-gray-900' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center ml-2">
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(notification.date)}
                      </span>
                      {!notification.read && onMarkAsRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-700"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>

                  {notification.actionUrl && notification.actionText && (
                    <button className="text-xs text-blue-600 hover:text-blue-700 mt-2">
                      {notification.actionText}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Activity Graph Widget Component
 */
export interface ActivityGraphWidgetProps {
  data: ActivityData[];
  isLoading?: boolean;
  className?: string;
  period?: 'week' | 'month';
  metric?: 'pickups' | 'earnings' | 'ratings';
}

export const ActivityGraphWidget: React.FC<ActivityGraphWidgetProps> = ({
  data,
  isLoading = false,
  className = '',
  period = 'week',
  metric = 'pickups'
}) => {
  const [selectedMetric, setSelectedMetric] = useState(metric);

  const chartData = useMemo(() => {
    if (!data.length) return [];

    const maxValue = Math.max(...data.map(d => d[selectedMetric]));
    return data.map((item, index) => ({
      ...item,
      percentage: maxValue > 0 ? (item[selectedMetric] / maxValue) * 100 : 0,
      label: new Date(item.date).toLocaleDateString('en', { weekday: 'short' })
    }));
  }, [data, selectedMetric]);

  const totalValue = data.reduce((sum, item) => sum + item[selectedMetric], 0);
  const averageValue = data.length > 0 ? totalValue / data.length : 0;

  const trend = useMemo(() => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3).reduce((sum, item) => sum + item[selectedMetric], 0) / 3;
    const previous = data.slice(-6, -3).reduce((sum, item) => sum + item[selectedMetric], 0) / 3;

    if (recent > previous * 1.1) return 'up';
    if (recent < previous * 0.9) return 'down';
    return 'stable';
  }, [data, selectedMetric]);

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'earnings':
        return 'Earnings (XAF)';
      case 'ratings':
        return 'Avg Rating';
      default:
        return 'Pickups';
    }
  };

  const getMetricValue = (value: number) => {
    switch (selectedMetric) {
      case 'earnings':
        return `${value.toLocaleString()} XAF`;
      case 'ratings':
        return value.toFixed(1);
      default:
        return value.toString();
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="flex justify-between items-end h-32 mb-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="bg-gray-300 rounded w-8" style={{
                height: `${Math.random() * 80 + 20}%`
              }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ChartBarIcon className="w-5 h-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Activity Overview
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="pickups">Pickups</option>
              <option value="earnings">Earnings</option>
              <option value="ratings">Ratings</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {getMetricValue(totalValue)}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {getMetricValue(averageValue)}
            </div>
            <div className="text-sm text-gray-500">Average</div>
          </div>

          <div className="text-center">
            <div className={`flex items-center justify-center text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : trend === 'down' ? (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              ) : null}
              {trend === 'up' ? 'Trending up' : trend === 'down' ? 'Trending down' : 'Stable'}
            </div>
            <div className="text-sm text-gray-500">Trend</div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="relative">
            <div className="flex items-end justify-between h-32 mb-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1 mx-1">
                  <div
                    className="bg-blue-500 rounded-t transition-all duration-300 w-full relative group cursor-pointer hover:bg-blue-600"
                    style={{ height: `${item.percentage}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {getMetricValue(item[selectedMetric])}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              {chartData.map((item, index) => (
                <div key={index} className="text-center flex-1">
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No activity data</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Profile Status Widget Component
 */
export interface ProfileStatusWidgetProps {
  profile: WorkerProfile;
  isLoading?: boolean;
  className?: string;
  onEditProfile?: () => void;
  onStatusChange?: (status: WorkerProfile['status']) => void;
}

export const ProfileStatusWidget: React.FC<ProfileStatusWidgetProps> = ({
  profile,
  isLoading = false,
  className = '',
  onEditProfile,
  onStatusChange
}) => {
  const getStatusConfig = (status: WorkerProfile['status']) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-500',
          text: 'Active',
          textColor: 'text-green-600'
        };
      case 'busy':
        return {
          color: 'bg-yellow-500',
          text: 'Busy',
          textColor: 'text-yellow-600'
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'Offline',
          textColor: 'text-gray-600'
        };
    }
  };

  const statusConfig = getStatusConfig(profile.status);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div className="ml-4 flex-1">
              <div className="h-5 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
          {onEditProfile && (
            <button
              onClick={onEditProfile}
              className="text-gray-400 hover:text-gray-600"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex items-center mb-6">
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-gray-600" />
              </div>
            )}

            {/* Status indicator */}
            <div className={`absolute bottom-1 right-1 w-4 h-4 ${statusConfig.color} rounded-full border-2 border-white`} />
          </div>

          <div className="ml-4 flex-1">
            <h4 className="text-lg font-semibold text-gray-900">
              {profile.name}
            </h4>
            <div className="flex items-center mt-1">
              <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                {statusConfig.text}
              </span>
              {onStatusChange && (
                <select
                  value={profile.status}
                  onChange={(e) => onStatusChange(e.target.value as WorkerProfile['status'])}
                  className="ml-2 text-xs border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {profile.completedPickups}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-lg font-bold text-gray-900">
                {profile.rating.toFixed(1)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {profile.totalReviews} reviews
            </div>
          </div>
        </div>

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Badges</h5>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Join date */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Member since {new Date(profile.joinDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default {
  NotificationsWidget,
  ActivityGraphWidget,
  ProfileStatusWidget
};