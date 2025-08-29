import { apiClient, ApiClientError } from '../../../shared/services/apiClient';

// ===== INTERFACES PARA EL BACKEND =====
export interface BackendMovementHistory {
  id: number;
  record_id: number | null;
  record_code: string | null;
  action: string;
  description: string;
  action_date: string;
  user_id: number | null;
  username: string | null;
  previous_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  changed_fields: string[] | null;
  is_record_active: boolean;
  additional_metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  formatted_date: string;
  action_label: string;
  user_display_name: string;
}

export interface BackendMovementStatistics {
  total: number;
  today: number;
  thisWeek: number;
  byAction: Array<{ action: string; count: number }>;
  byUser: Array<{ username: string; count: number }>;
}

export interface BackendPaginatedMovements {
  data: BackendMovementHistory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface BackendActionOption {
  value: string;
  label: string;
}

// ===== INTERFACES PARA EL FRONTEND =====
export interface MovementHistory {
  id: string;
  record_id: string | null;
  record_code: string | null;
  action: MovementAction;
  description: string;
  action_date: Date;
  user_id: string | null;
  username: string | null;
  previous_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  changed_fields: string[] | null;
  is_record_active: boolean;
  additional_metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  formatted_date: string;
  action_label: string;
  user_display_name: string;
}

export type MovementAction =
  | "create"
  | "update"
  | "delete"
  | "restore"
  | "status_change"
  | "image_upload"
  | "image_replace"
  | "image_delete"
  | "location_change"
  | "company_change"
  | "maintenance";

export interface MovementStatistics {
  total: number;
  today: number;
  thisWeek: number;
  activeUsers: number;
  byAction: Array<{ action: MovementAction; label: string; count: number }>;
  byUser: Array<{ username: string; count: number }>;
}

export interface MovementFilters extends Record<string, unknown> {
  record_id?: string;
  action?: MovementAction;
  username?: string;
  record_code?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
}

export interface ActionOption {
  value: MovementAction;
  label: string;
}

export interface PaginatedMovements {
  data: MovementHistory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

class MovementHistoryService {
  private readonly basePath = "/movement-history";

  /**
   * Mapear movimiento del backend al formato del frontend
   */
  private mapBackendToFrontend(backendMovement: BackendMovementHistory): MovementHistory {
    return {
      id: backendMovement.id.toString(),
      record_id: backendMovement.record_id?.toString() || null,
      record_code: backendMovement.record_code,
      action: this.mapBackendActionToFrontend(backendMovement.action),
      description: backendMovement.description,
      action_date: new Date(backendMovement.action_date),
      user_id: backendMovement.user_id?.toString() || null,
      username: backendMovement.username,
      previous_values: backendMovement.previous_values,
      new_values: backendMovement.new_values,
      changed_fields: backendMovement.changed_fields,
      is_record_active: backendMovement.is_record_active,
      additional_metadata: backendMovement.additional_metadata,
      ip_address: backendMovement.ip_address,
      user_agent: backendMovement.user_agent,
      formatted_date: backendMovement.formatted_date,
      action_label: backendMovement.action_label,
      user_display_name: backendMovement.user_display_name,
    };
  }

  /**
   * Mapear estadísticas del backend al formato del frontend
   */
  private mapBackendStatsToFrontend(backendStats: BackendMovementStatistics): MovementStatistics {
    return {
      total: backendStats.total,
      today: backendStats.today,
      thisWeek: backendStats.thisWeek,
      activeUsers: backendStats.byUser.length,
      byAction: backendStats.byAction.map(item => ({
        action: this.mapBackendActionToFrontend(item.action),
        label: this.getActionLabel(this.mapBackendActionToFrontend(item.action)),
        count: item.count,
      })),
      byUser: backendStats.byUser,
    };
  }

  /**
   * Mapear acción del backend al frontend
   */
  private mapBackendActionToFrontend(backendAction: string): MovementAction {
    const actionMap: Record<string, MovementAction> = {
      CREATE: "create",
      UPDATE: "update",
      DELETE: "delete",
      RESTORE: "restore",
      STATUS_CHANGE: "status_change",
      IMAGE_UPLOAD: "image_upload",
      IMAGE_REPLACE: "image_replace",
      IMAGE_DELETE: "image_delete",
      LOCATION_CHANGE: "location_change",
      COMPANY_CHANGE: "company_change",
      MAINTENANCE: "maintenance",
    };
    return actionMap[backendAction] || "update";
  }

