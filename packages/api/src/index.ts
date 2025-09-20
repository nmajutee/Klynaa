// API Client
export { ApiClient, apiClient } from './client';
export { queryClient } from './query-client';

// React Query Hooks (these contain the duplicate types)
export * from './hooks/useAuth';
export * from './hooks/useBins';
export * from './hooks/usePickups';

// Base types only (avoiding conflicts)
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError
} from './types';