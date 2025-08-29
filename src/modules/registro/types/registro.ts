// Tipos específicos del módulo registro

// ===== INTERFACES PARA EL BACKEND =====
export interface BackendRecord {
  id: number;
  codigo: string;
  codigo_placa?: string;
  cliente?: string;
  equipo?: string;
  fv_anios?: number;
  fv_meses?: number;
  fecha_instalacion?: string;
  longitud?: number;
  observaciones?: string;
  seec?: string;
  tipo_linea?: string;
  ubicacion?: string;
  anclaje_equipos?: string;
  fecha_caducidad?: string;
  estado_actual?: string;
}

export interface BackendPaginatedRecords {
  data: BackendRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface BackendStatistics {
  total: number;
  activos: number;
  vencidos: number;
  por_vencer: number;
  inactivos: number;
  mantenimiento: number;
  statusBreakdown?: any;
  lastUpdate?: string;
}

// ===== INTERFACES PARA EL FRONTEND =====
export interface DataRecord {
  id: string;
  codigo: string;
  codigo_placa?: string;
  cliente?: string;
  equipo?: string;
  fv_anios?: number;
  fv_meses?: number;
  fecha_instalacion?: string;
  longitud?: number;
  observaciones?: string;
  seec?: string;
  tipo_linea?: string;
  ubicacion?: string;
  anclaje_equipos?: string;
  fecha_caducidad?: string;
  estado_actual?: string;
}

export interface RecordFilters {
  codigo?: string;
  codigo_placa?: string;
  cliente?: string;
  equipo?: string;
  estado_actual?: string;
  tipo_linea?: string;
  ubicacion?: string;
  anclaje_equipos?: string;
  seec?: string;
  fecha_instalacion_desde?: string;
  fecha_instalacion_hasta?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface CreateRecordData {
  codigo: string;
  codigo_placa?: string;
  cliente?: string;
  equipo?: string;
  fv_anios?: number;
  fv_meses?: number;
  fecha_instalacion?: string;
  longitud?: number;
  observaciones?: string;
  seec?: string;
  tipo_linea?: string;
  ubicacion?: string;
  anclaje_equipos?: string;
  fecha_caducidad?: string;
  estado_actual?: string;
}

export interface UpdateRecordData extends Partial<CreateRecordData> {
  id: string;
}

export interface RecordStatistics {
  total: number;
  activos: number;
  por_vencer: number;
  vencidos: number;
  inactivos: number;
  mantenimiento: number;
}

export interface PaginatedRecords {
  data: DataRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ===== TIPOS PARA COMPONENTES =====
export interface RegistroListProps {
  onRecordSelect?: (record: DataRecord) => void;
  showFilters?: boolean;
  showStats?: boolean;
}

export interface RegistroFormProps {
  initialData?: Partial<CreateRecordData>;
  onSuccess?: (record: DataRecord) => void;
  onCancel?: () => void;
}

export interface RegistroDetailProps {
  recordId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface RegistroFiltersProps {
  filters: RecordFilters;
  onUpdateFilters: (filters: Partial<RecordFilters>) => void;
  onClearFilters: () => void;
  filterOptions?: {
    equipos: string[];
    ubicaciones: string[];
    clientes: string[];
    areas: string[];
    estados: string[];
  };
  loading?: boolean;
}

export interface RegistroStatsProps {
  statistics: RecordStatistics;
  loading?: boolean;
}

// ===== TIPOS PARA VALIDACIÓN =====
export interface RecordValidationErrors {
  codigo?: string;
  longitud?: string;
  fv_anios?: string;
  fv_meses?: string;
  fecha_instalacion?: string;
  fecha_caducidad?: string;
  general?: string;
}

// ===== ENUMS =====
export type RecordStatus = "activo" | "inactivo" | "vencido" | "por_vencer" | "mantenimiento";

export type RecordType = "linea_vida" | "equipo_proteccion" | "anclaje" | "otro";

// ===== TIPOS PARA RELACIONES =====
export interface RecordRelationship {
  id: string;
  record_id: string;
  related_record_id: string;
  relationship_type: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRelationshipData {
  record_id: string;
  related_record_id: string;
  relationship_type: string;
}

// ===== TIPOS PARA REPORTES =====
export interface RecordReport {
  id: string;
  name: string;
  description: string;
  filters: RecordFilters;
  created_at: string;
  updated_at: string;
}

export interface CreateReportData {
  name: string;
  description: string;
  filters: RecordFilters;
}
