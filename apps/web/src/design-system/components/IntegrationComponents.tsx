import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Types
export interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  responseTime: number;
  uptime: number;
  lastChecked: Date;
  errorRate: number;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    initialDelay: number;
  };
  lastTriggered?: Date;
  successRate: number;
}

export interface IntegrationService {
  id: string;
  name: string;
  type: 'payment' | 'notification' | 'analytics' | 'storage' | 'communication';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastSync?: Date;
  config: Record<string, any>;
  metadata?: {
    version?: string;
    region?: string;
    environment?: 'production' | 'staging' | 'development';
  };
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: Array<{
    name: string;
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    message?: string;
  }>;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  lastUpdated: Date;
}

// API Status Monitor
export interface APIStatusMonitorProps {
  endpoints: APIEndpoint[];
  onRefresh?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export const APIStatusMonitor: React.FC<APIStatusMonitorProps> = ({
  endpoints,
  onRefresh,
  autoRefresh = true,
  refreshInterval = 30000,
  className,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh API status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: APIEndpoint['status']) => {
    switch (status) {
      case 'online':
        return 'text-success-600 bg-success-100';
      case 'offline':
        return 'text-danger-600 bg-danger-100';
      case 'degraded':
        return 'text-warning-600 bg-warning-100';
      case 'maintenance':
        return 'text-neutral-600 bg-neutral-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 200) return 'text-success-600';
    if (responseTime < 500) return 'text-warning-600';
    return 'text-danger-600';
  };

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">
          API Status Monitor
        </h3>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-neutral-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              'p-2 rounded-md transition-colors',
              'hover:bg-neutral-100 disabled:opacity-50',
              isRefreshing && 'animate-spin'
            )}
          >
            <Icons.RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {endpoints.map((endpoint) => (
          <div
            key={endpoint.id}
            className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className={cn('p-2 rounded-full', getStatusColor(endpoint.status))}>
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-neutral-900">{endpoint.name}</h4>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium uppercase',
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                    endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                    'bg-neutral-100 text-neutral-800'
                  )}>
                    {endpoint.method}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 font-mono">{endpoint.url}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <p className={cn('font-medium', getResponseTimeColor(endpoint.responseTime))}>
                  {endpoint.responseTime}ms
                </p>
                <p className="text-neutral-500">Response</p>
              </div>

              <div className="text-center">
                <p className="font-medium text-neutral-900">
                  {endpoint.uptime.toFixed(1)}%
                </p>
                <p className="text-neutral-500">Uptime</p>
              </div>

              <div className="text-center">
                <p className="font-medium text-neutral-900">
                  {endpoint.errorRate.toFixed(1)}%
                </p>
                <p className="text-neutral-500">Error Rate</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {endpoints.length === 0 && (
        <div className="text-center py-8">
          <Icons.Settings className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
          <p className="text-neutral-500">No API endpoints configured</p>
        </div>
      )}
    </div>
  );
};

// Webhook Manager
export interface WebhookManagerProps {
  webhooks: WebhookConfig[];
  onAdd?: () => void;
  onEdit?: (webhook: WebhookConfig) => void;
  onDelete?: (webhookId: string) => void;
  onToggle?: (webhookId: string, isActive: boolean) => void;
  onTest?: (webhookId: string) => Promise<void>;
  className?: string;
}

