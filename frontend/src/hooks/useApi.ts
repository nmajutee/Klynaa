import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError, LoadingState } from '@/types';

interface UseApiOptions<T> {
  initialData?: T;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  state: LoadingState;
  execute: () => Promise<T>;
  reset: () => void;
}

/**
 * useApi Hook
 *
 * Generic hook for handling API calls with loading states and error handling.
 * Provides automatic cleanup and prevents state updates on unmounted components.
 *
 * @param apiCall - Function that returns a Promise
 * @param options - Configuration options
 * @returns API state and control functions
 *
 * @example
 * const { data, loading, error, execute } = useApi(
 *   () => binsService.getBins(),
 *   { immediate: true }
 * );
 */
export const useApi = <T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> => {
  const {
    initialData = null,
    immediate = false,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [state, setState] = useState<LoadingState>('idle');

  // Ref to track if component is still mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Execute the API call
   */
  const execute = useCallback(async (): Promise<T> => {
    if (!isMountedRef.current) {
      throw new Error('Component unmounted');
    }

    setLoading(true);
    setError(null);
    setState('loading');

    try {
      const result = await apiCall();

      if (isMountedRef.current) {
        setData(result);
        setState('success');
        onSuccess?.(result);
      }

      return result;
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'An error occurred',
        status: (err as any)?.status || 500,
        errors: (err as any)?.errors,
      };

      if (isMountedRef.current) {
        setError(apiError);
        setState('error');
        onError?.(apiError);
      }

      throw apiError;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiCall, onSuccess, onError]);

  /**
   * Reset the API state
   */
  const reset = useCallback(() => {
    if (!isMountedRef.current) return;

    setData(initialData);
    setLoading(false);
    setError(null);
    setState('idle');
  }, [initialData]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute().catch(() => {
        // Error is already handled in execute function
      });
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    state,
    execute,
    reset,
  };
};

/**
 * useApiMutation Hook
 *
 * Similar to useApi but optimized for mutations (POST, PUT, DELETE operations).
 * Does not execute immediately and provides better semantics for user actions.
 *
 * @example
 * const { mutate, loading } = useApiMutation(
 *   (data) => binsService.createBin(data),
 *   { onSuccess: () => console.log('Bin created!') }
 * );
 */
export const useApiMutation = <TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiOptions<TData> = {}
) => {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      if (!isMountedRef.current) {
        throw new Error('Component unmounted');
      }

      setLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);

        if (isMountedRef.current) {
          setData(result);
          options.onSuccess?.(result);
        }

        return result;
      } catch (err) {
        const apiError: ApiError = {
          message: err instanceof Error ? err.message : 'An error occurred',
          status: (err as any)?.status || 500,
          errors: (err as any)?.errors,
        };

        if (isMountedRef.current) {
          setError(apiError);
          options.onError?.(apiError);
        }

        throw apiError;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    if (!isMountedRef.current) return;

    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
};