import React from 'react';
import { Scorecard } from '@/types/dashboard';
import styles from './ScorecardTable.module.css';

interface ScorecardTableProps {
  data: Scorecard;
  onPageChange?: (page: number) => void;
  className?: string;
}

const getSentimentColor = (sentiment: number): string => {
  if (sentiment >= 10) return 'var(--color-success)';
  if (sentiment >= 0) return 'var(--color-warning)';
  return 'var(--color-error)';
};

const getImpactColor = (score: number): string => {
  if (score >= 100) return 'var(--color-success)';
  if (score >= 0) return 'var(--color-warning)';
  return 'var(--color-error)';
};

export const ScorecardTable: React.FC<ScorecardTableProps> = ({
  data,
  onPageChange,
  className = '',
}) => {
  const hasData = data.rows.length > 0;
  const totalPages = Math.ceil(data.total / data.pageSize);

  const handlePageClick = (page: number) => {
    if (page !== data.page && onPageChange) {
      onPageChange(page);
    }
  };

  if (!hasData) {
    return (
      <div className={`${styles.scorecardTable} ${className}`}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <p className={styles.emptyMessage}>No pickup data available</p>
          <p className={styles.emptySubtext}>Complete some pickups to see your scorecard</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.scorecardTable} ${className}`}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Sentiment</th>
              <th>Mentions</th>
              <th>Impact Score</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.id} className={styles.row}>
                <td className={styles.idCell}>
                  <span className={styles.idBadge}>#{row.id}</span>
                </td>
                <td className={styles.companyCell}>
                  <span className={styles.companyName}>{row.company}</span>
                </td>
                <td className={styles.sentimentCell}>
                  <span
                    className={styles.sentimentValue}
                    style={{ color: getSentimentColor(row.sentiment) }}
                  >
                    {row.sentiment > 0 ? '+' : ''}{row.sentiment}
                  </span>
                </td>
                <td className={styles.mentionsCell}>
                  <span className={styles.mentionsValue}>
                    {row.mentions.toLocaleString()}
                  </span>
                </td>
                <td className={styles.impactCell}>
                  <div className={styles.impactContainer}>
                    <span
                      className={styles.impactValue}
                      style={{ color: getImpactColor(row.impactScore) }}
                    >
                      {row.impactScore > 0 ? '+' : ''}{row.impactScore}
                    </span>
                    <div className={styles.impactBar}>
                      <div
                        className={styles.impactFill}
                        style={{
                          width: `${Math.min(Math.abs(row.impactScore) / 200 * 100, 100)}%`,
                          backgroundColor: getImpactColor(row.impactScore)
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageClick(data.page - 1)}
            disabled={data.page <= 1}
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.pageButton} ${
                page === data.page ? styles.activePage : ''
              }`}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </button>
          ))}

          <button
            className={styles.pageButton}
            onClick={() => handlePageClick(data.page + 1)}
            disabled={data.page >= totalPages}
          >
            →
          </button>
        </div>
      )}

      {/* Summary */}
      <div className={styles.summary}>
        <span className={styles.summaryText}>
          Showing {data.rows.length} of {data.total} pickups
        </span>
      </div>
    </div>
  );
};