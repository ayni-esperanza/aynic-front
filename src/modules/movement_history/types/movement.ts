// Tipos específicos del módulo movement history

// ===== INTERFACES PARA EL BACKEND =====
export interface BackendMovementHistory {
  id: number;
  record_id: number | null;
  record_code: string | null;
  action: string;
  description: string;
  action_date: string;
  user_id: number | null;
  username: string | null;
  previous_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  changed_fields: string[] | null;
  is_record_active: boolean;
  additional_metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  formatted_date: string;
  action_label: string;
  user_display_name: string;
}

export interface BackendMovementStatistics {
  total: number;
  today: number;
  thisWeek: number;
  byAction: Array<{ action: string; count: number }>;
  byUser: Array<{ username: string; count: number }>;
}

export interface BackendPaginatedMovements {
  data: BackendMovementHistory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface BackendActionOption {
  value: string;
  label: string;
}

// ===== INTERFACES PARA EL FRONTEND =====
export interface MovementHistory {
  id: string;
  record_id: string | null;
  record_code: string | null;
  action: MovementAction;
  description: string;
  action_date: Date;
  user_id: string | null;
  username: string | null;
  previous_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  changed_fields: string[] | null;
  is_record_active: boolean;
  additional_metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  formatted_date: string;
  action_label: string;
  user_display_name: string;
}

export type MovementAction =
  | "create"
  | "update"
  | "delete"
  | "restore"
  | "status_change"
  | "image_upload"
  | "image_replace"
  | "image_delete"
  | "location_change"
  | "company_change"
  | "maintenance";

export interface MovementStatistics {
  total: number;
  today: number;
  thisWeek: number;
  activeUsers: number;
  byAction: Array<{ action: MovementAction; label: string; count: number }>;
  byUser: Array<{ username: string; count: number }>;
}

export interface MovementFilters extends Record<string, unknown> {
  record_id?: string;
  action?: MovementAction;
  username?: string;
  record_code?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
}

export interface ActionOption {
  value: MovementAction;
  label: string;
}

export interface PaginatedMovements {
  data: MovementHistory[];
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
export interface MovementHistoryItemProps {
  movement: MovementHistory;
}

export interface MovementFiltersProps {
  filters: MovementFilters;
  onUpdateFilters: (filters: Partial<MovementFilters>) => void;
  onClearFilters: () => void;
  actionOptions: ActionOption[];
  usernameOptions: Array<{ value: string; label: string }>;
  loading?: boolean;
}

export interface MovementStatsProps {
  statistics: MovementStatistics;
  loading?: boolean;
}

// ===== TIPOS PARA VALIDACIÓN =====
export interface MovementValidationErrors {
  date_from?: string;
  date_to?: string;
  page?: string;
  limit?: string;
  general?: string;
}
