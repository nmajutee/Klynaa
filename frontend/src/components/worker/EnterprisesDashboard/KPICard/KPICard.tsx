import React from 'react';
import CardContainer from '../../../layout/CardContainer/CardContainer';
import styles from './KPICard.module.css';

interface KPICardProps {
  title: string;
  value: number;
  currency?: string;
  trendPercent?: number;
  subtitle?: string;
  variant: 'earnings' | 'pickups' | 'completed' | 'rating';
  className?: string;
}

const formatValue = (value: number, variant: string, currency?: string): string => {
  switch (variant) {
    case 'earnings':
      return currency ? `${value.toLocaleString()} ${currency}` : value.toLocaleString();
    case 'rating':
      return value.toFixed(1);
    default:
      return value.toLocaleString();
  }
};

const getVariantIcon = (variant: string): string => {
  switch (variant) {
    case 'earnings':
      return '💰';
    case 'pickups':
      return '📋';
    case 'completed':
      return '✅';
    case 'rating':
      return '⭐';
    default:
      return '📊';
  }
};

const getTrendColor = (trendPercent: number): string => {
  if (trendPercent > 0) return 'var(--color-success)';
  if (trendPercent < 0) return 'var(--color-error)';
  return 'var(--color-text-secondary)';
};

const getTrendArrow = (trendPercent: number): string => {
  if (trendPercent > 0) return '↗';
  if (trendPercent < 0) return '↘';
  return '→';
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  currency,
  trendPercent,
  subtitle,
  variant,
  className = '',
}) => {
  const formattedValue = formatValue(value, variant, currency);
  const icon = getVariantIcon(variant);

  return (
    <CardContainer
      className={`${styles.kpiCard} ${styles[variant]} ${className}`}
      loading={false}
    >
      <div className={styles.header}>
        <div className={styles.iconContainer}>
          <span className={styles.icon}>{icon}</span>
        </div>
        <h3 className={styles.title}>{title}</h3>
      </div>

      <div className={styles.content}>
        <div className={styles.valueContainer}>
          <span className={styles.value}>{formattedValue}</span>
          {trendPercent !== undefined && (
            <div
              className={styles.trend}
              style={{ color: getTrendColor(trendPercent) }}
            >
              <span className={styles.trendArrow}>
                {getTrendArrow(trendPercent)}
              </span>
              <span className={styles.trendPercent}>
                {Math.abs(trendPercent).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {subtitle && (
          <p className={styles.subtitle}>{subtitle}</p>
        )}
      </div>
    </CardContainer>
  );
};