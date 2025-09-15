/**
 * QuickStatsGrid Component - Enterprise Grade
 * Responsive grid layout for worker dashboard statistics
 * Following Klynaa design system and modularity patterns
 */

import React from 'react';
import {
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StatCard, StatCardWithProgress } from './StatCard';
import { WorkerStats } from '../../types';
import styles from './QuickStatsGrid.module.css';

export interface QuickStatsGridProps {
  stats: WorkerStats | null;
  isLoading?: boolean;
  className?: string;
  onStatClick?: (statType: 'earnings' | 'pending' | 'completed' | 'rating') => void;
}

/**
 * Error Boundary for Stats Grid
 */
class StatsErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('StatsGrid Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className={styles.errorBoundary}>
          <ExclamationTriangleIcon className={styles.errorIcon} />
          <h3 className={styles.errorTitle}>Unable to load statistics</h3>
          <p className={styles.errorMessage}>Please refresh the page or try again later.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Format currency value for display
 */
const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString()} XAF`;
};

/**
 * Calculate weekly earnings trend
 */
const calculateEarningsTrend = (current: number, previous?: number) => {
  if (!previous || previous === 0) return null;

  const percentChange = ((current - previous) / previous) * 100;
  const direction = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable';

  return {
    value: `${Math.abs(percentChange).toFixed(1)}%`,
    direction,
    label: 'vs last week'
  } as const;
};

/**
 * Calculate completion rate and trend
 */
const calculateCompletionStats = (stats: WorkerStats) => {
  const completedThisWeek = stats.completed_this_week || 0;
  const weeklyGoal = 20; // Default weekly goal

  return {
    current: completedThisWeek,
    target: weeklyGoal,
    trend: completedThisWeek >= weeklyGoal ? 'up' : 'stable'
  };
};

/**
 * Main QuickStatsGrid Component
 */
export const QuickStatsGrid: React.FC<QuickStatsGridProps> = ({
  stats,
  isLoading = false,
  className = '',
  onStatClick
}) => {
  // Handle loading state
  if (isLoading || !stats) {
    return (
      <div className={`${styles.statsGrid} ${className}`}>
        {[...Array(4)].map((_, index) => (
          <StatCard
            key={`skeleton-${index}`}
            title=""
            value=""
            icon={CurrencyDollarIcon}
            colorScheme="neutral"
            isLoading={true}
            data-testid={`stat-skeleton-${index}`}
          />
        ))}
      </div>
    );
  }

  // Calculate derived values
  const weeklyEarnings = stats.earnings_week || 0;
  const monthlyEarnings = stats.earnings_month || 0;
  const previousWeekEarnings = monthlyEarnings - weeklyEarnings; // Approximation
  const earningsTrend = calculateEarningsTrend(weeklyEarnings, previousWeekEarnings);

  const completionStats = calculateCompletionStats(stats);
  const averageRating = stats.avg_rating || stats.rating || 0;
  const pendingPickups = stats.pending_pickups || 0;

  return (
    <StatsErrorBoundary>
      <div className={`${styles.statsGrid} ${className}`}>

        {/* Total Earnings Card */}
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats.total_earnings || 0)}
          subtitle="This month"
          icon={CurrencyDollarIcon}
          colorScheme="ecoGreen"
          trend={earningsTrend || undefined}
          onClick={() => onStatClick?.('earnings')}
          data-testid="stat-earnings"
          className="hover:border-green-300"
        />

        {/* Pending Pickups Card */}
        <StatCard
          title="Pending Pickups"
          value={pendingPickups}
          subtitle={pendingPickups === 1 ? "pickup waiting" : "pickups waiting"}
          icon={ClockIcon}
          colorScheme={pendingPickups > 5 ? 'warning' : 'skyBlue'}
          trend={pendingPickups > 0 ? {
            value: `${pendingPickups} active`,
            direction: 'stable' as const,
            label: 'in queue'
          } : undefined}
          onClick={() => onStatClick?.('pending')}
          data-testid="stat-pending"
          className="hover:border-blue-300"
        />

        {/* Completed Pickups with Progress */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <StatCardWithProgress
            title="Completed Pickups"
            current={completionStats.current}
            target={completionStats.target}
            unit="pickups"
            icon={CheckCircleIcon}
            colorScheme="ecoGreen"
            trend={{
              value: `${((completionStats.current / completionStats.target) * 100).toFixed(0)}%`,
              direction: 'up' as const,
              label: 'of weekly goal'
            }}
            onClick={() => onStatClick?.('completed')}
            data-testid="stat-completed"
            className="hover:border-green-300"
            showProgress={true}
          />
        </div>

        {/* Average Rating Card */}
        <StatCard
          title="Average Rating"
          value={`${averageRating.toFixed(1)} ⭐`}
          subtitle={`Based on ${stats.total_pickups || 0} pickups`}
          icon={StarIcon}
          colorScheme={averageRating >= 4.5 ? 'ecoGreen' : averageRating >= 4.0 ? 'warning' : 'error'}
          trend={averageRating >= 4.5 ? {
            value: 'Excellent',
            direction: 'up' as const,
            label: 'rating'
          } : averageRating >= 4.0 ? {
            value: 'Good',
            direction: 'stable' as const,
            label: 'rating'
          } : {
            value: 'Needs improvement',
            direction: 'down' as const,
            label: ''
          }}
          onClick={() => onStatClick?.('rating')}
          data-testid="stat-rating"
          className="hover:border-yellow-300"
        />
      </div>
    </StatsErrorBoundary>
  );
};

/**
 * Quick Stats Container with Title and Actions
 */
export interface QuickStatsContainerProps extends QuickStatsGridProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  refreshAction?: () => void;
  lastUpdated?: Date;
}

export const QuickStatsContainer: React.FC<QuickStatsContainerProps> = ({
  title = "Quick Stats & Overview",
  subtitle = "Your performance at a glance",
  actions,
  refreshAction,
  lastUpdated,
  ...gridProps
}) => {
  return (
    <section className="mb-8" data-testid="quick-stats-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Last Updated */}
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          {/* Refresh Button */}
          {refreshAction && (
            <button
              onClick={refreshAction}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh stats"
              data-testid="refresh-stats"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {/* Custom Actions */}
          {actions}
        </div>
      </div>

      {/* Stats Grid */}
      <QuickStatsGrid {...gridProps} />
    </section>
  );
};

export default QuickStatsGrid;