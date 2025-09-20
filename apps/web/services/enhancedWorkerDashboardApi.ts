/**
 * Enhanced Worker Dashboard API Service
 * Matches the enhanced backend API specification
 */

import api from './api';

export interface WorkerStatus {
  status: 'active' | 'offline' | 'verification_required' | 'disabled';
  color: string;
  label: string;
}

export interface OverviewCard {
  value: number;
  currency?: string;
  formatted: string;
  icon: string;
  color: string;
  label?: string;
  total_reviews?: number;
}

export interface DashboardOverview {
  profile: {
    id: number;
    name: string;
    profile_picture: string | null;
    status: WorkerStatus;
    location: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  overview_cards: {
    total_earnings: OverviewCard;
    pending_pickups: OverviewCard;
    completed_pickups: OverviewCard;
    average_rating: OverviewCard;
  };
  quick_stats: {
    completed_today: number;
    completed_this_week: number;
    completed_this_month: number;
  };
}

export interface PendingPickup {
  id: number;
  owner_name: string;
  owner_phone: string | null;
  location: {
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
  status: string;
  status_display: string;
  time_date: string;
  formatted_time: string;
  expected_fee: number;
  waste_type: string;
  estimated_weight: number | null;
  notes: string;
  actions: {
    can_accept: boolean;
    can_decline: boolean;
    can_start: boolean;
    can_complete: boolean;
    can_report: boolean;
    can_chat: boolean;
  };
}

export interface CompletedPickup {
  id: number;
  owner_name: string;
  location: string;
  completed_date: string;
  completed_time: string;
  actual_fee: number;
  rating: {
    rating: number;
    comment: string;
    created_at: string;
  } | null;
  waste_type: string;
  pickup_proof: {
    has_proof: boolean;
    status: string | null;
  };
}

export interface AvailablePickup {
  id: number;
  owner_name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    distance_km: number | null;
  };
  expected_fee: number;
  waste_type: string;
  estimated_weight: number | null;
  created_at: string;
  formatted_time: string;
  urgency: 'high' | 'normal';
  bin_status: string;
  fill_level: number | null;
}

export interface EarningsSummary {
  period: string;
  summary: {
    total_earnings: {
      usd: number;
      xaf: number;
      formatted: string;
    };
    pending_earnings: {
      usd: number;
      xaf: number;
      formatted: string;
    };
    paid_earnings: {
      usd: number;
      xaf: number;
      formatted: string;
    };
  };
  transactions: Array<{
    id: number;
    pickup_id: number;
    amount: number;
    amount_xaf: number;
    status: string;
    earned_at: string;
    formatted_date: string;
    customer_name: string;
    location: string;
    payout_date: string | null;
  }>;
  can_request_payout: boolean;
}

export interface ChatMessage {
  id: number;
  sender: {
    id: number;
    name: string;
    is_worker: boolean;
  };
  message: string;
  image_url: string | null;
  created_at: string;
  formatted_time: string;
}

export interface ChatRoom {
  room_id: number;
  customer: {
    name: string;
    phone: string | null;
  };
  pickup: {
    id: number;
    status: string;
    location: string | null;
  };
  messages: ChatMessage[];
  quick_replies: Array<{
    id: number;
    text: string;
    category?: string;
  }>;
}

export interface QuickReply {
  id: number;
  text: string;
  category: string;
}

class EnhancedWorkerDashboardAPI {
  private baseURL = '/api/users/worker';

  // Dashboard Overview
  async getOverview(): Promise<{ data: DashboardOverview }> {
    const response = await api.get(`${this.baseURL}/dashboard/overview/`);
    return response.data;
  }

  // Pickup Management
  async getPendingPickups(): Promise<{ data: { count: number; pending_pickups: PendingPickup[] } }> {
    const response = await api.get(`${this.baseURL}/dashboard/pending_pickups/`);
    return response.data;
  }

  async getCompletedPickups(pageSize: number = 20): Promise<{ data: { count: number; completed_pickups: CompletedPickup[] } }> {
    const response = await api.get(`${this.baseURL}/dashboard/completed_pickups/`, {
      params: { page_size: pageSize }
    });
    return response.data;
  }

