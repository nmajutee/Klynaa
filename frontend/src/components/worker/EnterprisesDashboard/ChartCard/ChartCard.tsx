import React from 'react';
import CardContainer from '../../../layout/CardContainer/CardContainer';
import { TrendingChartData, RatingAgenciesChartData } from '@/types/dashboard';
import styles from './ChartCard.module.css';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: TrendingChartData | RatingAgenciesChartData;
  type: 'line' | 'bar';
  className?: string;
}

const LineChart: React.FC<{ data: TrendingChartData }> = ({ data }) => {
  const maxValue = Math.max(...data.series.flatMap(s => s.points));
  const minValue = Math.min(...data.series.flatMap(s => s.points));
  const range = maxValue - minValue || 1;

  const getY = (value: number, height: number) => {
    return height - ((value - minValue) / range) * height;
  };

  const chartWidth = 600;
  const chartHeight = 200;
  const pointSpacing = chartWidth / (data.labels.length - 1 || 1);

  return (
    <div className={styles.chartContainer}>
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = (chartHeight / 4) * i;
          return (
            <line
              key={i}
              x1="0"
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="var(--color-border)"
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}

        {/* Series lines */}
        {data.series.map((series, seriesIndex) => (
          <g key={series.key}>
            {/* Line path */}
            <path
              d={series.points
                .map((point, pointIndex) => {
                  const x = pointIndex * pointSpacing;
                  const y = getY(point, chartHeight);
                  return `${pointIndex === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              stroke={series.color}
              strokeWidth="2"
              fill="none"
            />

            {/* Data points */}
            {series.points.map((point, pointIndex) => (
              <circle
                key={pointIndex}
                cx={pointIndex * pointSpacing}
                cy={getY(point, chartHeight)}
                r="3"
                fill={series.color}
                className={styles.dataPoint}
              />
            ))}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className={styles.legend}>
        {data.series.map((series) => (
          <div key={series.key} className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: series.color }}
            />
            <span className={styles.legendLabel}>{series.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart: React.FC<{ data: RatingAgenciesChartData }> = ({ data }) => {
  const maxValue = Math.max(...data.series.flatMap(s => s.values));
  const chartHeight = 200;
  const barWidth = 40;
  const groupSpacing = 80;
  const seriesSpacing = 5;
  const chartWidth = data.labels.length * groupSpacing;

  return (
    <div className={styles.chartContainer}>
      <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}>
        {/* Bars */}
        {data.labels.map((label, labelIndex) => (
          <g key={label}>
            {data.series.map((series, seriesIndex) => {
              const value = series.values[labelIndex];
              const barHeight = (value / maxValue) * chartHeight;
              const x = labelIndex * groupSpacing + seriesIndex * (barWidth + seriesSpacing);
              const y = chartHeight - barHeight;

              return (
                <rect
                  key={series.label}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={series.color}
                  className={styles.bar}
                />
              );
            })}

            {/* Label */}
            <text
              x={labelIndex * groupSpacing + (data.series.length * (barWidth + seriesSpacing)) / 2}
              y={chartHeight + 20}
              textAnchor="middle"
              fontSize="12"
              fill="var(--color-text-secondary)"
            >
              {label}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className={styles.legend}>
        {data.series.map((series) => (
          <div key={series.label} className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: series.color }}
            />
            <span className={styles.legendLabel}>{series.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  data,
  type,
  className = '',
}) => {
  return (
    <CardContainer
      title={title}
      className={`${styles.chartCard} ${className}`}
      loading={false}
    >
      {subtitle && (
        <p className={styles.subtitle}>{subtitle}</p>
      )}

      <div className={styles.chartWrapper}>
        {type === 'line' ? (
          <LineChart data={data as TrendingChartData} />
        ) : (
          <BarChart data={data as RatingAgenciesChartData} />
        )}
      </div>
    </CardContainer>
  );
};