/**
 * Customer Dashboard API Service
 * Handles all API calls related to customer functionality
 */

import { apiClient } from './api';

// Types
export interface CustomerStats {
  total_bins: number;
  active_bins: number;
  total_pickups: number;
  pending_pickups: number;
  completed_pickups: number;
  total_spent: string;
  this_month_pickups: number;
  average_rating_given: number;
}

export interface Bin {
  id: number;
  bin_id: string;
  label: string;
  latitude: number;
  longitude: number;
  address: string;
  status: 'active' | 'inactive' | 'maintenance' | 'full';
  fill_level: number;
  capacity_liters: number;
  created_at: string;
  updated_at: string;
  last_pickup: string | null;
  owner_name: string;
  last_pickup_date: string | null;
  fill_percentage: number;
}

export interface WorkerSummary {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number?: string;
  rating_average: number;
}

export interface PickupRequest {
  id: number;
  bin: number;
  bin_address: string;
  bin_label: string;
  status: 'open' | 'accepted' | 'picked' | 'completed' | 'cancelled';
  status_display: string;
  created_at: string;
  accepted_at: string | null;
  picked_at: string | null;
  completed_at: string | null;
  expected_fee: string;
  actual_fee: string | null;
  payment_method: 'cash' | 'mobile_money' | 'card';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes: string;
  cancellation_reason: string | null;
  waste_type: string;
  estimated_weight_kg: string;
  pickup_time_window_start: string;
  pickup_time_window_end: string;
  worker_info: WorkerSummary | null;
  can_cancel: boolean;
  can_rate: boolean;
  estimated_arrival: string | null;
}

export interface CreatePickupRequest {
  bin_id: number;
  waste_type?: string;
  estimated_weight_kg?: number;
  preferred_pickup_time?: string;
  notes?: string;
  payment_method?: 'cash' | 'mobile_money' | 'card';
}

export interface CreateBin {
  label: string;
  latitude: number;
  longitude: number;
  address: string;
  capacity_liters?: number;
}

export interface CustomerProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_verified: boolean;
  latitude?: number;
  longitude?: number;
  date_joined: string;
  last_login: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  is_default: boolean;
}

export interface ReviewCreate {
  rating: number;
  comment?: string;
}

class CustomerDashboardAPI {
  private baseUrl = '/api/users/customer';

  // Dashboard Stats
  async getDashboardStats(): Promise<CustomerStats> {
    const response = await apiClient.get(`${this.baseUrl}/dashboard/stats/`);
    return response.data;
  }

  async getRecentActivity(): Promise<PickupRequest[]> {
    const response = await apiClient.get(`${this.baseUrl}/dashboard/recent_activity/`);
    return response.data;
  }

  // Pickup Management
  async getPickups(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: PickupRequest[];
  }> {
    const response = await apiClient.get(`${this.baseUrl}/pickups/`, { params });
    return response.data;
  }

  async getPickup(id: number): Promise<PickupRequest> {
    const response = await apiClient.get(`${this.baseUrl}/pickups/${id}/`);
    return response.data;
  }

  async createPickup(data: CreatePickupRequest): Promise<PickupRequest> {
    const response = await apiClient.post(`${this.baseUrl}/pickups/`, data);
    return response.data;
  }

  async cancelPickup(id: number, reason?: string): Promise<PickupRequest> {
    const response = await apiClient.post(`${this.baseUrl}/pickups/${id}/cancel/`, {
      cancellation_reason: reason
    });
    return response.data;
  }

  async rateWorker(pickupId: number, rating: ReviewCreate): Promise<void> {
    await apiClient.post(`${this.baseUrl}/pickups/${pickupId}/rate_worker/`, rating);
  }

  // Bin Management
  async getBins(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Bin[];
  }> {
    const response = await apiClient.get(`${this.baseUrl}/bins/`, { params });
    return response.data;
  }

  async getBin(id: number): Promise<Bin> {
    const response = await apiClient.get(`${this.baseUrl}/bins/${id}/`);
    return response.data;
  }

  async createBin(data: CreateBin): Promise<Bin> {
    const response = await apiClient.post(`${this.baseUrl}/bins/`, data);
    return response.data;
  }

  async updateBin(id: number, data: Partial<CreateBin>): Promise<Bin> {
    const response = await apiClient.patch(`${this.baseUrl}/bins/${id}/`, data);
    return response.data;
  }

  async deleteBin(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/bins/${id}/`);
  }

  async reportFullBin(id: number): Promise<Bin> {
    const response = await apiClient.post(`${this.baseUrl}/bins/${id}/report_full/`);
    return response.data;
  }

  async getBinPickupHistory(id: number): Promise<PickupRequest[]> {
    const response = await apiClient.get(`${this.baseUrl}/bins/${id}/pickup_history/`);
    return response.data;
  }

  // Profile Management
  async getProfile(): Promise<CustomerProfile> {
    const response = await apiClient.get(`${this.baseUrl}/profile/profile/`);
    return response.data;
  }

  async updateProfile(data: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const response = await apiClient.patch(`${this.baseUrl}/profile/profile/`, data);
    return response.data;
  }

  async updateLocation(latitude: number, longitude: number): Promise<CustomerProfile> {
    const response = await apiClient.post(`${this.baseUrl}/profile/update_location/`, {
      latitude,
      longitude
    });
    return response.data;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get(`${this.baseUrl}/profile/payment_methods/`);
    return response.data;
  }

  // Utility methods
  formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'open': 'bg-blue-100 text-blue-800',
      'accepted': 'bg-yellow-100 text-yellow-800',
      'picked': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'full': 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  getFillLevelColor(fillLevel: number): string {
    if (fillLevel >= 80) return 'text-red-600';
    if (fillLevel >= 60) return 'text-yellow-600';
    return 'text-green-600';
  }

  getFillLevelBgColor(fillLevel: number): string {
    if (fillLevel >= 80) return 'bg-red-500';
    if (fillLevel >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  }
}

export const customerDashboardApi = new CustomerDashboardAPI();