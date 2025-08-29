import { useState, useCallback, useEffect } from "react";
import { useApi } from '../../../shared/hooks/useApi';
import { movementHistoryService } from "../services/movementHistoryService";
import type { MovementHistory, MovementFilters, PaginatedMovements } from "../types";

export const useMovementData = (initialFilters?: MovementFilters) => {
  const [movements, setMovements] = useState<MovementHistory[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState<MovementFilters>(initialFilters || {
    page: 1,
    limit: 10,
    sortBy: "action_date",
    sortOrder: "DESC",
  });

  // Hook para cargar movimientos
  const {
    loading,
    error: apiError,
    execute: loadMovements,
  } = useApi(movementHistoryService.getMovements.bind(movementHistoryService), {
    onSuccess: (data: PaginatedMovements) => {
      setMovements(data.data);
      setPagination({
        currentPage: data.meta.page,
        totalPages: data.meta.totalPages,
        totalItems: data.meta.total,
        itemsPerPage: data.meta.limit,
      });
    },
  });

  // Cargar datos inicial
  useEffect(() => {
    loadMovements(filters);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<MovementFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset a página 1
    setFilters(updatedFilters);
    loadMovements(updatedFilters);
  }, [filters, loadMovements]);

  const clearFilters = useCallback(() => {
    const defaultFilters: MovementFilters = {
      page: 1,
      limit: 10,
      sortBy: "action_date",
      sortOrder: "DESC",
    };
    setFilters(defaultFilters);
    loadMovements(defaultFilters);
  }, [loadMovements]);

  const refreshData = useCallback(() => {
    loadMovements(filters);
  }, [filters, loadMovements]);

  const handlePageChange = useCallback((page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    loadMovements(updatedFilters);
  }, [filters, loadMovements]);

  const handleSort = useCallback((sortBy: string, sortOrder: "ASC" | "DESC") => {
    const updatedFilters = { ...filters, sortBy, sortOrder, page: 1 };
    setFilters(updatedFilters);
    loadMovements(updatedFilters);
  }, [filters, loadMovements]);

  return {
    // Datos
    movements,
    pagination,
    filters,
    
    // Estados de carga
    loading,
    apiError,
    
    // Acciones
    updateFilters,
    clearFilters,
    refreshData,
    handlePageChange,
    handleSort,
  };
};
