import { httpClient } from '@/lib/http-client';
import { Pickup, PickupRequestForm, PaginatedResponse, Route } from '@/types';

/**
 * Pickups Service
 * Manages pickup requests, assignments, and route optimization
 */
export class PickupsService {
  /**
   * Get all pickups with optional filtering
   */
  async getPickups(params?: {
    page?: number;
    limit?: number;
    status?: string;
    worker_id?: number;
    bin_id?: string;
    date_from?: string;
    date_to?: string;
  }) {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = searchParams.toString() ? `/pickups/?${searchParams}` : '/pickups/';
    const response = await httpClient.get<PaginatedResponse<Pickup>>(url);
    return response.data;
  }

  /**
   * Get a specific pickup by ID
   */
  async getPickup(id: string) {
    const response = await httpClient.get<Pickup>(`/pickups/${id}/`);
    return response.data;
  }

  /**
   * Create a new pickup request
   */
  async createPickupRequest(requestData: PickupRequestForm) {
    const response = await httpClient.post<Pickup>('/pickups/', requestData);
    return response.data;
  }

  /**
   * Accept a pickup request (worker)
   */
  async acceptPickup(id: string) {
    const response = await httpClient.post<Pickup>(`/pickups/${id}/accept/`);
    return response.data;
  }

  /**
   * Start pickup process (worker)
   */
  async startPickup(id: string) {
    const response = await httpClient.post<Pickup>(`/pickups/${id}/start/`);
    return response.data;
  }

  /**
   * Complete pickup with photos and notes
   */
  async completePickup(
    id: string,
    completionData: {
      notes?: string;
      before_photo?: File;
      after_photo?: File;
      actual_time?: number;
    }
  ) {
    const formData = new FormData();

    if (completionData.notes) {
      formData.append('notes', completionData.notes);
    }

    if (completionData.actual_time) {
      formData.append('actual_time', completionData.actual_time.toString());
    }

    if (completionData.before_photo) {
      formData.append('before_photo', completionData.before_photo);
    }

    if (completionData.after_photo) {
      formData.append('after_photo', completionData.after_photo);
    }

    const response = await httpClient.upload<Pickup>(`/pickups/${id}/complete/`, formData);
    return response.data;
  }

  /**
   * Cancel a pickup request
   */
  async cancelPickup(id: string, reason?: string) {
    const response = await httpClient.post<Pickup>(`/pickups/${id}/cancel/`, {
      cancellation_reason: reason,
    });
    return response.data;
  }

  /**
   * Get available pickups for workers
   */
  async getAvailablePickups(latitude?: number, longitude?: number, radius?: number) {
    const params = new URLSearchParams();
    params.append('status', 'pending');

    if (latitude && longitude) {
      params.append('latitude', latitude.toString());
      params.append('longitude', longitude.toString());
    }

    if (radius) {
      params.append('radius', radius.toString());
    }

    const response = await httpClient.get<Pickup[]>(`/pickups/available/?${params}`);
    return response.data;
  }

  /**
   * Get worker's active pickups
   */
  async getMyActivePickups() {
    const response = await httpClient.get<Pickup[]>('/pickups/my/active/');
    return response.data;
  }

  /**
   * Get worker's pickup history
   */
  async getMyPickupHistory(limit?: number) {
    const url = limit ? `/pickups/my/history/?limit=${limit}` : '/pickups/my/history/';
    const response = await httpClient.get<PaginatedResponse<Pickup>>(url);
    return response.data;
  }

  /**
   * Get customer's pickup requests
   */
  async getMyPickupRequests() {
    const response = await httpClient.get<Pickup[]>('/pickups/my/requests/');
    return response.data;
  }

  /**
   * Rate a completed pickup
   */
  async ratePickup(id: string, rating: number, comment?: string) {
    const response = await httpClient.post<{ message: string }>(`/pickups/${id}/rate/`, {
      rating,
      comment,
    });
    return response.data;
  }

  /**
   * Get pickup estimates
   */
  async getPickupEstimate(binId: string, scheduledTime?: string) {
    const data: any = { bin_id: binId };
    if (scheduledTime) {
      data.scheduled_time = scheduledTime;
    }

    const response = await httpClient.post<{
      estimated_time: number;
      estimated_cost: number;
      distance: number;
      available_workers: number;
    }>('/pickups/estimate/', data);

    return response.data;
  }

  /**
   * Create optimized route for multiple pickups
   */
  async createOptimizedRoute(pickupIds: string[]) {
    const response = await httpClient.post<Route>('/routes/optimize/', {
      pickup_ids: pickupIds,
    });
    return response.data;
  }

  /**
   * Get worker's current route
   */
  async getCurrentRoute() {
    const response = await httpClient.get<Route>('/routes/current/');
    return response.data;
  }

  /**
   * Update route status
   */
  async updateRouteStatus(routeId: string, status: 'active' | 'completed') {
    const response = await httpClient.patch<Route>(`/routes/${routeId}/`, { status });
    return response.data;
  }

  /**
   * Get pickup statistics
   */
  async getPickupStats(timeframe?: 'today' | 'week' | 'month') {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    const response = await httpClient.get<{
      total_pickups: number;
      completed_pickups: number;
      pending_pickups: number;
      cancelled_pickups: number;
      avg_completion_time: number;
      total_earnings: number;
      avg_rating: number;
    }>(`/pickups/stats/${params}`);
    return response.data;
  }

  /**
   * Report pickup issue
   */
  async reportIssue(pickupId: string, issue: {
    type: 'access_denied' | 'bin_not_found' | 'safety_concern' | 'other';
    description: string;
    photo?: File;
  }) {
    const formData = new FormData();
    formData.append('type', issue.type);
    formData.append('description', issue.description);

    if (issue.photo) {
      formData.append('photo', issue.photo);
    }

    const response = await httpClient.upload<{ message: string }>(
      `/pickups/${pickupId}/report-issue/`,
      formData
    );
    return response.data;
  }

  /**
   * Worker-specific enterprise methods
   */

  /**
   * Accept an available pickup for worker
   */
  async acceptWorkerPickup(pickupId: number) {
    const response = await httpClient.post<any>(`/worker/pickups/${pickupId}/accept`);
    return response.data;
  }

  /**
   * Get worker's pickups
   */
  async getMyPickups(params?: {
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await httpClient.get<any[]>(
      `/worker/pickups/my-pickups?${searchParams.toString()}`
    );
    return response.data;
  }

  /**
   * Update pickup status for worker
   */
  async updatePickupStatus(
    pickupId: number,
    status: 'in_progress' | 'completed' | 'cancelled',
    data?: {
      latitude?: number;
      longitude?: number;
      notes?: string;
      photos?: string[];
    }
  ) {
    const response = await httpClient.patch<any>(`/worker/pickups/${pickupId}/status`, {
      status,
      ...data,
    });
    return response.data;
  }
}

// Export singleton instance
export const pickupsService = new PickupsService();