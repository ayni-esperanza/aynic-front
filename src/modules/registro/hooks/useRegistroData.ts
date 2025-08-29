import { useState, useCallback, useEffect } from "react";
import { useApi } from "../../../hooks/useApi";
import { registroService } from "../services/registroService";
import type { DataRecord, RecordFilters, PaginatedRecords } from "../types";

export const useRegistroData = (initialFilters?: RecordFilters) => {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState<RecordFilters>(initialFilters || {
    page: 1,
    limit: 10,
    sortBy: "fecha_instalacion",
    sortOrder: "DESC",
  });

  // Hook para cargar registros
  const {
    loading,
    error: apiError,
    execute: loadRecords,
  } = useApi(registroService.getRecords.bind(registroService), {
    onSuccess: (data: PaginatedRecords) => {
      setRecords(data.data);
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
    loadRecords(filters);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<RecordFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset a página 1
    setFilters(updatedFilters);
    loadRecords(updatedFilters);
  }, [filters, loadRecords]);

  const clearFilters = useCallback(() => {
    const defaultFilters: RecordFilters = {
      page: 1,
      limit: 10,
      sortBy: "fecha_instalacion",
      sortOrder: "DESC",
    };
    setFilters(defaultFilters);
    loadRecords(defaultFilters);
  }, [loadRecords]);

  const refreshData = useCallback(() => {
    loadRecords(filters);
  }, [filters, loadRecords]);

  const handlePageChange = useCallback((page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    loadRecords(updatedFilters);
  }, [filters, loadRecords]);

  const handleSort = useCallback((sortBy: string, sortOrder: "ASC" | "DESC") => {
    const updatedFilters = { ...filters, sortBy, sortOrder, page: 1 };
    setFilters(updatedFilters);
    loadRecords(updatedFilters);
  }, [filters, loadRecords]);

  const searchRecords = useCallback(async (searchTerm: string) => {
    try {
      const results = await registroService.searchRecords(searchTerm);
      return results;
    } catch (error) {
      console.error("Error searching records:", error);
      return [];
    }
  }, []);

  return {
    // Datos
    records,
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
    searchRecords,
  };
};
