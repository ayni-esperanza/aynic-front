import { apiClient, ApiClientError } from "./apiClient";

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
  user_id?: string;
  record_code?: string;
  date_from?: string;
  date_to?: string;
  is_record_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface ActionOption {
  value: MovementAction;
  label: string;
}

// ===== CONSTANTES =====
const API_BASE_PATH = "/record-movement-history";

// ===== FUNCIONES UTILITARIAS =====
/**
 * Mapear acción del backend al frontend
 */
export const mapBackendActionToFrontend = (
  backendAction: string
): MovementAction => {
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
};

/**
 * Mapear acción del frontend al backend
 */
export const mapFrontendActionToBackend = (
  frontendAction: MovementAction
): string => {
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
};

/**
 * Mapear movimiento del backend al frontend
 */
export const mapBackendToFrontend = (
  backendMovement: BackendMovementHistory
): MovementHistory => {
  return {
    id: backendMovement.id.toString(),
    record_id: backendMovement.record_id?.toString() || null,
    record_code: backendMovement.record_code,
    action: mapBackendActionToFrontend(backendMovement.action),
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
};

/**
 * Mapear estadísticas del backend al frontend
 */
export const mapBackendStatsToFrontend = (
  backendStats: BackendMovementStatistics
): MovementStatistics => {
  // Contar usuarios activos únicos
  const activeUsers = new Set(backendStats.byUser.map((user) => user.username))
    .size;

  return {
    total: backendStats.total,
    today: backendStats.today,
    thisWeek: backendStats.thisWeek,
    activeUsers,
    byAction: backendStats.byAction.map((item) => ({
      action: mapBackendActionToFrontend(item.action),
      label: getActionLabel(mapBackendActionToFrontend(item.action)),
      count: item.count,
    })),
    byUser: backendStats.byUser,
  };
};

/**
 * Obtener etiqueta legible para una acción
 */
export const getActionLabel = (action: MovementAction): string => {
  const labels: Record<MovementAction, string> = {
    create: "Creación",
    update: "Actualización",
    delete: "Eliminación",
    restore: "Restauración",
    status_change: "Cambio de Estado",
    image_upload: "Subida de Imagen",
    image_replace: "Reemplazo de Imagen",
    image_delete: "Eliminación de Imagen",
    location_change: "Cambio de Ubicación",
    company_change: "Cambio de Empresa",
    maintenance: "Mantenimiento",
  };
  return labels[action] || "Acción";
};

// ===== FUNCIONES DE API =====
/**
 * Obtener historial con filtros y paginación
 */
export const getMovements = async (
  filters?: MovementFilters
): Promise<{
  data: MovementHistory[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}> => {
  console.log("🔍 getMovements called with filters:", filters);

  try {
    const params = new URLSearchParams();

    // Agregar filtros a los parámetros
    if (filters?.record_id) params.append("record_id", filters.record_id);
    if (filters?.action) {
      params.append("action", mapFrontendActionToBackend(filters.action));
    }
    if (filters?.user_id) params.append("user_id", filters.user_id);
    if (filters?.record_code) params.append("record_code", filters.record_code);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.is_record_active !== undefined) {
      params.append("is_record_active", filters.is_record_active.toString());
    }
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const queryString = params.toString();
    const url = `${API_BASE_PATH}${queryString ? `?${queryString}` : ""}`;

    console.log("🌐 Making request to URL:", url);

    const response = await apiClient.get<BackendPaginatedMovements>(url);

    console.log("✅ API Response received:", response);

    const mappedData = response.data.map((movement) =>
      mapBackendToFrontend(movement)
    );

    const result = {
      data: mappedData,
      pagination: {
        currentPage: response.meta.page,
        totalPages: response.meta.totalPages,
        totalItems: response.meta.total,
        itemsPerPage: response.meta.limit,
      },
    };

    console.log("✅ Mapped result:", result);

    return result;
  } catch (error) {
    console.error("❌ Error fetching movements:", error);
    throw error;
  }
};

/**
 * Obtener estadísticas del historial
 */
export const getStatistics = async (): Promise<MovementStatistics> => {
  console.log("🔍 getStatistics called");

  try {
    const url = `${API_BASE_PATH}/statistics`;
    console.log("🌐 Making request to URL:", url);

    const response = await apiClient.get<BackendMovementStatistics>(url);
    console.log("✅ Statistics response:", response);

    const result = mapBackendStatsToFrontend(response);
    console.log("✅ Mapped statistics:", result);

    return result;
  } catch (error) {
    console.error("❌ Error fetching movement statistics:", error);
    // Retornar datos por defecto en caso de error
    return {
      total: 0,
      today: 0,
      thisWeek: 0,
      activeUsers: 0,
      byAction: [],
      byUser: [],
    };
  }
};

/**
 * Obtener historial de un registro específico
 */
export const getRecordHistory = async (
  recordId: string
): Promise<MovementHistory[]> => {
  try {
    const response = await apiClient.get<BackendMovementHistory[]>(
      `${API_BASE_PATH}/by-record/${recordId}`
    );
    return response.map((movement) => mapBackendToFrontend(movement));
  } catch (error) {
    console.error("Error fetching record history:", error);
    return [];
  }
};

/**
 * Obtener tipos de acciones disponibles
 */
export const getAvailableActions = async (): Promise<ActionOption[]> => {
  try {
    const response = await apiClient.get<BackendActionOption[]>(
      `${API_BASE_PATH}/actions`
    );
    return response.map((option) => ({
      value: mapBackendActionToFrontend(option.value),
      label: option.label,
    }));
  } catch (error) {
    console.error("Error fetching available actions:", error);
    // Retornar opciones por defecto
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
};

/**
 * Obtener movimientos recientes
 */
export const getRecentMovements = async (
  limit: number = 20
): Promise<MovementHistory[]> => {
  try {
    const response = await apiClient.get<BackendPaginatedMovements>(
      `${API_BASE_PATH}/recent?limit=${limit}`
    );
    return response.data.map((movement) => mapBackendToFrontend(movement));
  } catch (error) {
    console.error("Error fetching recent movements:", error);
    return [];
  }
};

/**
 * Formatear valores JSON para mostrar
 */
export const formatJsonData = (data: Record<string, any> | null): string => {
  if (!data) return "N/A";

  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return "Error al formatear datos";
  }
};

/**
 * Obtener icono para una acción
 */
export const getActionIcon = (action: MovementAction): string => {
  const icons: Record<MovementAction, string> = {
    create: "➕",
    update: "✏️",
    delete: "🗑️",
    restore: "🔄",
    status_change: "🔄",
    image_upload: "📤",
    image_replace: "🔄",
    image_delete: "🗑️",
    location_change: "📍",
    company_change: "🏢",
    maintenance: "🔧",
  };
  return icons[action] || "📝";
};

/**
 * Obtener color para una acción
 */
export const getActionColor = (action: MovementAction): string => {
  const colors: Record<MovementAction, string> = {
    create: "success",
    update: "primary",
    delete: "danger",
    restore: "warning",
    status_change: "primary",
    image_upload: "success",
    image_replace: "warning",
    image_delete: "danger",
    location_change: "primary",
    company_change: "primary",
    maintenance: "warning",
  };
  return colors[action] || "secondary";
};
