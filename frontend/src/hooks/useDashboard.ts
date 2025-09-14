import { useState, useEffect, useCallback } from 'react';
import { WorkerStats, AvailablePickup, WorkerPickup } from '../types';

type LoadingState = 'idle' | 'loading' | 'error';

interface UseDashboardReturn {
  stats: WorkerStats | null;
  availablePickups: AvailablePickup[];
  activePickups: WorkerPickup[];
  lastUpdated: Date | null;
  loading: LoadingState;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  acceptPickup: (pickupId: number) => Promise<boolean>;
  updateWorkerStatus: (status: 'active' | 'offline') => Promise<boolean>;
  realtimeUpdates: boolean;
}

/**
 * Custom hook for managing worker dashboard data and operations
 * Handles stats, available pickups, and worker actions
 */
export const useDashboard = (): UseDashboardReturn => {
  console.log('useDashboard hook called');

  // State management
  const [stats, setStats] = useState<WorkerStats | null>(null);
  const [availablePickups, setAvailablePickups] = useState<AvailablePickup[]>([]);
  const [activePickups, setActivePickups] = useState<WorkerPickup[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [realtimeUpdates] = useState(false); // TODO: Implement WebSocket updates

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    try {
      setLoading('loading');
      setError(null);
      console.log('Loading dashboard data...');

      // Always use mock data for development/testing
      console.log('Using mock data for map testing...');

      setStats({
        total_earnings: 245000,
        pending_pickups: 2,
        completed_today: 3,
        completed_this_week: 18,
        completed_this_month: 45,
        avg_rating: 4.8,
        total_distance_today: 15.5,
        active_routes: 1,
        total_pickups: 45,
        completed_pickups: 43,
        rating: 4.8,
        earnings_today: 12500,
        earnings_week: 87500,
        earnings_month: 245000,
        completion_rate: 0.96
      });

      setAvailablePickups([
        {
          id: 1,
          type: 'general',
          location: 'Bonanjo District, Douala',
          distance: 2.3,
          priority: 'high',
          reward: 3500,
          timePosted: '2024-01-15T10:00:00Z',
          estimatedTime: 30,
          latitude: 4.0511,
          longitude: 9.7679,
          customerName: 'Marie Kouam',
          customerContact: '+237670123456'
        },
        {
          id: 2,
          type: 'recyclable',
          location: 'Akwa District, Douala',
          distance: 1.8,
          priority: 'medium',
          reward: 2800,
          timePosted: '2024-01-15T11:00:00Z',
          estimatedTime: 25,
          latitude: 4.0521,
          longitude: 9.7689,
          customerName: 'Jean Mbala',
          customerContact: '+237670123457'
        },
        {
          id: 3,
          type: 'organic',
          location: 'Makepe, Douala',
          distance: 4.2,
          priority: 'low',
          reward: 2200,
          timePosted: '2024-01-15T12:00:00Z',
          estimatedTime: 35,
          latitude: 4.0431,
          longitude: 9.7629,
          customerName: 'Paul Ndongo',
          customerContact: '+237670123458'
        }
      ]);

      setActivePickups([
        {
          id: 101,
          type: 'general',
          status: 'in_progress',
          customerName: 'Alice Fonkou',
          location: 'Bépanda, Douala',
          acceptedAt: '2024-01-15T12:00:00Z',
          earnings: 3000,
          estimatedTime: 20
        }
      ]);

      setLastUpdated(new Date());
      console.log('Mock data loaded successfully:', { pickups: 3, activePickups: 1 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('Dashboard error:', err);
    } finally {
      setLoading('idle');
    }
  }, []);

  // Accept pickup
  const acceptPickup = useCallback(async (pickupId: number): Promise<boolean> => {
    try {
      setLoading('loading');
      console.log('Accepting pickup:', pickupId);

      // Mock acceptance - remove from available and add to active
      const pickup = availablePickups.find(p => p.id === pickupId);
      if (pickup) {
        setAvailablePickups(prev => prev.filter(p => p.id !== pickupId));
        const activePickup: WorkerPickup = {
          id: pickupId,
          type: pickup.type,
          status: 'in_progress',
          customerName: pickup.customerName,
          location: pickup.location,
          acceptedAt: new Date().toISOString(),
          earnings: pickup.reward,
          estimatedTime: pickup.estimatedTime
        };
        setActivePickups(prev => [...prev, activePickup]);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept pickup';
      setError(errorMessage);
      console.error('Accept pickup error:', err);
      return false;
    } finally {
      setLoading('idle');
    }
  }, [availablePickups]);

  // Update worker status
  const updateWorkerStatus = useCallback(async (status: 'active' | 'offline'): Promise<boolean> => {
    try {
      console.log('Updating worker status to:', status);
      // Mock implementation
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      console.error('Update status error:', err);
      return false;
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    console.log('Dashboard hook useEffect triggered, loading data...');
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    stats,
    availablePickups,
    activePickups,
    lastUpdated,
    loading,
    error,
    refreshDashboard,
    acceptPickup,
    updateWorkerStatus,
    realtimeUpdates
  };
};