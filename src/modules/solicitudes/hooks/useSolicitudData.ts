import { useState, useCallback, useEffect } from "react";
import { useApi } from '../../../shared/hooks/useApi';
import { solicitudService } from "../services/solicitudService";
import type { PendingRequest, SolicitudFilters } from "../types";

export const useSolicitudData = (initialFilters?: SolicitudFilters) => {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PendingRequest[]>([]);
  const [filters, setFilters] = useState<SolicitudFilters>(initialFilters || {});

  // Hook para cargar solicitudes pendientes
  const {
    loading,
    error: apiError,
    execute: loadPendingRequests,
  } = useApi(solicitudService.getPendingRequests.bind(solicitudService), {
    onSuccess: (data) => {
      setRequests(data);
    },
  });

  // Hook para cargar todas las solicitudes con filtros
  const {
    loading: loadingAll,
    error: allRequestsError,
    execute: loadAllRequests,
  } = useApi(async (...args: unknown[]) => {
    const filters = args[0] as any;
    return solicitudService.getAllRequests(filters);
  }, {
    onSuccess: (data) => {
      setRequests(data);
    },
  });

  // Hook para eliminar solicitud
  const { loading: deleting, execute: deleteRequest } = useApi(
    async (...args: unknown[]) => {
      const id = args[0] as string;
      return solicitudService.deleteRequest(id);
    },
    {
      onSuccess: () => {
        // Recargar datos después de eliminar
        loadPendingRequests();
      },
    }
  );

  // Cargar datos inicial
  useEffect(() => {
    loadPendingRequests();
  }, []);

  // Aplicar filtros cuando cambian los datos o filtros
  useEffect(() => {
    let filtered = requests;

    if (filters.search?.trim()) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.recordCode.toLowerCase().includes(search) ||
          request.requestedBy.username.toLowerCase().includes(search) ||
          request.requestedBy.name.toLowerCase().includes(search) ||
          request.justification.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((request) => request.status === filters.status);
    }

    if (filters.recordCode?.trim()) {
      const recordCode = filters.recordCode.toLowerCase();
      filtered = filtered.filter((request) =>
        request.recordCode.toLowerCase().includes(recordCode)
      );
    }

    if (filters.requestedBy?.trim()) {
      const requestedBy = filters.requestedBy.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.requestedBy.username.toLowerCase().includes(requestedBy) ||
          request.requestedBy.name.toLowerCase().includes(requestedBy)
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (request) => request.createdAt >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (request) => request.createdAt <= filters.dateTo!
      );
    }

    setFilteredRequests(filtered);
  }, [requests, filters]);

  const updateFilters = useCallback((newFilters: Partial<SolicitudFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const refreshData = useCallback(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  const loadFilteredData = useCallback((newFilters: SolicitudFilters) => {
    setFilters(newFilters);
    loadAllRequests(newFilters);
  }, [loadAllRequests]);

  const handleDeleteRequest = useCallback(
    async (requestId: string, recordCode: string) => {
      if (
        confirm(
          `¿Estás seguro de que quieres eliminar la solicitud para el registro "${recordCode}"?`
        )
      ) {
        await deleteRequest(requestId);
      }
    },
    [deleteRequest]
  );

  return {
    // Datos
    requests,
    filteredRequests,
    filters,
    
    // Estados de carga
    loading,
    loadingAll,
    deleting,
    apiError,
    allRequestsError,
    
    // Acciones
    updateFilters,
    clearFilters,
    refreshData,
    loadFilteredData,
    handleDeleteRequest,
    loadPendingRequests,
  };
};
