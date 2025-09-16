import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import CardContainer from '../../layout/CardContainer/CardContainer';
import { Scorecard, ScorecardRow } from '../../../types/dashboard';
import styles from './ScoreCard.module.css';

export interface ScoreCardProps {
  title: string;
  subtitle?: string;
  data: Scorecard;
  loading?: boolean;
  className?: string;
}

// Column definition interface for the scorecard table
interface Column {
  key: keyof ScorecardRow;
  label: string;
  sortable: boolean;
  type?: 'string' | 'number' | 'currency' | 'percentage';
}

/**
 * ScoreCard - Paginated table component for scorecard data
 * Features pagination, sortable columns, and responsive design
 */
export const ScoreCard: React.FC<ScoreCardProps> = ({
  title,
  subtitle,
  data,
  loading = false,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof ScorecardRow | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.rows.length / itemsPerPage);

  // Define the table columns
  const columns: Column[] = [
    { key: 'company', label: 'Company', sortable: true, type: 'string' },
    { key: 'sentiment', label: 'Sentiment', sortable: true, type: 'percentage' },
    { key: 'mentions', label: 'Mentions', sortable: true, type: 'number' },
    { key: 'impactScore', label: 'Impact Score', sortable: true, type: 'number' }
  ];

  // Handle sorting
  const handleSort = (columnKey: keyof ScorecardRow) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Sort and paginate data
  const sortedData = [...data.rows].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (sortDirection === 'asc') {
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    } else {
      return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
    }
  });

  const paginatedData = sortedData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  const formatCellValue = (value: any, column: Column) => {
    if (column.type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    if (column.type === 'percentage') {
      return `${value}%`;
    }
    
    if (column.type === 'number') {
      return new Intl.NumberFormat('en-US').format(value);
    }
    
    return value;
  };

  return (
    <CardContainer
      title={title}
      subtitle={subtitle}
      loading={loading}
      className={`${styles.scoreCard} ${className}`}
    >
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table} role="table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`${styles.th} ${column.sortable ? styles.sortable : ''}`}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                    role="columnheader"
                    tabIndex={column.sortable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleSort(column.key);
                      }
                    }}
                  >
                    <div className={styles.thContent}>
                      {column.label}
                      {column.sortable && sortColumn === column.key && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr key={index} className={styles.tr}>
                  {columns.map((column) => (
                    <td key={column.key} className={styles.td}>
                      {formatCellValue(row[column.key], column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className={`${styles.pageButton} ${currentPage === 0 ? styles.disabled : ''}`}
              aria-label="Previous page"
            >
              <ChevronLeftIcon className={styles.pageIcon} />
            </button>
            
            <div className={styles.pageInfo}>
              <span className={styles.pageText}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <span className={styles.itemsText}>
                ({paginatedData.length} of {data.rows.length} items)
              </span>
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className={`${styles.pageButton} ${currentPage === totalPages - 1 ? styles.disabled : ''}`}
              aria-label="Next page"
            >
              <ChevronRightIcon className={styles.pageIcon} />
            </button>
          </div>
        )}
      </div>
    </CardContainer>
  );
};

export default ScoreCard;