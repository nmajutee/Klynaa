import React, { useState, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';
import { Button } from './Button';
import { Text } from './Typography';
import { Card } from './Card';

// Chart Container Component
export interface ChartContainerProps {
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  loading = false,
  error = null,
  actions,
  className,
  children,
}) => {
  return (
    <Card className={cn('p-6', className)}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <Text variant="h3" className="mb-1">
                {title}
              </Text>
            )}
            {description && (
              <Text variant="body" color="muted">
                {description}
              </Text>
            )}
          </div>
          {actions && <div className="ml-4">{actions}</div>}
        </div>
      )}

      {error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icons.AlertCircle className="mx-auto h-12 w-12 text-danger-500 mb-4" />
            <Text variant="body" color="danger">
              {error}
            </Text>
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <Icons.Loader className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="relative">{children}</div>
      )}
    </Card>
  );
};

// Simple Bar Chart Component
export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface SimpleBarChartProps {
  data: BarChartData[];
  height?: number;
  showValues?: boolean;
  showGrid?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  height = 300,
  showValues = true,
  showGrid = true,
  orientation = 'vertical',
  className,
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  if (orientation === 'horizontal') {
    return (
      <div className={cn('space-y-4', className)} style={{ height }}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const color = item.color || colors[index % colors.length];

          return (
            <div key={item.label} className="flex items-center space-x-3">
              <div className="w-20 text-right">
                <Text variant="caption" className="text-neutral-600">
                  {item.label}
                </Text>
              </div>
              <div className="flex-1 relative">
                {showGrid && (
                  <div className="absolute inset-0 flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-r border-neutral-200 last:border-r-0"
                      />
                    ))}
                  </div>
                )}
                <div
                  className="h-8 rounded transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                  }}
                />
                {showValues && (
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <Text variant="caption" className="font-medium text-white">
                      {item.value}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-end justify-between space-x-2" style={{ height }}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const color = item.color || colors[index % colors.length];

          return (
            <div key={item.label} className="flex-1 flex flex-col items-center">
              <div className="relative flex-1 flex items-end w-full">
                {showGrid && (
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border-t border-neutral-200" />
                    ))}
                  </div>
                )}
                <div
                  className="w-full rounded-t transition-all duration-500 min-h-[4px]"
                  style={{
                    height: `${percentage}%`,
                    backgroundColor: color,
                  }}
                />
                {showValues && (
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                    <Text variant="caption" className="font-medium text-white">
                      {item.value}
                    </Text>
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <Text variant="caption" className="text-neutral-600">
                  {item.label}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Donut Chart Component
export interface DonutChartData {
  label: string;
  value: number;
  color?: string;
}

export interface SimpleDonutChartProps {
  data: DonutChartData[];
  size?: number;
  innerRadius?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  centerContent?: React.ReactNode;
  className?: string;
}

export const SimpleDonutChart: React.FC<SimpleDonutChartProps> = ({
  data,
  size = 200,
  innerRadius = 60,
  showLegend = true,
  showLabels = false,
  centerContent,
  className,
}) => {
  const radius = (size - 20) / 2;
  const center = size / 2;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  let cumulativeAngle = 0;
  const paths = data.map((item, index) => {
    const angle = (item.value / total) * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const x3 = center + innerRadius * Math.cos(endAngle);
    const y3 = center + innerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(startAngle);
    const y4 = center + innerRadius * Math.sin(startAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    cumulativeAngle += angle;

    return {
      ...item,
      path: pathData,
      color: item.color || colors[index % colors.length],
      percentage: (item.value / total) * 100,
      midAngle: startAngle + angle / 2,
    };
  });

  return (
    <div className={cn('flex items-center space-x-6', className)}>
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {paths.map((path, index) => (
            <g key={index}>
              <path
                d={path.path}
                fill={path.color}
                className="transition-all duration-300 hover:opacity-80"
              />
              {showLabels && path.percentage > 5 && (
                <text
                  x={center + ((radius + innerRadius) / 2) * Math.cos(path.midAngle)}
                  y={center + ((radius + innerRadius) / 2) * Math.sin(path.midAngle)}
                  className="text-xs font-medium fill-white transform rotate-90"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {Math.round(path.percentage)}%
                </text>
              )}
            </g>
          ))}
        </svg>

        {centerContent && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              width: innerRadius * 2,
              height: innerRadius * 2,
              left: center - innerRadius,
              top: center - innerRadius,
            }}
          >
            {centerContent}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="space-y-2">
          {paths.map((path, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: path.color }}
              />
              <div>
                <Text variant="caption" className="font-medium">
                  {path.label}
                </Text>
                <Text variant="caption" color="muted">
                  {path.value} ({Math.round(path.percentage)}%)
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Progress Ring Component
export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  label?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  showValue = true,
  label,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>

      {(showValue || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <Text variant="h3" className="font-bold">
              {Math.round(percentage)}%
            </Text>
          )}
          {label && (
            <Text variant="caption" color="muted" className="text-center">
              {label}
            </Text>
          )}
        </div>
      )}
    </div>
  );
};

// Metric Card Component
export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  icon?: React.ComponentType<any>;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
  className?: string;
}

const metricCardVariants = cva(
  'relative p-6 rounded-lg border transition-all duration-200',
  {
    variants: {
      color: {
        primary: 'bg-primary-50 border-primary-200',
        success: 'bg-success-50 border-success-200',
        warning: 'bg-warning-50 border-warning-200',
        danger: 'bg-danger-50 border-danger-200',
        info: 'bg-info-50 border-info-200',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }
);

export const MetricCard: React.FC<MetricCardProps & VariantProps<typeof metricCardVariants>> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
  loading = false,
  className,
}) => {
  const colorClasses = {
    primary: {
      icon: 'text-primary-600',
      value: 'text-primary-900',
      change: change?.type === 'increase' ? 'text-success-600' : 'text-danger-600',
    },
    success: {
      icon: 'text-success-600',
      value: 'text-success-900',
      change: change?.type === 'increase' ? 'text-success-600' : 'text-danger-600',
    },
    warning: {
      icon: 'text-warning-600',
      value: 'text-warning-900',
      change: change?.type === 'increase' ? 'text-success-600' : 'text-danger-600',
    },
    danger: {
      icon: 'text-danger-600',
      value: 'text-danger-900',
      change: change?.type === 'increase' ? 'text-success-600' : 'text-danger-600',
    },
    info: {
      icon: 'text-info-600',
      value: 'text-info-900',
      change: change?.type === 'increase' ? 'text-success-600' : 'text-danger-600',
    },
  };

  if (loading) {
    return (
      <Card className={cn('p-6 animate-pulse', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-neutral-200 rounded w-24"></div>
          <div className="h-6 w-6 bg-neutral-200 rounded"></div>
        </div>
        <div className="h-8 bg-neutral-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-neutral-200 rounded w-20"></div>
      </Card>
    );
  }

  return (
    <div className={cn(metricCardVariants({ color }), className)}>
      <div className="flex items-center justify-between mb-4">
        <Text variant="body" color="muted" className="font-medium">
          {title}
        </Text>
        {Icon && (
          <Icon className={cn('h-6 w-6', colorClasses[color].icon)} />
        )}
      </div>

      <div className="mb-2">
        <Text variant="h2" className={cn('font-bold', colorClasses[color].value)}>
          {value}
        </Text>
      </div>

      {change && (
        <div className="flex items-center space-x-1">
          {change.type === 'increase' ? (
            <Icons.TrendingUp className={cn('h-4 w-4', colorClasses[color].change)} />
          ) : (
            <Icons.TrendingDown className={cn('h-4 w-4', colorClasses[color].change)} />
          )}
          <Text
            variant="caption"
            className={cn('font-medium', colorClasses[color].change)}
          >
            {Math.abs(change.value)}%
          </Text>
          {change.period && (
            <Text variant="caption" color="muted">
              {change.period}
            </Text>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartContainer;