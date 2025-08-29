// Enums que coinciden con tu backend
export enum EstadoAccidente {
  REPORTADO = "REPORTADO",
  EN_INVESTIGACION = "EN_INVESTIGACION",
  RESUELTO = "RESUELTO",
}

export enum SeveridadAccidente {
  LEVE = "LEVE",
  MODERADO = "MODERADO",
  GRAVE = "GRAVE",
  CRITICO = "CRITICO",
}

// ===== INTERFACES PARA EL BACKEND =====
export interface BackendAccident {
  id: number;
  linea_vida_id: number | null;
  linea_vida_codigo: string | null;
  linea_vida_cliente: string | null;
  linea_vida_ubicacion: string | null;
  fecha_accidente: string;
  descripcion: string;
  estado: string;
  severidad: string;
  lesiones: string | null;
  testigos: string | null;
  medidas_correctivas: string | null;
  fecha_investigacion: string | null;
  investigador: string | null;
  conclusiones: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendAccidentStatistics {
  total: number;
  por_estado: Array<{ estado: string; count: number }>;
  por_severidad: Array<{ severidad: string; count: number }>;
  por_mes: Array<{ mes: string; count: number }>;
  tendencia: Array<{ fecha: string; count: number }>;
}

export interface BackendPaginatedAccidents {
  data: BackendAccident[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== INTERFACES PARA EL FRONTEND =====
// Interfaz principal del accidente
export interface Accident {
  id: string;
  linea_vida_id: string | null;
  linea_vida_codigo: string | null;
  linea_vida_cliente: string | null;
  linea_vida_ubicacion: string | null;
  fecha_accidente: string;
  descripcion: string;
  estado: EstadoAccidente;
  severidad: SeveridadAccidente;
  lesiones: string | null;
  testigos: string | null;
  medidas_correctivas: string | null;
  fecha_investigacion: string | null;
  investigador: string | null;
  conclusiones: string | null;
  created_at: string;
  updated_at: string;
}

// DTO para crear accidente
export interface CreateAccidentDto {
  linea_vida_id: string;
  fecha_accidente: string;
  descripcion: string;
  estado: EstadoAccidente;
  severidad: SeveridadAccidente;
  lesiones?: string;
  testigos?: string;
  medidas_correctivas?: string;
  fecha_investigacion?: string;
  investigador?: string;
  conclusiones?: string;
}

// DTO para actualizar accidente
export interface UpdateAccidentDto extends Partial<CreateAccidentDto> {
  id: string;
}

// Filtros para búsqueda
export interface AccidentFilters {
  page?: number;
  limit?: number;
  linea_vida_id?: string;
  estado?: EstadoAccidente;
  severidad?: SeveridadAccidente;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// Respuesta paginada
export interface AccidentsPaginatedResponse {
  data: Accident[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Estadísticas
export interface AccidentStatistics {
  total: number;
  por_estado: Array<{ estado: EstadoAccidente; count: number }>;
  por_severidad: Array<{ severidad: SeveridadAccidente; count: number }>;
  por_mes: Array<{ mes: string; count: number }>;
  tendencia: Array<{ fecha: string; count: number }>;
}

// ===== TIPOS PARA COMPONENTES =====
export interface AccidentListProps {
  onAccidentSelect?: (accident: Accident) => void;
  showFilters?: boolean;
  showStats?: boolean;
}

export interface AccidentFormProps {
  initialData?: Partial<CreateAccidentDto>;
  onSuccess?: (accident: Accident) => void;
  onCancel?: () => void;
}

export interface AccidentDetailProps {
  accidentId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface AccidentFiltersProps {
  filters: AccidentFilters;
  onUpdateFilters: (filters: Partial<AccidentFilters>) => void;
  onClearFilters: () => void;
  lineasVida?: Array<{ id: string; codigo: string; cliente: string; ubicacion: string }>;
  loading?: boolean;
}

export interface AccidentStatsProps {
  statistics: AccidentStatistics;
  loading?: boolean;
}

// ===== TIPOS PARA VALIDACIÓN =====
export interface AccidentValidationErrors {
  descripcion?: string;
  fecha_accidente?: string;
  estado?: string;
  severidad?: string;
  fecha_investigacion?: string;
  general?: string;
}
