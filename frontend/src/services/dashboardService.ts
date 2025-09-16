import axios, { AxiosResponse } from 'axios';
import { DashboardOverviewData, DateRange } from '../types/dashboard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with auth interceptor
const dashboardApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
dashboardApi.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API errors
dashboardApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export class DashboardService {
  /**
   * Get comprehensive dashboard overview data
   */
  async getOverview(dateRange?: DateRange): Promise<DashboardOverviewData> {
    const params: Record<string, string> = {};

    if (dateRange) {
      params.start = dateRange.start;
      params.end = dateRange.end;
      if (dateRange.tz) {
        params.tz = dateRange.tz;
      }
    }

    try {
      const response: AxiosResponse<DashboardOverviewData> = await dashboardApi.get(
        '/analytics/overview/',
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('Dashboard overview fetch error:', error);
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch dashboard data'
      );
    }
  }

  /**
   * Get KPIs only (for quick updates)
   */
  async getKPIs(dateRange?: DateRange) {
    const data = await this.getOverview(dateRange);
    return data.kpis;
  }

  /**
   * Get trending chart data
   */
  async getTrendingData(dateRange?: DateRange) {
    const data = await this.getOverview(dateRange);
    return data.charts.trending;
  }

  /**
   * Get scorecard data with pagination
   */
  async getScorecardData(page = 1, pageSize = 10, dateRange?: DateRange) {
    // For now, we get all data and handle pagination on frontend
    // In production, this would be a separate paginated endpoint
    const data = await this.getOverview(dateRange);
    return data.scorecard;
  }

  /**
   * Get reviews data
   */
  async getReviewsData(limit = 5) {
    const data = await this.getOverview();
    return {
      ...data.reviews,
      recent: data.reviews.recent.slice(0, limit)
    };
  }

  /**
   * Export dashboard data
   */
  async exportData(format: 'csv' | 'xlsx' | 'pdf', dateRange?: DateRange): Promise<Blob> {
    const params: Record<string, string> = {
      format,
      export: 'true'
    };

    if (dateRange) {
      params.start = dateRange.start;
      params.end = dateRange.end;
    }

    try {
      const response = await dashboardApi.get('/analytics/overview/export/', {
        params,
        responseType: 'blob'
      });

      return response.data;
    } catch (error: any) {
      console.error('Dashboard export error:', error);
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'Failed to export dashboard data'
      );
    }
  }

  /**
   * Get real-time updates (for polling)
   */
  async getUpdates(lastUpdated?: string) {
    const params: Record<string, string> = {};
    if (lastUpdated) {
      params.since = lastUpdated;
    }

    // This would ideally be a lightweight endpoint that returns only changed data
    // For now, we'll use the main endpoint
    return this.getOverview();
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();