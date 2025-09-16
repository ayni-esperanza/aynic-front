import { apiClient, ApiClientError } from '../../../shared/services/apiClient';
import type { DataRecord } from '../types';

export interface RecordFilters {
  codigo?: string;
  codigo_placa?: string;
  cliente?: string;
  equipo?: string;
  ubicacion?: string;
  anclaje_equipos?: string;
  estado_actual?: string;
  tipo_linea?: string;
  seccion?: string;
  area?: string;
  planta?: string;
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
  fecha_mantenimiento?: string;
  longitud?: number;
  observaciones?: string;
  seccion?: string;
  area?: string;
  planta?: string;
  tipo_linea?: string;
  ubicacion?: string;
  anclaje_equipos?: string;
  anclaje_tipo?: string;
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
  fecha_mantenimiento?: string;
  longitud?: number;
  observaciones?: string;
  seccion?: string;
  area?: string;
  planta?: string;
  tipo_linea?: string;
  ubicacion?: string;
  anclaje_equipos?: string;
  anclaje_tipo?: string;
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
   * Mapear estado del backend al frontend
   */
  private mapBackendStatusToFrontend(
    backendStatus: string | null | undefined
  ): DataRecord["estado_actual"] {
    // Si no hay estado registrado, retornar undefined
    if (!backendStatus) {
      return undefined;
    }

    const statusMap: Record<string, DataRecord["estado_actual"]> = {
      ACTIVO: "activo",
      POR_VENCER: "por_vencer",
      VENCIDO: "vencido",
      INACTIVO: "inactivo",
      MANTENIMIENTO: "mantenimiento",
    };
    return statusMap[backendStatus] || undefined;
  }

  /**
   * Mapear estado del frontend al backend
   */
  private mapFrontendStatusToBackend(
    frontendStatus: DataRecord["estado_actual"]
  ): string {
    // Si no hay estado, no enviar nada al backend
    if (!frontendStatus) {
      return "";
    }

    const statusMap: Record<string, string> = {
      activo: "ACTIVO",
      por_vencer: "POR_VENCER",
      vencido: "VENCIDO",
      inactivo: "INACTIVO",
      mantenimiento: "MANTENIMIENTO",
    };
    return statusMap[frontendStatus] || "";
  }

  /**
   * Mapear estadísticas del backend al frontend
   */
  private mapBackendStatisticsToFrontend(
    backendStats: BackendStatistics
  ): FrontendStatistics {
    return {
      total: backendStats.total || 0,
      activos: backendStats.activos || 0,
      por_vencer: backendStats.por_vencer || 0,
      vencidos: backendStats.vencidos || 0,
      inactivos: backendStats.inactivos || 0,
      mantenimiento: backendStats.mantenimiento || 0,
    };
  }

  /**
   * Mapear registro del backend al formato del frontend
   */
  private mapBackendToFrontend(backendRecord: BackendRecord): DataRecord {
    return {
      id: backendRecord.id.toString(),
      codigo: backendRecord.codigo,
      codigo_placa: backendRecord.codigo_placa,
      cliente: backendRecord.cliente || "",
      equipo: backendRecord.equipo || "",
      fv_anios: backendRecord.fv_anios || 0,
      fv_meses: backendRecord.fv_meses || 0,
      fecha_instalacion: backendRecord.fecha_instalacion
        ? new Date(backendRecord.fecha_instalacion)
        : undefined,
      fecha_mantenimiento: backendRecord.fecha_mantenimiento
        ? new Date(backendRecord.fecha_mantenimiento)
        : undefined,
      longitud: backendRecord.longitud || 0,
      observaciones: backendRecord.observaciones,
      seccion: backendRecord.seccion || "",
      area: backendRecord.area || "",
      planta: backendRecord.planta || "",
      tipo_linea: backendRecord.tipo_linea || "",
      ubicacion: backendRecord.ubicacion || "",
      anclaje_equipos: backendRecord.anclaje_equipos || undefined,
      anclaje_tipo: backendRecord.anclaje_tipo || undefined,
      fecha_caducidad: backendRecord.fecha_caducidad
        ? new Date(backendRecord.fecha_caducidad)
        : undefined,
      estado_actual: this.mapBackendStatusToFrontend(
        backendRecord.estado_actual
      ),
    };
  }

