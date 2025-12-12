import { apiClient, ApiClientError } from '../../../shared/services/apiClient';
import type {
  Accident,
  CreateAccidentDto,
  UpdateAccidentDto,
  AccidentFilters,
  AccidentsPaginatedResponse,
  AccidentStatistics,
  BackendAccident,
  BackendAccidentStatistics,
  BackendPaginatedAccidents,
} from "../types/accident";
import { EstadoAccidente, SeveridadAccidente } from "../types/accident";

class AccidentService {
  private readonly basePath = "/accidents";

  /**
   * Mapear accidente del backend al formato del frontend
   */
  private mapBackendToFrontend(backendAccident: BackendAccident): Accident {
    return {
      id: backendAccident.id.toString(),
      linea_vida_id: backendAccident.linea_vida_id?.toString() || null,
      linea_vida_codigo: backendAccident.lineaVida?.codigo || null,
      linea_vida_cliente: backendAccident.lineaVida?.cliente || null,
      linea_vida_ubicacion: backendAccident.lineaVida?.ubicacion || null,
      fecha_accidente: backendAccident.fecha_accidente,
      descripcion: backendAccident.descripcion_incidente,
      estado: this.mapBackendEstadoToFrontend(backendAccident.estado),
      severidad: this.mapBackendSeveridadToFrontend(backendAccident.severidad),
      lesiones: backendAccident.persona_involucrada,
      testigos: null,
      medidas_correctivas: backendAccident.acciones_correctivas,
      fecha_investigacion: null,
      investigador: null,
      conclusiones: null,
      created_at: backendAccident.fecha_creacion,
      updated_at: backendAccident.fecha_creacion,
      usuario: backendAccident.usuario,
    };
  }

  /**
   * Mapear estadísticas del backend al formato del frontend
   */
  private mapBackendStatsToFrontend(backendStats: BackendAccidentStatistics): AccidentStatistics {
    return {
      total: backendStats.total || 0,
      por_estado: (backendStats.por_estado || []).map(item => ({
        estado: this.mapBackendEstadoToFrontend(item.estado),
        count: item.count,
      })),
      por_severidad: (backendStats.por_severidad || []).map(item => ({
        severidad: this.mapBackendSeveridadToFrontend(item.severidad),
        count: item.count,
      })),
      por_mes: backendStats.por_mes || [],
      tendencia: backendStats.tendencia || [],
    };
  }

  /**
   * Mapear estado del backend al frontend
   */
  private mapBackendEstadoToFrontend(backendEstado: string): EstadoAccidente {
    const estadoMap: Record<string, EstadoAccidente> = {
      REPORTADO: EstadoAccidente.REPORTADO,
      EN_INVESTIGACION: EstadoAccidente.EN_INVESTIGACION,
      RESUELTO: EstadoAccidente.RESUELTO,
    };
    return estadoMap[backendEstado] || EstadoAccidente.REPORTADO;
  }

  /**
   * Mapear severidad del backend al frontend
   */
  private mapBackendSeveridadToFrontend(backendSeveridad: string): SeveridadAccidente {
    const severidadMap: Record<string, SeveridadAccidente> = {
      LEVE: SeveridadAccidente.LEVE,
      MODERADO: SeveridadAccidente.MODERADO,
      GRAVE: SeveridadAccidente.GRAVE,
      CRITICO: SeveridadAccidente.CRITICO,
    };
    return severidadMap[backendSeveridad] || SeveridadAccidente.LEVE;
  }

