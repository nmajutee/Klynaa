/**
 * usePickups Hook
 * Custom hook for worker pickup management
 */

import { useState, useEffect, useCallback } from 'react';
import { pickupsService } from '../services/pickups.service';
import type { LoadingState, AvailablePickup, WorkerPickup } from '../types';

interface UsePickupsReturn {
  // Available pickups data
  availablePickups: AvailablePickup[];
  availableLoading: LoadingState;
  availableError: string | null;

  // Worker pickups data
  myPickups: WorkerPickup[];
  myPickupsLoading: LoadingState;
  myPickupsError: string | null;

  // Actions
  fetchAvailablePickups: (params?: any) => Promise<void>;
  fetchMyPickups: (params?: any) => Promise<void>;
  acceptPickup: (pickupId: number) => Promise<boolean>;
  updatePickupStatus: (pickupId: number, status: string, data?: any) => Promise<boolean>;

  // Filters
  availableFilters: {
    type: string | null;
    priority: string | null;
    radius: number;
  };
  setAvailableFilters: (filters: any) => void;

  myPickupsFilters: {
    status: string | null;
    startDate: string | null;
    endDate: string | null;
  };
  setMyPickupsFilters: (filters: any) => void;
}

export const usePickups = (): UsePickupsReturn => {
  // Available pickups state
  const [availablePickups, setAvailablePickups] = useState<AvailablePickup[]>([]);
  const [availableLoading, setAvailableLoading] = useState<LoadingState>('idle');
  const [availableError, setAvailableError] = useState<string | null>(null);

  // Worker pickups state
  const [myPickups, setMyPickups] = useState<WorkerPickup[]>([]);
  const [myPickupsLoading, setMyPickupsLoading] = useState<LoadingState>('idle');
  const [myPickupsError, setMyPickupsError] = useState<string | null>(null);

  // Filter states
  const [availableFilters, setAvailableFilters] = useState({
    type: null,
    priority: null,
    radius: 10,
  });

  const [myPickupsFilters, setMyPickupsFilters] = useState({
    status: null,
    startDate: null,
    endDate: null,
  });

  // Fetch available pickups
  const fetchAvailablePickups = useCallback(async (params?: any) => {
    try {
      setAvailableLoading('loading');
      setAvailableError(null);

      const data = await pickupsService.getAvailablePickups({
        ...availableFilters,
        ...params,
      });

      if (data && Array.isArray(data)) {
        // Convert Pickup[] to AvailablePickup[] format
        const availablePickupsData = data.map((pickup: any) => ({
          id: pickup.id,
          type: pickup.type || 'general',
          location: pickup.location || pickup.address,
          distance: pickup.distance || 0,
          reward: pickup.reward || pickup.estimated_cost || 0,
          priority: pickup.priority || 'medium',
          timePosted: pickup.timePosted || pickup.created_at,
          estimatedTime: pickup.estimatedTime || pickup.estimated_time || 30,
          latitude: pickup.latitude || 0,
          longitude: pickup.longitude || 0,
          customerName: pickup.customerName || pickup.customer_name,
          customerContact: pickup.customerContact || pickup.customer_contact
        }));
        setAvailablePickups(availablePickupsData);
      } else {
        // Mock data fallback for development
        const mockAvailablePickups: AvailablePickup[] = [
          {
            id: 1,
            type: 'general',
            location: 'Douala, Bonanjo - Avenue Charles de Gaulle',
            distance: 2.5,
            reward: 2500,
            priority: 'high',
            timePosted: '15 minutes ago',
            estimatedTime: 30,
            latitude: 4.0511,
            longitude: 9.7679,
            customerName: 'Marie Kouam',
            customerContact: '+237 123 456 789'
          },
          {
            id: 2,
            type: 'recyclable',
            location: 'Douala, Akwa - Rue Joffre',
            distance: 1.2,
            reward: 3000,
            priority: 'medium',
            timePosted: '45 minutes ago',
            estimatedTime: 25,
            latitude: 4.0483,
            longitude: 9.7671,
            customerName: 'Jean Mbala',
            customerContact: '+237 987 654 321'
          },
          {
            id: 3,
            type: 'organic',
            location: 'Douala, Bassa - Rue du Commerce',
            distance: 3.8,
            reward: 2800,
            priority: 'low',
            timePosted: '1 hour ago',
            estimatedTime: 35,
            latitude: 4.0447,
            longitude: 9.7624,
            customerName: 'Alice Nkomo'
          }
        ];
        setAvailablePickups(mockAvailablePickups);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available pickups';
      setAvailableError(errorMessage);
      console.error('Available pickups error:', err);
    } finally {
      setAvailableLoading('idle');
    }
  }, [availableFilters]);

  // Fetch worker's pickups
  const fetchMyPickups = useCallback(async (params?: any) => {
    try {
      setMyPickupsLoading('loading');
      setMyPickupsError(null);

      const data = await pickupsService.getMyPickups({
        ...myPickupsFilters,
        ...params,
      });

      if (data) {
        setMyPickups(data);
      } else {
        // Mock data fallback for development
        const mockMyPickups: WorkerPickup[] = [
          {
            id: 1234,
            type: 'general',
            location: 'Douala, Bonanjo - Avenue Charles de Gaulle',
            status: 'in_progress',
            customerName: 'Marie Ngando',
            acceptedAt: '2 hours ago',
            earnings: 2500,
            estimatedTime: 30,
            rating: 4.8
          },
          {
            id: 1235,
            type: 'recyclable',
            location: 'Douala, Akwa - Rue Joffre',
            status: 'completed',
            customerName: 'Jean Baptiste',
            acceptedAt: 'Yesterday',
            completedAt: 'Yesterday, 3:30 PM',
            earnings: 3200,
            estimatedTime: 25,
            actualTime: 28,
            rating: 4.9,
            customerFeedback: 'Excellent service, very professional!'
          },
          {
            id: 1236,
            type: 'organic',
            location: 'Douala, Bassa - Marché Central',
            status: 'pending',
            customerName: 'Catherine Lobe',
            acceptedAt: '30 minutes ago',
            earnings: 2200,
            estimatedTime: 20
          }
        ];
        setMyPickups(mockMyPickups);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch your pickups';
      setMyPickupsError(errorMessage);
      console.error('My pickups error:', err);
    } finally {
      setMyPickupsLoading('idle');
    }
  }, [myPickupsFilters]);

  // Accept pickup
  const acceptPickup = useCallback(async (pickupId: number): Promise<boolean> => {
    try {
      const data = await pickupsService.acceptPickup(pickupId.toString());

      if (data) {
        // Remove from available pickups
        setAvailablePickups(prev => prev.filter(pickup => pickup.id !== pickupId));
        // Refresh my pickups to include the new one
        await fetchMyPickups();
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept pickup';
      setAvailableError(errorMessage);
      console.error('Accept pickup error:', err);
      return false;
    }
  }, [fetchMyPickups]);

  // Update pickup status
  const updatePickupStatus = useCallback(async (
    pickupId: number,
    status: string,
    data?: any
  ): Promise<boolean> => {
    try {
      const result = await pickupsService.updatePickupStatus(pickupId, status as any, data);

      if (result) {
        // Update the pickup in the list
        setMyPickups(prev => prev.map(pickup =>
          pickup.id === pickupId
            ? { ...pickup, status: status as any, ...data }
            : pickup
        ));
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update pickup status';
      setMyPickupsError(errorMessage);
      console.error('Update pickup status error:', err);
      return false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAvailablePickups();
  }, [fetchAvailablePickups]);

  useEffect(() => {
    fetchMyPickups();
  }, [fetchMyPickups]);

  return {
    // Available pickups
    availablePickups,
    availableLoading,
    availableError,

    // Worker pickups
    myPickups,
    myPickupsLoading,
    myPickupsError,

    // Actions
    fetchAvailablePickups,
    fetchMyPickups,
    acceptPickup,
    updatePickupStatus,

    // Filters
    availableFilters,
    setAvailableFilters,
    myPickupsFilters,
    setMyPickupsFilters,
  };
};