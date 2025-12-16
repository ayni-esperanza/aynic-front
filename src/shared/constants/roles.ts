/**
 * Constantes y utilidades para el sistema de roles
 * Centraliza toda la lógica de autorización y permisos
 */

// ============= ROLES DEL SISTEMA =============

/**
 * Roles disponibles en el frontend
 */
export const ROLES = {
  ADMIN: "admin",
  USUARIO: "usuario",
  SUPERVISOR: "supervisor", // Reservado para uso futuro
} as const;

/**
 * Roles disponibles en el backend
 */
export const BACKEND_ROLES = {
  ADMINISTRADOR: "ADMINISTRADOR",
  USUARIO: "USUARIO",
} as const;

/**
 * Tipo para los roles del frontend
 */
export type FrontendRole = (typeof ROLES)[keyof typeof ROLES];

/**
 * Tipo para los roles del backend
 */
export type BackendRole = (typeof BACKEND_ROLES)[keyof typeof BACKEND_ROLES];

// ============= MAPEO DE ROLES =============

/**
 * Mapeo de roles del backend al frontend
 */
export const BACKEND_TO_FRONTEND_ROLE_MAP: Record<BackendRole, FrontendRole> = {
  [BACKEND_ROLES.ADMINISTRADOR]: ROLES.ADMIN,
  [BACKEND_ROLES.USUARIO]: ROLES.USUARIO,
};

/**
 * Mapeo de roles del frontend al backend
 */
export const FRONTEND_TO_BACKEND_ROLE_MAP: Record<FrontendRole, BackendRole> = {
  [ROLES.ADMIN]: BACKEND_ROLES.ADMINISTRADOR,
  [ROLES.USUARIO]: BACKEND_ROLES.USUARIO,
  [ROLES.SUPERVISOR]: BACKEND_ROLES.USUARIO, // Supervisor mapea a USUARIO por ahora
};

// ============= PERMISOS POR ROL =============

/**
 * Define los permisos disponibles en el sistema
 */
export const PERMISSIONS = {
  // Usuarios
  CREATE_USER: "create_user",
  VIEW_USERS: "view_users",
  EDIT_USER: "edit_user",
  DELETE_USER: "delete_user",

  // Registros
  CREATE_RECORD: "create_record",
  VIEW_RECORDS: "view_records",
  EDIT_RECORD: "edit_record",
  DELETE_RECORD: "delete_record",
  VIEW_ALL_COMPANIES: "view_all_companies",

  // Mantenimiento
  CREATE_MAINTENANCE: "create_maintenance",
  VIEW_MAINTENANCE: "view_maintenance",
  EDIT_MAINTENANCE: "edit_maintenance",
  DELETE_MAINTENANCE: "delete_maintenance",

  // Accidentes
  CREATE_ACCIDENT: "create_accident",
  VIEW_ACCIDENTS: "view_accidents",
  EDIT_ACCIDENT: "edit_accident",
  DELETE_ACCIDENT: "delete_accident",

  // Solicitudes
  CREATE_REQUEST: "create_request",
  VIEW_REQUESTS: "view_requests",
  APPROVE_REQUEST: "approve_request",
  REJECT_REQUEST: "reject_request",

  // Reportes
  GENERATE_REPORTS: "generate_reports",
  VIEW_REPORTS: "view_reports",

  // Órdenes de compra
  CREATE_PURCHASE_ORDER: "create_purchase_order",
  VIEW_PURCHASE_ORDERS: "view_purchase_orders",
  EDIT_PURCHASE_ORDER: "edit_purchase_order",
  DELETE_PURCHASE_ORDER: "delete_purchase_order",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Matriz de permisos por rol
 */
export const ROLE_PERMISSIONS: Record<FrontendRole, Permission[]> = {
  [ROLES.ADMIN]: [
    // Administradores tienen TODOS los permisos
    ...Object.values(PERMISSIONS),
  ],
  [ROLES.USUARIO]: [
    // Usuarios pueden ver y gestionar registros de su empresa
    PERMISSIONS.VIEW_RECORDS,
    PERMISSIONS.CREATE_RECORD,
    PERMISSIONS.EDIT_RECORD,
    PERMISSIONS.DELETE_RECORD,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.CREATE_MAINTENANCE,
    PERMISSIONS.EDIT_MAINTENANCE,
    PERMISSIONS.VIEW_ACCIDENTS,
    PERMISSIONS.CREATE_ACCIDENT,
    PERMISSIONS.EDIT_ACCIDENT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.CREATE_PURCHASE_ORDER,
    PERMISSIONS.EDIT_PURCHASE_ORDER,
    PERMISSIONS.CREATE_REQUEST,
  ],
  [ROLES.SUPERVISOR]: [
    // Supervisores tienen permisos similares a usuarios por ahora
    // En el futuro se pueden agregar permisos específicos
    PERMISSIONS.VIEW_RECORDS,
    PERMISSIONS.CREATE_RECORD,
    PERMISSIONS.EDIT_RECORD,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.CREATE_MAINTENANCE,
    PERMISSIONS.EDIT_MAINTENANCE,
    PERMISSIONS.VIEW_ACCIDENTS,
    PERMISSIONS.CREATE_ACCIDENT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.VIEW_PURCHASE_ORDERS,
  ],
};

// ============= CONFIGURACIÓN DE EMPRESA =============

/**
 * Variantes aceptadas del nombre de la empresa Ayni
 * Incluye diferentes formas de escribir: Ayni, Aynic, ayni, AYNI, etc.
 */
export const AYNI_COMPANY_VARIANTS = [
  "ayni",
  "aynic",
  "aynisac",
  "ayni sac",
] as const;

/**
 * Verifica si una empresa es Ayni (acepta todas las variantes)
 * @param empresa - Nombre de la empresa a verificar
 * @returns true si es Ayni (en cualquiera de sus variantes)
 */
export const isAyniCompany = (empresa?: string | null): boolean => {
  if (!empresa) return false;

  const empresaLower = empresa.toLowerCase().trim();

  return AYNI_COMPANY_VARIANTS.some(
    (variant) =>
      empresaLower === variant || empresaLower.startsWith(variant + " ")
  );
};

// ============= ETIQUETAS Y TRADUCCIONES =============

/**
 * Etiquetas amigables para los roles
 */
export const ROLE_LABELS: Record<FrontendRole, string> = {
  [ROLES.ADMIN]: "Administrador",
  [ROLES.USUARIO]: "Usuario",
  [ROLES.SUPERVISOR]: "Supervisor",
};

/**
 * Descripciones de los roles
 */
export const ROLE_DESCRIPTIONS: Record<FrontendRole, string> = {
  [ROLES.ADMIN]: "Acceso completo a todas las funcionalidades del sistema",
  [ROLES.USUARIO]: "Acceso a gestión de registros y funcionalidades básicas",
  [ROLES.SUPERVISOR]: "Acceso de supervisión con permisos limitados",
};

/**
 * Colores para badges de roles
 */
export const ROLE_COLORS: Record<FrontendRole, { bg: string; text: string }> = {
  [ROLES.ADMIN]: { bg: "bg-purple-100", text: "text-purple-800" },
  [ROLES.USUARIO]: { bg: "bg-blue-100", text: "text-blue-800" },
  [ROLES.SUPERVISOR]: { bg: "bg-green-100", text: "text-green-800" },
};
