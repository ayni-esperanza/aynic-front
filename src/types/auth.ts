import {
  BACKEND_TO_FRONTEND_ROLE_MAP,
  FRONTEND_TO_BACKEND_ROLE_MAP,
  type BackendRole,
  type FrontendRole,
} from "../shared/constants/roles";

export interface BackendUser {
  id: number;
  usuario: string;
  nombre: string;
  apellidos?: string;
  email: string;
  celular?: string;
  rol: BackendRole;
  cargo?: string;
  empresa: string;
}

export interface User extends Record<string, unknown> {
  id: string; // Convertir number a string para compatibilidad
  nombre: string;
  email: string;
  telefono?: string;
  rol: FrontendRole;
  fecha_creacion: Date;
  activo: boolean;
  usuario?: string;
  apellidos?: string;
  cargo?: string;
  empresa?: string;
}

export interface LoginCredentials {
  username: string; // espera 'username'
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: BackendUser;
  needsPasswordChange?: boolean;
}

export class AuthMappers {
  /**
   * Convierte usuario del backend al formato del frontend
   */
  static backendUserToFrontend(backendUser: BackendUser): User {
    return {
      id: backendUser.id.toString(), // Convertir a string
      nombre: backendUser.nombre,
      email: backendUser.email,
      telefono: backendUser.celular, // Mapear celular -> telefono
      rol: this.mapBackendRoleToFrontend(backendUser.rol),
      fecha_creacion: new Date(), // Valor por defecto
      activo: true, // Valor por defecto
      usuario: backendUser.usuario,
      apellidos: backendUser.apellidos,
      cargo: backendUser.cargo,
      empresa: backendUser.empresa,
    };
  }

  /**
   * Mapea los roles del backend a los del frontend
   */
  private static mapBackendRoleToFrontend(
    backendRole: BackendRole
  ): FrontendRole {
    return BACKEND_TO_FRONTEND_ROLE_MAP[backendRole] || "usuario";
  }

  /**
   * Mapea los roles del frontend a los del backend
   */
  static mapFrontendRoleToBackend(frontendRole: FrontendRole): BackendRole {
    return FRONTEND_TO_BACKEND_ROLE_MAP[frontendRole] || "USUARIO";
  }

  /**
   * Valida las credenciales antes de enviarlas
   */
  static validateCredentials(
    username: string,
    password: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!username || username.trim().length === 0) {
      errors.push("El usuario es requerido");
    }

    if (!password || password.length === 0) {
      errors.push("La contraseña es requerida");
    }

    if (username && username.length < 3) {
      errors.push("El usuario debe tener al menos 3 caracteres");
    }

    if (password && password.length < 3) {
      errors.push("La contraseña debe tener al menos 3 caracteres");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// ===== ESTADO DE AUTENTICACIÓN =====
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}