export const WebhookManager: React.FC<WebhookManagerProps> = ({
  webhooks,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  onTest,
  className,
}) => {
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  const handleTest = async (webhookId: string) => {
    setTestingWebhook(webhookId);
    try {
      await onTest?.(webhookId);
    } catch (error) {
      console.error('Failed to test webhook:', error);
    } finally {
      setTestingWebhook(null);
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-success-600';
    if (rate >= 80) return 'text-warning-600';
    return 'text-danger-600';
  };

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">
          Webhook Management
        </h3>

        <button
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Icons.Plus className="h-4 w-4" />
          <span>Add Webhook</span>
        </button>
      </div>

      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <div
            key={webhook.id}
            className="border border-neutral-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-neutral-900">{webhook.name}</h4>

                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      webhook.isActive ? 'bg-success-100 text-success-800' : 'bg-neutral-100 text-neutral-600'
                    )}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </div>

                    <div className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getSuccessRateColor(webhook.successRate)
                    )}>
                      {webhook.successRate.toFixed(1)}% success
                    </div>
                  </div>
                </div>

                <p className="text-sm text-neutral-600 font-mono mb-2">
                  {webhook.url}
                </p>

                <div className="flex flex-wrap gap-1 mb-2">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="px-2 py-0.5 bg-primary-100 text-primary-800 text-xs rounded"
                    >
                      {event}
                    </span>
                  ))}
                </div>

                {webhook.lastTriggered && (
                  <p className="text-xs text-neutral-500">
                    Last triggered: {webhook.lastTriggered.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onToggle?.(webhook.id, !webhook.isActive)}
                  className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                  title={webhook.isActive ? 'Disable' : 'Enable'}
                >
                  {webhook.isActive ? (
                    <Icons.PauseCircle className="h-4 w-4" />
                  ) : (
                    <Icons.PlayCircle className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={() => handleTest(webhook.id)}
                  disabled={testingWebhook === webhook.id}
                  className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                  title="Test webhook"
                >
                  {testingWebhook === webhook.id ? (
                    <div className="animate-spin">
                      <Icons.Settings className="h-4 w-4" />
                    </div>
                  ) : (
                    <Icons.Send className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={() => onEdit?.(webhook)}
                  className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                  title="Edit webhook"
                >
                  <Icons.Settings className="h-4 w-4" />
                </button>

                <button
                  onClick={() => onDelete?.(webhook.id)}
                  className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 rounded-md transition-colors"
                  title="Delete webhook"
                >
                  <Icons.XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {webhooks.length === 0 && (
        <div className="text-center py-8">
          <Icons.Send className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
          <p className="text-neutral-500 mb-2">No webhooks configured</p>
          <p className="text-sm text-neutral-400">
            Add a webhook to receive real-time notifications
          </p>
        </div>
      )}
    </div>
  );
};

// Third-party Service Connector
export interface ServiceConnectorProps {
  services: IntegrationService[];
  onConnect?: (serviceType: string) => void;
  onDisconnect?: (serviceId: string) => void;
  onConfigure?: (service: IntegrationService) => void;
  onSync?: (serviceId: string) => Promise<void>;
  className?: string;
}

export const ServiceConnector: React.FC<ServiceConnectorProps> = ({
  services,
  onConnect,
  onDisconnect,
  onConfigure,
  onSync,
  className,
}) => {
  const [syncingService, setSyncingService] = useState<string | null>(null);

  const availableServices = [
    { type: 'payment', name: 'Stripe', provider: 'stripe', icon: Icons.CreditCard },
    { type: 'notification', name: 'SendGrid', provider: 'sendgrid', icon: Icons.Mail },
    { type: 'analytics', name: 'Google Analytics', provider: 'google_analytics', icon: Icons.BarChart },
    { type: 'storage', name: 'AWS S3', provider: 'aws_s3', icon: Icons.Cloud },
    { type: 'communication', name: 'Twilio', provider: 'twilio', icon: Icons.MessageSquare },
  ];

  const handleSync = async (serviceId: string) => {
    setSyncingService(serviceId);
    try {
      await onSync?.(serviceId);
    } catch (error) {
      console.error('Failed to sync service:', error);
    } finally {
      setSyncingService(null);
    }
  };

  const getStatusColor = (status: IntegrationService['status']) => {
    switch (status) {
      case 'connected':
        return 'text-success-600 bg-success-100';
      case 'disconnected':
        return 'text-neutral-600 bg-neutral-100';
      case 'error':
        return 'text-danger-600 bg-danger-100';
      case 'configuring':
        return 'text-warning-600 bg-warning-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Service Integrations
        </h3>
        <p className="text-sm text-neutral-600">
          Connect third-party services to extend functionality
        </p>
      </div>

      <div className="space-y-4">
        {availableServices.map((availableService) => {
          const connectedService = services.find(s => s.provider === availableService.provider);
          const IconComponent = availableService.icon;

          return (
            <div
              key={availableService.provider}
              className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={cn(
                  'p-3 rounded-lg',
                  connectedService ? getStatusColor(connectedService.status) : 'bg-neutral-100 text-neutral-600'
                )}>
                  <IconComponent className="h-6 w-6" />
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900">
                    {availableService.name}
                  </h4>
                  <p className="text-sm text-neutral-600 capitalize">
                    {availableService.type} service
                  </p>

                  {connectedService && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                        getStatusColor(connectedService.status)
                      )}>
                        {connectedService.status}
                      </span>

                      {connectedService.lastSync && (
                        <span className="text-xs text-neutral-500">
                          Last sync: {connectedService.lastSync.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {connectedService ? (
                  <>
                    {connectedService.status === 'connected' && (
                      <button
                        onClick={() => handleSync(connectedService.id)}
                        disabled={syncingService === connectedService.id}
                        className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                        title="Sync now"
                      >
                        {syncingService === connectedService.id ? (
                          <div className="animate-spin">
                            <Icons.RefreshCw className="h-4 w-4" />
                          </div>
                        ) : (
                          <Icons.RefreshCw className="h-4 w-4" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => onConfigure?.(connectedService)}
                      className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                      title="Configure"
                    >
                      <Icons.Settings className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onDisconnect?.(connectedService.id)}
                      className="px-3 py-1.5 text-danger-600 border border-danger-300 rounded-md hover:bg-danger-50 transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onConnect?.(availableService.type)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// System Health Monitor
export interface SystemHealthMonitorProps {
  health: SystemHealth;
  onRefresh?: () => void;
  autoRefresh?: boolean;
  className?: string;
}

export const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({
  health,
  onRefresh,
  autoRefresh = true,
  className,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        onRefresh?.();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, onRefresh]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getOverallStatusColor = (status: SystemHealth['overall']) => {
    switch (status) {
      case 'healthy':
        return 'text-success-600 bg-success-100';
      case 'warning':
        return 'text-warning-600 bg-warning-100';
      case 'critical':
        return 'text-danger-600 bg-danger-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'text-success-600';
      case 'down':
        return 'text-danger-600';
      case 'degraded':
        return 'text-warning-600';
      default:
        return 'text-neutral-600';
    }
  };

  const getMetricColor = (value: number, type: 'cpu' | 'memory' | 'disk' | 'network') => {
    const thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      disk: { warning: 85, critical: 95 },
      network: { warning: 80, critical: 95 },
    };

    const threshold = thresholds[type];
    if (value >= threshold.critical) return 'text-danger-600 bg-danger-100';
    if (value >= threshold.warning) return 'text-warning-600 bg-warning-100';
    return 'text-success-600 bg-success-100';
  };

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-neutral-900">
            System Health
          </h3>

          <div className={cn(
            'px-3 py-1 rounded-full text-sm font-medium capitalize',
            getOverallStatusColor(health.overall)
          )}>
            {health.overall}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-neutral-500">
            Updated: {health.lastUpdated.toLocaleTimeString()}
          </span>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              'p-2 rounded-md transition-colors',
              'hover:bg-neutral-100 disabled:opacity-50',
              isRefreshing && 'animate-spin'
            )}
          >
            <Icons.RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(health.metrics).map(([metric, value]) => (
          <div key={metric} className="text-center">
            <div className={cn(
              'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2',
              getMetricColor(value, metric as keyof typeof health.metrics)
            )}>
              <span className="text-lg font-bold">{value}%</span>
            </div>
            <p className="text-sm text-neutral-600 capitalize">{metric}</p>
          </div>
        ))}
      </div>

      {/* Service Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-neutral-900">Services</h4>

        <div className="space-y-2">
          {health.services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  service.status === 'up' ? 'bg-success-500' :
                  service.status === 'down' ? 'bg-danger-500' :
                  'bg-warning-500'
                )} />

                <span className="font-medium text-neutral-900">
                  {service.name}
                </span>

                {service.message && (
                  <span className="text-sm text-neutral-600">
                    {service.message}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span className={getServiceStatusColor(service.status)}>
                  {service.status.toUpperCase()}
                </span>

                {service.responseTime && (
                  <span className="text-neutral-600">
                    {service.responseTime}ms
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Integration Test Runner
export interface IntegrationTestProps {
  tests: Array<{
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    duration?: number;
    error?: string;
  }>;
  onRunTest?: (testId: string) => Promise<void>;
  onRunAll?: () => Promise<void>;
  className?: string;
}

export const IntegrationTestRunner: React.FC<IntegrationTestProps> = ({
  tests,
  onRunTest,
  onRunAll,
  className,
}) => {
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [runningAll, setRunningAll] = useState(false);

  const handleRunTest = async (testId: string) => {
    setRunningTests(prev => new Set(prev).add(testId));
    try {
      await onRunTest?.(testId);
    } finally {
      setRunningTests(prev => {
        const next = new Set(prev);
        next.delete(testId);
        return next;
      });
    }
  };

  const handleRunAll = async () => {
    setRunningAll(true);
    try {
      await onRunAll?.();
    } finally {
      setRunningAll(false);
    }
  };

  const getTestStatusIcon = (status: string, isRunning: boolean) => {
    if (isRunning) {
      return <div className="animate-spin"><Icons.Settings className="h-4 w-4 text-primary-600" /></div>;
    }

    switch (status) {
      case 'passed':
        return <Icons.CheckCircle className="h-4 w-4 text-success-600" />;
      case 'failed':
        return <Icons.XCircle className="h-4 w-4 text-danger-600" />;
      case 'pending':
        return <Icons.Clock className="h-4 w-4 text-neutral-600" />;
      default:
        return <Icons.Settings className="h-4 w-4 text-neutral-600" />;
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Integration Tests
          </h3>
          <div className="flex items-center space-x-4 mt-1 text-sm text-neutral-600">
            <span>{passedTests} passed</span>
            <span>{failedTests} failed</span>
            <span>{tests.length - passedTests - failedTests} pending</span>
          </div>
        </div>

        <button
          onClick={handleRunAll}
          disabled={runningAll}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {runningAll ? (
            <div className="animate-spin">
              <Icons.Settings className="h-4 w-4" />
            </div>
          ) : (
            <Icons.PlayCircle className="h-4 w-4" />
          )}
          <span>Run All Tests</span>
        </button>
      </div>

      <div className="space-y-3">
        {tests.map((test) => {
          const isRunning = runningTests.has(test.id);

          return (
            <div
              key={test.id}
              className="flex items-start justify-between p-4 border border-neutral-200 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                {getTestStatusIcon(test.status, isRunning)}

                <div>
                  <h4 className="font-medium text-neutral-900">{test.name}</h4>
                  <p className="text-sm text-neutral-600">{test.description}</p>

                  {test.duration && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Duration: {test.duration}ms
                    </p>
                  )}

                  {test.error && (
                    <p className="text-xs text-danger-600 mt-1 font-mono">
                      {test.error}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleRunTest(test.id)}
                disabled={isRunning}
                className="px-3 py-1.5 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 transition-colors"
              >
                {isRunning ? 'Running...' : 'Run'}
              </button>
            </div>
          );
        })}
      </div>

      {tests.length === 0 && (
        <div className="text-center py-8">
          <Icons.CheckCircle className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
          <p className="text-neutral-500">No integration tests configured</p>
        </div>
      )}
    </div>
  );
};

export default APIStatusMonitor;