import { usePickup } from '@klynaa/api';

export interface UsePickupTrackingOptions {
  pickupId: string;
  refetchInterval?: number;
}

export interface UsePickupTrackingReturn {
  pickup: any;
  isLoading: boolean;
  error: any;
  refetch: () => void;
  isTracking: boolean;
  estimatedArrival?: Date;
  progress: number;
}

export const usePickupTracking = ({
  pickupId,
  refetchInterval = 30000
}: UsePickupTrackingOptions): UsePickupTrackingReturn => {
  const { data: pickup, isLoading, error, refetch } = usePickup(pickupId);

  const isTracking = pickup?.status === 'assigned' || pickup?.status === 'in_progress';

  // Calculate progress based on status
  const getProgress = (status: string) => {
    switch (status) {
      case 'scheduled': return 25;
      case 'assigned': return 50;
      case 'in_progress': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  // Estimate arrival time (mock calculation)
  const estimatedArrival = pickup?.scheduledTime
    ? new Date(pickup.scheduledTime)
    : undefined;

  // Auto-refresh when tracking
  React.useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      refetch();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [isTracking, refetchInterval, refetch]);

  return {
    pickup,
    isLoading,
    error,
    refetch,
    isTracking,
    estimatedArrival,
    progress: getProgress(pickup?.status || 'scheduled'),
  };
};