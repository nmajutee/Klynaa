import React, { useState, useMemo, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';
import { Button } from './Button';
import { Text } from './Typography';
import { LoadingSpinner } from './Loading';

// Table Types and Interfaces
export interface Column<T = any> {
  key: string;
  header: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
  accessor?: (row: T) => any;
  sortFn?: (a: T, b: T) => number;
  filterFn?: (row: T, filterValue: string) => boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableFilter {
  [key: string]: string;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

// Table Component
export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  onSort?: (sortConfig: SortConfig) => void;
  onFilter?: (filters: TableFilter) => void;
  onRowClick?: (row: T, index: number) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  sortConfig?: SortConfig;
  filters?: TableFilter;
  selectable?: boolean;
  selectedRows?: T[];
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  emptyMessage?: string;
  stickyHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  getRowId?: (row: T, index: number) => string | number;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  onSort,
  onFilter,
  onRowClick,
  onRowSelect,
  sortConfig,
  filters = {},
  selectable = false,
  selectedRows = [],
  pagination,
  onPageChange,
  onPageSizeChange,
  emptyMessage = 'No data available',
  stickyHeader = false,
  striped = false,
  hoverable = true,
  compact = false,
  className,
  rowClassName,
  getRowId = (row, index) => index,
}: DataTableProps<T>) => {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizing, setResizing] = useState<{ column: string; startX: number; startWidth: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Local sorting and filtering if not controlled
  const [localSortConfig, setLocalSortConfig] = useState<SortConfig | null>(null);
  const [localFilters, setLocalFilters] = useState<TableFilter>({});

  const currentSortConfig = sortConfig || localSortConfig;
  const currentFilters = filters || localFilters;

  // Process data (sort and filter)
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(currentFilters).forEach(([key, filterValue]) => {
      if (!filterValue) return;

      const column = columns.find(col => col.key === key);
      if (column?.filterFn) {
        result = result.filter(row => column.filterFn!(row, filterValue));
      } else {
        result = result.filter(row => {
          const value = column?.accessor ? column.accessor(row) : row[key];
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (currentSortConfig) {
      const column = columns.find(col => col.key === currentSortConfig.key);
      result.sort((a, b) => {
        if (column?.sortFn) {
          const sortResult = column.sortFn(a, b);
          return currentSortConfig.direction === 'desc' ? -sortResult : sortResult;
        }

        const aVal = column?.accessor ? column.accessor(a) : a[currentSortConfig.key];
        const bVal = column?.accessor ? column.accessor(b) : b[currentSortConfig.key];

        if (aVal < bVal) return currentSortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, columns, currentSortConfig, currentFilters]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;

    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return processedData.slice(start, end);
  }, [processedData, pagination]);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    const newDirection: 'asc' | 'desc' =
      currentSortConfig?.key === columnKey && currentSortConfig.direction === 'asc'
        ? 'desc'
        : 'asc';

    const newSortConfig = { key: columnKey, direction: newDirection };

    if (onSort) {
      onSort(newSortConfig);
    } else {
      setLocalSortConfig(newSortConfig);
    }
  };

  const handleFilter = (columnKey: string, filterValue: string) => {
    const newFilters = { ...currentFilters, [columnKey]: filterValue };

    if (onFilter) {
      onFilter(newFilters);
    } else {
      setLocalFilters(newFilters);
    }
  };

  const handleRowSelect = (row: T, isSelected: boolean) => {
    if (!onRowSelect) return;

    let newSelectedRows;
    if (isSelected) {
      newSelectedRows = [...selectedRows, row];
    } else {
      newSelectedRows = selectedRows.filter(selectedRow =>
        getRowId(selectedRow, 0) !== getRowId(row, 0)
      );
    }

    onRowSelect(newSelectedRows);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (!onRowSelect) return;

    if (isSelected) {
      onRowSelect([...selectedRows, ...paginatedData]);
    } else {
      const currentPageIds = paginatedData.map((row, index) => getRowId(row, index));
      onRowSelect(selectedRows.filter(selectedRow =>
        !currentPageIds.includes(getRowId(selectedRow, 0))
      ));
    }
  };

  const isRowSelected = (row: T) => {
    return selectedRows.some(selectedRow =>
      getRowId(selectedRow, 0) === getRowId(row, 0)
    );
  };

  const isAllSelected = () => {
    return paginatedData.length > 0 && paginatedData.every(row => isRowSelected(row));
  };

  const isSomeSelected = () => {
    return paginatedData.some(row => isRowSelected(row));
  };

  // Column resizing
  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).closest('th')?.getBoundingClientRect();
    if (rect) {
      setResizing({
        column: columnKey,
        startX: e.clientX,
        startWidth: columnWidths[columnKey] || rect.width,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;

      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(50, resizing.startWidth + diff);

      setColumnWidths(prev => ({
        ...prev,
        [resizing.column]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <Icons.AlertCircle className="mx-auto h-12 w-12 text-danger-500 mb-4" />
        <Text variant="body" color="danger">
          {error}
        </Text>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className={cn(
            'min-w-full divide-y divide-neutral-200',
            striped && 'table-striped'
          )}
        >
          <thead
            className={cn(
              'bg-neutral-50',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {selectable && (
                <th className="px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected()}
                    ref={(el) => {
                      if (el) el.indeterminate = !isAllSelected() && isSomeSelected();
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-3 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:text-neutral-700 select-none',
                    compact && 'px-2 py-2'
                  )}
                  style={{
                    width: columnWidths[column.key] || column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center justify-between relative">
                    <span>{column.header}</span>

                    {column.sortable && (
                      <div className="flex flex-col ml-1">
                        <Icons.ChevronUp
                          className={cn(
                            'h-3 w-3',
                            currentSortConfig?.key === column.key && currentSortConfig.direction === 'asc'
                              ? 'text-primary-600'
                              : 'text-neutral-400'
                          )}
                        />
                        <Icons.ChevronDown
                          className={cn(
                            'h-3 w-3 -mt-1',
                            currentSortConfig?.key === column.key && currentSortConfig.direction === 'desc'
                              ? 'text-primary-600'
                              : 'text-neutral-400'
                          )}
                        />
                      </div>
                    )}

                    {column.resizable && (
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary-500"
                        onMouseDown={(e) => handleMouseDown(e, column.key)}
                      />
                    )}
                  </div>

                  {column.filterable && (
                    <div className="mt-1">
                      <input
                        type="text"
                        placeholder={`Filter ${column.header}`}
                        value={currentFilters[column.key] || ''}
                        onChange={(e) => handleFilter(column.key, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-neutral-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-3 py-8">
                  <LoadingSpinner size="md" className="mx-auto" />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-3 py-8 text-center">
                  <Text variant="body" color="muted">
                    {emptyMessage}
                  </Text>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const isSelected = isRowSelected(row);

                return (
                  <tr
                    key={getRowId(row, index)}
                    className={cn(
                      'transition-colors',
                      hoverable && 'hover:bg-neutral-50',
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-primary-50',
                      rowClassName && rowClassName(row, index)
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {selectable && (
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRowSelect(row, e.target.checked);
                          }}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                    )}

                    {columns.map((column) => {
                      const value = column.accessor ? column.accessor(row) : row[column.key];

                      return (
                        <td
                          key={column.key}
                          className={cn(
                            'px-3 py-4 whitespace-nowrap text-sm',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            compact && 'px-2 py-2'
                          )}
                        >
                          {column.render ? column.render(value, row, index) : value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <TablePagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          total={processedData.length}
        />
      )}
    </div>
  );
};

// Table Pagination Component
export interface TablePaginationProps {
  pagination: PaginationConfig;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  total?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  total = pagination.total,
  showSizeChanger = true,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = false,
  className,
}) => {
  const [jumpToPage, setJumpToPage] = useState('');

  const totalPages = Math.ceil(total / pagination.pageSize);
  const startItem = (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, total);

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange?.(page);
      setJumpToPage('');
    }
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page buttons to show
    const halfShow = Math.floor(showPages / 2);

    let startPage = Math.max(1, pagination.page - halfShow);
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-4 border-t border-neutral-200',
      className
    )}>
      <div className="flex items-center space-x-4">
        <Text variant="caption" color="muted">
          Showing {startItem} to {endItem} of {total} results
        </Text>

        {showSizeChanger && (
          <div className="flex items-center space-x-2">
            <Text variant="caption" color="muted">
              Show
            </Text>
            <select
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange?.(parseInt(e.target.value))}
              className="border border-neutral-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {showQuickJumper && (
          <div className="flex items-center space-x-2">
            <Text variant="caption" color="muted">
              Go to
            </Text>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
              className="w-16 border border-neutral-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <Button size="sm" onClick={handleJumpToPage}>
              Go
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange?.(pagination.page - 1)}
          >
            <Icons.ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <span className="px-2 py-1 text-sm text-neutral-500">...</span>
              ) : (
                <Button
                  variant={pageNum === pagination.page ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => typeof pageNum === 'number' && onPageChange?.(pageNum)}
                >
                  {pageNum}
                </Button>
              )}
            </React.Fragment>
          ))}

          <Button
            variant="ghost"
            size="sm"
            disabled={pagination.page >= totalPages}
            onClick={() => onPageChange?.(pagination.page + 1)}
          >
            <Icons.ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;