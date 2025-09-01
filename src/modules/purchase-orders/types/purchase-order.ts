export enum PurchaseOrderStatus {
  PENDING = 'pendiente',
  APPROVED = 'aprobada',
  REJECTED = 'rechazada',
  COMPLETED = 'completada',
  CANCELLED = 'cancelada'
}

export enum PurchaseOrderType {
  LINEA_VIDA = 'linea_vida',
  EQUIPOS = 'equipos',
  ACCESORIOS = 'accesorios',
  SERVICIOS = 'servicios'
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface PurchaseOrder {
  id: number;
  codigo: string;
  descripcion: string;
  tipo: PurchaseOrderType;
  estado: PurchaseOrderStatus;
  monto_total: number;
  proveedor?: string;
  observaciones?: string;
  fecha_requerida?: string;
  fecha_aprobacion?: string;
  solicitante: User;
  aprobador?: User;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreatePurchaseOrderData {
  codigo: string;
  descripcion: string;
  tipo: PurchaseOrderType;
  monto_total: number;
  proveedor?: string;
  observaciones?: string;
  fecha_requerida?: string;
}

export interface UpdatePurchaseOrderData {
  codigo?: string;
  descripcion?: string;
  tipo?: PurchaseOrderType;
  monto_total?: number;
  proveedor?: string;
  observaciones?: string;
  fecha_requerida?: string;
  estado?: PurchaseOrderStatus;
}

export interface PurchaseOrderFilters {
  estado?: PurchaseOrderStatus;
  tipo?: PurchaseOrderType;
  proveedor?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface PurchaseOrderStats {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  completadas: number;
  canceladas: number;
  monto_total: number;
}
