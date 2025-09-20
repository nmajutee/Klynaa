// Base response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

// Common filter types
export interface DateRange {
  start: string;
  end: string;
}

export interface LocationFilter {
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

// Sort types
export type SortDirection = 'asc' | 'desc';

export interface SortParams {
  sortBy: string;
  sortDirection: SortDirection;
}