  /**
   * Obtener todos los accidentes con filtros
   */
  async getAccidents(
    filters: AccidentFilters = {}
  ): Promise<AccidentsPaginatedResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.linea_vida_id)
        params.append("linea_vida_id", filters.linea_vida_id.toString());
      if (filters.estado) params.append("estado", filters.estado);
      if (filters.severidad) params.append("severidad", filters.severidad);
      if (filters.fecha_desde) params.append("fecha_desde", filters.fecha_desde);
      if (filters.fecha_hasta) params.append("fecha_hasta", filters.fecha_hasta);
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const queryString = params.toString();
      const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

      const response = await apiClient.get<BackendPaginatedAccidents>(url);
      
      return {
        data: response.data.map(accident => this.mapBackendToFrontend(accident)),
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching accidents:", error);
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para ver los accidentes");
      }
      throw error;
    }
  }

  /**
   * Obtener un accidente por ID
   */
  async getAccidentById(id: string): Promise<Accident> {
    try {
      const response = await apiClient.get<BackendAccident>(`${this.basePath}/${id}`);
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Accidente no encontrado");
      }
      throw error;
    }
  }

  /**
   * Crear un nuevo accidente
   */
  async createAccident(accidentData: CreateAccidentDto): Promise<Accident> {
    try {
      const response = await apiClient.post<BackendAccident>(this.basePath, accidentData);
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 400) {
        throw new Error("Datos de accidente inválidos");
      }
      if (error instanceof ApiClientError && error.status === 409) {
        throw new Error("Ya existe un accidente con esos datos");
      }
      throw error;
    }
  }

  /**
   * Actualizar un accidente
   */
  async updateAccident(
    id: string,
    accidentData: UpdateAccidentDto
  ): Promise<Accident> {
    try {
      const response = await apiClient.patch<BackendAccident>(`${this.basePath}/${id}`, accidentData);
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Accidente no encontrado");
      }
      if (error instanceof ApiClientError && error.status === 400) {
        throw new Error("Datos de accidente inválidos");
      }
      throw error;
    }
  }

  /**
   * Eliminar un accidente
   */
  async deleteAccident(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Accidente no encontrado");
      }
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para eliminar accidentes");
      }
      throw error;
    }
  }

  /**
   * Obtener estadísticas de accidentes
   */
  async getStatistics(): Promise<AccidentStatistics> {
    try {
      const response = await apiClient.get<BackendAccidentStatistics>(`${this.basePath}/statistics`);
      return this.mapBackendStatsToFrontend(response);
    } catch (error) {
      console.error("Error fetching accident statistics:", error);
      throw error;
    }
  }

  /**
   * Obtener accidentes de una línea de vida específica
   */
  async getAccidentsByLineaVida(lineaVidaId: string): Promise<Accident[]> {
    try {
      const response = await apiClient.get<BackendAccident[]>(`${this.basePath}/by-linea-vida/${lineaVidaId}`);
      return response.map(accident => this.mapBackendToFrontend(accident));
    } catch (error) {
      console.error("Error fetching accidents by linea vida:", error);
      throw error;
    }
  }

  /**
   * Obtener accidentes recientes
   */
  async getRecentAccidents(
    limit: number = 10
  ): Promise<AccidentsPaginatedResponse> {
    try {
      const response = await apiClient.get<BackendPaginatedAccidents>(
        `${this.basePath}/recent?limit=${limit}`
      );
      
      return {
        data: response.data.map(accident => this.mapBackendToFrontend(accident)),
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching recent accidents:", error);
      throw error;
    }
  }

  /**
   * Obtener accidentes por severidad
   */
  async getAccidentsBySeverity(
    severidad: string
  ): Promise<AccidentsPaginatedResponse> {
    try {
      const response = await apiClient.get<BackendPaginatedAccidents>(
        `${this.basePath}/by-severity/${severidad}`
      );
      
      return {
        data: response.data.map(accident => this.mapBackendToFrontend(accident)),
        pagination: response.pagination,
      };
    } catch (error) {
      console.error("Error fetching accidents by severity:", error);
      throw error;
    }
  }

  /**
   * Obtener líneas de vida para filtros
   */
  async getLineasVida(): Promise<Array<{ id: string; codigo: string; cliente: string; ubicacion: string }>> {
    try {
      // Usar el endpoint correcto para líneas de vida
      const response = await apiClient.get<Array<{ id: number; codigo: string; cliente: string; ubicacion: string }>>(`/records/search/lineas-vida`);
      return response.map(linea => ({
        id: linea.id.toString(),
        codigo: linea.codigo,
        cliente: linea.cliente,
        ubicacion: linea.ubicacion,
      }));
    } catch (error) {
      console.error("Error fetching lineas vida:", error);
      // Si falla, retornar array vacío en lugar de lanzar error
      return [];
    }
  }

  /**
   * Exportar accidentes
   */
  async exportAccidents(filters: AccidentFilters = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();

      if (filters.linea_vida_id)
        params.append("linea_vida_id", filters.linea_vida_id);
      if (filters.estado) params.append("estado", filters.estado);
      if (filters.severidad) params.append("severidad", filters.severidad);
      if (filters.fecha_desde) params.append("fecha_desde", filters.fecha_desde);
      if (filters.fecha_hasta) params.append("fecha_hasta", filters.fecha_hasta);

      const queryString = params.toString();
      const url = `${this.basePath}/export${queryString ? `?${queryString}` : ""}`;
      
      const response = await apiClient.get(url);
      return response as Blob;
    } catch (error) {
      console.error("Error exporting accidents:", error);
      throw error;
    }
  }

  /**
   * Validar datos de accidente
   */
  validateAccidentData(data: CreateAccidentDto): string[] {
    const errors: string[] = [];

    if (!data.descripcion?.trim()) {
      errors.push("La descripción es requerida");
    }

    if (!data.fecha_accidente) {
      errors.push("La fecha del accidente es requerida");
    }

    if (!data.estado) {
      errors.push("El estado es requerido");
    }

    if (!data.severidad) {
      errors.push("La severidad es requerida");
    }

    if (data.fecha_accidente && data.fecha_investigacion) {
      const accidentDate = new Date(data.fecha_accidente);
      const investigationDate = new Date(data.fecha_investigacion);
      
      if (investigationDate < accidentDate) {
        errors.push("La fecha de investigación no puede ser anterior a la fecha del accidente");
      }
    }

    return errors;
  }
}

// Exportar instancia singleton
export const accidentService = new AccidentService();
