import {
  apiClient,
  ApiResponse,
  PaginatedResponse,
  ApiClientError,
} from "./apiClient";
import type { DataRecord } from "../types";

export interface RecordFilters {
  codigo?: string;
  cliente?: string;
  equipo?: string;
  estado_actual?: string;
  tipo_linea?: string;
  ubicacion?: string;
  seec?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface CreateRecordData {
  codigo: string;
  cliente?: string;
  equipo?: string;
  fv_anios?: number;
  fv_meses?: number;
  fecha_instalacion?: string; // ISO string
  longitud?: number;
  observaciones?: string;
  seec?: string;
  tipo_linea?: string;
  ubicacion?: string;
  fecha_vencimiento?: string; // ISO string
  estado_actual?: string;
}

export interface BackendRecord {
  id: number;
  codigo: string;
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
  fecha_vencimiento?: string;
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

class RecordsService {
  private readonly basePath = "/records";

  /**
   * Mapear registro del backend al formato del frontend
   */
  private mapBackendToFrontend(backendRecord: BackendRecord): DataRecord {
    return {
      id: backendRecord.id.toString(), // number -> string
      codigo: backendRecord.codigo,
      cliente: backendRecord.cliente || "",
      equipo: backendRecord.equipo || "",
      fv_anios: backendRecord.fv_anios || 0,
      fv_meses: backendRecord.fv_meses || 0,
      fecha_instalacion: backendRecord.fecha_instalacion
        ? new Date(backendRecord.fecha_instalacion)
        : new Date(),
      longitud: backendRecord.longitud || 0,
      observaciones: backendRecord.observaciones,
      seec: backendRecord.seec || "",
      tipo_linea: backendRecord.tipo_linea || "",
      ubicacion: backendRecord.ubicacion || "",
      fecha_vencimiento: backendRecord.fecha_vencimiento
        ? new Date(backendRecord.fecha_vencimiento)
        : new Date(),
      estado_actual:
        (backendRecord.estado_actual as DataRecord["estado_actual"]) ||
        "activo",
    };
  }

  /**
   * Mapear datos del frontend al formato del backend
   */
  private mapFrontendToBackend(
    frontendData: Omit<DataRecord, "id">
  ): CreateRecordData {
    return {
      codigo: frontendData.codigo,
      cliente: frontendData.cliente || undefined,
      equipo: frontendData.equipo || undefined,
      fv_anios: frontendData.fv_anios || undefined,
      fv_meses: frontendData.fv_meses || undefined,
      fecha_instalacion: frontendData.fecha_instalacion
        ? new Date(frontendData.fecha_instalacion).toISOString().split("T")[0]
        : undefined,
      longitud: frontendData.longitud || undefined,
      observaciones: frontendData.observaciones || undefined,
      seec: frontendData.seec || undefined,
      tipo_linea: frontendData.tipo_linea || undefined,
      ubicacion: frontendData.ubicacion || undefined,
      fecha_vencimiento: frontendData.fecha_vencimiento
        ? new Date(frontendData.fecha_vencimiento).toISOString().split("T")[0]
        : undefined,
      estado_actual: this.mapFrontendStatusToBackend(
        frontendData.estado_actual
      ),
    };
  }

  /**
   * Mapear estados del frontend al backend
   */
  private mapFrontendStatusToBackend(
    frontendStatus: DataRecord["estado_actual"]
  ): string {
    const statusMap: Record<DataRecord["estado_actual"], string> = {
      activo: "ACTIVO",
      inactivo: "INACTIVO",
      mantenimiento: "MANTENIMIENTO",
      vencido: "VENCIDO",
    };
    return statusMap[frontendStatus] || "ACTIVO";
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
      if (filters?.cliente) params.append("cliente", filters.cliente);
      if (filters?.equipo) params.append("equipo", filters.equipo);
      if (filters?.estado_actual) {
        // Mapear estado del frontend al backend
        const backendStatus = this.mapFrontendStatusToBackend(
          filters.estado_actual as DataRecord["estado_actual"]
        );
        params.append("estado_actual", backendStatus);
      }
      if (filters?.tipo_linea) params.append("tipo_linea", filters.tipo_linea);
      if (filters?.ubicacion) params.append("ubicacion", filters.ubicacion);
      if (filters?.seec) params.append("seec", filters.seec);
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
    recordData: Partial<Omit<DataRecord, "id">>
  ): Promise<DataRecord> {
    try {
      // Solo enviar campos que realmente se están actualizando
      const backendData: Partial<CreateRecordData> = {};

      if (recordData.codigo !== undefined)
        backendData.codigo = recordData.codigo;
      if (recordData.cliente !== undefined)
        backendData.cliente = recordData.cliente;
      if (recordData.equipo !== undefined)
        backendData.equipo = recordData.equipo;
      if (recordData.fv_anios !== undefined)
        backendData.fv_anios = recordData.fv_anios;
      if (recordData.fv_meses !== undefined)
        backendData.fv_meses = recordData.fv_meses;
      if (recordData.fecha_instalacion !== undefined) {
        backendData.fecha_instalacion = new Date(recordData.fecha_instalacion)
          .toISOString()
          .split("T")[0];
      }
      if (recordData.longitud !== undefined)
        backendData.longitud = recordData.longitud;
      if (recordData.observaciones !== undefined)
        backendData.observaciones = recordData.observaciones;
      if (recordData.seec !== undefined) backendData.seec = recordData.seec;
      if (recordData.tipo_linea !== undefined)
        backendData.tipo_linea = recordData.tipo_linea;
      if (recordData.ubicacion !== undefined)
        backendData.ubicacion = recordData.ubicacion;
      if (recordData.fecha_vencimiento !== undefined) {
        backendData.fecha_vencimiento = new Date(recordData.fecha_vencimiento)
          .toISOString()
          .split("T")[0];
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
   * Obtener estadísticas
   */
  async getStatistics(): Promise<{
    total: number;
    activos: number;
    vencidos: number;
    por_vencer: number;
    inactivos: number;
  }> {
    try {
      return await apiClient.get<{
        total: number;
        activos: number;
        vencidos: number;
        por_vencer: number;
        inactivos: number;
      }>(`${this.basePath}/statistics`);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      // Retornar valores por defecto en caso de error
      return {
        total: 0,
        activos: 0,
        vencidos: 0,
        por_vencer: 0,
        inactivos: 0,
      };
    }
  }
}

// Exportar instancia singleton
export const recordsService = new RecordsService();