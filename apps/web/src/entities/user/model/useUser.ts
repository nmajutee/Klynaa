import { useAuth } from '@klynaa/api';

export const useUser = () => {
  const { data: user, isLoading, error, refetch } = useAuth();

  return {
    user,
    isLoading,
    error,
    refetch,
    isAuthenticated: !!user,
  };
};