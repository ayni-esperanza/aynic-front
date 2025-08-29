// Exportaciones de tipos del módulo registro
export type {
  // Tipos principales
  DataRecord,
  RecordStatistics,
  PaginatedRecords,
  
  // Tipos del backend
  BackendRecord,
  BackendPaginatedRecords,
  BackendStatistics,
  
  // Tipos para filtros y formularios
  RecordFilters,
  CreateRecordData,
  UpdateRecordData,
  
  // Enums
  RecordStatus,
  RecordType,
  
  // Tipos para componentes
  RegistroListProps,
  RegistroFormProps,
  RegistroDetailProps,
  RegistroFiltersProps,
  RegistroStatsProps,
  
  // Tipos para validación
  RecordValidationErrors,
  
  // Tipos para relaciones
  RecordRelationship,
  CreateRelationshipData,
  
  // Tipos para reportes
  RecordReport,
  CreateReportData,
} from './registro';
