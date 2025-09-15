/**
 * Worker Dashboard - Enhanced with Modular Components
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import WorkerLayout from '../../components/WorkerLayout';
import { QuickStatsGrid } from '../../src/components/dashboard/QuickStatsGrid';
import { PickupHistoryTable } from '../../src/components/dashboard/PickupHistoryTable';
import { RecentReviewsWidget } from '../../src/components/dashboard/RecentReviewsWidget';
import {
  ActivityGraphWidget,
  ProfileStatusWidget
} from '../../src/components/dashboard/EnhancementWidgets';
import { useDashboard } from '../../src/hooks/useDashboard';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import styles from './Dashboard.module.css';

// Import types
import type {
  WorkerStats,
  PickupHistoryItem,
  DashboardReview,
  ReviewStats,
  ActivityData,
  WorkerProfile
} from '../../src/types';

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

  // Mock data for new components (replace with real API calls)
  const [mockPickupHistory] = useState<PickupHistoryItem[]>([
    {
      id: '1',
      date: '2024-01-20T10:30:00Z',
      client: 'John Doe',
      location: 'Douala, Cameroon',
      status: 'completed',
      earnings: 2500,
      rating: 4.8,
      notes: 'Great service, very punctual'
    },
    {
      id: '2',
      date: '2024-01-19T14:15:00Z',
      client: 'Marie Claire',
      location: 'Yaoundé, Cameroon',
      status: 'paid',
      earnings: 3200,
      rating: 5.0
    },
    {
      id: '3',
      date: '2024-01-18T09:45:00Z',
      client: 'Paul Biya Corp',
      location: 'Bafoussam, Cameroon',
      status: 'completed',
      earnings: 1800,
      rating: 4.2
    }
  ]);

  const [mockReviews] = useState<DashboardReview[]>([
    {
      id: '1',
      customerName: 'John Doe',
      rating: 4.8,
      comment: 'Excellent service! Very professional and on time. The waste collection was done efficiently and the area was left clean.',
      date: '2024-01-20T10:30:00Z',
      pickupId: '1',
      location: 'Douala, Cameroon',
      isVerified: true,
      tags: ['Professional', 'On Time', 'Clean']
    },
    {
      id: '2',
      customerName: 'Marie Claire',
      rating: 5.0,
      comment: 'Outstanding work! Highly recommend this worker.',
      date: '2024-01-19T14:15:00Z',
      pickupId: '2',
      location: 'Yaoundé, Cameroon',
      isVerified: true,
      tags: ['Excellent', 'Recommended']
    }
  ]);

  const [mockReviewStats] = useState<ReviewStats>({
    averageRating: 4.6,
    totalReviews: 48,
    ratingDistribution: {
      5: 25,
      4: 15,
      3: 5,
      2: 2,
      1: 1
    },
    recentTrend: 'up'
  });

  const [mockActivityData] = useState<ActivityData[]>([
    { date: '2024-01-14', pickups: 4, earnings: 8000, ratings: 4.5 },
    { date: '2024-01-15', pickups: 6, earnings: 12000, ratings: 4.7 },
    { date: '2024-01-16', pickups: 3, earnings: 6000, ratings: 4.2 },
    { date: '2024-01-17', pickups: 5, earnings: 10000, ratings: 4.8 },
    { date: '2024-01-18', pickups: 7, earnings: 14000, ratings: 4.6 },
    { date: '2024-01-19', pickups: 8, earnings: 16000, ratings: 4.9 },
    { date: '2024-01-20', pickups: 5, earnings: 10000, ratings: 4.5 }
  ]);

  const [mockProfile] = useState<WorkerProfile>({
    id: 'worker-1',
    name: 'Jean Baptiste',
    status: 'active',
    rating: 4.6,
    totalReviews: 48,
    completedPickups: 127,
    joinDate: '2023-06-15',
    badges: ['Top Performer', 'Reliable', 'Eco Champion']
  });

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
        console.log(`Successfully accepted pickup ${pickupId}`);
      }
      return success;
    } catch (err) {
      console.error('Failed to accept pickup:', err);
      return false;
    }
  };

  // Enhanced handlers for new components
  const handlePickupHistoryClick = (pickup: PickupHistoryItem) => {
    console.log('View pickup details:', pickup);
    // Navigate to pickup details
  };

  const handleReviewClick = (review: DashboardReview) => {
    console.log('View review details:', review);
    // Navigate to review details
  };

  const handleEditProfile = () => {
    window.location.href = '/worker/profile';
  };

  const handleStatusChange = (status: WorkerProfile['status']) => {
    console.log('Change status to:', status);
    // Update worker status
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

  // Transform stats for new QuickStatsGrid
  const workerStats: WorkerStats = {
    // Legacy fields
    total_earnings: stats?.total_earnings || 0,
    pending_pickups: stats?.pending_pickups || 0,
    completed_today: stats?.completed_today || 0,
    completed_this_week: stats?.completed_this_week || 0,
    completed_this_month: stats?.completed_this_month || 0,
    avg_rating: stats?.avg_rating || 0,
    total_distance_today: stats?.total_distance_today || 0,
    active_routes: stats?.active_routes || 0,
    total_pickups: stats?.total_pickups || 0,
    completed_pickups: stats?.completed_pickups || 0,
    rating: stats?.rating || 0,
    earnings_today: stats?.earnings_today || 0,
    earnings_week: stats?.earnings_week || 0,
    earnings_month: stats?.earnings_month || 0,
    completion_rate: stats?.completion_rate || 0,
    // New fields for enhanced dashboard
    totalEarnings: stats?.total_earnings || 0,
    activePickups: stats?.pending_pickups || 0,
    completedToday: stats?.completed_today || 0,
    averageRating: stats?.avg_rating || 0,
    totalCompleted: mockProfile.completedPickups,
    monthlyEarnings: stats?.total_earnings || 0,
    weeklyPickups: mockActivityData.reduce((sum, day) => sum + day.pickups, 0),
    completionRate: 95
  };

  // Debug loading state
  console.log('Dashboard loading state:', loading, 'Type:', typeof loading);
  const isLoading = false; // Temporarily disable loading states for testing

  return (
    <WorkerLayout>
      <Head>
        <title>Worker Dashboard - Klynaa</title>
        <meta name="description" content="Comprehensive worker dashboard with stats, history, and reviews" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Here's your comprehensive overview
            </p>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Stats and History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <QuickStatsGrid
                stats={workerStats}
                isLoading={isLoading}
              />

              {/* Pickup History */}
              <PickupHistoryTable
                data={mockPickupHistory}
                isLoading={isLoading}
                onItemClick={handlePickupHistoryClick}
                showFilters={true}
                showSearch={true}
              />

              {/* Activity Graph - Full Width on Large Screens */}
              <ActivityGraphWidget
                data={mockActivityData}
                isLoading={isLoading}
                period="week"
                metric="pickups"
              />
            </div>

            {/* Right Column - Widgets */}
            <div className="space-y-6">
              {/* Profile Status */}
              <ProfileStatusWidget
                profile={mockProfile}
                isLoading={isLoading}
                onEditProfile={handleEditProfile}
                onStatusChange={handleStatusChange}
              />

              {/* Recent Reviews */}
              <RecentReviewsWidget
                reviews={mockReviews}
                stats={mockReviewStats}
                isLoading={isLoading}
                maxReviews={3}
                onReviewClick={handleReviewClick}
                onViewAll={() => window.location.href = '/worker/reviews'}
                showStats={true}
              />
            </div>
          </div>

          {/* Legacy Quick Actions (Hidden on larger screens, visible on mobile) */}
          <div className="lg:hidden mt-6">
            <QuickActions
              availablePickups={availablePickups}
              activePickups={activePickups}
              onAcceptPickup={handleAcceptPickup}
              onViewAllAvailable={handleViewAllAvailable}
              onViewAllActive={handleViewAllActive}
            />
          </div>
        </div>
      </div>
    </WorkerLayout>
  );
};

export default WorkerDashboard;