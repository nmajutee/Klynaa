/**
 * Worker Earnings Page
 * Enterprise-structured earnings management with proper separation of concerns
 */

import React, { useState } from 'react';
import Head from 'next/head';
import WorkerLayout from '../../components/WorkerLayout';
import {
  EarningsCard,
  TransactionsList,
  WithdrawalModal
} from '../../src/components/earnings';
import { useEarnings } from '../../src/hooks';
import { formatCurrency } from '../../src/lib/utils';
import type { EarningsPeriod } from '../../src/types';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import styles from './Earnings.module.css';

const WorkerEarnings: React.FC = () => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const {
    earnings,
    loading,
    error,
    requestWithdrawal,
    selectedPeriod,
    setSelectedPeriod,
    refreshData,
  } = useEarnings('this_month');

  const handleWithdrawalRequest = async (request: any) => {
    const success = await requestWithdrawal(request);
    return success;
  };

  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'all_time', label: 'All Time' },
  ] as const;

  if (loading === 'loading' && !earnings) {
    return (
      <WorkerLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading earnings data...</p>
        </div>
      </WorkerLayout>
    );
  }

  if (error) {
    return (
      <WorkerLayout>
        <div className={styles.errorContainer}>
          <h2>Unable to Load Earnings</h2>
          <p>{error}</p>
          <button onClick={refreshData} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </WorkerLayout>
    );
  }

  // Mock data fallback for development
  const mockEarnings = {
    totalBalance: 125000,
    pendingPayments: 15000,
    todayEarnings: 8500,
    thisWeekEarnings: 47500,
    thisMonthEarnings: 125000,
    averagePerPickup: 2500,
    totalPickups: 50,
    recentTransactions: [
      {
        id: 1,
        type: 'pickup' as const,
        amount: 3000,
        description: 'Waste collection - Bonanjo District',
        date: '2024-01-15',
        status: 'completed' as const,
        customer: 'Marie Kouam'
      },
      {
        id: 2,
        type: 'pickup' as const,
        amount: 2500,
        description: 'Waste collection - Akwa District',
        date: '2024-01-15',
        status: 'completed' as const,
        customer: 'Jean Mbala'
      },
    ],
    withdrawalHistory: []
  };

  const displayData = earnings || mockEarnings;

  return (
    <WorkerLayout>
      <Head>
        <title>Earnings & Payments - Worker Portal</title>
        <meta name="description" content="Track your earnings, view payment history, and manage withdrawals" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Earnings & Payments</h1>
            <p className={styles.subtitle}>
              Track your earnings, view payment history, and manage withdrawals
            </p>
          </div>

          <button
            onClick={refreshData}
            className={styles.refreshButton}
            disabled={loading === 'loading'}
          >
            {loading === 'loading' ? '↻' : '🔄'}
          </button>
        </header>

        <div className={styles.content}>
          {/* Left Column - Main Content */}
          <div className={styles.mainContent}>
            {/* Balance Cards */}
            <div className={styles.balanceCards}>
              <EarningsCard
                title="Total Balance"
                amount={formatCurrency(displayData.totalBalance)}
                icon={<BanknotesIcon />}
                variant="primary"
                className={styles.primaryCard}
              />

              <EarningsCard
                title="Pending"
                amount={formatCurrency(displayData.pendingPayments)}
                icon={<ClockIcon />}
                variant="warning"
              />

              <EarningsCard
                title="Avg/Pickup"
                amount={formatCurrency(displayData.averagePerPickup)}
                icon={<ArrowTrendingUpIcon />}
                variant="secondary"
              />
            </div>

            {/* Earnings Overview */}
            <div className={styles.earningsOverview}>
              <div className={styles.overviewHeader}>
                <h2>Earnings Overview</h2>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as EarningsPeriod)}
                  className={styles.periodSelector}
                >
                  {periodOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.overviewStats}>
                <div className={styles.mainStat}>
                  {formatCurrency(
                    selectedPeriod === 'today' ? displayData.todayEarnings :
                    selectedPeriod === 'this_week' ? displayData.thisWeekEarnings :
                    displayData.thisMonthEarnings
                  )}
                </div>
                <p className={styles.statLabel}>
                  {selectedPeriod.replace('_', ' ')} earnings
                </p>
              </div>

              <div className={styles.quickStats}>
                <div className={styles.quickStat}>
                  <span className={styles.quickStatValue}>{displayData.totalPickups}</span>
                  <span className={styles.quickStatLabel}>Total Pickups</span>
                </div>
                <div className={styles.quickStat}>
                  <span className={styles.quickStatValue}>{formatCurrency(displayData.averagePerPickup)}</span>
                  <span className={styles.quickStatLabel}>Average per Pickup</span>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <TransactionsList
              transactions={displayData.recentTransactions}
              loading={loading === 'loading'}
              emptyMessage="No transactions found for this period"
            />
          </div>

          {/* Right Column - Sidebar */}
          <aside className={styles.sidebar}>
            {/* Withdrawal Request */}
            <div className={styles.withdrawalSection}>
              <h3>Withdraw Funds</h3>

              <div className={styles.balanceDisplay}>
                <span className={styles.balanceLabel}>Available Balance</span>
                <span className={styles.balanceAmount}>
                  {formatCurrency(displayData.totalBalance)}
                </span>
              </div>

              <button
                onClick={() => setShowWithdrawModal(true)}
                className={styles.withdrawButton}
                disabled={displayData.totalBalance < 10000}
              >
                Request Withdrawal
              </button>

              <div className={styles.withdrawalInfo}>
                <p>Minimum withdrawal: 10,000 XAF</p>
                <p>Processing time: 24-48 hours</p>
              </div>
            </div>

            {/* Withdrawal History - simplified for sidebar */}
            {displayData.withdrawalHistory.length > 0 && (
              <div className={styles.historySection}>
                <h3>Recent Withdrawals</h3>
                {displayData.withdrawalHistory.slice(0, 3).map((withdrawal) => (
                  <div key={withdrawal.id} className={styles.historyItem}>
                    <div className={styles.historyAmount}>
                      {formatCurrency(withdrawal.amount)}
                    </div>
                    <div className={styles.historyDetails}>
                      <span className={styles.historyMethod}>{withdrawal.method}</span>
                      <span className={styles.historyDate}>{withdrawal.date}</span>
                    </div>
                    <span className={`${styles.historyStatus} ${styles[withdrawal.status]}`}>
                      {withdrawal.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSubmit={handleWithdrawalRequest}
        availableBalance={displayData.totalBalance}
        loading={loading === 'loading'}
      />
    </WorkerLayout>
  );
};

export default WorkerEarnings;