  /**
   * Mapear datos del frontend al formato del backend
   */
  private mapFrontendToBackend(frontendData: any): CreateRecordData {
    return {
      codigo: frontendData.codigo,
      codigo_placa: frontendData.codigo_placa || undefined,
      cliente: frontendData.cliente || undefined,
      equipo: frontendData.equipo || undefined,
      fv_anios: frontendData.fv_anios || undefined,
      fv_meses: frontendData.fv_meses || undefined,
      fecha_instalacion: frontendData.fecha_instalacion || undefined,
      fecha_mantenimiento: frontendData.fecha_mantenimiento || undefined,
      longitud: frontendData.longitud || undefined,
      observaciones: frontendData.observaciones || undefined,
      seccion: frontendData.seccion || undefined,
      area: frontendData.area || undefined,
      planta: frontendData.planta || undefined,
      tipo_linea: frontendData.tipo_linea || undefined,
      ubicacion: frontendData.ubicacion || undefined,
      anclaje_equipos: frontendData.anclaje_equipos || undefined,
      anclaje_tipo: frontendData.anclaje_tipo || undefined,
      fecha_caducidad: frontendData.fecha_caducidad
        ? new Date(frontendData.fecha_caducidad).toISOString().split("T")[0]
        : undefined,
      estado_actual: frontendData.estado_actual ? this.mapFrontendStatusToBackend(
        frontendData.estado_actual
      ) : undefined,
    };
  }

