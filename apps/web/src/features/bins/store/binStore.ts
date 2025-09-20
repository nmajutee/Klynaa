import { create } from 'zustand';

export interface BinFilters {
  type?: 'general' | 'recyclable' | 'organic' | 'hazardous';
  status?: 'active' | 'inactive' | 'full' | 'maintenance';
  location?: string;
}

interface BinStore {
  filters: BinFilters;
  selectedBinId?: string;
  setFilters: (filters: Partial<BinFilters>) => void;
  clearFilters: () => void;
  setSelectedBin: (binId?: string) => void;
}

export const useBinStore = create<BinStore>((set) => ({
  filters: {},
  selectedBinId: undefined,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearFilters: () =>
    set({ filters: {} }),

  setSelectedBin: (binId) =>
    set({ selectedBinId: binId }),
}));