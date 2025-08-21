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

// Interfaz principal del accidente
export interface Accident {
  id: number;
  linea_vida_id: number;
  fecha_accidente: Date;
  descripcion_incidente: string;
  persona_involucrada: string | null;
  acciones_correctivas: string | null;
  evidencias_urls: string[] | null;
  fecha_creacion: Date;
  reportado_por: number | null;
  estado: EstadoAccidente;
  severidad: SeveridadAccidente;
  lineaVida?: {
    id: number;
    codigo: string;
    cliente: string;
    ubicacion: string;
  };
  usuario?: {
    id: number;
    nombre: string;
    apellidos: string;
  };
}

// DTO para crear accidente
export interface CreateAccidentDto {
  linea_vida_id: number;
  fecha_accidente: string;
  descripcion_incidente: string;
  persona_involucrada?: string;
  acciones_correctivas?: string;
  evidencias_urls?: string[];
  severidad?: SeveridadAccidente;
}

// DTO para actualizar accidente
export interface UpdateAccidentDto extends Partial<CreateAccidentDto> {
  estado?: EstadoAccidente;
}

// Filtros para búsqueda
export interface AccidentFilters {
  page?: number;
  limit?: number;
  linea_vida_id?: number;
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
  porEstado: Array<{ estado: EstadoAccidente; count: number }>;
  porSeveridad: Array<{ severidad: SeveridadAccidente; count: number }>;
  ultimoMes: number;
  lineasConIncidentes: number;
}
