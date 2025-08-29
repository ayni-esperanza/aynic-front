import { useState, useCallback, useEffect } from "react";
import { useApi } from "../../../hooks/useApi";
import { movementHistoryService } from "../services/movementHistoryService";
import type { ActionOption, MovementStatistics } from "../types";

export const useMovementOptions = () => {
  const [statistics, setStatistics] = useState<MovementStatistics | null>(null);
  const [actionOptions, setActionOptions] = useState<ActionOption[]>([]);
  const [usernameOptions, setUsernameOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Hook para cargar estadísticas
  const {
    loading: loadingStats,
    error: statsError,
    execute: loadStatistics,
  } = useApi(movementHistoryService.getStatistics.bind(movementHistoryService), {
    onSuccess: (data: MovementStatistics) => {
      setStatistics(data);
    },
  });

  // Hook para cargar opciones de acciones
  const {
    loading: loadingActions,
    error: actionsError,
    execute: loadActions,
  } = useApi(movementHistoryService.getAvailableActions.bind(movementHistoryService), {
    onSuccess: (data: ActionOption[]) => {
      setActionOptions(data);
    },
  });

  // Hook para cargar opciones de usuarios
  const {
    loading: loadingUsernames,
    error: usernamesError,
    execute: loadUsernames,
  } = useApi(movementHistoryService.getUniqueUsernames.bind(movementHistoryService), {
    onSuccess: (data: Array<{ value: string; label: string }>) => {
      setUsernameOptions(data);
    },
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadStatistics(),
          loadActions(),
          loadUsernames(),
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading initial movement data:", error);
      }
    };

    loadInitialData();
  }, []);

  const refreshStatistics = useCallback(() => {
    loadStatistics();
  }, [loadStatistics]);

  const refreshActions = useCallback(() => {
    loadActions();
  }, [loadActions]);

  const refreshUsernames = useCallback(() => {
    loadUsernames();
  }, [loadUsernames]);

  const refreshAll = useCallback(() => {
    loadStatistics();
    loadActions();
    loadUsernames();
  }, [loadStatistics, loadActions, loadUsernames]);

  return {
    // Datos
    statistics,
    actionOptions,
    usernameOptions,
    isInitialized,
    
    // Estados de carga
    loadingStats,
    loadingActions,
    loadingUsernames,
    statsError,
    actionsError,
    usernamesError,
    
    // Acciones
    refreshStatistics,
    refreshActions,
    refreshUsernames,
    refreshAll,
  };
};
