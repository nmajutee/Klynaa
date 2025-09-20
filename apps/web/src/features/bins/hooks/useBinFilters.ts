import { useBinStore, type BinFilters } from '../store/binStore';

export interface UseBinFiltersReturn {
  filters: BinFilters;
  setTypeFilter: (type?: string) => void;
  setStatusFilter: (status?: string) => void;
  setLocationFilter: (location?: string) => void;
  clearAllFilters: () => void;
}

export const useBinFilters = (): UseBinFiltersReturn => {
  const { filters, setFilters, clearFilters } = useBinStore();

  return {
    filters,
    setTypeFilter: (type) => setFilters({ type: type as any }),
    setStatusFilter: (status) => setFilters({ status: status as any }),
    setLocationFilter: (location) => setFilters({ location }),
    clearAllFilters: clearFilters,
  };
};