  async getAvailablePickups(): Promise<{ data: { count: number; worker_location: any; available_pickups: AvailablePickup[] } }> {
    const response = await api.get(`${this.baseURL}/dashboard/available_pickups/`);
    return response.data;
  }

  // Status Management
  async updateStatus(data: {
    is_available?: boolean;
    latitude?: number;
    longitude?: number;
  }): Promise<{ data: any }> {
    const response = await api.patch(`${this.baseURL}/dashboard/update_status/`, data);
    return response.data;
  }

  // Pickup Actions
  async acceptPickup(pickupId: number): Promise<{ data: any }> {
    const response = await api.post(`${this.baseURL}/pickups/${pickupId}/accept/`);
    return response.data;
  }

  async declinePickup(pickupId: number, reason?: string): Promise<{ data: any }> {
    const response = await api.post(`${this.baseURL}/pickups/${pickupId}/decline/`, {
      reason: reason || 'Not available'
    });
    return response.data;
  }

  async startPickup(pickupId: number): Promise<{ data: any }> {
    const response = await api.post(`${this.baseURL}/pickups/${pickupId}/start/`);
    return response.data;
  }

  async completePickup(pickupId: number, data: {
    actual_weight_kg?: number;
    notes?: string;
  }): Promise<{ data: any }> {
    const response = await api.post(`${this.baseURL}/pickups/${pickupId}/complete/`, data);
    return response.data;
  }

  async reportIssue(pickupId: number, data: {
    issue_type: string;
    description: string;
  }): Promise<{ data: any }> {
    const response = await api.post(`${this.baseURL}/pickups/${pickupId}/report_issue/`, data);
    return response.data;
  }

  // Earnings
  async getEarnings(period: 'daily' | 'weekly' | 'monthly' | 'all' = 'all'): Promise<{ data: EarningsSummary }> {
    const response = await api.get(`${this.baseURL}/earnings/`, {
      params: { period }
    });
    return response.data;
  }

  async requestPayout(data: {
    method: string;
    details: any;
  }): Promise<{ data: any }> {
    const response = await api.post(`${this.baseURL}/earnings/`, data);
    return response.data;
  }

  // Chat
  async getChatMessages(roomId: number): Promise<{ data: ChatRoom }> {
    const response = await api.get(`${this.baseURL}/chat/${roomId}/`);
    return response.data;
  }

  async sendMessage(roomId: number, data: {
    message?: string;
    image?: File;
  }): Promise<{ data: any }> {
    const formData = new FormData();
    if (data.message) formData.append('message', data.message);
    if (data.image) formData.append('image', data.image);

    const response = await api.post(`${this.baseURL}/chat/${roomId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getQuickReplies(): Promise<{ data: { quick_replies: QuickReply[] } }> {
    const response = await api.get(`${this.baseURL}/quick-replies/`);
    return response.data;
  }

  // Legacy compatibility methods (keeping for backward compatibility)
  async getWorkerStats(): Promise<any> {
    // Map to new overview format for backward compatibility
    const response = await this.getOverview();
    return {
      total_pickups: response.data.overview_cards.completed_pickups.value,
      total_earnings: response.data.overview_cards.total_earnings.value,
      this_week_pickups: response.data.quick_stats.completed_this_week,
      average_rating: response.data.overview_cards.average_rating.value,
    };
  }

  async getMyPickups(params: any): Promise<any> {
    // Map to new pending pickups format for backward compatibility
    const response = await this.getPendingPickups();
    return {
      results: response.data.pending_pickups.map(pickup => ({
        id: pickup.id,
        pickup_location: pickup.location.address,
        pickup_time: pickup.time_date,
        status: pickup.status,
      }))
    };
  }

  async toggleWorkerStatus(isAvailable: boolean): Promise<any> {
    return this.updateStatus({ is_available: isAvailable });
  }
}

export const enhancedWorkerDashboardApi = new EnhancedWorkerDashboardAPI();

// Export for backward compatibility
export const workerDashboardApi = enhancedWorkerDashboardApi;
