import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Bin } from './useBins';

export interface Pickup {
  id: string;
  bin: Bin;
  worker?: {
    id: string;
    name: string;
    phone: string;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
  };
  status: 'scheduled' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime: string;
  completedTime?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePickupData {
  binId: string;
  scheduledTime: string;
  priority?: Pickup['priority'];
  notes?: string;
  estimatedDuration?: number;
}

export interface UpdatePickupData {
  workerId?: string;
  status?: Pickup['status'];
  scheduledTime?: string;
  completedTime?: string;
  notes?: string;
  priority?: Pickup['priority'];
  actualDuration?: number;
}

// Pickups API calls
const pickupsApi = {
  getPickups: (params?: {
    status?: string;
    workerId?: string;
    binId?: string;
    customerId?: string;
    priority?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ results: Pickup[]; count: number }> =>
    apiClient.get('/pickups/', params),

  getPickup: (id: string): Promise<Pickup> =>
    apiClient.get(`/pickups/${id}/`),

  createPickup: (data: CreatePickupData): Promise<Pickup> =>
    apiClient.post('/pickups/', data),

  updatePickup: (id: string, data: UpdatePickupData): Promise<Pickup> =>
    apiClient.patch(`/pickups/${id}/`, data),

  deletePickup: (id: string): Promise<void> =>
    apiClient.delete(`/pickups/${id}/`),

  assignWorker: (id: string, workerId: string): Promise<Pickup> =>
    apiClient.post(`/pickups/${id}/assign/`, { worker_id: workerId }),

  startPickup: (id: string): Promise<Pickup> =>
    apiClient.post(`/pickups/${id}/start/`),

  completePickup: (id: string, data: { notes?: string; actualDuration?: number }): Promise<Pickup> =>
    apiClient.post(`/pickups/${id}/complete/`, data),
};

// React Query hooks
export const usePickups = (params?: Parameters<typeof pickupsApi.getPickups>[0]) => {
  return useQuery({
    queryKey: ['pickups', params],
    queryFn: () => pickupsApi.getPickups(params),
  });
};

export const usePickup = (id: string) => {
  return useQuery({
    queryKey: ['pickups', id],
    queryFn: () => pickupsApi.getPickup(id),
    enabled: !!id,
  });
};

export const useCreatePickup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pickupsApi.createPickup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
    },
  });
};

export const useUpdatePickup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePickupData }) =>
      pickupsApi.updatePickup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      queryClient.invalidateQueries({ queryKey: ['pickups', variables.id] });
    },
  });
};

export const useDeletePickup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pickupsApi.deletePickup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
    },
  });
};

export const useAssignWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, workerId }: { id: string; workerId: string }) =>
      pickupsApi.assignWorker(id, workerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      queryClient.invalidateQueries({ queryKey: ['pickups', variables.id] });
    },
  });
};

export const useStartPickup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pickupsApi.startPickup,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      queryClient.invalidateQueries({ queryKey: ['pickups', id] });
    },
  });
};

export const useCompletePickup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof pickupsApi.completePickup>[1] }) =>
      pickupsApi.completePickup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pickups'] });
      queryClient.invalidateQueries({ queryKey: ['pickups', variables.id] });
    },
  });
};