import { apiClient, ApiClientError } from "./apiClient";

// ===== INTERFACES PARA EL BACKEND =====
export interface BackendAlert {
  id: number;
  tipo: "POR_VENCER" | "VENCIDO" | "CRITICO";
  registro_id: number;
  mensaje: string;
  prioridad: "low" | "medium" | "high" | "critical";
  usuario_id?: number;
  metadata?: string;
  leida: boolean;
  fecha_creada: string;
  fecha_leida?: string;
  record?: {
    id: number;
    codigo: string;
    cliente: string;
    equipo: string;
    ubicacion: string;
  };
}

export interface BackendAlertStats {
  total: number;
  noLeidas: number;
  porTipo: Array<{ tipo: string; count: number }>;
  porPrioridad: Array<{ prioridad: string; count: number }>;
  recientes: BackendAlert[];
  criticas: BackendAlert[];
}

export interface BackendPaginatedAlerts {
  data: BackendAlert[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ===== INTERFACES PARA EL FRONTEND =====
export interface Alert {
  id: string;
  tipo: "por_vencer" | "vencido" | "critico";
  registro_id: string;
  mensaje: string;
  prioridad: "low" | "medium" | "high" | "critical";
  usuario_id?: string;
  metadata?: Record<string, any>;
  leida: boolean;
  fecha_creada: Date;
  fecha_leida?: Date;
  record?: {
    id: string;
    codigo: string;
    cliente: string;
    equipo: string;
    ubicacion: string;
  };
}

export interface AlertStats {
  total: number;
  noLeidas: number;
  porTipo: Array<{ tipo: "por_vencer" | "vencido" | "critico"; count: number }>;
  porPrioridad: Array<{
    prioridad: "low" | "medium" | "high" | "critical";
    count: number;
  }>;
  recientes: Alert[];
  criticas: Alert[];
}

export interface AlertFilters {
  tipo?: "por_vencer" | "vencido" | "critico";
  registro_id?: string;
  leida?: boolean;
  prioridad?: "low" | "medium" | "high" | "critical";
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface CreateAlertDto {
  tipo: "por_vencer" | "vencido" | "critico";
  registro_id: string;
  mensaje: string;
  prioridad?: "low" | "medium" | "high" | "critical";
  usuario_id?: string;
  metadata?: Record<string, any>;
}

export interface UpdateAlertDto {
  leida?: boolean;
  fecha_leida?: Date;
  mensaje?: string;
  prioridad?: "low" | "medium" | "high" | "critical";
}

class AlertService {
  private readonly basePath = "/alerts";

  /**
   * Mapear tipo de alerta del backend al frontend
   */
  private mapBackendTypeToFrontend(backendType: string): Alert["tipo"] {
    const typeMap: Record<string, Alert["tipo"]> = {
      POR_VENCER: "por_vencer",
      VENCIDO: "vencido",
      CRITICO: "critico",
    };
    return typeMap[backendType] || "por_vencer";
  }

  /**
   * Mapear tipo de alerta del frontend al backend
   */
  private mapFrontendTypeToBackend(frontendType: Alert["tipo"]): string {
    const typeMap: Record<Alert["tipo"], string> = {
      por_vencer: "POR_VENCER",
      vencido: "VENCIDO",
      critico: "CRITICO",
    };
    return typeMap[frontendType] || "POR_VENCER";
  }

  /**
   * Mapear prioridad del backend al frontend
   */
  private mapBackendPriorityToFrontend(
    backendPriority: string
  ): Alert["prioridad"] {
    const priorityMap: Record<string, Alert["prioridad"]> = {
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
      CRITICAL: "critical",
      low: "low",
      medium: "medium",
      high: "high",
      critical: "critical",
    };
    return priorityMap[backendPriority] || "medium";
  }

  /**
   * Mapear prioridad del frontend al backend
   */
  private mapFrontendPriorityToBackend(
    frontendPriority: Alert["prioridad"]
  ): string {
    const priorityMap: Record<Alert["prioridad"], string> = {
      low: "low",
      medium: "medium",
      high: "high",
      critical: "critical",
    };
    return priorityMap[frontendPriority] || "medium";
  }

  /**
   * Mapear alerta del backend al frontend
   */
  private mapBackendToFrontend(backendAlert: BackendAlert): Alert {
    return {
      id: backendAlert.id.toString(),
      tipo: this.mapBackendTypeToFrontend(backendAlert.tipo),
      registro_id: backendAlert.registro_id.toString(),
      mensaje: backendAlert.mensaje,
      prioridad: this.mapBackendPriorityToFrontend(backendAlert.prioridad),
      usuario_id: backendAlert.usuario_id?.toString(),
      metadata: backendAlert.metadata
        ? JSON.parse(backendAlert.metadata)
        : undefined,
      leida: backendAlert.leida,
      fecha_creada: new Date(backendAlert.fecha_creada),
      fecha_leida: backendAlert.fecha_leida
        ? new Date(backendAlert.fecha_leida)
        : undefined,
      record: backendAlert.record
        ? {
            id: backendAlert.record.id.toString(),
            codigo: backendAlert.record.codigo,
            cliente: backendAlert.record.cliente,
            equipo: backendAlert.record.equipo,
            ubicacion: backendAlert.record.ubicacion,
          }
        : undefined,
    };
  }

  /**
   * Mapear estadísticas del backend al frontend
   */
  private mapBackendStatsToFrontend(
    backendStats: BackendAlertStats
  ): AlertStats {
    return {
      total: backendStats.total,
      noLeidas: backendStats.noLeidas,
      porTipo: backendStats.porTipo.map((item) => ({
        tipo: this.mapBackendTypeToFrontend(item.tipo),
        count: item.count,
      })),
      porPrioridad: backendStats.porPrioridad.map((item) => ({
        prioridad: this.mapBackendPriorityToFrontend(item.prioridad),
        count: item.count,
      })),
      recientes: backendStats.recientes.map((alert) =>
        this.mapBackendToFrontend(alert)
      ),
      criticas: backendStats.criticas.map((alert) =>
        this.mapBackendToFrontend(alert)
      ),
    };
  }

  /**
   * Obtener alertas con filtros y paginación
   */
  async getAlerts(filters?: AlertFilters): Promise<{
    data: Alert[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    try {
      const params = new URLSearchParams();

      if (filters?.tipo) {
        params.append("tipo", this.mapFrontendTypeToBackend(filters.tipo));
      }
      if (filters?.registro_id) {
        params.append("registro_id", filters.registro_id);
      }
      if (filters?.leida !== undefined) {
        params.append("leida", filters.leida.toString());
      }
      if (filters?.prioridad) {
        params.append(
          "prioridad",
          this.mapFrontendPriorityToBackend(filters.prioridad)
        );
      }
      if (filters?.fecha_desde) {
        params.append("fecha_desde", filters.fecha_desde);
      }
      if (filters?.fecha_hasta) {
        params.append("fecha_hasta", filters.fecha_hasta);
      }
      if (filters?.page) {
        params.append("page", filters.page.toString());
      }
      if (filters?.limit) {
        params.append("limit", filters.limit.toString());
      }
      if (filters?.sortBy) {
        params.append("sortBy", filters.sortBy);
      }
      if (filters?.sortOrder) {
        params.append("sortOrder", filters.sortOrder);
      }

      const queryString = params.toString();
      const url = `${this.basePath}${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get<BackendPaginatedAlerts>(url);

      const mappedData = response.data.map((alert) =>
        this.mapBackendToFrontend(alert)
      );

      return {
        data: mappedData,
        pagination: {
          currentPage: response.meta.page,
          totalPages: response.meta.totalPages,
          totalItems: response.meta.total,
          itemsPerPage: response.meta.limit,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener alerta por ID
   */
  async getAlertById(id: string): Promise<Alert> {
    try {
      const response = await apiClient.get<BackendAlert>(
        `${this.basePath}/${id}`
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Alerta no encontrada");
      }
      throw error;
    }
  }

  /**
   * Crear nueva alerta
   */
  async createAlert(alertData: CreateAlertDto): Promise<Alert> {
    try {
      const backendData = {
        tipo: this.mapFrontendTypeToBackend(alertData.tipo),
        registro_id: parseInt(alertData.registro_id),
        mensaje: alertData.mensaje,
        prioridad: alertData.prioridad
          ? this.mapFrontendPriorityToBackend(alertData.prioridad)
          : undefined,
        usuario_id: alertData.usuario_id
          ? parseInt(alertData.usuario_id)
          : undefined,
        metadata: alertData.metadata
          ? JSON.stringify(alertData.metadata)
          : undefined,
      };

      const response = await apiClient.post<BackendAlert>(
        this.basePath,
        backendData
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar alerta
   */
  async updateAlert(id: string, alertData: UpdateAlertDto): Promise<Alert> {
    try {
      const backendData: any = {};

      if (alertData.leida !== undefined) {
        backendData.leida = alertData.leida;
      }
      if (alertData.fecha_leida !== undefined) {
        backendData.fecha_leida = alertData.fecha_leida.toISOString();
      }
      if (alertData.mensaje !== undefined) {
        backendData.mensaje = alertData.mensaje;
      }
      if (alertData.prioridad !== undefined) {
        backendData.prioridad = this.mapFrontendPriorityToBackend(
          alertData.prioridad
        );
      }

      const response = await apiClient.patch<BackendAlert>(
        `${this.basePath}/${id}`,
        backendData
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Alerta no encontrada");
      }
      throw error;
    }
  }

  /**
   * Eliminar alerta
   */
  async deleteAlert(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/${id}`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Alerta no encontrada");
      }
      throw error;
    }
  }

  /**
   * Obtener contador de alertas no leídas
   */
  async getUnreadCount(): Promise<{ count: number }> {
    try {
      const response = await apiClient.get<{ count: number }>(
        `${this.basePath}/unread-count`
      );
      return response;
    } catch (error) {
      return { count: 0 };
    }
  }

  /**
   * Obtener resumen/estadísticas de alertas para dashboard
   */
  async getDashboardSummary(): Promise<AlertStats> {
    try {
      const response = await apiClient.get<BackendAlertStats>(
        `${this.basePath}/dashboard`
      );
      return this.mapBackendStatsToFrontend(response);
    } catch (error) {
      // Retornar datos por defecto en caso de error
      return {
        total: 0,
        noLeidas: 0,
        porTipo: [],
        porPrioridad: [],
        recientes: [],
        criticas: [],
      };
    }
  }

  /**
   * Marcar alerta como leída
   */
  async markAsRead(id: string): Promise<Alert> {
    try {
      const response = await apiClient.patch<BackendAlert>(
        `${this.basePath}/${id}/read`,
        {}
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Alerta no encontrada");
      }
      throw error;
    }
  }

  /**
   * Marcar todas las alertas como leídas
   */
  async markAllAsRead(): Promise<{ updated: number }> {
    try {
      const response = await apiClient.patch<{ updated: number }>(
        `${this.basePath}/mark-all-read`,
        {}
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener alertas críticas activas
   */
  async getCriticalAlerts(): Promise<Alert[]> {
    try {
      const response = await apiClient.get<BackendAlert[]>(
        `${this.basePath}/critical`
      );
      return response.map((alert) => this.mapBackendToFrontend(alert));
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtener alertas por registro específico
   */
  async getAlertsByRecord(registroId: string): Promise<Alert[]> {
    try {
      const response = await apiClient.get<BackendAlert[]>(
        `${this.basePath}/by-record/${registroId}`
      );
      return response.map((alert) => this.mapBackendToFrontend(alert));
    } catch (error) {
      return [];
    }
  }

  /**
   * Generar alertas manualmente (solo administradores)
   */
  async generateAlerts(): Promise<{
    evaluated: number;
    generated: number;
    alerts: Alert[];
  }> {
    try {
      const response = await apiClient.post<{
        evaluated: number;
        generated: number;
        alerts: BackendAlert[];
      }>(`${this.basePath}/generate`, {});

      return {
        evaluated: response.evaluated,
        generated: response.generated,
        alerts: response.alerts.map((alert) =>
          this.mapBackendToFrontend(alert)
        ),
      };
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para generar alertas");
      }
      throw error;
    }
  }

  /**
   * Limpiar alertas antiguas (mantenimiento)
   */
  async cleanOldAlerts(days: number): Promise<number> {
    try {
      const response = await apiClient.delete<{ deletedCount: number }>(
        `${this.basePath}/cleanup/${days}`
      );
      return response.deletedCount;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para limpiar alertas");
      }
      throw error;
    }
  }

  /**
   * Obtener estadísticas de alertas por período
   */
  async getAlertStatsByPeriod(
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<Array<{ fecha: string; tipo: Alert["tipo"]; count: number }>> {
    try {
      const response = await apiClient.get<
        Array<{ fecha: string; tipo: string; count: string }>
      >(
        `${this.basePath}/stats-by-period?fecha_inicio=${
          fechaInicio.toISOString().split("T")[0]
        }&fecha_fin=${fechaFin.toISOString().split("T")[0]}`
      );

      return response.map((item) => ({
        fecha: item.fecha,
        tipo: this.mapBackendTypeToFrontend(item.tipo),
        count: parseInt(item.count, 10),
      }));
    } catch (error) {
      return [];
    }
  }
}

// Exportar instancia singleton
export const alertService = new AlertService();