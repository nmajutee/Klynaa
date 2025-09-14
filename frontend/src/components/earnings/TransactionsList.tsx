/**
 * TransactionsList Component
 * Displays a list of transactions with proper formatting and status indicators
 */

import React from 'react';
import Card from '../../components/cards/Card';
import styles from './TransactionsList.module.css';
import type { Transaction } from '../../types';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface TransactionsListProps {
  transactions: Transaction[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  loading = false,
  emptyMessage = "No transactions found",
  className = '',
}) => {
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className={styles.statusIcon} />;
      case 'pending':
        return <ClockIcon className={styles.statusIcon} />;
      case 'failed':
      case 'cancelled':
        return <ExclamationTriangleIcon className={styles.statusIcon} />;
      default:
        return <ClockIcon className={styles.statusIcon} />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'pending':
        return styles.statusPending;
      case 'failed':
      case 'cancelled':
        return styles.statusFailed;
      default:
        return styles.statusPending;
    }
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'withdraw' || amount < 0) {
      return <ArrowTrendingUpIcon className={`${styles.transactionIcon} ${styles.withdrawal}`} />;
    }
    return <ArrowTrendingUpIcon className={`${styles.transactionIcon} ${styles.income}`} />;
  };

  const getTransactionTypeLabel = (type: string): string => {
    switch (type) {
      case 'pickup':
        return 'Pickup Payment';
      case 'bonus':
        return 'Performance Bonus';
      case 'withdraw':
        return 'Withdrawal';
      case 'refund':
        return 'Refund';
      case 'penalty':
        return 'Penalty';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card className={`${styles.transactionsList} ${className}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>Recent Transactions</h3>
        </div>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading transactions...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${styles.transactionsList} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Transactions</h3>
      </div>

      {transactions.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💰</div>
          <p className={styles.emptyMessage}>{emptyMessage}</p>
        </div>
      ) : (
        <div className={styles.transactionsContainer}>
          {transactions.map((transaction) => (
            <div key={transaction.id} className={styles.transactionItem}>
              <div className={styles.transactionLeft}>
                <div className={styles.iconContainer}>
                  {getTransactionIcon(transaction.type, transaction.amount)}
                </div>

                <div className={styles.transactionDetails}>
                  <h4 className={styles.transactionDescription}>
                    {transaction.description || getTransactionTypeLabel(transaction.type)}
                  </h4>

                  {transaction.customer && (
                    <p className={styles.customerName}>
                      Customer: {transaction.customer}
                    </p>
                  )}

                  <p className={styles.transactionDate}>{transaction.date}</p>
                </div>
              </div>

              <div className={styles.transactionRight}>
                <p className={`${styles.amount} ${transaction.amount > 0 ? styles.positive : styles.negative}`}>
                  {transaction.amount > 0 ? '+' : '-'}{formatAmount(transaction.amount)}
                </p>

                <div className={`${styles.statusBadge} ${getStatusColor(transaction.status)}`}>
                  {getStatusIcon(transaction.status)}
                  <span className={styles.statusText}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TransactionsList;