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

// Límite máximo permitido por el backend
const MAX_LIMIT = 100;

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
 * Validar filtros antes de enviar al backend
 */
export const validateFilters = (
  filters: MovementFilters
): {
  valid: boolean;
  errors: string[];
  sanitizedFilters: MovementFilters;
} => {
  const errors: string[] = [];
  const sanitizedFilters: MovementFilters = { ...filters };

  // user_id debe ser numérico o vacío
  if (filters.user_id) {
    const userIdAsNumber = parseInt(filters.user_id, 10);
    if (isNaN(userIdAsNumber)) {
      errors.push(
        `user_id debe ser un número válido. Recibido: "${filters.user_id}"`
      );
      delete sanitizedFilters.user_id; // Remover valor inválido
    } else {
      sanitizedFilters.user_id = userIdAsNumber.toString();
    }
  }

  // limit no debe exceder MAX_LIMIT
  if (filters.limit && filters.limit > MAX_LIMIT) {
    errors.push(
      `limit no debe ser mayor que ${MAX_LIMIT}. Recibido: ${filters.limit}`
    );
    sanitizedFilters.limit = MAX_LIMIT;
  }

  // page debe ser positivo
  if (filters.page && filters.page < 1) {
    errors.push(`page debe ser mayor que 0. Recibido: ${filters.page}`);
    sanitizedFilters.page = 1;
  }

  // VALIDACIÓN: fechas deben ser válidas
  if (filters.date_from && !isValidDate(filters.date_from)) {
    errors.push(
      `date_from debe ser una fecha válida (YYYY-MM-DD). Recibido: "${filters.date_from}"`
    );
    delete sanitizedFilters.date_from;
  }

  if (filters.date_to && !isValidDate(filters.date_to)) {
    errors.push(
      `date_to debe ser una fecha válida (YYYY-MM-DD). Recibido: "${filters.date_to}"`
    );
    delete sanitizedFilters.date_to;
  }

  // sortOrder debe ser válido
  if (filters.sortOrder && !["ASC", "DESC"].includes(filters.sortOrder)) {
    errors.push(
      `sortOrder debe ser "ASC" o "DESC". Recibido: "${filters.sortOrder}"`
    );
    sanitizedFilters.sortOrder = "DESC";
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedFilters,
  };
};

/**
 * Validar si una fecha está en formato correcto (YYYY-MM-DD)
 */
const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
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
    // VALIDAR FILTROS ANTES DE ENVIAR
    const validation = validateFilters(filters || {});

    if (!validation.valid) {
      console.warn("⚠️ Filter validation errors:", validation.errors);
      // Usar filtros sanitizados en lugar de fallar
      console.log("🔧 Using sanitized filters:", validation.sanitizedFilters);
    }

    const sanitizedFilters = validation.sanitizedFilters;
    const params = new URLSearchParams();

    // Agregar filtros validados a los parámetros
    if (sanitizedFilters.record_id)
      params.append("record_id", sanitizedFilters.record_id);
    if (sanitizedFilters.action) {
      params.append(
        "action",
        mapFrontendActionToBackend(sanitizedFilters.action)
      );
    }
    if (sanitizedFilters.user_id)
      params.append("user_id", sanitizedFilters.user_id);
    if (sanitizedFilters.record_code)
      params.append("record_code", sanitizedFilters.record_code);
    if (sanitizedFilters.date_from)
      params.append("date_from", sanitizedFilters.date_from);
    if (sanitizedFilters.date_to)
      params.append("date_to", sanitizedFilters.date_to);
    if (sanitizedFilters.is_record_active !== undefined) {
      params.append(
        "is_record_active",
        sanitizedFilters.is_record_active.toString()
      );
    }
    if (sanitizedFilters.search)
      params.append("search", sanitizedFilters.search);
    if (sanitizedFilters.page)
      params.append("page", sanitizedFilters.page.toString());
    if (sanitizedFilters.limit)
      params.append("limit", sanitizedFilters.limit.toString());
    if (sanitizedFilters.sortBy)
      params.append("sortBy", sanitizedFilters.sortBy);
    if (sanitizedFilters.sortOrder)
      params.append("sortOrder", sanitizedFilters.sortOrder);

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

    // MANEJO MEJORADO DE ERRORES
    if (error instanceof ApiClientError) {
      if (error.status === 400) {
        // Error de validación del backend
        throw new Error(`Error de validación: ${error.message}`);
      }
      throw new Error(`Error del servidor (${error.status}): ${error.message}`);
    }

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
    // VALIDAR LÍMITE
    const validLimit = Math.min(limit, MAX_LIMIT);

    const response = await apiClient.get<BackendPaginatedMovements>(
      `${API_BASE_PATH}/recent?limit=${validLimit}`
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

/**
 * Crear filtros seguros para exportación
 */
export const createExportFilters = (
  baseFilters: MovementFilters
): MovementFilters => {
  return {
    ...baseFilters,
    page: 1,
    limit: MAX_LIMIT, // Usar límite máximo seguro
  };
};
