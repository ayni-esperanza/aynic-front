import { apiClient } from "../../../services/apiClient";
import type {
  Accident,
  CreateAccidentDto,
  UpdateAccidentDto,
  AccidentFilters,
  AccidentsPaginatedResponse,
  AccidentStatistics,
} from "../types/accident";

export const accidentService = {
  /**
   * Obtener todos los accidentes con filtros
   */
  async getAccidents(
    filters: AccidentFilters = {}
  ): Promise<AccidentsPaginatedResponse> {
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
    const url = queryString ? `/accidents?${queryString}` : "/accidents";

    return apiClient.get<AccidentsPaginatedResponse>(url);
  },

  /**
   * Obtener un accidente por ID
   */
  async getAccidentById(id: number): Promise<Accident> {
    return apiClient.get<Accident>(`/accidents/${id}`);
  },

  /**
   * Crear un nuevo accidente
   */
  async createAccident(accidentData: CreateAccidentDto): Promise<Accident> {
    return apiClient.post<Accident>("/accidents", accidentData);
  },

  /**
   * Actualizar un accidente
   */
  async updateAccident(
    id: number,
    accidentData: UpdateAccidentDto
  ): Promise<Accident> {
    return apiClient.patch<Accident>(`/accidents/${id}`, accidentData);
  },

  /**
   * Eliminar un accidente
   */
  async deleteAccident(id: number): Promise<void> {
    return apiClient.delete(`/accidents/${id}`);
  },

  /**
   * Obtener estadísticas de accidentes
   */
  async getStatistics(): Promise<AccidentStatistics> {
    return apiClient.get<AccidentStatistics>("/accidents/statistics");
  },

  /**
   * Obtener accidentes de una línea de vida específica
   */
  async getAccidentsByLineaVida(lineaVidaId: number): Promise<Accident[]> {
    return apiClient.get<Accident[]>(`/accidents/by-linea-vida/${lineaVidaId}`);
  },

  /**
   * Obtener accidentes recientes
   */
  async getRecentAccidents(
    limit: number = 10
  ): Promise<AccidentsPaginatedResponse> {
    return apiClient.get<AccidentsPaginatedResponse>(
      `/accidents/recent?limit=${limit}`
    );
  },

  /**
   * Obtener accidentes por severidad
   */
  async getAccidentsBySeverity(
    severidad: string
  ): Promise<AccidentsPaginatedResponse> {
    return apiClient.get<AccidentsPaginatedResponse>(
      `/accidents/by-severity/${severidad}`
    );
  },

  /**
   * Buscar líneas de vida para formularios (sin paginación)
   */
  async searchLineasVida(
    searchTerm?: string
  ): Promise<
    Array<{ id: number; codigo: string; cliente: string; ubicacion: string }>
  > {
    try {
      const params = searchTerm
        ? `?search=${encodeURIComponent(searchTerm)}`
        : "";
      const response = await apiClient.get<
        Array<{
          id: number;
          codigo: string;
          cliente: string;
          ubicacion: string;
        }>
      >(`/records/search/lineas-vida${params}`);
      return response;
    } catch (error) {
      console.error("Error searching líneas de vida:", error);
      return [];
    }
  },

  /**
   * Obtener líneas de vida para filtros
   */
  async getLineasVida(): Promise<
    Array<{ id: number; codigo: string; cliente: string; ubicacion: string }>
  > {
    return this.searchLineasVida();
  },
};
