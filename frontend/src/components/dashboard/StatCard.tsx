/**
 * StatCard Component - Enterprise Grade
 * Modular, reusable statistics card following Klynaa design system
 */

import React from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import styles from './StatCard.module.css';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  colorScheme: 'ecoGreen' | 'skyBlue' | 'warning' | 'error' | 'neutral';
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'stable';
    label?: string;
  };
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
  'data-testid'?: string;
}

/**
 * Trend Indicator Component
 */
const TrendIndicator: React.FC<{ trend: NonNullable<StatCardProps['trend']> }> = ({ trend }) => {
  if (!trend) return null;

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up':
        return <ArrowTrendingUpIcon className={styles.trendIcon} />;
      case 'down':
        return <ArrowTrendingDownIcon className={styles.trendIcon} />;
      default:
        return <MinusIcon className={styles.trendIcon} />;
    }
  };

  const getTrendClass = () => {
    switch (trend.direction) {
      case 'up':
        return styles.trendUp;
      case 'down':
        return styles.trendDown;
      default:
        return styles.trendStable;
    }
  };

  return (
    <div className={styles.trendContainer}>
      <span className={`${styles.trendValue} ${getTrendClass()}`}>
        {getTrendIcon()}
        {trend.value}
      </span>
      {trend.label && (
        <span className={styles.trendLabel}>{trend.label}</span>
      )}
    </div>
  );
};

export interface ProgressBarProps {
  progress: number;
  max: number;
  colorScheme: StatCardProps['colorScheme'];
  size?: 'sm' | 'md';
  showLabels?: boolean;
  className?: string;
}

/**
 * Progress Bar Component - Reusable progress indicator
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  max,
  colorScheme,
  size = 'md',
  showLabels = false,
  className = ''
}) => {
  const percentage = Math.min((progress / max) * 100, 100);

  const getProgressColorClass = () => {
    switch (colorScheme) {
      case 'ecoGreen': return styles.progressEcoGreen;
      case 'skyBlue': return styles.progressSkyBlue;
      case 'warning': return styles.progressWarning;
      case 'error': return styles.progressError;
      default: return styles.progressNeutral;
    }
  };

  const sizeClass = size === 'sm' ? styles.progressBarSm : styles.progressBarMd;

  return (
    <div className={`${styles.progressContainer} ${className}`}>
      {showLabels && (
        <div className={styles.progressLabels}>
          <span>{progress}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={`${styles.progressBar} ${sizeClass}`}>
        <div
          className={`${styles.progressFill} ${getProgressColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Loading Skeleton for StatCard
 */
const StatCardSkeleton: React.FC = () => (
  <div className={styles.skeleton}>
    <div className={styles.skeletonContent}>
      <div className={styles.skeletonIcon}></div>
      <div className={styles.skeletonInfo}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonValue}></div>
        <div className={styles.skeletonSubtitle}></div>
      </div>
    </div>
  </div>
);

/**
 * Main StatCard Component
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  trend,
  isLoading = false,
  className = '',
  onClick,
  'data-testid': testId
}) => {
  const getIconColorClass = () => {
    switch (colorScheme) {
      case 'ecoGreen': return styles.iconEcoGreen;
      case 'skyBlue': return styles.iconSkyBlue;
      case 'warning': return styles.iconWarning;
      case 'error': return styles.iconError;
      default: return styles.iconNeutral;
    }
  };

  const cardClasses = `
    ${styles.statCard}
    ${onClick ? styles.clickable : ''}
    ${className}
  `;

  if (isLoading) {
    return (
      <div className={cardClasses} data-testid={testId}>
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      data-testid={testId}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className={styles.cardContent}>
        <div className={styles.iconContainer}>
          <div className={`${styles.iconBackground} ${getIconColorClass()}`}>
            <Icon className={styles.icon} />
          </div>
        </div>

        <div className={styles.cardInfo}>
          {/* Title */}
          <div className={styles.title}>
            {title}
          </div>

          {/* Value */}
          <div className={styles.valueContainer}>
            <div className={styles.value}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>

            {/* Trend */}
            {trend && (
              <div className={styles.trendContainer}>
                <TrendIndicator trend={trend} />
              </div>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div className={styles.subtitle}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * StatCard with Progress Bar - For completion tracking
 */
export interface StatCardWithProgressProps extends Omit<StatCardProps, 'value'> {
  current: number;
  target: number;
  unit?: string;
  showProgress?: boolean;
}

export const StatCardWithProgress: React.FC<StatCardWithProgressProps> = ({
  current,
  target,
  unit = '',
  showProgress = true,
  ...props
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const displayValue = `${current.toLocaleString()}${unit ? ` ${unit}` : ''}`;

  return (
    <div className={styles.statCardWithProgress}>
      <StatCard
        {...props}
        value={displayValue}
        subtitle={`Goal: ${target.toLocaleString()}${unit ? ` ${unit}` : ''}`}
      />
      {showProgress && (
        <div className={styles.progressSection}>
          <ProgressBar
            progress={current}
            max={target}
            colorScheme={props.colorScheme}
            showLabels={false}
          />
          <div className={styles.progressPercentage}>
            {percentage.toFixed(1)}% of goal
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;