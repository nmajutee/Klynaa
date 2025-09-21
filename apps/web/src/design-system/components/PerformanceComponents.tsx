import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Types
export interface VirtualScrollItem {
  id: string | number;
  height?: number;
  data: any;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  networkRequests: number;
  cacheHitRate: number;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'performance' | 'memory' | 'network' | 'bundle';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: string;
  fix?: string;
}

// Virtual Scrolling Component
export interface VirtualScrollProps {
  items: VirtualScrollItem[];
  itemHeight?: number;
  containerHeight: number;
  renderItem: (item: VirtualScrollItem, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export const VirtualScroll: React.FC<VirtualScrollProps> = ({
  items,
  itemHeight = 50,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { visibleStartIndex, visibleStopIndex, totalHeight } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      visibleStartIndex: startIndex,
      visibleStopIndex: endIndex,
      totalHeight: items.length * itemHeight,
    };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleStartIndex, visibleStopIndex + 1);
  }, [items, visibleStartIndex, visibleStopIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn('relative overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${visibleStartIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              style={{
                height: item.height || itemHeight,
                overflow: 'hidden',
              }}
            >
              {renderItem(item, visibleStartIndex + index)}
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling indicator */}
      {isScrolling && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-neutral-900 bg-opacity-75 text-white text-xs rounded">
          Scrolling...
        </div>
      )}
    </div>
  );
};

// Lazy Loading Wrapper
export interface LazyLoadProps {
  children: React.ReactNode;
  height?: number;
  offset?: number;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  height = 200,
  offset = 100,
  placeholder,
  onLoad,
  fallback,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasLoaded(true);
            onLoad?.();
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: `${offset}px`,
        threshold: 0,
      }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [offset, onLoad]);

  const handleError = (error: Error) => {
    setError(error);
  };

  if (error) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        {fallback || (
          <div className="text-center">
            <Icons.AlertTriangle className="h-8 w-8 mx-auto mb-2 text-danger-600" />
            <p className="text-sm text-danger-600">Failed to load content</p>
            <button
              onClick={() => {
                setError(null);
                setHasLoaded(false);
                setIsVisible(false);
              }}
              className="mt-2 text-xs text-primary-600 hover:text-primary-700"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={cn('min-h-0', className)}
      style={{ minHeight: !isVisible ? height : undefined }}
    >
      {!isVisible ? (
        <div className="flex items-center justify-center" style={{ height }}>
          {placeholder || (
            <div className="animate-pulse bg-neutral-200 rounded w-full h-full" />
          )}
        </div>
      ) : (
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center" style={{ height }}>
              <div className="animate-spin">
                <Icons.Settings className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          }
        >
          <ErrorBoundary onError={handleError}>
            {children}
          </ErrorBoundary>
        </React.Suspense>
      )}
    </div>
  );
};

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center p-4">
          <Icons.AlertTriangle className="h-8 w-8 mx-auto mb-2 text-danger-600" />
          <p className="text-sm text-danger-600">Something went wrong</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance Monitor
export interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  suggestions: OptimizationSuggestion[];
  onOptimize?: (suggestionId: string) => void;
  showDetails?: boolean;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  metrics,
  suggestions,
  onOptimize,
  showDetails = false,
  className,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<keyof PerformanceMetrics | null>(null);

  const getMetricColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-success-600 bg-success-100';
    if (value <= thresholds.poor) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  const metricConfigs = {
    fps: { label: 'FPS', unit: '', thresholds: { good: 45, poor: 30 } },
    memoryUsage: { label: 'Memory', unit: 'MB', thresholds: { good: 50, poor: 100 } },
    loadTime: { label: 'Load Time', unit: 'ms', thresholds: { good: 1000, poor: 3000 } },
    renderTime: { label: 'Render Time', unit: 'ms', thresholds: { good: 16, poor: 50 } },
    bundleSize: { label: 'Bundle Size', unit: 'KB', thresholds: { good: 200, poor: 500 } },
    networkRequests: { label: 'Network Requests', unit: '', thresholds: { good: 10, poor: 25 } },
    cacheHitRate: { label: 'Cache Hit Rate', unit: '%', thresholds: { good: 90, poor: 70 } },
  };

  const getSeverityColor = (severity: OptimizationSuggestion['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-danger-600 bg-danger-100';
      case 'medium':
        return 'text-warning-600 bg-warning-100';
      case 'low':
        return 'text-neutral-600 bg-neutral-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">
          Performance Monitor
        </h3>

        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
          <span className="text-xs text-success-600">Live</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {Object.entries(metrics).map(([key, value]) => {
          const config = metricConfigs[key as keyof PerformanceMetrics];
          const isSelected = selectedMetric === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedMetric(isSelected ? null : key as keyof PerformanceMetrics)}
              className={cn(
                'p-3 rounded-lg border transition-all',
                isSelected
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <div className={cn(
                'text-center p-2 rounded-full mb-2 mx-auto w-fit',
                getMetricColor(value, config.thresholds)
              )}>
                <span className="text-lg font-bold">
                  {typeof value === 'number' ? value.toFixed(0) : value}
                  <span className="text-xs ml-1">{config.unit}</span>
                </span>
              </div>
              <p className="text-xs text-neutral-600">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Metric Details */}
      {selectedMetric && showDetails && (
        <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
          <h4 className="font-medium text-neutral-900 mb-2">
            {metricConfigs[selectedMetric].label} Details
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-neutral-600">Current:</span>
              <span className="ml-2 font-medium">
                {metrics[selectedMetric]} {metricConfigs[selectedMetric].unit}
              </span>
            </div>
            <div>
              <span className="text-neutral-600">Good:</span>
              <span className="ml-2 font-medium text-success-600">
                ≤ {metricConfigs[selectedMetric].thresholds.good} {metricConfigs[selectedMetric].unit}
              </span>
            </div>
            <div>
              <span className="text-neutral-600">Poor:</span>
              <span className="ml-2 font-medium text-danger-600">
                {'>'} {metricConfigs[selectedMetric].thresholds.poor} {metricConfigs[selectedMetric].unit}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h4 className="font-medium text-neutral-900 mb-4">
            Optimization Suggestions ({suggestions.length})
          </h4>

          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 border border-neutral-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="font-medium text-neutral-900">
                        {suggestion.title}
                      </h5>

                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium uppercase',
                        getSeverityColor(suggestion.severity)
                      )}>
                        {suggestion.severity}
                      </span>

                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-xs rounded">
                        {suggestion.type}
                      </span>
                    </div>

                    <p className="text-sm text-neutral-600 mb-2">
                      {suggestion.description}
                    </p>

                    <p className="text-xs text-success-600">
                      Impact: {suggestion.impact}
                    </p>

                    {suggestion.fix && (
                      <p className="text-xs text-neutral-500 mt-1 font-mono">
                        Fix: {suggestion.fix}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onOptimize?.(suggestion.id)}
                    className="ml-4 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Optimize
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Resource Usage Indicator
export interface ResourceUsageProps {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResourceUsage: React.FC<ResourceUsageProps> = ({
  cpu,
  memory,
  network,
  storage,
  showLabels = true,
  size = 'md',
  className,
}) => {
  const resources = [
    { label: 'CPU', value: cpu, color: '#3B82F6', icon: Icons.Settings },
    { label: 'Memory', value: memory, color: '#10B981', icon: Icons.Settings },
    { label: 'Network', value: network, color: '#F59E0B', icon: Icons.Settings },
    { label: 'Storage', value: storage, color: '#8B5CF6', icon: Icons.Settings },
  ];

  const sizeConfig = {
    sm: { height: 'h-2', width: 'w-24', textSize: 'text-xs' },
    md: { height: 'h-3', width: 'w-32', textSize: 'text-sm' },
    lg: { height: 'h-4', width: 'w-40', textSize: 'text-base' },
  };

  const config = sizeConfig[size];

  const getUsageColor = (value: number) => {
    if (value <= 50) return 'bg-success-500';
    if (value <= 80) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {resources.map((resource) => {
        const IconComponent = resource.icon;

        return (
          <div key={resource.label} className="flex items-center space-x-3">
            {showLabels && (
              <>
                <IconComponent className="h-4 w-4 text-neutral-600 flex-shrink-0" />
                <span className={cn('w-16 text-neutral-700', config.textSize)}>
                  {resource.label}
                </span>
              </>
            )}

            <div className={cn('flex-1 bg-neutral-200 rounded-full', config.height)}>
              <div
                className={cn(
                  'rounded-full transition-all duration-300',
                  config.height,
                  getUsageColor(resource.value)
                )}
                style={{ width: `${Math.min(resource.value, 100)}%` }}
              />
            </div>

            {showLabels && (
              <span className={cn('w-10 text-right text-neutral-600', config.textSize)}>
                {resource.value}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Bundle Analyzer
export interface BundleAnalyzerProps {
  bundles: Array<{
    name: string;
    size: number;
    gzipSize: number;
    modules: number;
    type: 'main' | 'chunk' | 'vendor';
  }>;
  onAnalyze?: () => void;
  className?: string;
}

export const BundleAnalyzer: React.FC<BundleAnalyzerProps> = ({
  bundles,
  onAnalyze,
  className,
}) => {
  const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
  const totalGzipSize = bundles.reduce((sum, bundle) => sum + bundle.gzipSize, 0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main':
        return 'bg-primary-100 text-primary-800';
      case 'vendor':
        return 'bg-warning-100 text-warning-800';
      case 'chunk':
        return 'bg-neutral-100 text-neutral-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getSizeColor = (size: number) => {
    if (size > 500 * 1024) return 'text-danger-600'; // > 500KB
    if (size > 200 * 1024) return 'text-warning-600'; // > 200KB
    return 'text-success-600';
  };

  return (
    <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Bundle Analysis
          </h3>
          <div className="flex items-center space-x-4 mt-1 text-sm text-neutral-600">
            <span>Total: {formatSize(totalSize)}</span>
            <span>Gzipped: {formatSize(totalGzipSize)}</span>
            <span>{bundles.length} bundles</span>
          </div>
        </div>

        <button
          onClick={onAnalyze}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Re-analyze
        </button>
      </div>

      <div className="space-y-3">
        {bundles
          .sort((a, b) => b.size - a.size)
          .map((bundle) => {
            const sizePercentage = (bundle.size / totalSize) * 100;

            return (
              <div
                key={bundle.name}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-neutral-900">
                        {bundle.name}
                      </h4>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        getTypeColor(bundle.type)
                      )}>
                        {bundle.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-neutral-600">
                      <span>{bundle.modules} modules</span>
                      <span>{sizePercentage.toFixed(1)}% of total</span>
                    </div>
                  </div>

                  {/* Size bar */}
                  <div className="flex-1 max-w-48">
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${sizePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={cn('font-medium', getSizeColor(bundle.size))}>
                    {formatSize(bundle.size)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {formatSize(bundle.gzipSize)} gzipped
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {bundles.length === 0 && (
        <div className="text-center py-8">
          <Icons.Settings className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
          <p className="text-neutral-500">No bundle data available</p>
        </div>
      )}
    </div>
  );
};

export default VirtualScroll;