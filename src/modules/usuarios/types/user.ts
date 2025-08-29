// Tipos específicos del módulo usuarios

// ===== INTERFACES PARA EL BACKEND =====
export interface BackendUser {
  id: number;
  usuario: string;
  apellidos?: string;
  cargo?: string;
  celular?: string;
  contrasenia?: string; // No se incluye en las respuestas
  email: string;
  empresa: string;
  nombre: string;
  rol: string;
}

export interface CreateUserBackendDto {
  usuario: string;
  apellidos?: string;
  cargo?: string;
  celular?: string;
  contrasenia: string;
  email: string;
  empresa: string;
  nombre: string;
  rol: string;
}

export interface UpdateUserBackendDto {
  usuario?: string;
  apellidos?: string;
  cargo?: string;
  celular?: string;
  contrasenia?: string;
  email?: string;
  empresa?: string;
  nombre?: string;
  rol?: string;
}

// ===== INTERFACES PARA EL FRONTEND =====
export interface User extends Record<string, unknown> {
  id: string; // Convertir number a string
  usuario: string;
  nombre: string;
  apellidos?: string;
  email: string;
  telefono?: string; // Mapear celular -> telefono
  cargo?: string;
  empresa: string;
  rol: "admin" | "supervisor" | "usuario"; // Mapear roles
  fecha_creacion: Date; // Valor calculado
  activo: boolean; // Valor calculado
}

export interface CreateUserDto {
  usuario: string;
  nombre: string;
  apellidos?: string;
  email: string;
  telefono?: string;
  cargo?: string;
  empresa: string;
  rol: "admin" | "supervisor" | "usuario";
  contrasenia: string;
}

export interface UpdateUserDto {
  usuario?: string;
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  empresa?: string;
  rol?: "admin" | "supervisor" | "usuario";
  contrasenia?: string;
}

// ===== TIPOS PARA FILTROS =====
export interface UserFilters {
  search?: string;
  rol?: User["rol"];
  activo?: boolean;
  empresa?: string;
}

// ===== TIPOS PARA FORMULARIOS =====
export interface UserFormData {
  usuario: string;
  nombre: string;
  apellidos?: string;
  email: string;
  telefono?: string;
  cargo?: string;
  empresa: string;
  rol: "admin" | "supervisor" | "usuario";
  contrasenia?: string;
  confirmarContrasenia?: string;
}

// ===== ENUMS =====
export type UserRole = "admin" | "supervisor" | "usuario";

export type UserStatus = "activo" | "inactivo";

// ===== TIPOS PARA VALIDACIÓN =====
export interface UserValidationErrors {
  usuario?: string;
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  empresa?: string;
  rol?: string;
  contrasenia?: string;
  confirmarContrasenia?: string;
  general?: string;
}
