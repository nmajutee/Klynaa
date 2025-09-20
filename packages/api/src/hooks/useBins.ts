import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

export interface Bin {
  id: string;
  type: 'general' | 'recyclable' | 'organic' | 'hazardous';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  capacity: number;
  currentLevel: number;
  status: 'active' | 'inactive' | 'full' | 'maintenance';
  lastEmptied?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBinData {
  type: Bin['type'];
  location: Bin['location'];
  capacity: number;
}

export interface UpdateBinData {
  type?: Bin['type'];
  location?: Bin['location'];
  capacity?: number;
  status?: Bin['status'];
  currentLevel?: number;
}

// Bins API calls
const binsApi = {
  getBins: (params?: {
    type?: string;
    status?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ results: Bin[]; count: number }> =>
    apiClient.get('/bins/', params),

  getBin: (id: string): Promise<Bin> =>
    apiClient.get(`/bins/${id}/`),

  createBin: (data: CreateBinData): Promise<Bin> =>
    apiClient.post('/bins/', data),

  updateBin: (id: string, data: UpdateBinData): Promise<Bin> =>
    apiClient.patch(`/bins/${id}/`, data),

  deleteBin: (id: string): Promise<void> =>
    apiClient.delete(`/bins/${id}/`),

  getBinQR: (id: string): Promise<{ qrCode: string }> =>
    apiClient.get(`/bins/${id}/qr/`),
};

// React Query hooks
export const useBins = (params?: Parameters<typeof binsApi.getBins>[0]) => {
  return useQuery({
    queryKey: ['bins', params],
    queryFn: () => binsApi.getBins(params),
  });
};

export const useBin = (id: string) => {
  return useQuery({
    queryKey: ['bins', id],
    queryFn: () => binsApi.getBin(id),
    enabled: !!id,
  });
};

export const useCreateBin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: binsApi.createBin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bins'] });
    },
  });
};

export const useUpdateBin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBinData }) =>
      binsApi.updateBin(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bins'] });
      queryClient.invalidateQueries({ queryKey: ['bins', variables.id] });
    },
  });
};

export const useDeleteBin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: binsApi.deleteBin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bins'] });
    },
  });
};

export const useBinQR = (id: string) => {
  return useQuery({
    queryKey: ['bins', id, 'qr'],
    queryFn: () => binsApi.getBinQR(id),
    enabled: !!id,
  });
};