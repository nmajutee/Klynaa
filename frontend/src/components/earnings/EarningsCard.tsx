/**
 * EarningsCard Component
 * Reusable card component for displaying earnings information
 */

import React from 'react';
import Card from '../../components/cards/Card';
import styles from './EarningsCard.module.css';
import type { ReactNode } from 'react';

interface EarningsCardProps {
  title: string;
  amount: string;
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({
  title,
  amount,
  icon,
  variant = 'secondary',
  subtitle,
  trend,
  className = '',
}) => {
  const cardVariant = variant === 'primary' ? 'primary' : 'default';
  const textColor = variant === 'primary' ? 'text-white' : 'text-gray-900';
  const subtitleColor = variant === 'primary' ? 'text-white/90' : 'text-gray-600';

  return (
    <Card className={`${styles.earningsCard} ${className}`}>
      <div className={styles.cardContent}>
        <div className={styles.iconContainer}>
          {icon}
        </div>

        <div className={styles.textContent}>
          <p className={`${styles.title} ${subtitleColor}`}>
            {title}
          </p>

          <p className={`${styles.amount} ${textColor}`}>
            {amount}
          </p>

          {subtitle && (
            <p className={`${styles.subtitle} ${subtitleColor}`}>
              {subtitle}
            </p>
          )}

          {trend && (
            <div className={`${styles.trend} ${trend.isPositive ? styles.trendPositive : styles.trendNegative}`}>
              <span className={styles.trendIcon}>
                {trend.isPositive ? '↗' : '↘'}
              </span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EarningsCard;