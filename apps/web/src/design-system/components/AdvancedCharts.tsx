import React, { useState, useEffect, useMemo, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesDataPoint {
  date: Date | string;
  value: number;
  label?: string;
  color?: string;
}

export interface WasteMetrics {
  totalWaste: number;
  recyclable: number;
  organic: number;
  hazardous: number;
  period: 'day' | 'week' | 'month' | 'year';
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
}

export interface RecyclingData {
  category: string;
  collected: number;
  processed: number;
  recycled: number;
  color: string;
}

// Waste Analytics Dashboard
export interface WasteAnalyticsDashboardProps {
  metrics: WasteMetrics;
  recyclingData: RecyclingData[];
  pickupData: TimeSeriesDataPoint[];
  environmentalImpact: {
    carbonSaved: number;
    treesEquivalent: number;
    waterSaved: number;
  };
  className?: string;
}

export const WasteAnalyticsDashboard: React.FC<WasteAnalyticsDashboardProps> = ({
  metrics,
  recyclingData,
  pickupData,
  environmentalImpact,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Waste</p>
              <p className="text-2xl font-bold text-neutral-900">
                {metrics.totalWaste.toLocaleString()} kg
              </p>
            </div>
            <div className="p-3 bg-neutral-100 rounded-full">
              <Icons.Settings className="h-6 w-6 text-neutral-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {metrics.trend === 'up' ? (
              <Icons.ChevronUp className="h-4 w-4 text-danger-600 mr-1" />
            ) : metrics.trend === 'down' ? (
              <Icons.ChevronDown className="h-4 w-4 text-success-600 mr-1" />
            ) : (
              <Icons.Settings className="h-4 w-4 text-neutral-600 mr-1" />
            )}
            <span className={cn(
              'text-sm',
              metrics.trend === 'up' ? 'text-danger-600' :
              metrics.trend === 'down' ? 'text-success-600' : 'text-neutral-600'
            )}>
              {metrics.percentageChange}% from last {metrics.period}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Recyclable</p>
              <p className="text-2xl font-bold text-success-600">
                {metrics.recyclable.toLocaleString()} kg
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-full">
              <Icons.CheckCircle className="h-6 w-6 text-success-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-neutral-600">
              {Math.round((metrics.recyclable / metrics.totalWaste) * 100)}% of total
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Organic</p>
              <p className="text-2xl font-bold text-warning-600">
                {metrics.organic.toLocaleString()} kg
              </p>
            </div>
            <div className="p-3 bg-warning-100 rounded-full">
              <Icons.Settings className="h-6 w-6 text-warning-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-neutral-600">
              {Math.round((metrics.organic / metrics.totalWaste) * 100)}% of total
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Hazardous</p>
              <p className="text-2xl font-bold text-danger-600">
                {metrics.hazardous.toLocaleString()} kg
              </p>
            </div>
            <div className="p-3 bg-danger-100 rounded-full">
              <Icons.AlertTriangle className="h-6 w-6 text-danger-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-neutral-600">
              {Math.round((metrics.hazardous / metrics.totalWaste) * 100)}% of total
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Composition Chart */}
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Waste Composition
          </h3>
          <WasteCompositionChart data={[
            { label: 'Recyclable', value: metrics.recyclable, color: '#10B981' },
            { label: 'Organic', value: metrics.organic, color: '#F59E0B' },
            { label: 'Hazardous', value: metrics.hazardous, color: '#EF4444' },
            { label: 'General', value: metrics.totalWaste - metrics.recyclable - metrics.organic - metrics.hazardous, color: '#6B7280' },
          ]} />
        </div>

        {/* Pickup Trends */}
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Pickup Trends
          </h3>
          <PickupTrendsChart data={pickupData} />
        </div>
      </div>

      {/* Recycling Progress */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Recycling Progress
        </h3>
        <RecyclingProgressChart data={recyclingData} />
      </div>

      {/* Environmental Impact */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Environmental Impact
        </h3>
        <EnvironmentalImpactChart impact={environmentalImpact} />
      </div>
    </div>
  );
};

