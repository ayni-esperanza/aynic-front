export interface User extends Record<string, unknown> {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: "admin" | "usuario" | "supervisor";
  fecha_creacion: Date;
  activo: boolean;
}

export interface DataRecord extends Record<string, unknown> {
  id: string;
  codigo: string;
  codigo_placa?: string;
  cliente: string;
  equipo: string;
  fv_anios: number;
  fv_meses: number;
  fecha_instalacion: Date;
  longitud: number;
  observaciones?: string;
  seccion: string;
  area: string;
  planta: string;
  tipo_linea: string;
  ubicacion: string;
  anclaje_equipos?: string;
  fecha_caducidad: Date;
  estado_actual:
    | "activo"
    | "por_vencer"
    | "vencido"
    | "inactivo"
    | "mantenimiento";
}

// UI Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, record: T) => React.ReactNode;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface UserFormData {
  nombre: string;
  email: string;
  telefono?: string;
  rol: User["rol"];
}

export * from "./auth";
