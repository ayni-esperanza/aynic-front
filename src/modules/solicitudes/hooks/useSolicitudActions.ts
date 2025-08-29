import { useCallback } from "react";
import { useApi } from '../../../shared/hooks/useApi';
import { solicitudService } from "../services/solicitudService";
import type { GeneratedCode } from "../types";

export const useSolicitudActions = (onSuccess?: () => void) => {
  // Hook para generar código de autorización
  const {
    loading: generatingCode,
    error: generateError,
    execute: generateCode,
  } = useApi(async (...args: unknown[]) => {
    const requestId = args[0] as number;
    return solicitudService.generateAuthorizationCode(requestId);
  }, {
    onSuccess: () => {
      onSuccess?.();
    },
  });

  // Hook para aprobar solicitud
  const {
    loading: approving,
    error: approveError,
    execute: approveRequest,
  } = useApi(async (...args: unknown[]) => {
    const requestId = args[0] as string;
    const comments = args[1] as string;
    return solicitudService.approveRequest(requestId, comments);
  }, {
    onSuccess: () => {
      onSuccess?.();
    },
  });

  // Hook para rechazar solicitud
  const {
    loading: rejecting,
    error: rejectError,
    execute: rejectRequest,
  } = useApi(async (...args: unknown[]) => {
    const requestId = args[0] as string;
    const reason = args[1] as string;
    return solicitudService.rejectRequest(requestId, reason);
  }, {
    onSuccess: () => {
      onSuccess?.();
    },
  });

  // Hook para obtener estadísticas
  const {
    loading: loadingStats,
    error: statsError,
    execute: loadStats,
  } = useApi(async (...args: unknown[]) => {
    return solicitudService.getRequestStats();
  });

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
