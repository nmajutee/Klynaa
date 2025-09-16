import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardOverviewData, DashboardError, DateRange } from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';

interface UseDashboardDataOptions {
  dateRange?: DateRange;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

interface UseDashboardDataReturn {
  data: DashboardOverviewData | null;
  loading: boolean;
  error: DashboardError | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  setDateRange: (range: DateRange) => void;
}

export function useDashboardData(options: UseDashboardDataOptions = {}): UseDashboardDataReturn {
  const {
    dateRange,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute default
    enabled = true
  } = options;

  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DashboardError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentDateRange, setCurrentDateRange] = useState<DateRange | undefined>(dateRange);

  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!enabled) return;

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await dashboardService.getOverview(currentDateRange);

      if (mountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
        setLoading(false);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        const dashboardError: DashboardError = {
          message: err.message || 'Failed to fetch dashboard data',
          code: err.response?.status?.toString(),
          details: err.response?.data
        };
        setError(dashboardError);
        setLoading(false);
      }
    }
  }, [enabled, currentDateRange]);

  const refresh = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  const setDateRange = useCallback((range: DateRange) => {
    setCurrentDateRange(range);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !enabled) {
      return;
    }

    const setupRefresh = () => {
      refreshTimeoutRef.current = setTimeout(() => {
        refresh().finally(() => {
          if (mountedRef.current) {
            setupRefresh();
          }
        });
      }, refreshInterval);
    };

    setupRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, enabled, refreshInterval, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    setDateRange
  };
}

// Hook for polling specific data sections
export function usePolling<T>(
  fetchFunction: () => Promise<T>,
  interval: number = 30000,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      const result = await fetchFunction();
      if (mountedRef.current) {
        setData(result);
        setError(null);
        setLoading(false);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Failed to fetch data');
        setLoading(false);
      }
    }
  }, [fetchFunction, enabled]);

  useEffect(() => {
    fetchData();

    if (enabled && interval > 0) {
      intervalRef.current = setInterval(fetchData, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval, enabled]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { data, loading, error, refresh: fetchData };
}