// Tipos específicos del módulo solicitudes

// ===== INTERFACES PARA EL BACKEND =====
export interface BackendPendingRequest {
  id: number;
  record_id: number;
  record_code: string;
  requested_by: {
    id: number;
    username: string;
    name: string;
  };
  justification: string;
  created_at: string;
  status: string;
}

export interface BackendGeneratedCode {
  code: string;
  expires_in_minutes: number;
}

export interface CreateAuthorizationCodeRequest {
  request_id: number;
}

// ===== INTERFACES PARA EL FRONTEND =====
export interface PendingRequest {
  id: string; // Convertir number a string
  recordId: string; // Convertir number a string
  recordCode: string;
  requestedBy: {
    id: string; // Convertir number a string
    username: string;
    name: string;
  };
  justification: string;
  createdAt: Date; // Convertir string a Date
  status: SolicitudStatus;
}

export interface GeneratedCode {
  code: string;
  expiresInMinutes: number;
}

// ===== TIPOS PARA FILTROS =====
export interface SolicitudFilters {
  search?: string;
  status?: SolicitudStatus;
  recordCode?: string;
  requestedBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// ===== TIPOS PARA FORMULARIOS =====
export interface SolicitudFormData {
  recordCode: string;
  justification: string;
}

// ===== ENUMS =====
export type SolicitudStatus = "pending" | "approved" | "rejected" | "expired";

export type SolicitudPriority = "low" | "medium" | "high" | "urgent";

// ===== TIPOS PARA VALIDACIÓN =====
export interface SolicitudValidationErrors {
  recordCode?: string;
  justification?: string;
  general?: string;
}

// ===== TIPOS PARA ESTADÍSTICAS =====
export interface SolicitudStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  averageResponseTime: number; // en minutos
}
