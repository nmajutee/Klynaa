import React from 'react';
import CardContainer from '../../../layout/CardContainer/CardContainer';
import { DonutChartData } from '@/types/dashboard';
import styles from './DonutCard.module.css';

interface DonutCardProps {
  title: string;
  subtitle?: string;
  data: DonutChartData;
  className?: string;
}

export const DonutCard: React.FC<DonutCardProps> = ({
  title,
  subtitle,
  data,
  className = '',
}) => {
  const total = data.categories.reduce((sum, cat) => sum + cat.value, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  // Calculate angles and paths
  let cumulativePercent = 0;
  const segments = data.categories.map(category => {
    const percent = total > 0 ? (category.value / total) : 0;
    const startAngle = cumulativePercent * 360 - 90; // Start from top
    const endAngle = (cumulativePercent + percent) * 360 - 90;

    cumulativePercent += percent;

    // Calculate arc path
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const largeArcFlag = percent > 0.5 ? 1 : 0;
    const x1 = 100 + radius * Math.cos(startAngleRad);
    const y1 = 100 + radius * Math.sin(startAngleRad);
    const x2 = 100 + radius * Math.cos(endAngleRad);
    const y2 = 100 + radius * Math.sin(endAngleRad);

    const pathData = [
      `M 100 100`, // Move to center
      `L ${x1} ${y1}`, // Line to start
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arc
      `Z` // Close path
    ].join(' ');

    return {
      ...category,
      percent: percent * 100,
      pathData: percent > 0 ? pathData : '',
    };
  });

  return (
    <CardContainer
      title={title}
      className={`${styles.donutCard} ${className}`}
      loading={false}
    >
      {subtitle && (
        <p className={styles.subtitle}>{subtitle}</p>
      )}

      <div className={styles.donutContainer}>
        {total > 0 ? (
          <>
            <div className={styles.chartContainer}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="2"
                />

                {/* Data segments */}
                {segments.map((segment, index) => (
                  segment.pathData && (
                    <path
                      key={segment.label}
                      d={segment.pathData}
                      fill={segment.color}
                      className={styles.segment}
                      data-label={segment.label}
                      data-value={segment.value}
                      data-percent={segment.percent.toFixed(1)}
                    />
                  )
                ))}

                {/* Center hole */}
                <circle
                  cx="100"
                  cy="100"
                  r="35"
                  fill="var(--color-background)"
                />

                {/* Center text */}
                <text
                  x="100"
                  y="95"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="600"
                  fill="var(--color-text-primary)"
                >
                  {total.toLocaleString()}
                </text>
                <text
                  x="100"
                  y="110"
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--color-text-secondary)"
                >
                  Total
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
              {segments.map((segment) => (
                <div key={segment.label} className={styles.legendItem}>
                  <div
                    className={styles.legendColor}
                    style={{ backgroundColor: segment.color }}
                  />
                  <div className={styles.legendContent}>
                    <span className={styles.legendLabel}>{segment.label}</span>
                    <div className={styles.legendValue}>
                      <span className={styles.value}>{segment.value.toLocaleString()}</span>
                      <span className={styles.percent}>({segment.percent.toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyChart}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="35"
                  fill="var(--color-background)"
                />
                <text
                  x="100"
                  y="105"
                  textAnchor="middle"
                  fontSize="12"
                  fill="var(--color-text-secondary)"
                >
                  No Data
                </text>
              </svg>
            </div>
            <p className={styles.emptyMessage}>No waste collection data available</p>
          </div>
        )}
      </div>
    </CardContainer>
  );
};