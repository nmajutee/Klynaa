/**
 * StatCard Component
 * Reusable statistics card with trend indicators and responsive design
 */

import React from 'react';
import {
  HomeIcon,
  TruckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import styles from './StatCard.module.css';

// Icon mapping for type safety
const iconMap = {
  home: HomeIcon,
  truck: TruckIcon,
  chart: ChartBarIcon,
  currency: CurrencyDollarIcon,
  star: StarIcon,
  clock: ClockIcon,
  check: CheckCircleIcon,
  map: MapIcon,
} as const;

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof iconMap;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  trend,
  loading = false,
  onClick,
  className = '',
}) => {
  const Icon = iconMap[icon];

  if (loading) {
    return (
      <div className={`${styles.statCard} ${styles.loading} ${className}`}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSkeleton}></div>
          <div className={styles.loadingText}>
            <div className={styles.loadingLine}></div>
            <div className={styles.loadingLine}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.statCard} ${styles[variant]} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <div className={`${styles.iconWrapper} ${styles[`icon-${variant}`]}`}>
            <Icon className={styles.icon} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.header}>
            <dt className={styles.title}>{title}</dt>
            <dd className={styles.valueContainer}>
              <div className={styles.value}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              {trend && (
                <div className={`${styles.trend} ${trend.isPositive ? styles.trendPositive : styles.trendNegative}`}>
                  <span className={styles.trendIndicator}>
                    {trend.isPositive ? '+' : ''}
                  </span>
                  {trend.value}
                </div>
              )}
            </dd>
            {subtitle && (
              <dd className={styles.subtitle}>{subtitle}</dd>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};