// Waste Composition Donut Chart
export interface WasteCompositionChartProps {
  data: ChartDataPoint[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export const WasteCompositionChart: React.FC<WasteCompositionChartProps> = ({
  data,
  size = 'md',
  showLabels = true,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const sizeConfig = {
    sm: { width: 200, height: 200, strokeWidth: 20 },
    md: { width: 300, height: 300, strokeWidth: 30 },
    lg: { width: 400, height: 400, strokeWidth: 40 },
  };

  const config = sizeConfig[size];
  const radius = (Math.min(config.width, config.height) - config.strokeWidth) / 2;
  const centerX = config.width / 2;
  const centerY = config.height / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, config.width, config.height);

    let currentAngle = -Math.PI / 2; // Start from top

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineWidth = config.strokeWidth;
      ctx.strokeStyle = item.color || '#6B7280';
      ctx.lineCap = 'round';

      // Highlight hovered segment
      if (hoveredSegment === index) {
        ctx.lineWidth = config.strokeWidth + 4;
        ctx.globalAlpha = 0.8;
      } else {
        ctx.globalAlpha = 1;
      }

      ctx.stroke();

      currentAngle += sliceAngle;
    });

    // Draw center circle (donut hole)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - config.strokeWidth / 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Draw total in center
    ctx.fillStyle = '#111827';
    ctx.font = `bold ${config.strokeWidth / 2}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${total.toLocaleString()} kg`, centerX, centerY);
  }, [data, total, hoveredSegment, config, centerX, centerY, radius]);

  return (
    <div className={cn('flex items-center space-x-6', className)}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={config.width}
          height={config.height}
          className="cursor-pointer"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left - centerX;
            const y = e.clientY - rect.top - centerY;
            const distance = Math.sqrt(x * x + y * y);

            if (distance >= radius - config.strokeWidth && distance <= radius) {
              const angle = Math.atan2(y, x) + Math.PI / 2;
              const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

              let currentAngle = 0;
              let foundIndex = -1;

              for (let i = 0; i < data.length; i++) {
                const sliceAngle = (data[i].value / total) * 2 * Math.PI;
                if (normalizedAngle >= currentAngle && normalizedAngle < currentAngle + sliceAngle) {
                  foundIndex = i;
                  break;
                }
                currentAngle += sliceAngle;
              }

              setHoveredSegment(foundIndex);
            } else {
              setHoveredSegment(null);
            }
          }}
          onMouseLeave={() => setHoveredSegment(null)}
        />
      </div>

      {showLabels && (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center space-x-2 cursor-pointer transition-opacity',
                hoveredSegment !== null && hoveredSegment !== index ? 'opacity-50' : ''
              )}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <p className="text-sm font-medium text-neutral-900">{item.label}</p>
                <p className="text-xs text-neutral-600">
                  {item.value.toLocaleString()} kg ({Math.round((item.value / total) * 100)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Pickup Trends Line Chart
export interface PickupTrendsChartProps {
  data: TimeSeriesDataPoint[];
  height?: number;
  className?: string;
}

export const PickupTrendsChart: React.FC<PickupTrendsChartProps> = ({
  data,
  height = 200,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    data: TimeSeriesDataPoint;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 40;
    const width = canvas.width;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min/max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    const stepX = chartWidth / (data.length - 1);
    for (let i = 0; i < data.length; i++) {
      const x = padding + stepX * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Draw line
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + (1 - (point.value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#3B82F6';
    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + (1 - (point.value - minValue) / valueRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      const value = maxValue - (valueRange / 5) * i;
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    data.forEach((point, index) => {
      if (index % Math.ceil(data.length / 5) === 0) {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const date = new Date(point.date);
        const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        ctx.fillText(label, x, height - padding + 20);
      }
    });
  }, [data, height]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;

    if (x >= padding && x <= canvas.width - padding && y >= padding && y <= height - padding) {
      const dataIndex = Math.round(((x - padding) / chartWidth) * (data.length - 1));
      const point = data[dataIndex];

      if (point) {
        setTooltip({
          show: true,
          x: e.clientX,
          y: e.clientY,
          data: point,
        });
      }
    } else {
      setTooltip(null);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        className="w-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />

      {tooltip && (
        <div
          className="absolute z-50 p-2 bg-neutral-900 text-white text-xs rounded shadow-lg pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 40,
          }}
        >
          <div className="font-medium">
            {new Date(tooltip.data.date).toLocaleDateString()}
          </div>
          <div>{tooltip.data.value.toLocaleString()} kg</div>
        </div>
      )}
    </div>
  );
};

// Recycling Progress Bar Chart
export interface RecyclingProgressChartProps {
  data: RecyclingData[];
  className?: string;
}

export const RecyclingProgressChart: React.FC<RecyclingProgressChartProps> = ({
  data,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {data.map((category) => {
        const collectedPercentage = (category.collected / category.collected) * 100;
        const processedPercentage = (category.processed / category.collected) * 100;
        const recycledPercentage = (category.recycled / category.collected) * 100;

        return (
          <div key={category.category} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-neutral-900">
                {category.category}
              </h4>
              <div className="text-xs text-neutral-600">
                {category.collected} kg collected
              </div>
            </div>

            <div className="relative h-6 bg-neutral-100 rounded-full overflow-hidden">
              {/* Collected (base) */}
              <div
                className="absolute top-0 left-0 h-full transition-all duration-500 opacity-30"
                style={{
                  width: `${collectedPercentage}%`,
                  backgroundColor: category.color,
                }}
              />

              {/* Processed */}
              <div
                className="absolute top-0 left-0 h-full transition-all duration-500 opacity-60"
                style={{
                  width: `${processedPercentage}%`,
                  backgroundColor: category.color,
                }}
              />

              {/* Recycled */}
              <div
                className="absolute top-0 left-0 h-full transition-all duration-500"
                style={{
                  width: `${recycledPercentage}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-neutral-600">
              <span>Processed: {category.processed} kg ({Math.round(processedPercentage)}%)</span>
              <span>Recycled: {category.recycled} kg ({Math.round(recycledPercentage)}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Environmental Impact Visualization
export interface EnvironmentalImpactChartProps {
  impact: {
    carbonSaved: number;
    treesEquivalent: number;
    waterSaved: number;
  };
  className?: string;
}

export const EnvironmentalImpactChart: React.FC<EnvironmentalImpactChartProps> = ({
  impact,
  className,
}) => {
  const impactMetrics = [
    {
      label: 'Carbon Saved',
      value: impact.carbonSaved,
      unit: 'kg CO₂',
      icon: Icons.Settings,
      color: 'success',
      description: 'Equivalent to driving 0 km less',
    },
    {
      label: 'Trees Equivalent',
      value: impact.treesEquivalent,
      unit: 'trees',
      icon: Icons.Settings,
      color: 'success',
      description: 'Trees needed to offset this carbon',
    },
    {
      label: 'Water Saved',
      value: impact.waterSaved,
      unit: 'liters',
      icon: Icons.Settings,
      color: 'primary',
      description: 'Through recycling processes',
    },
  ];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-6', className)}>
      {impactMetrics.map((metric) => {
        const IconComponent = metric.icon;
        const colorClasses = {
          success: 'text-success-600 bg-success-100',
          primary: 'text-primary-600 bg-primary-100',
          warning: 'text-warning-600 bg-warning-100',
        };

        return (
          <div key={metric.label} className="text-center">
            <div className={cn(
              'inline-flex p-4 rounded-full mb-4',
              colorClasses[metric.color as keyof typeof colorClasses]
            )}>
              <IconComponent className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-bold text-neutral-900">
                {metric.value.toLocaleString()}
                <span className="text-base font-normal text-neutral-600 ml-1">
                  {metric.unit}
                </span>
              </p>
              <p className="text-sm font-medium text-neutral-700">
                {metric.label}
              </p>
              <p className="text-xs text-neutral-500">
                {metric.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Real-time Metrics Widget
export interface RealTimeMetricsProps {
  metrics: {
    activePickups: number;
    completedToday: number;
    avgResponseTime: number;
    customerSatisfaction: number;
  };
  isLive?: boolean;
  className?: string;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  metrics,
  isLive = true,
  className,
}) => {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isLive]);

  return (
    <div className={cn('bg-white p-6 rounded-lg border border-neutral-200', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">
          Real-time Metrics
        </h3>

        <div className="flex items-center space-x-2">
          {isLive && (
            <>
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-xs text-success-600">Live</span>
            </>
          )}
          <span className="text-xs text-neutral-500">
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-600">
            {metrics.activePickups}
          </p>
          <p className="text-sm text-neutral-600">Active Pickups</p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-success-600">
            {metrics.completedToday}
          </p>
          <p className="text-sm text-neutral-600">Completed Today</p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-warning-600">
            {metrics.avgResponseTime}m
          </p>
          <p className="text-sm text-neutral-600">Avg Response Time</p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-success-600">
            {metrics.customerSatisfaction}%
          </p>
          <p className="text-sm text-neutral-600">Satisfaction</p>
        </div>
      </div>
    </div>
  );
};

export default WasteAnalyticsDashboard;