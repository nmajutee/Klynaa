import React, { useState, useEffect } from 'react';
import { DashboardOverviewData } from '@/types/dashboard';
import { dashboardService } from '@/services/dashboardService';
import CardContainer from '../../layout/CardContainer/CardContainer';
import { KPICard } from './KPICard/KPICard';
import { ChartCard } from './ChartCard/ChartCard';
import { DonutCard } from './DonutCard/DonutCard';
import { ScorecardTable } from './ScorecardTable/ScorecardTable';
import { ReviewsWidget } from './ReviewsWidget/ReviewsWidget';
import styles from './EnterprisesDashboard.module.css';

interface EnterprisesDashboardProps {
  className?: string;
}

export const EnterprisesDashboard: React.FC<EnterprisesDashboardProps> = ({
  className = '',
}) => {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = await dashboardService.getOverview();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (isLoading) {
    return (
      <div className={`${styles.dashboard} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.dashboard} ${className}`}>
        <div className={styles.errorState}>
          <h3>Failed to load dashboard</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${styles.dashboard} ${className}`}>
        <div className={styles.emptyState}>
          <p>No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Worker Dashboard</h1>
        <div className={styles.headerActions}>
          <span className={styles.lastUpdated}>
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </span>
          <button onClick={handleRefresh} className={styles.refreshButton}>
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className={styles.kpiSection}>
        <KPICard
          title="Total Earnings"
          value={data.kpis.totalEarnings.value}
          currency={data.kpis.totalEarnings.currency}
          trendPercent={data.kpis.totalEarnings.trendPercent}
          subtitle={data.kpis.totalEarnings.periodLabel}
          variant="earnings"
        />

        <KPICard
          title="Pending Pickups"
          value={data.kpis.pendingPickups.count}
          subtitle={`${data.kpis.pendingPickups.nearby} nearby, ${data.kpis.pendingPickups.scheduled} scheduled`}
          variant="pickups"
        />

        <KPICard
          title="Completed Pickups"
          value={data.kpis.completedPickups.count}
          trendPercent={data.kpis.completedPickups.weeklyGoalPercent}
          subtitle="This period"
          variant="completed"
        />

        <KPICard
          title="Average Rating"
          value={data.kpis.averageRating.value}
          subtitle={`${data.kpis.averageRating.reviewsCount} reviews`}
          variant="rating"
        />
      </div>

      {/* Charts Row */}
      <div className={styles.chartsSection}>
        <ChartCard
          title="Trending Performance"
          subtitle="ESG Impact Over Time"
          data={data.charts.trending}
          type="line"
          className={styles.trendingChart}
        />

        <ChartCard
          title="Rating Agencies"
          subtitle="Performance Breakdown"
          data={data.charts.ratingAgencies}
          type="bar"
          className={styles.agencyChart}
        />
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        {/* Waste Categories Donut */}
        <DonutCard
          title="Waste Categories"
          subtitle="Collection breakdown"
          data={data.donut}
          className={styles.donutCard}
        />

        {/* Scorecard Table */}
        <CardContainer
          title="Recent Pickups Scorecard"
          className={styles.scorecardCard}
        >
          <ScorecardTable
            data={data.scorecard}
            onPageChange={(page) => {
              // TODO: Implement pagination
              console.log('Page change requested:', page);
            }}
          />
        </CardContainer>

        {/* Reviews Widget */}
        <CardContainer
          title="Customer Reviews"
          className={styles.reviewsCard}
        >
          <ReviewsWidget data={data.reviews} />
        </CardContainer>
      </div>
    </div>
  );
};