export interface Maintenance extends Record<string, unknown> {
  id: number;
  record_id: number;
  maintenance_date: string;
  description?: string;
  previous_length_meters?: number;
  new_length_meters?: number;
  image_filename?: string;
  image_url?: string;
  image_size?: number;
  created_at: string;
  created_by?: number;
  record?: { id: number; codigo: string; cliente: string; ubicacion: string };
  user?: { id: number; nombre: string; apellidos: string };
}

export interface CreateMaintenanceDto {
  record_id: number;
  maintenance_date: string;
  description?: string;
  new_length_meters?: number;
}

export interface MaintenanceFilters extends Record<string, unknown> {
  record_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  has_length_change?: boolean;
  page?: number;
  limit?: number;
}

export interface MaintenanceStats {
  total_maintenances: number;
  this_month: number;
  with_length_changes: number;
  records_maintained: number;
  average_per_record: number;
}