  /**
   * Obtener registros con filtros y paginación
   */
  async getRecords(filters?: RecordFilters): Promise<{
    data: DataRecord[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    try {
      const params = new URLSearchParams();

      if (filters?.codigo) params.append("codigo", filters.codigo);
      if (filters?.codigo_placa)
        params.append("codigo_placa", filters.codigo_placa);
      if (filters?.cliente) params.append("cliente", filters.cliente);
      if (filters?.equipo) params.append("equipo", filters.equipo);
      if (filters?.anclaje_equipos)
        params.append("anclaje_equipos", filters.anclaje_equipos);
      if (filters?.seccion) params.append("seccion", filters.seccion);
      if (filters?.area) params.append("area", filters.area);
      if (filters?.planta) params.append("planta", filters.planta);
      if (filters?.estado_actual) {
        // Mapear estado del frontend al backend
        const backendStatus = this.mapFrontendStatusToBackend(
          filters.estado_actual as DataRecord["estado_actual"]
        );
        params.append("estado_actual", backendStatus);
      }
      if (filters?.tipo_linea) params.append("tipo_linea", filters.tipo_linea);
      if (filters?.ubicacion) params.append("ubicacion", filters.ubicacion);
      if (filters?.fecha_instalacion_desde)
        params.append(
          "fecha_instalacion_desde",
          filters.fecha_instalacion_desde
        );
      if (filters?.fecha_instalacion_hasta)
        params.append(
          "fecha_instalacion_hasta",
          filters.fecha_instalacion_hasta
        );
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

      const queryString = params.toString();
      const url = `${this.basePath}${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get<BackendPaginatedRecords>(url);

      // Mapear respuesta del backend al formato del frontend
      const mappedData = response.data.map((record) =>
        this.mapBackendToFrontend(record)
      );

      return {
        data: mappedData,
        pagination: {
          currentPage: response.meta.page,
          totalPages: response.meta.totalPages,
          totalItems: response.meta.total,
          itemsPerPage: response.meta.limit,
        },
      };
    } catch (error) {
      console.error("Error fetching records:", error);
      throw error;
    }
  }

  /**
   * Obtener registro por ID
   */
  async getRecordById(id: string): Promise<DataRecord> {
    try {
      const response = await apiClient.get<BackendRecord>(
        `${this.basePath}/${id}`
      );
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
  async createRecord(recordData: Omit<DataRecord, "id">): Promise<DataRecord> {
    try {
      const backendData = this.mapFrontendToBackend(recordData);
      const response = await apiClient.post<BackendRecord>(
        this.basePath,
        backendData
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        throw new Error("El código ya existe");
      }
      throw error;
    }
  }

  /**
   * Actualizar registro
   */
  async updateRecord(
    id: string,
    recordData: any
  ): Promise<DataRecord> {
    try {
      // Solo enviar campos que realmente se están actualizando
      const backendData: Partial<CreateRecordData> = {} as any;

      if (recordData.codigo !== undefined)
        backendData.codigo = recordData.codigo;
      if (recordData.codigo_placa !== undefined)
        backendData.codigo_placa = recordData.codigo_placa;
      if (recordData.cliente !== undefined)
        backendData.cliente = recordData.cliente;
      if (recordData.equipo !== undefined)
        backendData.equipo = recordData.equipo;
      if (recordData.anclaje_equipos !== undefined)
        backendData.anclaje_equipos = recordData.anclaje_equipos;
      if (recordData.fv_anios !== undefined)
        backendData.fv_anios = recordData.fv_anios;
      if (recordData.fv_meses !== undefined)
        backendData.fv_meses = recordData.fv_meses;
      if (recordData.fecha_instalacion !== undefined) {
        backendData.fecha_instalacion = recordData.fecha_instalacion as any;
      }
      if (recordData.fecha_mantenimiento !== undefined) {
        backendData.fecha_mantenimiento = recordData.fecha_mantenimiento as any;
      }
      if (recordData.longitud !== undefined)
        backendData.longitud = recordData.longitud;
      if (recordData.observaciones !== undefined)
        backendData.observaciones = recordData.observaciones;
      if (recordData.seccion !== undefined) backendData.seccion = recordData.seccion;
      if (recordData.area !== undefined) backendData.area = recordData.area;
      if (recordData.planta !== undefined) backendData.planta = recordData.planta;
      if (recordData.tipo_linea !== undefined)
        backendData.tipo_linea = recordData.tipo_linea;
      if (recordData.ubicacion !== undefined)
        backendData.ubicacion = recordData.ubicacion;
      if (recordData.fecha_caducidad !== undefined) {
        backendData.fecha_caducidad = recordData.fecha_caducidad as any;
      }
      if (recordData.estado_actual !== undefined) {
        backendData.estado_actual = this.mapFrontendStatusToBackend(
          recordData.estado_actual
        );
      }

      const response = await apiClient.patch<BackendRecord>(
        `${this.basePath}/${id}`,
        backendData
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Registro no encontrado");
      }
      if (error instanceof ApiClientError && error.status === 409) {
        throw new Error("El código ya existe");
      }
      throw error;
    }
  }

  /**
   * Eliminar registro
   */
  async deleteRecord(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/${id}`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Registro no encontrado");
      }
      throw error;
    }
  }

  /**
   * Obtener estadísticas de registros
   * Mapea directamente la respuesta del backend al formato del frontend
   */
  async getStatistics(): Promise<FrontendStatistics> {
    try {
      const response = await apiClient.get<BackendStatistics>(
        `${this.basePath}/statistics`
      );

      // Mapear directamente la respuesta del backend
      return this.mapBackendStatisticsToFrontend(response);
    } catch (error) {
      console.error("Error fetching statistics:", error);

      // En caso de error, retornar valores por defecto
      return {
        total: 0,
        activos: 0,
        vencidos: 0,
        por_vencer: 0,
        inactivos: 0,
        mantenimiento: 0,
      };
    }
  }
}

// Exportar instancia singleton
export const registroService = new RegistroService();
