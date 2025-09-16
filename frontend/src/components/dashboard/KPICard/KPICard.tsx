import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { KPICardProps } from '../../../types/dashboard';
import CardContainer from '../../layout/CardContainer';
import styles from './KPICard.module.css';

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  loading = false,
  className = ''
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format large numbers with abbreviations
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toString();
    }
    return val;
  };

  const formatTrendValue = (trendValue: number): string => {
    const abs = Math.abs(trendValue);
    return `${abs}%`;
  };

  return (
    <CardContainer
      loading={loading}
      className={`${styles.kpiCard} ${className}`}
      padding="md"
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            {Icon && (
              <div className={styles.iconWrapper}>
                <Icon className={styles.icon} aria-hidden="true" />
              </div>
            )}
            <h4 className={styles.title}>{title}</h4>
          </div>
        </div>

        <div className={styles.valueSection}>
          <div className={styles.mainValue}>
            {formatValue(value)}
          </div>

          {trend && (
            <div
              className={`${styles.trend} ${trend.isPositive ? styles.trendPositive : styles.trendNegative}`}
              role="img"
              aria-label={`Trend: ${trend.isPositive ? 'up' : 'down'} by ${formatTrendValue(trend.value)}`}
            >
              {trend.isPositive ? (
                <ArrowUpIcon className={styles.trendIcon} aria-hidden="true" />
              ) : (
                <ArrowDownIcon className={styles.trendIcon} aria-hidden="true" />
              )}
              <span className={styles.trendValue}>
                {formatTrendValue(trend.value)}
              </span>
            </div>
          )}
        </div>

        {(subtitle || trend?.label) && (
          <div className={styles.footer}>
            {subtitle && (
              <p className={styles.subtitle}>
                {subtitle}
              </p>
            )}
            {trend?.label && (
              <p className={styles.trendLabel}>
                {trend.label}
              </p>
            )}
          </div>
        )}
      </div>
    </CardContainer>
  );
};

export default KPICard;