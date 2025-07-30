// Core Types
export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'admin' | 'usuario' | 'supervisor';
  fecha_creacion: Date;
  activo: boolean;
}

export interface DataRecord {
  id: string;
  codigo: string;
  cliente: string;
  equipo: string;
  fv_anios: number;
  fv_meses: number;
  fecha_instalacion: Date;
  longitud: number;
  observaciones?: string;
  seec: string;
  tipo_linea: string;
  ubicacion: string;
  fecha_vencimiento: Date;
  estado_actual: 'activo' | 'inactivo' | 'mantenimiento' | 'vencido';
}

// UI Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Form Types
export interface UserFormData {
  nombre: string;
  email: string;
  telefono?: string;
  rol: User['rol'];
}