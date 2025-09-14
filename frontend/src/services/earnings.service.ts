/**
 * Earnings Service
 * Handles all earnings related API operations
 */

import { httpClient } from '../lib/http-client';
import type {
  EarningsData,
  WithdrawalRequest,
  WithdrawalHistory,
  Transaction,
  EarningsPeriod
} from '../types';

export class EarningsService {
  private readonly basePath = '/api/v1/worker/earnings';

  /**
   * Get worker earnings data
   */
  async getEarnings(period: EarningsPeriod): Promise<EarningsData> {
    const response = await httpClient.get<EarningsData>(`${this.basePath}?period=${period}`);
    return response.data;
  }

  /**
   * Get transaction history with pagination
   */
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: 'earnings' | 'withdrawal' | 'bonus';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    transactions: Transaction[];
    total: number;
    hasMore: boolean;
  }> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = searchParams.toString()
      ? `${this.basePath}/transactions?${searchParams}`
      : `${this.basePath}/transactions`;

    const response = await httpClient.get<{
      transactions: Transaction[];
      total: number;
      hasMore: boolean;
    }>(url);

    return response.data;
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawalHistory(): Promise<WithdrawalHistory[]> {
    const response = await httpClient.get<WithdrawalHistory[]>(`${this.basePath}/withdrawals`);
    return response.data;
  }

  /**
   * Request a withdrawal
   */
  async requestWithdrawal(request: WithdrawalRequest): Promise<{ withdrawalId: string }> {
    const response = await httpClient.post<{ withdrawalId: string }>(`${this.basePath}/withdraw`, request);
    return response.data;
  }
}

// Export singleton instance
export const earningsService = new EarningsService();