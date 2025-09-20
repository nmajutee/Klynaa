import React from 'react';
import { cn } from '../../utils/cn';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn('w-full p-8 text-center', className)}>
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('w-full p-8 text-center text-gray-500', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-700"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={cn(
                'hover:bg-gray-50',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(item, index)}
            >
              {columns.map((column) => {
                const value = item[column.key as keyof T];
                return (
                  <td
                    key={String(column.key)}
                    className="border border-gray-200 px-4 py-2"
                  >
                    {column.render ? column.render(value, item, index) : String(value || '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}