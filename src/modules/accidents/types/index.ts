// Exportaciones de tipos del módulo accidents
export type {
  // Tipos principales
  Accident,
  AccidentStatistics,
  AccidentsPaginatedResponse,
  
  // Tipos del backend
  BackendAccident,
  BackendAccidentStatistics,
  BackendPaginatedAccidents,
  
  // Tipos para filtros y formularios
  AccidentFilters,
  CreateAccidentDto,
  UpdateAccidentDto,
  
  // Enums
  EstadoAccidente,
  SeveridadAccidente,
  
  // Tipos para componentes
  AccidentListProps,
  AccidentFormProps,
  AccidentDetailProps,
  AccidentFiltersProps,
  AccidentStatsProps,
  
  // Tipos para validación
  AccidentValidationErrors,
} from './accident';
