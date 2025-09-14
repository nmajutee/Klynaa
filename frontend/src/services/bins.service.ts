import { httpClient } from '@/lib/http-client';
import { Bin, BinForm, PaginatedResponse } from '@/types';

/**
 * Bins Service
 * Manages waste bin operations including CRUD operations and filtering
 */
export class BinsService {
  /**
   * Get all bins with optional filtering
   */
  async getBins(params?: {
    page?: number;
    limit?: number;
    waste_type?: string;
    status?: string;
    owner_id?: number;
    latitude?: number;
    longitude?: number;
    radius?: number; // in kilometers
  }) {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = searchParams.toString() ? `/bins/?${searchParams}` : '/bins/';
    const response = await httpClient.get<PaginatedResponse<Bin>>(url);
    return response.data;
  }

  /**
   * Get a specific bin by ID
   */
  async getBin(id: string) {
    const response = await httpClient.get<Bin>(`/bins/${id}/`);
    return response.data;
  }

  /**
   * Create a new bin
   */
  async createBin(binData: BinForm) {
    const response = await httpClient.post<Bin>('/bins/', binData);
    return response.data;
  }

  /**
   * Update an existing bin
   */
  async updateBin(id: string, updates: Partial<BinForm>) {
    const response = await httpClient.patch<Bin>(`/bins/${id}/`, updates);
    return response.data;
  }

  /**
   * Delete a bin
   */
  async deleteBin(id: string) {
    const response = await httpClient.delete<{ message: string }>(`/bins/${id}/`);
    return response.data;
  }

  /**
   * Update bin fill level
   */
  async updateFillLevel(id: string, fillLevel: number) {
    const response = await httpClient.patch<Bin>(`/bins/${id}/`, {
      fill_level: fillLevel,
    });
    return response.data;
  }

  /**
   * Get bins owned by current user
   */
  async getMyBins() {
    const response = await httpClient.get<Bin[]>('/bins/my/');
    return response.data;
  }

  /**
   * Get bins near a location
   */
  async getBinsNearLocation(latitude: number, longitude: number, radius: number = 5) {
    const response = await httpClient.get<Bin[]>(
      `/bins/near/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
    return response.data;
  }

  /**
   * Get bins requiring pickup (high fill level)
   */
  async getBinsRequiringPickup(fillLevelThreshold: number = 80) {
    const response = await httpClient.get<Bin[]>(
      `/bins/requiring-pickup/?threshold=${fillLevelThreshold}`
    );
    return response.data;
  }

  /**
   * Upload bin photo
   */
  async uploadBinPhoto(binId: string, photoFile: File) {
    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await httpClient.upload<{ photo_url: string }>(
      `/bins/${binId}/photo/`,
      formData
    );
    return response.data;
  }

  /**
   * Get bin statistics
   */
  async getBinStats() {
    const response = await httpClient.get<{
      total_bins: number;
      bins_by_status: Record<string, number>;
      bins_by_waste_type: Record<string, number>;
      avg_fill_level: number;
      bins_requiring_pickup: number;
    }>('/bins/stats/');
    return response.data;
  }

  /**
   * Set bin maintenance status
   */
  async setBinMaintenance(id: string, inMaintenance: boolean, notes?: string) {
    const response = await httpClient.patch<Bin>(`/bins/${id}/`, {
      status: inMaintenance ? 'maintenance' : 'empty',
      maintenance_notes: notes,
    });
    return response.data;
  }

  /**
   * Get bin collection history
   */
  async getBinHistory(id: string, limit?: number) {
    const url = limit ? `/bins/${id}/history/?limit=${limit}` : `/bins/${id}/history/`;
    const response = await httpClient.get<{
      collections: Array<{
        id: string;
        collected_at: string;
        worker_name: string;
        fill_level_before: number;
        fill_level_after: number;
        notes?: string;
      }>;
    }>(url);
    return response.data;
  }
}

// Export singleton instance
export const binsService = new BinsService();