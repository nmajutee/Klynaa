/**
 * useEarnings Hook
 * Custom hook for managing earnings state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { httpClient } from '../lib/http-client';
import type {
  EarningsData,
  WithdrawalRequest,
  EarningsPeriod,
  LoadingState,
  Transaction
} from '../types';

// Inline earnings service methods for now
const getEarnings = async (period: EarningsPeriod): Promise<EarningsData> => {
  const response = await httpClient.get<EarningsData>(`/api/v1/worker/earnings?period=${period}`);
  return response.data;
};

const requestWithdrawal = async (request: WithdrawalRequest): Promise<{ withdrawalId: string }> => {
  const response = await httpClient.post<{ withdrawalId: string }>('/api/v1/worker/earnings/withdraw', request);
  return response.data;
};

interface UseEarningsReturn {
  // Data
  earnings: EarningsData | null;
  loading: LoadingState;
  error: string | null;

  // Actions
  fetchEarnings: (period?: EarningsPeriod) => Promise<void>;
  requestWithdrawal: (request: WithdrawalRequest) => Promise<boolean>;
  refreshData: () => Promise<void>;

  // State
  selectedPeriod: EarningsPeriod;
  setSelectedPeriod: (period: EarningsPeriod) => void;
}

export const useEarnings = (initialPeriod: EarningsPeriod = 'this_month'): UseEarningsReturn => {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<EarningsPeriod>(initialPeriod);

  const fetchEarnings = useCallback(async (period?: EarningsPeriod) => {
    const periodToUse = period || selectedPeriod;

    try {
      setLoading('loading');
      setError(null);

      const data = await getEarnings(periodToUse);
      setEarnings(data);
      setLoading('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setLoading('error');
      console.error('Failed to fetch earnings:', err);
    }
  }, [selectedPeriod]);

  const requestWithdrawal = useCallback(async (request: WithdrawalRequest): Promise<boolean> => {
    try {
      setLoading('loading');
      setError(null);

      await requestWithdrawal(request);
      // Refresh earnings data after successful withdrawal request
      await fetchEarnings();
      setLoading('success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal request failed';
      setError(errorMessage);
      setLoading('error');
      console.error('Failed to request withdrawal:', err);
      return false;
    }
  }, [fetchEarnings]);

  const refreshData = useCallback(async () => {
    await fetchEarnings();
  }, [fetchEarnings]);

  // Fetch initial data
  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  // Update data when period changes
  useEffect(() => {
    if (earnings) {
      fetchEarnings(selectedPeriod);
    }
  }, [selectedPeriod, fetchEarnings, earnings]);

  return {
    earnings,
    loading,
    error,
    fetchEarnings,
    requestWithdrawal,
    refreshData,
    selectedPeriod,
    setSelectedPeriod,
  };
};