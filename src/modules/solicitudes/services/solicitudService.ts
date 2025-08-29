import { apiClient, ApiClientError } from '../../../shared/services/apiClient';
import type {
  BackendPendingRequest,
  BackendGeneratedCode,
  CreateAuthorizationCodeRequest,
  PendingRequest,
  GeneratedCode,
  SolicitudStatus,
} from "../types";

class SolicitudService {
  private readonly basePath = "/authorization-codes";

  /**
   * Mapear solicitud del backend al formato del frontend
   */
  private mapBackendToFrontend(backendRequest: BackendPendingRequest): PendingRequest {
    return {
      id: backendRequest.id.toString(),
      recordId: backendRequest.record_id.toString(),
      recordCode: backendRequest.record_code,
      requestedBy: {
        id: backendRequest.requested_by.id.toString(),
        username: backendRequest.requested_by.username,
        name: backendRequest.requested_by.name,
      },
      justification: backendRequest.justification,
      createdAt: new Date(backendRequest.created_at),
      status: this.mapBackendStatusToFrontend(backendRequest.status),
    };
  }

  /**
   * Mapear código generado del backend al formato del frontend
   */
  private mapBackendCodeToFrontend(backendCode: BackendGeneratedCode): GeneratedCode {
    return {
      code: backendCode.code,
      expiresInMinutes: backendCode.expires_in_minutes,
    };
  }

  /**
   * Mapear status del backend al frontend
   */
  private mapBackendStatusToFrontend(backendStatus: string): SolicitudStatus {
    const statusMap: Record<string, SolicitudStatus> = {
      PENDING: "pending",
      APPROVED: "approved",
      REJECTED: "rejected",
      EXPIRED: "expired",
    };
    return statusMap[backendStatus] || "pending";
  }

  /**
   * Obtener solicitudes pendientes
   */
  async getPendingRequests(): Promise<PendingRequest[]> {
    try {
      const response = await apiClient.get<BackendPendingRequest[]>(`${this.basePath}/pending`);
      return response.map((request) => this.mapBackendToFrontend(request));
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para ver las solicitudes");
      }
      throw error;
    }
  }

  /**
   * Obtener todas las solicitudes (con filtros opcionales)
   */
  async getAllRequests(filters?: {
    status?: SolicitudStatus;
    recordCode?: string;
    requestedBy?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<PendingRequest[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.status) {
        queryParams.append("status", filters.status);
      }
      if (filters?.recordCode) {
        queryParams.append("record_code", filters.recordCode);
      }
      if (filters?.requestedBy) {
        queryParams.append("requested_by", filters.requestedBy);
      }
      if (filters?.dateFrom) {
        queryParams.append("date_from", filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        queryParams.append("date_to", filters.dateTo.toISOString());
      }

      const url = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get<BackendPendingRequest[]>(url);
      return response.map((request) => this.mapBackendToFrontend(request));
    } catch (error) {
      console.error("Error fetching all requests:", error);
      throw error;
    }
  }

  /**
   * Obtener solicitud por ID
   */
  async getRequestById(id: string): Promise<PendingRequest> {
    try {
      const response = await apiClient.get<BackendPendingRequest>(`${this.basePath}/${id}`);
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Solicitud no encontrada");
      }
      throw error;
    }
  }

  /**
   * Generar código de autorización
   */
  async generateAuthorizationCode(requestId: number): Promise<GeneratedCode> {
    try {
      const requestData: CreateAuthorizationCodeRequest = {
        request_id: requestId,
      };
      
      const response = await apiClient.post<BackendGeneratedCode>(
        `${this.basePath}/generate`,
        requestData
      );
      
      return this.mapBackendCodeToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Solicitud no encontrada");
      }
      if (error instanceof ApiClientError && error.status === 409) {
        throw new Error("Ya existe un código para esta solicitud");
      }
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para generar códigos");
      }
      throw error;
    }
  }

  /**
   * Aprobar solicitud
   */
  async approveRequest(id: string, comments?: string): Promise<void> {
    try {
      await apiClient.patch(`${this.basePath}/${id}/approve`, {
        comments,
      });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Solicitud no encontrada");
      }
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para aprobar solicitudes");
      }
      throw error;
    }
  }

  /**
   * Rechazar solicitud
   */
  async rejectRequest(id: string, reason: string): Promise<void> {
    try {
      await apiClient.patch(`${this.basePath}/${id}/reject`, {
        reason,
      });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Solicitud no encontrada");
      }
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para rechazar solicitudes");
      }
      throw error;
    }
  }

  /**
   * Eliminar solicitud
   */
  async deleteRequest(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Solicitud no encontrada");
      }
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para eliminar solicitudes");
      }
      throw error;
    }
  }

  /**
   * Obtener estadísticas de solicitudes
   */
  async getRequestStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    averageResponseTime: number;
  }> {
    try {
      const response = await apiClient.get(`${this.basePath}/stats`);
      return response;
    } catch (error) {
      console.error("Error fetching request stats:", error);
      throw error;
    }
  }

  /**
   * Validar datos de solicitud
   */
  validateRequestData(data: { recordCode: string; justification: string }): string[] {
    const errors: string[] = [];

    if (!data.recordCode?.trim()) {
      errors.push("El código de registro es requerido");
    }

    if (!data.justification?.trim()) {
      errors.push("La justificación es requerida");
    } else if (data.justification.length < 10) {
      errors.push("La justificación debe tener al menos 10 caracteres");
    }

    return errors;
  }
}

// Exportar instancia singleton
export const solicitudService = new SolicitudService();
