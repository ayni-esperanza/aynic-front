/**
 * Utilidades para verificación de permisos y autorización
 */

import {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  AYNI_COMPANY_VARIANTS,
  isAyniCompany,
  type FrontendRole,
  type Permission,
} from "../constants/roles";
import type { User } from "../../types/auth";

// Re-exportar tipos para facilitar importación
export type { FrontendRole, Permission } from "../constants/roles";

// ============= VERIFICACIÓN DE ROLES =============

/**
 * Verifica si un usuario tiene un rol específico
 */
export const hasRole = (
  user: User | null | undefined,
  role: FrontendRole
): boolean => {
  if (!user) return false;
  return user.rol === role;
};

/**
 * Verifica si un usuario tiene al menos uno de los roles especificados
 */
export const hasAnyRole = (
  user: User | null | undefined,
  roles: FrontendRole[]
): boolean => {
  if (!user) return false;
  return roles.includes(user.rol);
};

/**
 * Verifica si un usuario es administrador
 */
export const isAdmin = (user: User | null | undefined): boolean => {
  return hasRole(user, ROLES.ADMIN);
};

/**
 * Verifica si un usuario es usuario regular
 */
export const isUsuario = (user: User | null | undefined): boolean => {
  return hasRole(user, ROLES.USUARIO);
};

/**
 * Verifica si un usuario es supervisor
 */
export const isSupervisor = (user: User | null | undefined): boolean => {
  return hasRole(user, ROLES.SUPERVISOR);
};

// ============= VERIFICACIÓN DE PERMISOS =============

/**
 * Verifica si un usuario tiene un permiso específico
 */
export const hasPermission = (
  user: User | null | undefined,
  permission: Permission
): boolean => {
  if (!user) return false;

  const userPermissions = ROLE_PERMISSIONS[user.rol] || [];
  return userPermissions.includes(permission);
};

/**
 * Verifica si un usuario tiene todos los permisos especificados
 */
export const hasAllPermissions = (
  user: User | null | undefined,
  permissions: Permission[]
): boolean => {
  if (!user) return false;

  return permissions.every((permission) => hasPermission(user, permission));
};

/**
 * Verifica si un usuario tiene al menos uno de los permisos especificados
 */
export const hasAnyPermission = (
  user: User | null | undefined,
  permissions: Permission[]
): boolean => {
  if (!user) return false;

  return permissions.some((permission) => hasPermission(user, permission));
};

/**
 * Obtiene todos los permisos de un usuario
 */
export const getUserPermissions = (
  user: User | null | undefined
): Permission[] => {
  if (!user) return [];

  return ROLE_PERMISSIONS[user.rol] || [];
};

// ============= VERIFICACIÓN DE EMPRESA =============

/**
 * Verifica si un usuario pertenece a Ayni
 * Acepta todas las variantes: ayni, Ayni, AYNI, Aynic, aynic, AyNi, etc.
 */
export const isAyniUser = (user: User | null | undefined): boolean => {
  return isAyniCompany(user?.empresa);
};

/**
 * Verifica si un usuario puede ver registros de todas las empresas
 */
export const canViewAllCompanies = (user: User | null | undefined): boolean => {
  return isAyniUser(user);
};

/**
 * Verifica si un usuario puede acceder a un registro de una empresa específica
 */
export const canAccessCompanyRecord = (
  user: User | null | undefined,
  recordCompany: string
): boolean => {
  if (!user) return false;

  // Usuarios de Ayni pueden acceder a todo
  if (isAyniUser(user)) return true;

  // Otros usuarios solo pueden acceder a su propia empresa
  return user.empresa?.toLowerCase() === recordCompany.toLowerCase();
};

/**
 * Verifica si un usuario puede editar/eliminar un registro
 */
export const canModifyRecord = (
  user: User | null | undefined,
  recordCompany: string
): boolean => {
  if (!user) return false;

  // Solo usuarios de Ayni pueden modificar cualquier registro
  return isAyniUser(user) || canAccessCompanyRecord(user, recordCompany);
};

// ============= COMBINACIONES COMUNES =============

/**
 * Verifica si un usuario puede gestionar usuarios del sistema
 */
export const canManageUsers = (user: User | null | undefined): boolean => {
  return isAdmin(user);
};

/**
 * Verifica si un usuario puede aprobar solicitudes
 */
export const canApproveRequests = (user: User | null | undefined): boolean => {
  return isAdmin(user);
};

/**
 * Verifica si un usuario puede ver el módulo de solicitudes
 */
export const canViewRequestsModule = (
  user: User | null | undefined
): boolean => {
  return isAdmin(user);
};

/**
 * Verifica si un usuario puede generar reportes
 */
export const canGenerateReports = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return hasPermission(user, "generate_reports" as Permission);
};

/**
 * Verifica si un usuario puede crear/editar/eliminar según su empresa
 */
export const canPerformAction = (
  user: User | null | undefined,
  _action: "create" | "edit" | "delete",
  targetCompany?: string
): boolean => {
  if (!user) return false;

  // Administradores pueden hacer todo
  if (isAdmin(user)) return true;

  // Usuarios de Ayni pueden hacer todo
  if (isAyniUser(user)) return true;

  // Si hay empresa objetivo, verificar acceso
  if (targetCompany) {
    return canAccessCompanyRecord(user, targetCompany);
  }

  // Por defecto, permitir si tiene el permiso básico
  return true;
};

// ============= UTILIDADES DE UI =============

/**
 * Obtiene el mensaje de restricción apropiado
 */
export const getRestrictionMessage = (
  user: User | null | undefined
): string | null => {
  if (!user) return "Debes iniciar sesión para acceder";

  if (isAyniUser(user)) return null;

  return `Visualizando solo registros de: ${user.empresa}`;
};

/**
 * Determina si se debe mostrar el filtro de todas las empresas
 */
export const shouldShowAllCompaniesFilter = (
  user: User | null | undefined
): boolean => {
  return canViewAllCompanies(user);
};

/**
 * Obtiene la empresa por defecto para filtros
 */
export const getDefaultCompanyFilter = (
  user: User | null | undefined
): string | null => {
  if (!user) return null;
  if (isAyniUser(user)) return null;
  return user.empresa || null;
};
