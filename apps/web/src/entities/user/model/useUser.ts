import { useAuth } from '@klynaa/api';

export const useUser = () => {
  const { user, isLoading, error, refetchUser } = useAuth();

  return {
    user,
    isLoading,
    error,
    refetch: refetchUser,
    isAuthenticated: !!user,
  };
};