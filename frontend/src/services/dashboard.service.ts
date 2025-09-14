/**
 * Dashboard Service
 * Enterprise service for worker dashboard analytics and statistics
 */

import { httpClient } from '../lib/http-client';
import type { ApiResponse, WorkerStats, AvailablePickup, WorkerPickup } from '../types';

export class DashboardService {
  private readonly basePath = '/api/v1/worker';

  /**
   * Get worker statistics and analytics
   */
  async getWorkerStats(): Promise<WorkerStats> {
    const response = await httpClient.get<WorkerStats>(`${this.basePath}/stats`);
    return response.data;
  }

  /**
   * Get available pickups for the dashboard preview
   */
  async getAvailablePickupsPreview(limit: number = 3): Promise<AvailablePickup[]> {
    const response = await httpClient.get<AvailablePickup[]>(`${this.basePath}/available-pickups?limit=${limit}`);
    return response.data;
  }

  /**
   * Get worker's active pickups
   */
  async getActivePickups(): Promise<WorkerPickup[]> {
    const response = await httpClient.get<WorkerPickup[]>(`${this.basePath}/pickups/active`);
    return response.data;
  }

  /**
   * Get complete dashboard data
   */
  async getDashboard(): Promise<{
    stats: WorkerStats;
    availablePickups: AvailablePickup[];
    activePickups: WorkerPickup[];
    notifications: any[];
  }> {
    return this.getDashboardSummary();
  }

  /**
   * Get dashboard summary data
   */
  async getDashboardSummary(): Promise<{
    stats: WorkerStats;
    availablePickups: AvailablePickup[];
    activePickups: WorkerPickup[];
    notifications: any[];
  }> {
    const response = await httpClient.get<{
      stats: WorkerStats;
      availablePickups: AvailablePickup[];
      activePickups: WorkerPickup[];
      notifications: any[];
    }>(`${this.basePath}/dashboard/summary`);
    return response.data;
  }

  /**
   * Update worker status (active/offline)
   */
  async updateWorkerStatus(status: 'active' | 'offline'): Promise<{ status: string }> {
    const response = await httpClient.patch<{ status: string }>(`${this.basePath}/status`, { status });
    return response.data;
  }

  /**
   * Accept a pickup from dashboard
   */
  async acceptPickup(pickupId: number): Promise<WorkerPickup> {
    const response = await httpClient.post<WorkerPickup>(`${this.basePath}/pickups/${pickupId}/accept`);
    return response.data;
  }

  /**
   * Get real-time dashboard updates
   */
  async getRealtimeUpdates(): Promise<{
    newPickups: number;
    completedPickups: number;
    earnings: number;
    messages: number;
  }> {
    const response = await httpClient.get<{
      newPickups: number;
      completedPickups: number;
      earnings: number;
      messages: number;
    }>(`${this.basePath}/dashboard/updates`);
    return response.data;
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();