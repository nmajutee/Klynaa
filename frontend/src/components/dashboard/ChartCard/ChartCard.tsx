import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import CardContainer from '../../layout/CardContainer/CardContainer';
import { TrendingChartData, RatingAgenciesChartData } from '../../../types/dashboard';
import styles from './ChartCard.module.css';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: any;
  type: 'line' | 'bar' | 'area';
  height?: number;
  loading?: boolean;
  className?: string;
}

/**
 * ChartCard - Generic wrapper for all chart types
 * Supports line charts, bar charts, and area charts with Recharts
 */
export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  data,
  type,
  height = 300,
  loading = false,
  className = ''
}) => {
  const renderChart = () => {
    if (!data) return null;

    switch (type) {
      case 'line':
        return <TrendingLineChart data={data} height={height} />;
      case 'bar':
        return <RatingBarChart data={data} height={height} />;
      case 'area':
        return <TrendingLineChart data={data} height={height} area={true} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <CardContainer
      title={title}
      subtitle={subtitle}
      loading={loading}
      className={`${styles.chartCard} ${className}`}
    >
      <div className={styles.chartContainer}>
        {renderChart()}
      </div>
    </CardContainer>
  );
};

/**
 * Trending Line Chart Component
 */
interface TrendingLineChartProps {
  data: TrendingChartData;
  height: number;
  area?: boolean;
}

const TrendingLineChart: React.FC<TrendingLineChartProps> = ({ data, height, area = false }) => {
  // Transform data for Recharts format
  const chartData = data.labels.map((label, index) => {
    const point: any = { date: label };
    data.series.forEach(series => {
      point[series.key] = series.points[index];
    });
    return point;
  });

  const colors = ['#16A34A', '#1E88E5', '#7C3AED', '#F59E0B', '#DC2626'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid var(--neutral-200)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)'
          }}
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <Legend />
        {data.series.map((series, index) => (
          <Line
            key={series.key}
            type="monotone"
            dataKey={series.key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name={series.label}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Rating Agencies Bar Chart Component
 */
interface RatingBarChartProps {
  data: RatingAgenciesChartData;
  height: number;
}

const RatingBarChart: React.FC<RatingBarChartProps> = ({ data, height }) => {
  // Transform data for Recharts format
  const chartData = data.labels.map((label, index) => {
    const point: any = { agency: label };
    data.series.forEach(series => {
      point[series.label] = series.values[index];
    });
    return point;
  });

  const colors = ['#16A34A', '#1E88E5', '#7C3AED'];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
        <XAxis 
          dataKey="agency" 
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid var(--neutral-200)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)'
          }}
        />
        <Legend />
        {data.series.map((series, index) => (
          <Bar
            key={series.label}
            dataKey={series.label}
            fill={colors[index % colors.length]}
            name={series.label}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ChartCard;