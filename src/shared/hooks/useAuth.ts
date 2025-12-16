import { useAuthStore } from "../../store/authStore";
import {
  isAdmin as checkIsAdmin,
  isUsuario as checkIsUsuario,
  isSupervisor as checkIsSupervisor,
  hasRole,
  hasPermission,
  hasAnyRole,
  hasAnyPermission,
  isAyniUser as checkIsAyniUser,
  canViewAllCompanies,
  canManageUsers,
  canApproveRequests,
  canGenerateReports,
  getUserPermissions,
} from "../utils/permissions";
import type { FrontendRole, Permission } from "../utils/permissions";

/**
 * Hook personalizado para acceder a la autenticación del usuario
 * con utilidades completas de verificación de permisos
 * @returns Información de autenticación, funciones y verificaciones de permisos
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
    needsPasswordChange,
    setNeedsPasswordChange,
  } = useAuthStore();

  // ============= VERIFICACIONES DE ROLES =============

  const isAdmin = checkIsAdmin(user);
  const isUsuario = checkIsUsuario(user);
  const isSupervisor = checkIsSupervisor(user);

  // ============= VERIFICACIONES DE EMPRESA =============

  const isAyniUser = checkIsAyniUser(user);
  const canSeeAllCompanies = canViewAllCompanies(user);

  // ============= VERIFICACIONES DE PERMISOS COMUNES =============

  const canManageSystemUsers = canManageUsers(user);
  const canApproveUserRequests = canApproveRequests(user);
  const canCreateReports = canGenerateReports(user);

  // ============= FUNCIONES DE UTILIDAD =============

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const checkRole = (role: FrontendRole): boolean => {
    return hasRole(user, role);
  };

  /**
   * Verifica si el usuario tiene al menos uno de los roles
   */
  const checkAnyRole = (roles: FrontendRole[]): boolean => {
    return hasAnyRole(user, roles);
  };

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(user, permission);
  };

  /**
   * Verifica si el usuario tiene al menos uno de los permisos
   */
  const checkAnyPermission = (permissions: Permission[]): boolean => {
    return hasAnyPermission(user, permissions);
  };

  /**
   * Obtiene todos los permisos del usuario
   */
  const permissions = getUserPermissions(user);

  return {
    // Estado de autenticación
    user,
    isAuthenticated,

    // Funciones de autenticación
    login,
    logout,
    updateUser,

    // Estado de cambio de contraseña
    needsPasswordChange,
    setNeedsPasswordChange,

    // Verificaciones de roles
    isAdmin,
    isUsuario,
    isSupervisor,

    // Verificaciones de empresa
    isAyniUser,
    canSeeAllCompanies,

    // Permisos comunes
    canManageSystemUsers,
    canApproveUserRequests,
    canCreateReports,

    // Funciones de verificación
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,

    // Lista de permisos
    permissions,
  };
};
