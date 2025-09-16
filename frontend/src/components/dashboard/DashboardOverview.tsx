import React from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import KPICard from './KPICard';
import ChartCard from './ChartCard';
import DonutChart from './DonutChart';
import ScoreCard from './ScoreCard';
import ReviewsWidget from './ReviewsWidget';
import ProfileSnapshotCard from './ProfileSnapshotCard';
import styles from './DashboardOverview.module.css';

/**
 * DashboardOverview - Main dashboard component with responsive grid layout
 * Integrates all dashboard widgets with proper loading states and error handling
 */
export const DashboardOverview: React.FC = () => {
  const { data, loading, error, refresh } = useDashboardData();

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Unable to load dashboard</h2>
        <p>{error.message}</p>
        <button onClick={refresh} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Performance Dashboard</h1>
        <p className={styles.subtitle}>
          Track your pickup performance, earnings, and customer feedback
        </p>
        {data?.lastUpdated && (
          <p className={styles.lastUpdated}>
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      <div className={styles.grid}>
        {/* KPI Cards Row - 4 cards per design document */}
        <div className={styles.kpiSection}>
          <KPICard
            title="My Earnings"
            value={`${data?.kpis.totalEarnings.currency || 'XAF'} ${(data?.kpis.totalEarnings.value || 24500).toLocaleString()}`}
            trend={data?.kpis.totalEarnings.trendPercent !== undefined ? {
              value: Math.abs(data.kpis.totalEarnings.trendPercent),
              isPositive: data.kpis.totalEarnings.trendPercent > 0,
              label: `${Math.abs(data.kpis.totalEarnings.trendPercent)}%`
            } : {
              value: 42.8,
              isPositive: false,
              label: "42.8%"
            }}
            loading={loading}
            className={styles.kpiCard}
          />
          <KPICard
            title="Pending Pickups"
            value={data?.kpis.pendingPickups.count || 3}
            subtitle={`${data?.kpis.pendingPickups.nearby || 2} nearby, ${data?.kpis.pendingPickups.scheduled || 1} scheduled`}
            loading={loading}
            className={styles.kpiCard}
          />
          <KPICard
            title="Completed This Week"
            value={data?.kpis.completedPickups.count || 15}
            subtitle={`${data?.kpis.completedPickups.weeklyGoalPercent || 75}% of weekly goal`}
            loading={loading}
            className={styles.kpiCard}
          />
          <ProfileSnapshotCard
            profile={{
              name: "John Worker", // Mock worker name
              status: loading ? "offline" : "active",
              completedPickups: data?.kpis.completedPickups.count || 15,
              totalReviews: data?.kpis.averageRating.reviewsCount || 12,
              averageRating: data?.kpis.averageRating.value || 4.8,
              badges: ["Professional", "On Time", "Eco Champion"],
            }}
            loading={loading}
            className={styles.kpiCard}
          />
        </div>

        {/* Charts Row */}
        <div className={styles.chartsSection}>
          <ChartCard
            title="My Performance Trends"
            subtitle="Daily pickups, earnings, and efficiency over time"
            data={data?.charts.trending}
            type="line"
            loading={loading}
            className={styles.trendingChart}
          />
          <ChartCard
            title="Pickup Types Breakdown"
            subtitle="Residential, commercial, and industrial pickups"
            data={data?.charts.trending} // Use trending data for now
            type="bar"
            loading={loading}
            className={styles.ratingsChart}
          />
        </div>

        {/* Data Tables & Analytics Row */}
        <div className={styles.dataSection}>
          <ScoreCard
            title="My Recent Pickups"
            subtitle="Pickup history with performance details"
            data={data?.scorecard || { total: 0, page: 1, pageSize: 10, rows: [] }}
            loading={loading}
            className={styles.scorecard}
          />

          <div className={styles.rightColumn}>
            <DonutChart
              title="My Waste Types"
              subtitle="Breakdown by waste categories I've handled"
              data={data?.donut || {
                categories: [
                  { label: "Recyclable", value: 45, color: "#16A34A" },
                  { label: "Organic", value: 30, color: "#059669" },
                  { label: "Hazardous", value: 15, color: "#DC2626" },
                  { label: "Mixed", value: 10, color: "#7C3AED" }
                ]
              }}
              loading={loading}
              className={styles.donutChart}
            />

            <ReviewsWidget
              title="Customer Reviews"
              subtitle="Recent feedback from my customers"
              data={data?.reviews || {
                distribution: [1, 0, 1, 3, 8], // Mock rating distribution
                recent: [
                  {
                    id: "r1",
                    name: "Marie Dubois",
                    customerName: "Marie Dubois",
                    rating: 5,
                    text: "Excellent service! Very professional and punctual pickup.",
                    comment: "Excellent service! Very professional and punctual pickup.",
                    date: "2025-09-14",
                    tags: ["Professional", "On Time"]
                  },
                  {
                    id: "r2",
                    name: "Jean Pierre",
                    customerName: "Jean Pierre",
                    rating: 4,
                    text: "Good work, arrived on time and was very efficient.",
                    comment: "Good work, arrived on time and was very efficient.",
                    date: "2025-09-13",
                    tags: ["Efficient", "Reliable"]
                  }
                ]
              }}
              loading={loading}
              className={styles.reviewsWidget}
              maxReviews={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;