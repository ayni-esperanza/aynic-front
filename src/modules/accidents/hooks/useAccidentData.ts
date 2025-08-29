import { useState, useCallback, useEffect } from "react";
import { useApi } from "../../../hooks/useApi";
import { accidentService } from "../services/accidentService";
import type { Accident, AccidentFilters, AccidentsPaginatedResponse } from "../types/accident";

export const useAccidentData = (initialFilters?: AccidentFilters) => {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState<AccidentFilters>(initialFilters || {
    page: 1,
    limit: 10,
    sortBy: "fecha_accidente",
    sortOrder: "DESC",
  });

  // Hook para cargar accidentes
  const {
    loading,
    error: apiError,
    execute: loadAccidents,
  } = useApi(accidentService.getAccidents.bind(accidentService), {
    onSuccess: (data: AccidentsPaginatedResponse) => {
      setAccidents(data.data);
      setPagination({
        currentPage: data.pagination.page,
        totalPages: data.pagination.totalPages,
        totalItems: data.pagination.total,
        itemsPerPage: data.pagination.limit,
      });
    },
  });

  // Cargar datos inicial
  useEffect(() => {
    loadAccidents(filters);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<AccidentFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset a página 1
    setFilters(updatedFilters);
    loadAccidents(updatedFilters);
  }, [filters, loadAccidents]);

  const clearFilters = useCallback(() => {
    const defaultFilters: AccidentFilters = {
      page: 1,
      limit: 10,
      sortBy: "fecha_accidente",
      sortOrder: "DESC",
    };
    setFilters(defaultFilters);
    loadAccidents(defaultFilters);
  }, [loadAccidents]);

  const refreshData = useCallback(() => {
    loadAccidents(filters);
  }, [filters, loadAccidents]);

  const handlePageChange = useCallback((page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    loadAccidents(updatedFilters);
  }, [filters, loadAccidents]);

  const handleSort = useCallback((sortBy: string, sortOrder: "ASC" | "DESC") => {
    const updatedFilters = { ...filters, sortBy, sortOrder, page: 1 };
    setFilters(updatedFilters);
    loadAccidents(updatedFilters);
  }, [filters, loadAccidents]);

  const searchAccidents = useCallback(async (searchTerm: string) => {
    try {
      const searchFilters = { ...filters, search: searchTerm, page: 1 };
      const results = await accidentService.getAccidents(searchFilters);
      return results.data;
    } catch (error) {
      console.error("Error searching accidents:", error);
      return [];
    }
  }, [filters]);

  return {
    // Datos
    accidents,
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
    searchAccidents,
  };
};
