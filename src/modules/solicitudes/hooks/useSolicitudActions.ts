import { useCallback } from "react";
import { useApi } from "../../../hooks/useApi";
import { solicitudService } from "../services/solicitudService";
import type { GeneratedCode } from "../types";

export const useSolicitudActions = (onSuccess?: () => void) => {
  // Hook para generar código de autorización
  const {
    loading: generatingCode,
    error: generateError,
    execute: generateCode,
  } = useApi(solicitudService.generateAuthorizationCode.bind(solicitudService), {
    onSuccess: () => {
      onSuccess?.();
    },
  });

  // Hook para aprobar solicitud
  const {
    loading: approving,
    error: approveError,
    execute: approveRequest,
  } = useApi(solicitudService.approveRequest.bind(solicitudService), {
    onSuccess: () => {
      onSuccess?.();
    },
  });

  // Hook para rechazar solicitud
  const {
    loading: rejecting,
    error: rejectError,
    execute: rejectRequest,
  } = useApi(solicitudService.rejectRequest.bind(solicitudService), {
    onSuccess: () => {
      onSuccess?.();
    },
  });

  // Hook para obtener estadísticas
  const {
    loading: loadingStats,
    error: statsError,
    execute: loadStats,
  } = useApi(solicitudService.getRequestStats.bind(solicitudService));

  const handleGenerateCode = useCallback(
    async (requestId: number): Promise<GeneratedCode | null> => {
      try {
        const result = await generateCode(requestId);
        return result;
      } catch (error) {
        console.error("Error generating code:", error);
        return null;
      }
    },
    [generateCode]
  );

  const handleApproveRequest = useCallback(
    async (requestId: string, comments?: string): Promise<boolean> => {
      try {
        await approveRequest(requestId, comments);
        return true;
      } catch (error) {
        console.error("Error approving request:", error);
        return false;
      }
    },
    [approveRequest]
  );

  const handleRejectRequest = useCallback(
    async (requestId: string, reason: string): Promise<boolean> => {
      try {
        await rejectRequest(requestId, reason);
        return true;
      } catch (error) {
        console.error("Error rejecting request:", error);
        return false;
      }
    },
    [rejectRequest]
  );

  const handleLoadStats = useCallback(async () => {
    try {
      const stats = await loadStats();
      return stats;
    } catch (error) {
      console.error("Error loading stats:", error);
      return null;
    }
  }, [loadStats]);

  return {
    // Estados de carga
    generatingCode,
    approving,
    rejecting,
    loadingStats,
    
    // Errores
    generateError,
    approveError,
    rejectError,
    statsError,
    
    // Acciones
    handleGenerateCode,
    handleApproveRequest,
    handleRejectRequest,
    handleLoadStats,
  };
};
