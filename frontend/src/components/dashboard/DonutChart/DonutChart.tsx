import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import CardContainer from '../../layout/CardContainer/CardContainer';
import { DonutChartData, DonutCategory } from '../../../types/dashboard';
import styles from './DonutChart.module.css';

export interface DonutChartProps {
  title: string;
  subtitle?: string;
  data: DonutChartData;
  loading?: boolean;
  className?: string;
  showLegend?: boolean;
  showPercentages?: boolean;
}

/**
 * DonutChart - Donut/pie chart component for category breakdowns
 * Features custom colors, tooltips, legend, and responsive design
 */
export const DonutChart: React.FC<DonutChartProps> = ({
  title,
  subtitle,
  data,
  loading = false,
  className = '',
  showLegend = true,
  showPercentages = true
}) => {
  // Default colors for categories
  const defaultColors = ['#16A34A', '#1E88E5', '#7C3AED', '#F59E0B', '#DC2626', '#059669', '#7C2D12'];

  // Prepare data with colors and percentages
  const total = data.categories.reduce((sum, cat) => sum + cat.value, 0);
  const chartData = data.categories.map((category, index) => ({
    ...category,
    color: category.color || defaultColors[index % defaultColors.length],
    percentage: total > 0 ? ((category.value / total) * 100).toFixed(1) : '0'
  }));

  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <div className={styles.tooltipHeader}>
            <div
              className={styles.tooltipColor}
              style={{ backgroundColor: data.color }}
            />
            <span className={styles.tooltipLabel}>{data.label}</span>
          </div>
          <div className={styles.tooltipValue}>
            {new Intl.NumberFormat('en-US').format(data.value)}
            {showPercentages && ` (${data.percentage}%)`}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    if (!showLegend) return null;

    return (
      <div className={styles.legend}>
        {chartData.map((item, index) => (
          <div key={index} className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: item.color }}
            />
            <span className={styles.legendLabel}>{item.label}</span>
            {showPercentages && (
              <span className={styles.legendValue}>{item.percentage}%</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <CardContainer
      title={title}
      subtitle={subtitle}
      loading={loading}
      className={`${styles.donutChart} ${className}`}
    >
      <div className={styles.chartContainer}>
        <div className={styles.pieContainer}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center total value */}
          <div className={styles.centerValue}>
            <div className={styles.totalNumber}>
              {new Intl.NumberFormat('en-US').format(total)}
            </div>
            <div className={styles.totalLabel}>Total</div>
          </div>
        </div>

        {renderLegend({})}
      </div>
    </CardContainer>
  );
};

export default DonutChart;