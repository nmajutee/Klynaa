// Re-export individual feature types for centralized access
export type { User } from '../entities/user/model/types';
export type { Bin } from '../features/bins/types';

// Define additional types that may be missing
export interface PickupTask {
  id: string;
  binId: string;
  workerId?: string;
  scheduledFor: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalBins: number;
  totalPickups: number;
  totalWorkers: number;
  totalCustomers: number;
  completedPickupsToday: number;
  pendingPickups: number;
  revenue: number;
}

export interface WorkerStats {
  completedPickups: number;
  pendingPickups: number;
  earnings: number;
  rating: number;
}