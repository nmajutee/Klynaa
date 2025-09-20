import { create } from 'zustand';

export interface PickupFilters {
  status?: 'scheduled' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  workerId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface PickupStore {
  filters: PickupFilters;
  selectedPickupId?: string;
  setFilters: (filters: Partial<PickupFilters>) => void;
  clearFilters: () => void;
  setSelectedPickup: (pickupId?: string) => void;
}

export const usePickupStore = create<PickupStore>((set) => ({
  filters: {},
  selectedPickupId: undefined,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearFilters: () =>
    set({ filters: {} }),

  setSelectedPickup: (pickupId) =>
    set({ selectedPickupId: pickupId }),
}));