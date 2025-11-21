/**
 * Archivo central de exportación para el sistema de roles y permisos
 * Facilita la importación de constantes y utilidades desde un solo lugar
 */

// Constantes de roles
export {
  ROLES,
  BACKEND_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  AYNI_COMPANY_VARIANTS,
  isAyniCompany,
} from "../constants/roles";

export type { FrontendRole, BackendRole, Permission } from "../constants/roles";

// Utilidades de permisos
export {
  hasRole,
  hasAnyRole,
  isAdmin,
  isUsuario,
  isSupervisor,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getUserPermissions,
  isAyniUser,
  canViewAllCompanies,
  canAccessCompanyRecord,
  canModifyRecord,
  canManageUsers,
  canApproveRequests,
  canViewRequestsModule,
  canGenerateReports,
  canPerformAction,
  getRestrictionMessage,
  shouldShowAllCompaniesFilter,
  getDefaultCompanyFilter,
} from "../utils/permissions";

// Hook de autenticación
export { useAuth } from "../hooks/useAuth";
