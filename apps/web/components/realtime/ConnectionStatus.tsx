import React, { useEffect, useState } from 'react';
import { useWebSocketStore, selectConnections, selectGlobalConnected } from '../../stores/websocketStore';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

/**
 * Connection Status Badge Component
 * Shows real-time connection status for all WebSocket endpoints
 */
export const ConnectionStatusBadge: React.FC = () => {
  const connections = useWebSocketStore(selectConnections);
  const globalConnected = useWebSocketStore(selectGlobalConnected);
  const showConnectionStatus = useWebSocketStore(state => state.showConnectionStatus);
  const toggleConnectionStatus = useWebSocketStore(state => state.toggleConnectionStatus);

  const connectionCount = Object.keys(connections).length;
  const connectedCount = Object.values(connections).filter(conn => conn.state === 'connected').length;
  const reconnectingCount = Object.values(connections).filter(conn => conn.state === 'reconnecting').length;
  const errorCount = Object.values(connections).filter(conn => conn.state === 'error').length;

  const getStatusIcon = () => {
    if (errorCount > 0) return <ExclamationCircleIcon className="h-4 w-4 text-red-500" />;
    if (reconnectingCount > 0) return <ClockIcon className="h-4 w-4 text-yellow-500 animate-spin" />;
    if (globalConnected) return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    return <XCircleIcon className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (errorCount > 0) return 'bg-red-100 text-red-800 border-red-200';
    if (reconnectingCount > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (globalConnected) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="relative">
      <button
        onClick={toggleConnectionStatus}
        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span>{connectedCount}/{connectionCount} Connected</span>
      </button>

      {/* Detailed Status Panel */}
      {showConnectionStatus && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-900">WebSocket Connections</h3>
              <button
                onClick={toggleConnectionStatus}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(connections).map(([endpoint, info]) => (
                <ConnectionItem key={endpoint} endpoint={endpoint} info={info} />
              ))}

              {connectionCount === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No WebSocket connections active
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ConnectionItemProps {
  endpoint: string;
  info: {
    state: string;
    stats: {
      uptime: number;
      messagesSent: number;
      messagesReceived: number;
      reconnectCount: number;
    };
  };
}

const ConnectionItem: React.FC<ConnectionItemProps> = ({ endpoint, info }) => {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-blue-600 bg-blue-100';
      case 'reconnecting': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <div className="flex-1">
        <div className="text-xs font-medium text-gray-900 truncate">
          {endpoint.replace('/ws/', '').replace('/', '')}
        </div>
        <div className="text-xs text-gray-500">
          ↑{info.stats.messagesSent} ↓{info.stats.messagesReceived}
          {info.stats.uptime > 0 && ` • ${formatUptime(info.stats.uptime)}`}
          {info.stats.reconnectCount > 0 && ` • ${info.stats.reconnectCount} reconnects`}
        </div>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(info.state)}`}>
        {info.state}
      </span>
    </div>
  );
};