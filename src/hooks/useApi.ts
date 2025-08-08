import { useState, useEffect, useCallback, useRef } from "react";
import { ApiClientError } from "../services/apiClient";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseApiOptions<T = unknown> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  retryCount?: number;
  retryDelay?: number;
}

type ApiFunction<T> = (...args: unknown[]) => Promise<T>;

export const useApi = <T = unknown>(
  apiFunction: ApiFunction<T>,
  options: UseApiOptions<T> = {}
) => {
  const {
    immediate = false,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const mountedRef = useRef(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const lastArgsRef = useRef<unknown[]>();
  const executedRef = useRef(false); // Para evitar ejecuciones múltiples

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const execute = useCallback(
    async (...args: unknown[]) => {
      lastArgsRef.current = args;
      let currentRetry = 0;

      const attemptRequest = async (): Promise<void> => {
        if (!mountedRef.current) return;

        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          success: false,
        }));

        try {
          const result = await apiFunction(...args);

          if (!mountedRef.current) return;

          setState((prev) => ({
            ...prev,
            data: result,
            loading: false,
            success: true,
          }));

          if (mountedRef.current && onSuccess) {
            onSuccess(result);
          }
        } catch (error) {
          if (!mountedRef.current) return;

          const errorMessage =
            error instanceof ApiClientError
              ? error.message
              : error instanceof Error
              ? error.message
              : "Error desconocido";

          // Check if we should retry
          if (currentRetry < retryCount && shouldRetry(error)) {
            currentRetry++;
            retryTimeoutRef.current = setTimeout(() => {
              attemptRequest();
            }, retryDelay * currentRetry);
            return;
          }

          setState((prev) => ({
            ...prev,
            error: errorMessage,
            loading: false,
            success: false,
          }));

          if (mountedRef.current && onError) {
            onError(errorMessage);
          }
        }
      };

      await attemptRequest();
    },
    [apiFunction, onSuccess, onError, retryCount, retryDelay]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  const retry = useCallback(() => {
    if (lastArgsRef.current) {
      return execute(...lastArgsRef.current);
    }
    return execute();
  }, [execute]);

  // Solo ejecutar immediate una vez
  useEffect(() => {
    if (immediate && !executedRef.current) {
      executedRef.current = true;
      execute();
    }
  }, []); // Dependencias vacías para ejecutar solo una vez

  return {
    ...state,
    execute,
    reset,
    retry,
  };
};

// Helper function to determine if error is retryable
const shouldRetry = (error: unknown): boolean => {
  if (error instanceof ApiClientError) {
    // Retry on server errors (5xx) but not client errors (4xx)
    return error.status >= 500 || error.status === 0; // 0 for network errors
  }
  return true; // Retry on unknown errors
};

// Define pagination response interface
interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedApiResponse<T> {
  data: T[];
  pagination: PaginationResponse;
}

// Specialized hook for paginated data
export const usePaginatedApi = <
  T = unknown,
  F extends Record<string, unknown> = Record<string, unknown>
>(
  apiFunction: (filters: F) => Promise<PaginatedApiResponse<T>>,
  initialFilters: F,
  options: UseApiOptions<PaginatedApiResponse<T>> = {}
) => {
  const [filters, setFilters] = useState(initialFilters);
  const [allData, setAllData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationResponse>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Crear función estable que no cambie en cada render
  const stableApiFunction = useCallback(
    (filtersArg: F) => apiFunction(filtersArg),
    [apiFunction]
  );

  const wrappedApiFunction = useCallback(
    (...args: unknown[]) => {
      const filtersArg = args[0] as F;
      return stableApiFunction(filtersArg);
    },
    [stableApiFunction]
  );

  const {
    data,
    loading,
    error,
    success,
    execute: originalExecute,
    reset,
  } = useApi(wrappedApiFunction, {
    ...options,
    onSuccess: (result) => {
      const currentFilters = filters as F & { page?: number };
      if (currentFilters.page === 1) {
        setAllData(result.data);
      } else {
        setAllData((prev) => [...prev, ...result.data]);
      }
      setPagination(result.pagination);
      options.onSuccess?.(result);
    },
  });

  const execute = useCallback(
    (newFilters?: Partial<F>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      return originalExecute(updatedFilters);
    },
    [filters, originalExecute]
  );

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      return execute({ ...filters, page: pagination.page + 1 } as F);
    }
  }, [execute, pagination, filters]);

  const refresh = useCallback(() => {
    setAllData([]);
    return execute({ ...filters, page: 1 } as F);
  }, [execute, filters]);

  const updateFilters = useCallback(
    (newFilters: Partial<F>) => {
      setAllData([]);
      return execute({ ...filters, ...newFilters, page: 1 } as F);
    },
    [execute, filters]
  );

  return {
    data: allData,
    currentPageData: data?.data || [],
    pagination,
    loading,
    error,
    success,
    filters,
    execute,
    loadMore,
    refresh,
    updateFilters,
    reset,
    hasMore: pagination.page < pagination.totalPages,
  };
};

// Hook for mutations (create, update, delete)
export const useMutation = <T = unknown, P = unknown>(
  mutationFunction: (params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) => {
  // Crear función estable
  const stableMutationFunction = useCallback(
    (params: P) => mutationFunction(params),
    [mutationFunction]
  );

  const wrappedMutationFunction = useCallback(
    (...args: unknown[]) => {
      const params = args[0] as P;
      return stableMutationFunction(params);
    },
    [stableMutationFunction]
  );

  const { data, loading, error, success, execute, reset } = useApi(
    wrappedMutationFunction,
    options
  );

  const mutate = useCallback(
    (params: P) => {
      return execute(params);
    },
    [execute]
  );

  return {
    data,
    loading,
    error,
    success,
    mutate,
    reset,
    isLoading: loading,
    isSuccess: success,
    isError: !!error,
  };
};

// Hook for optimistic updates
export const useOptimisticMutation = <T = unknown, P = unknown>(
  mutationFunction: (params: P) => Promise<T>,
  optimisticUpdate: (params: P) => T,
  options: UseApiOptions<T> = {}
) => {
  const [optimisticData, setOptimisticData] = useState<T | null>(null);

  // Crear función estable para optimistic update
  const stableOptimisticUpdate = useCallback(
    (params: P) => optimisticUpdate(params),
    [optimisticUpdate]
  );

  const {
    data,
    loading,
    error,
    success,
    mutate: originalMutate,
    reset: originalReset,
  } = useMutation(mutationFunction, {
    ...options,
    onSuccess: (result) => {
      setOptimisticData(null);
      options.onSuccess?.(result);
    },
    onError: (error) => {
      setOptimisticData(null);
      options.onError?.(error);
    },
  });

  const mutate = useCallback(
    (params: P) => {
      const optimisticResult = stableOptimisticUpdate(params);
      setOptimisticData(optimisticResult);
      return originalMutate(params);
    },
    [originalMutate, stableOptimisticUpdate]
  );

  const reset = useCallback(() => {
    setOptimisticData(null);
    originalReset();
  }, [originalReset]);

  return {
    data: optimisticData || data,
    loading,
    error,
    success,
    mutate,
    reset,
    isLoading: loading,
    isSuccess: success,
    isError: !!error,
    isOptimistic: !!optimisticData,
  };
};