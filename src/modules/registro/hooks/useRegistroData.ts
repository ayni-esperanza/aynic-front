import { useState, useCallback, useEffect } from "react";
import { useApi } from "../../../shared/hooks/useApi";
import { registroService } from "../services/registroService";
import type { DataRecord, RecordFilters } from "../types";

// Tipo que coincide con lo que retorna registroService.getRecords
interface RegistroServiceResponse {
  data: DataRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const useRegistroData = (initialFilters?: RecordFilters) => {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState<RecordFilters>(
    initialFilters || {
      page: 1,
      limit: 10,
      sortBy: "fecha_instalacion",
      sortOrder: "DESC",
    }
  );

  // Hook para cargar registros
  const {
    loading,
    error: apiError,
    execute: loadRecords,
  } = useApi(
    async (...args: unknown[]) => {
      const filters = args[0] as RecordFilters;
      return registroService.getRecords(filters);
    },
    {
      onSuccess: (data: RegistroServiceResponse) => {
        setRecords(data.data);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalItems,
          itemsPerPage: data.pagination.itemsPerPage,
        });
      },
    }
  );

  // NO cargar datos automáticamente al inicio
  // La carga inicial se maneja en RegistroList después de restaurar filtros guardados
  // useEffect(() => {
  //   loadRecords(filters);
  // }, []);

  const updateFilters = useCallback(
    (newFilters: Partial<RecordFilters>) => {
      const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset a página 1
      setFilters(updatedFilters);
      loadRecords(updatedFilters);
    },
    [filters, loadRecords]
  );

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

  const handlePageChange = useCallback(
    (page: number) => {
      const updatedFilters = { ...filters, page };
      setFilters(updatedFilters);
      loadRecords(updatedFilters);
    },
    [filters, loadRecords]
  );

  const handleSort = useCallback(
    (sortBy: string, sortOrder: "ASC" | "DESC") => {
      const updatedFilters = { ...filters, sortBy, sortOrder, page: 1 };
      setFilters(updatedFilters);
      loadRecords(updatedFilters);
    },
    [filters, loadRecords]
  );

  const searchRecords = useCallback(
    async (searchTerm: string) => {
      try {
        // Implementar búsqueda usando filtros
        const searchFilters = { ...filters, codigo: searchTerm, page: 1 };
        const results = await registroService.getRecords(searchFilters);
        return results.data;
      } catch (error) {
        console.error("Error searching records:", error);
        return [];
      }
    },
    [filters]
  );

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
