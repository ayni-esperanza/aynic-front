import { apiClient, ApiClientError } from '../../../shared/services/apiClient';
import type {
  BackendMovementHistory,
  BackendMovementStatistics,
  BackendPaginatedMovements,
  BackendActionOption,
  MovementHistory,
  MovementAction,
  MovementStatistics,
  MovementFilters,
  ActionOption,
} from '../types/movement';

class MovementHistoryService {
  private readonly basePath = "/record-movement-history";

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
      byAction: backendStats.byAction.map((item) => ({
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
   * Mapear acción del frontend al backend
   */
  private mapFrontendActionToBackend(frontendAction: MovementAction): string {
    const actionMap: Record<MovementAction, string> = {
      create: "CREATE",
      update: "UPDATE",
      delete: "DELETE",
      restore: "RESTORE",
      status_change: "STATUS_CHANGE",
      image_upload: "IMAGE_UPLOAD",
      image_replace: "IMAGE_REPLACE",
      image_delete: "IMAGE_DELETE",
      location_change: "LOCATION_CHANGE",
      company_change: "COMPANY_CHANGE",
      maintenance: "MAINTENANCE",
    };
    return actionMap[frontendAction] || "UPDATE";
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
  async getMovements(filters: MovementFilters = {}): Promise<{
    data: MovementHistory[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.record_id) {
        queryParams.append("record_id", filters.record_id);
      }
      if (filters.action) {
        queryParams.append("action", this.mapFrontendActionToBackend(filters.action));
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
      if ((filters as any).is_record_active !== undefined && (filters as any).is_record_active !== null) {
        queryParams.append("is_record_active", String((filters as any).is_record_active));
      }
      if (filters.search) {
        queryParams.append("search", filters.search);
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

      const url = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get<BackendPaginatedMovements>(url);

      return {
        data: response.data.map((movement) => this.mapBackendToFrontend(movement)),
        pagination: {
          currentPage: response.meta.page,
          totalPages: response.meta.totalPages,
          totalItems: response.meta.total,
          itemsPerPage: response.meta.limit,
        },
      };
    } catch (error) {
      console.error("Error fetching movements:", error);
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para ver el historial de movimientos");
      }
      if (error instanceof ApiClientError && error.status === 400) {
        throw new Error(`Error de validación: ${error.message}`);
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
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        activeUsers: 0,
        byAction: [],
        byUser: [],
      };
    }
  }

  /**
   * Obtener opciones de acciones disponibles
   */
  async getAvailableActions(): Promise<ActionOption[]> {
    try {
      const response = await apiClient.get<BackendActionOption[]>(`${this.basePath}/actions`);
      return response.map((option) => ({
        value: this.mapBackendActionToFrontend(option.value) as MovementAction,
        label: option.label,
      }));
    } catch (error) {
      console.error("Error fetching available actions:", error);
      const defaultActions: ActionOption[] = [
        { value: "create", label: "Creación" },
        { value: "update", label: "Actualización" },
        { value: "delete", label: "Eliminación" },
        { value: "status_change", label: "Cambio de Estado" },
        { value: "image_upload", label: "Subida de Imagen" },
        { value: "image_replace", label: "Reemplazo de Imagen" },
        { value: "image_delete", label: "Eliminación de Imagen" },
      ];
      return defaultActions;
    }
  }

  /**
   * Obtener nombres de usuario únicos
   */
  async getUniqueUsernames(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await apiClient.get<Array<{ value: string; label: string }>>(`${this.basePath}/usernames`);
      return response;
    } catch (error) {
      console.error("Error fetching usernames:", error);
      return [];
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

      const url = `${this.basePath}/export${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const fullUrl = `${baseURL}${url}`;
      const token = localStorage.getItem('token');
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      
      if (!response.ok) {
        throw new ApiClientError('Error exportando movimientos', response.status);
      }
      
      return await response.blob();
    } catch (error) {
      console.error("Error exporting movements:", error);
      throw error;
    }
  }
}

export const movementHistoryService = new MovementHistoryService();
