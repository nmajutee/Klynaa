/**
 * PickupHistoryTable Component - Enterprise Grade
 * Modular, reusable pickup history table with filters, sorting, and pagination
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import styles from './PickupHistoryTable.module.css';

// Types
export interface PickupHistoryItem {
  id: string;
  date: string;
  client: string;
  location: string;
  status: 'completed' | 'cancelled' | 'disputed' | 'paid';
  earnings: number;
  rating?: number;
  notes?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: T[keyof T], item: T, index: number) => React.ReactNode;
}

export interface FilterOptions {
  status: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  minEarnings?: number;
  maxEarnings?: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Props
export interface PickupHistoryTableProps {
  data: PickupHistoryItem[];
  isLoading?: boolean;
  pageSize?: number;
  className?: string;
  onItemClick?: (item: PickupHistoryItem) => void;
  showFilters?: boolean;
  showSearch?: boolean;
  emptyState?: React.ReactNode;
}

/**
 * Status Badge Component
 */
const StatusBadge: React.FC<{ status: PickupHistoryItem['status'] }> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          label: 'Completed'
        };
      case 'paid':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          label: 'Paid'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          label: 'Cancelled'
        };
      case 'disputed':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          label: 'Disputed'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          label: status
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

/**
 * Rating Stars Component
 */
const RatingStars: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({
  rating,
  size = 'sm'
}) => {
  const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${starSize} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
    </div>
  );
};

/**
 * Table Filters Component
 */
const TableFilters: React.FC<{
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClear: () => void;
}> = ({ filters, onFiltersChange, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filters
          <ArrowDownIcon
            className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        <button
          onClick={onClear}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear all
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              multiple
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={filters.status}
              onChange={(e) => onFiltersChange({
                ...filters,
                status: Array.from(e.target.selectedOptions, option => option.value)
              })}
            >
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.dateRange.start || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, start: e.target.value }
                })}
              />
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.dateRange.end || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  dateRange: { ...filters.dateRange, end: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Earnings Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Earnings Range (XAF)
            </label>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.minEarnings || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  minEarnings: e.target.value ? Number(e.target.value) : undefined
                })}
              />
              <input
                type="number"
                placeholder="Max"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.maxEarnings || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  maxEarnings: e.target.value ? Number(e.target.value) : undefined
                })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Search Bar Component
 */
const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = "Search by client or location..." }) => {
  return (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

/**
 * Pagination Component
 */
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}> = ({ currentPage, totalPages, onPageChange, totalItems, pageSize }) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                    isCurrentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main PickupHistoryTable Component
 */
export const PickupHistoryTable: React.FC<PickupHistoryTableProps> = ({
  data,
  isLoading = false,
  pageSize = 10,
  className = '',
  onItemClick,
  showFilters = true,
  showSearch = true,
  emptyState
}) => {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    dateRange: {}
  });

  // Table columns configuration
  const columns: TableColumn<PickupHistoryItem>[] = [
    {
      key: 'date',
      title: 'Date & Time',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <CalendarDaysIcon className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {value ? new Date(value).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              {value ? new Date(value).toLocaleTimeString() : 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'client',
      title: 'Client & Location',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPinIcon className="w-3 h-3 mr-1" />
            {item.location}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value as "completed" | "cancelled" | "disputed" | "paid"} />
    },
    {
      key: 'earnings',
      title: 'Earnings',
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <CurrencyDollarIcon className="w-4 h-4 text-gray-400 mr-1" />
          <span className="text-sm font-medium text-gray-900">
            {value ? (value as number).toLocaleString() : '0'} XAF
          </span>
        </div>
      )
    },
    {
      key: 'rating',
      title: 'Rating',
      render: (value) => value ? <RatingStars rating={value as number} /> : (
        <span className="text-xs text-gray-400">No rating</span>
      )
    }
  ];

  // Filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status.length > 0) {
      filtered = filtered.filter(item => filters.status.includes(item.status));
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(item =>
        new Date(item.date) >= new Date(filters.dateRange.start!)
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(item =>
        new Date(item.date) <= new Date(filters.dateRange.end!)
      );
    }

    if (filters.minEarnings) {
      filtered = filtered.filter(item => item.earnings >= filters.minEarnings!);
    }

    if (filters.maxEarnings) {
      filtered = filtered.filter(item => item.earnings <= filters.maxEarnings!);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof PickupHistoryItem];
      const bVal = b[sortConfig.key as keyof PickupHistoryItem];

      // Handle undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, searchTerm, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: [],
      dateRange: {}
    });
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={`${styles.container} ${styles.loading} ${className}`}>
        <div className={styles.content}>
          <div className={styles.loadingSkeleton}>
            <div className={styles.loadingTitle}></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.loadingRow}>
                <div className={styles.loadingCell}></div>
                <div className={styles.loadingCell}></div>
                <div className={styles.loadingCell}></div>
                <div className={styles.loadingCell}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>
            Pickup History
          </h3>
          <p className={styles.subtitle}>
            Track your completed pickups and earnings
          </p>
        </div>

        {/* Search */}
        {showSearch && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by client or location..."
          />
        )}

        {/* Filters */}
        {showFilters && (
          <TableFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={clearFilters}
          />
        )}

        {/* Table */}
        {paginatedData.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key as string}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                        }`}
                        onClick={column.sortable ? () => handleSort(column.key as string) : undefined}
                        style={column.width ? { width: column.width } : undefined}
                      >
                        <div className="flex items-center">
                          {column.title}
                          {column.sortable && sortConfig.key === column.key && (
                            <span className="ml-1">
                              {sortConfig.direction === 'asc' ? (
                                <ArrowUpIcon className="w-4 h-4" />
                              ) : (
                                <ArrowDownIcon className="w-4 h-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 ${onItemClick ? 'cursor-pointer' : ''}`}
                      onClick={() => onItemClick?.(item)}
                    >
                      {columns.map((column) => (
                        <td key={column.key as string} className="px-6 py-4 whitespace-nowrap">
                          {column.render
                            ? column.render(item[column.key], item, index)
                            : item[column.key]
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredAndSortedData.length}
                pageSize={pageSize}
              />
            )}
          </>
        ) : (
          <div className="text-center py-8">
            {emptyState || (
              <div>
                <div className="text-gray-400 text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pickup history</h3>
                <p className="text-gray-500">
                  Your completed pickups will appear here once you start working.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupHistoryTable;