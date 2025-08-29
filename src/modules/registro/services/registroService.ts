import {
  apiClient,
  ApiResponse,
  PaginatedResponse,
  ApiClientError,
} from "../../../services/apiClient";

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

// Interface para estadísticas del frontend
export interface FrontendStatistics {
  total: number;
  activos: number;
  por_vencer: number;
  vencidos: number;
  inactivos: number;
  mantenimiento: number;
}

class RegistroService {
  private readonly basePath = "/records";

  /**
   * Mapear registro del backend al formato del frontend
   */
  private mapBackendToFrontend(backendRecord: BackendRecord): any {
    return {
      id: backendRecord.id.toString(),
      codigo: backendRecord.codigo,
      codigo_placa: backendRecord.codigo_placa,
      cliente: backendRecord.cliente,
      equipo: backendRecord.equipo,
      fv_anios: backendRecord.fv_anios,
      fv_meses: backendRecord.fv_meses,
      fecha_instalacion: backendRecord.fecha_instalacion,
      longitud: backendRecord.longitud,
      observaciones: backendRecord.observaciones,
      seec: backendRecord.seec,
      tipo_linea: backendRecord.tipo_linea,
      ubicacion: backendRecord.ubicacion,
      anclaje_equipos: backendRecord.anclaje_equipos,
      fecha_caducidad: backendRecord.fecha_caducidad,
      estado_actual: backendRecord.estado_actual,
    };
  }

  /**
   * Mapear estadísticas del backend al formato del frontend
   */
  private mapBackendStatsToFrontend(backendStats: BackendStatistics): FrontendStatistics {
    return {
      total: backendStats.total,
      activos: backendStats.activos,
      por_vencer: backendStats.por_vencer,
      vencidos: backendStats.vencidos,
      inactivos: backendStats.inactivos,
      mantenimiento: backendStats.mantenimiento,
    };
  }

  /**
   * Obtener registros con paginación y filtros
   */
  async getRecords(filters: RecordFilters = {}): Promise<PaginatedResponse<any>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.codigo) {
        queryParams.append("codigo", filters.codigo);
      }
      if (filters.codigo_placa) {
        queryParams.append("codigo_placa", filters.codigo_placa);
      }
      if (filters.cliente) {
        queryParams.append("cliente", filters.cliente);
      }
      if (filters.equipo) {
        queryParams.append("equipo", filters.equipo);
      }
      if (filters.estado_actual) {
        queryParams.append("estado_actual", filters.estado_actual);
      }
      if (filters.tipo_linea) {
        queryParams.append("tipo_linea", filters.tipo_linea);
      }
      if (filters.ubicacion) {
        queryParams.append("ubicacion", filters.ubicacion);
      }
      if (filters.anclaje_equipos) {
        queryParams.append("anclaje_equipos", filters.anclaje_equipos);
      }
      if (filters.seec) {
        queryParams.append("seec", filters.seec);
      }
      if (filters.fecha_instalacion_desde) {
        queryParams.append("fecha_instalacion_desde", filters.fecha_instalacion_desde);
      }
      if (filters.fecha_instalacion_hasta) {
        queryParams.append("fecha_instalacion_hasta", filters.fecha_instalacion_hasta);
      }
      if (filters.page) {
        queryParams.append("page", filters.page.toString());
      }
      if (filters.limit) {
        queryParams.append("limit", filters.limit.toString());
      }
      if (filters.sortBy) {
        queryParams.append("sortBy", filters.sortBy);
      }
      if (filters.sortOrder) {
        queryParams.append("sortOrder", filters.sortOrder);
      }

      const url = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get<BackendPaginatedRecords>(url);
      
      return {
        data: response.data.map(record => this.mapBackendToFrontend(record)),
        meta: response.meta,
      };
    } catch (error) {
      console.error("Error fetching records:", error);
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para ver los registros");
      }
      throw error;
    }
  }

  /**
   * Obtener registro por ID
   */
  async getRecordById(id: string): Promise<any> {
    try {
      const response = await apiClient.get<BackendRecord>(`${this.basePath}/${id}`);
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Registro no encontrado");
      }
      throw error;
    }
  }

  /**
   * Crear nuevo registro
   */
  async createRecord(data: CreateRecordData): Promise<any> {
    try {
      const response = await apiClient.post<BackendRecord>(this.basePath, data);
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 400) {
        throw new Error("Datos de registro inválidos");
      }
      if (error instanceof ApiClientError && error.status === 409) {
        throw new Error("Ya existe un registro con ese código");
      }
      throw error;
    }
  }

  /**
   * Actualizar registro
   */
  async updateRecord(id: string, data: Partial<CreateRecordData>): Promise<any> {
    try {
      const response = await apiClient.put<BackendRecord>(`${this.basePath}/${id}`, data);
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Registro no encontrado");
      }
      if (error instanceof ApiClientError && error.status === 400) {
        throw new Error("Datos de registro inválidos");
      }
      throw error;
    }
  }

  /**
   * Eliminar registro
   */
  async deleteRecord(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Registro no encontrado");
      }
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para eliminar registros");
      }
      throw error;
    }
  }

  /**
   * Obtener estadísticas de registros
   */
  async getStatistics(): Promise<FrontendStatistics> {
    try {
      const response = await apiClient.get<BackendStatistics>(`${this.basePath}/statistics`);
      return this.mapBackendStatsToFrontend(response);
    } catch (error) {
      console.error("Error fetching record statistics:", error);
      throw error;
    }
  }

  /**
   * Buscar registros por término
   */
  async searchRecords(searchTerm: string): Promise<any[]> {
    try {
      const response = await apiClient.get<BackendRecord[]>(`${this.basePath}/search?q=${encodeURIComponent(searchTerm)}`);
      return response.map(record => this.mapBackendToFrontend(record));
    } catch (error) {
      console.error("Error searching records:", error);
      throw error;
    }
  }

  /**
   * Obtener opciones para filtros
   */
  async getFilterOptions(): Promise<{
    equipos: string[];
    ubicaciones: string[];
    clientes: string[];
    areas: string[];
    estados: string[];
  }> {
    try {
      const response = await apiClient.get(`${this.basePath}/filter-options`);
      return response;
    } catch (error) {
      console.error("Error fetching filter options:", error);
      throw error;
    }
  }

  /**
   * Exportar registros
   */
  async exportRecords(filters: RecordFilters = {}): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.codigo) {
        queryParams.append("codigo", filters.codigo);
      }
      if (filters.cliente) {
        queryParams.append("cliente", filters.cliente);
      }
      if (filters.equipo) {
        queryParams.append("equipo", filters.equipo);
      }
      if (filters.estado_actual) {
        queryParams.append("estado_actual", filters.estado_actual);
      }
      if (filters.fecha_instalacion_desde) {
        queryParams.append("fecha_instalacion_desde", filters.fecha_instalacion_desde);
      }
      if (filters.fecha_instalacion_hasta) {
        queryParams.append("fecha_instalacion_hasta", filters.fecha_instalacion_hasta);
      }

      const url = `${this.basePath}/export${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await apiClient.get(url, { responseType: 'blob' });
      return response;
    } catch (error) {
      console.error("Error exporting records:", error);
      throw error;
    }
  }

  /**
   * Validar datos de registro
   */
  validateRecordData(data: CreateRecordData): string[] {
    const errors: string[] = [];

    if (!data.codigo?.trim()) {
      errors.push("El código es requerido");
    }

    if (data.longitud && data.longitud <= 0) {
      errors.push("La longitud debe ser mayor a 0");
    }

    if (data.fv_anios && data.fv_anios <= 0) {
      errors.push("Los años de vida útil deben ser mayor a 0");
    }

    if (data.fv_meses && (data.fv_meses < 0 || data.fv_meses > 11)) {
      errors.push("Los meses de vida útil deben estar entre 0 y 11");
    }

    return errors;
  }
}

// Exportar instancia singleton
export const registroService = new RegistroService();