  /**
   * Obtener etiqueta de acción
   */
  private getActionLabel(action: MovementAction): string {
    const labels: Record<MovementAction, string> = {
      create: "Crear",
      update: "Actualizar",
      delete: "Eliminar",
      restore: "Restaurar",
      status_change: "Cambio de estado",
      image_upload: "Subir imagen",
      image_replace: "Reemplazar imagen",
      image_delete: "Eliminar imagen",
      location_change: "Cambio de ubicación",
      company_change: "Cambio de empresa",
      maintenance: "Mantenimiento",
    };
    return labels[action];
  }

  /**
   * Obtener movimientos con paginación y filtros
   */
  async getMovements(filters: MovementFilters = {}): Promise<PaginatedMovements> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.record_id) {
        queryParams.append("record_id", filters.record_id);
      }
      if (filters.action) {
        queryParams.append("action", filters.action);
      }
      if (filters.username) {
        queryParams.append("username", filters.username);
      }
      if (filters.record_code) {
        queryParams.append("record_code", filters.record_code);
      }
      if (filters.date_from) {
        queryParams.append("date_from", filters.date_from);
      }
      if (filters.date_to) {
        queryParams.append("date_to", filters.date_to);
      }
      if (filters.page) {
        queryParams.append("page", filters.page.toString());
      }
      if (filters.limit) {
        queryParams.append("limit", filters.limit.toString());
      }
      if (filters.sortBy) {
        queryParams.append("sortBy", filters.sortBy);
      }
      if (filters.sortOrder) {
        queryParams.append("sortOrder", filters.sortOrder);
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
      }

      const url = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get<BackendPaginatedMovements>(url);
      
      return {
        data: response.data.map(movement => this.mapBackendToFrontend(movement)),
        meta: response.meta,
      };
    } catch (error) {
      console.error("Error fetching movements:", error);
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para ver el historial de movimientos");
      }
      throw error;
    }
  }

  /**
   * Obtener estadísticas de movimientos
   */
  async getStatistics(): Promise<MovementStatistics> {
    try {
      const response = await apiClient.get<BackendMovementStatistics>(`${this.basePath}/statistics`);
      return this.mapBackendStatsToFrontend(response);
    } catch (error) {
      console.error("Error fetching movement statistics:", error);
      throw error;
    }
  }

  /**
   * Obtener opciones de acciones disponibles
   */
  async getAvailableActions(): Promise<ActionOption[]> {
    try {
      const response = await apiClient.get<BackendActionOption[]>(`${this.basePath}/actions`);
      return response.map(option => ({
        value: this.mapBackendActionToFrontend(option.value) as MovementAction,
        label: option.label,
      }));
    } catch (error) {
      console.error("Error fetching available actions:", error);
      throw error;
    }
  }

  /**
   * Obtener nombres de usuario únicos
   */
  async getUniqueUsernames(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await apiClient.get<Array<{ username: string; display_name: string }>>(`${this.basePath}/usernames`);
      return response.map(user => ({
        value: user.username,
        label: user.display_name || user.username,
      }));
    } catch (error) {
      console.error("Error fetching unique usernames:", error);
      throw error;
    }
  }

  /**
   * Obtener movimiento por ID
   */
  async getMovementById(id: string): Promise<MovementHistory> {
    try {
      const response = await apiClient.get<BackendMovementHistory>(`${this.basePath}/${id}`);
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Movimiento no encontrado");
      }
      throw error;
    }
  }

  /**
   * Exportar movimientos a CSV
   */
  async exportMovements(filters: MovementFilters = {}): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.record_id) {
        queryParams.append("record_id", filters.record_id);
      }
      if (filters.action) {
        queryParams.append("action", filters.action);
      }
      if (filters.username) {
        queryParams.append("username", filters.username);
      }
      if (filters.date_from) {
        queryParams.append("date_from", filters.date_from);
      }
      if (filters.date_to) {
        queryParams.append("date_to", filters.date_to);
      }

      const url = `${this.basePath}/export${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get(url, { responseType: 'blob' });
      return response;
    } catch (error) {
      console.error("Error exporting movements:", error);
      throw error;
    }
  }

  /**
   * Validar filtros de movimiento
   */
  validateFilters(filters: MovementFilters): string[] {
    const errors: string[] = [];

    if (filters.date_from && filters.date_to) {
      const fromDate = new Date(filters.date_from);
      const toDate = new Date(filters.date_to);
      
      if (fromDate > toDate) {
        errors.push("La fecha de inicio no puede ser mayor que la fecha de fin");
      }
    }

    if (filters.page && filters.page < 1) {
      errors.push("El número de página debe ser mayor a 0");
    }

    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      errors.push("El límite debe estar entre 1 y 100");
    }

    return errors;
  }
}

// Exportar instancia singleton
export const movementHistoryService = new MovementHistoryService();
