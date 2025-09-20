import { useBins as useApiBins, useBin as useApiBin } from '@klynaa/api';

export const useBin = (id: string) => {
  return useApiBin(id);
};

export const useBins = (filters?: any) => {
  return useApiBins(filters);
};