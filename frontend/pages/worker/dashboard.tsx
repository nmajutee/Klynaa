/**
 * Worker Dashboard - Clean Version Without Map
 */

import React from 'react';
import Head from 'next/head';
import WorkerLayout from '../../components/WorkerLayout';
import { StatCard } from '../../src/components/cards/StatCard';
import { useDashboard } from '../../src/hooks/useDashboard';
import { formatCurrency } from '../../src/lib/utils';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import styles from './Dashboard.module.css';

/**
 * Loading Component
 */
const DashboardLoading: React.FC = () => (
  <div className={styles.loading}>
    <div className={styles.loadingSpinner}>
      <ArrowPathIcon className={styles.spinner} />
    </div>
    <span className={styles.loadingText}>Loading dashboard...</span>
  </div>
);

/**
 * Error Component
 */
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className={styles.error}>
    <div className={styles.errorContent}>
      <ExclamationTriangleIcon className={styles.errorIcon} />
      <h3 className={styles.errorTitle}>Something went wrong</h3>
      <p className={styles.errorMessage}>{message}</p>
      <button onClick={onRetry} className={styles.retryButton}>
        <ArrowPathIcon className={styles.retryIcon} />
        Try Again
      </button>
    </div>
  </div>
);

/**
 * Quick Actions Component
 */
interface QuickActionsProps {
  availablePickups: any[];
  activePickups: any[];
  onAcceptPickup: (id: number) => Promise<boolean>;
  onViewAllAvailable: () => void;
  onViewAllActive: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  availablePickups,
  activePickups,
  onAcceptPickup,
  onViewAllAvailable,
  onViewAllActive,
}) => (
  <div className={styles.quickActions}>
    <div className={styles.quickActionsHeader}>
      <h3 className={styles.quickActionsTitle}>Quick Actions</h3>
    </div>

    <div className={styles.quickActionsGrid}>
      <div className={styles.quickActionCard}>
        <h4 className={styles.quickActionTitle}>Available Pickups</h4>
        <p className={styles.quickActionCount}>{availablePickups.length} jobs available</p>
        <button onClick={onViewAllAvailable} className={styles.viewAllButton}>
          View All Available
        </button>
      </div>

      <div className={styles.quickActionCard}>
        <h4 className={styles.quickActionTitle}>Active Pickups</h4>
        <p className={styles.quickActionCount}>{activePickups.length} in progress</p>
        <button onClick={onViewAllActive} className={styles.viewAllButton}>
          View All My Pickups
        </button>
      </div>
    </div>
  </div>
);

/**
 * Main Dashboard Component
 */
const WorkerDashboard: React.FC = () => {
  const {
    stats,
    availablePickups,
    activePickups,
    loading,
    error,
    refreshDashboard,
    acceptPickup,
  } = useDashboard();

  // Navigation handlers
  const handleViewAllAvailable = () => {
    window.location.href = '/worker/available-pickups';
  };

  const handleViewAllActive = () => {
    window.location.href = '/worker/my-pickups';
  };

  const handleAcceptPickup = async (pickupId: number): Promise<boolean> => {
    try {
      const success = await acceptPickup(pickupId);
      if (success) {
        // Optionally show success message
        console.log(`Successfully accepted pickup ${pickupId}`);
      }
      return success;
    } catch (err) {
      console.error('Failed to accept pickup:', err);
      return false;
    }
  };

  // Loading state
  if (loading === 'loading') {
    return (
      <WorkerLayout>
        <DashboardLoading />
      </WorkerLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <WorkerLayout>
        <ErrorState message={error} onRetry={refreshDashboard} />
      </WorkerLayout>
    );
  }

  return (
    <WorkerLayout>
      <Head>
        <title>Worker Dashboard - Klynaa</title>
        <meta name="description" content="Worker dashboard with stats and pickup management" />
      </Head>

      <div className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Dashboard</h1>
          <p className={styles.dashboardSubtitle}>
            Welcome back! Here's your overview
          </p>
        </div>

        <div className={styles.dashboardContent}>
          {/* Stats Grid */}
          {stats && (
            <div className={styles.statsGrid}>
              <StatCard
                title="Total Earnings"
                value={formatCurrency(stats.total_earnings)}
                subtitle="This month"
                icon="currency"
              />
              <StatCard
                title="Active Pickups"
                value={stats.pending_pickups.toString()}
                subtitle="In progress"
                icon="truck"
              />
              <StatCard
                title="Completed Today"
                value={stats.completed_today.toString()}
                subtitle="Jobs finished"
                icon="check"
              />
              <StatCard
                title="Rating"
                value={stats.avg_rating.toFixed(1)}
                subtitle="Average rating"
                icon="star"
              />
            </div>
          )}

          {/* Quick Actions */}
          <QuickActions
            availablePickups={availablePickups}
            activePickups={activePickups}
            onAcceptPickup={handleAcceptPickup}
            onViewAllAvailable={handleViewAllAvailable}
            onViewAllActive={handleViewAllActive}
          />
        </div>
      </div>
    </WorkerLayout>
  );
};

export default WorkerDashboard;