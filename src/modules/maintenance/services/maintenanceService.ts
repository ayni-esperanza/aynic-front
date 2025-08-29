import {
  apiClient,
  PaginatedResponse,
  API_ENDPOINTS,
} from '../../../shared/services/apiClient';
import type {
  Maintenance,
  CreateMaintenanceDto,
  MaintenanceFilters,
} from "../types/maintenance";

type RecordLite = {
  id: number;
  codigo: string;
  cliente: string;
  longitud: number;
  ubicacion: string;
};

class MaintenanceService {
  private readonly baseUrl = API_ENDPOINTS.MAINTENANCE.BASE;

  // === Búsqueda de líneas de vida para selects (con o sin término)
  async searchRecordsForSelect(searchTerm?: string): Promise<RecordLite[]> {
    const qs = searchTerm?.trim()
      ? `?search=${encodeURIComponent(searchTerm.trim())}`
      : "";
    const rows = await apiClient.get<Array<any>>(
      `/records/search/lineas-vida${qs}`
    );
    return (rows || []).map((r) => ({
      id: r.id,
      codigo: r.codigo,
      cliente: r.cliente,
      longitud: Number(r.longitud ?? 0),
      ubicacion: r.ubicacion ?? "",
    }));
  }

  // Alias de compatibilidad (por si otras pantallas lo usaban)
  async getRecordsForSelect(): Promise<RecordLite[]> {
    return this.searchRecordsForSelect();
  }
  async searchLineasVida(term?: string) {
    return this.searchRecordsForSelect(term);
  }

  // === Lista de mantenimientos (cliente hace el filtrado básico)
  async getMaintenances(
    filters: MaintenanceFilters = {}
  ): Promise<PaginatedResponse<Maintenance>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    if (!filters.record_id) {
      return {
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    let all = await apiClient.get<Maintenance[]>(
      API_ENDPOINTS.MAINTENANCE.BY_RECORD(filters.record_id)
    );

    if (filters.search) {
      const s = filters.search.toLowerCase();
      all = all.filter(
        (m) =>
          m.description?.toLowerCase().includes(s) ||
          m.record?.codigo?.toLowerCase().includes(s) ||
          m.record?.cliente?.toLowerCase().includes(s)
      );
    }
    if (filters.date_from) {
      const from = new Date(filters.date_from).getTime();
      all = all.filter((m) => new Date(m.maintenance_date).getTime() >= from);
    }
    if (filters.date_to) {
      const to = new Date(filters.date_to).getTime();
      all = all.filter((m) => new Date(m.maintenance_date).getTime() <= to);
    }
    if (typeof filters.has_length_change === "boolean") {
      all = all.filter((m) => {
        const prev = m.previous_length_meters;
        const next = m.new_length_meters;
        const changed =
          prev != null && next != null && Number(prev) !== Number(next);
        return filters.has_length_change ? changed : !changed;
      });
    }

    all.sort(
      (a, b) =>
        new Date(b.maintenance_date).getTime() -
        new Date(a.maintenance_date).getTime()
    );

    const start = (page - 1) * limit;
    const slice = all.slice(start, start + limit);

    return {
      data: slice,
      meta: {
        page,
        limit,
        total: all.length,
        totalPages: Math.max(1, Math.ceil(all.length / limit)),
        hasNextPage: page * limit < all.length,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getMaintenancesByRecord(recordId: number): Promise<Maintenance[]> {
    return apiClient.get<Maintenance[]>(
      API_ENDPOINTS.MAINTENANCE.BY_RECORD(recordId)
    );
  }

  async getMaintenance(id: number): Promise<Maintenance> {
    return apiClient.get<Maintenance>(API_ENDPOINTS.MAINTENANCE.BY_ID(id));
  }

  async createMaintenance(
    data: CreateMaintenanceDto,
    file?: File
  ): Promise<Maintenance> {
    if (file) {
      const formData = new FormData();
      formData.append("record_id", String(data.record_id));
      formData.append("maintenance_date", data.maintenance_date);
      if (data.description?.trim())
        formData.append("description", data.description.trim());
      if (data.new_length_meters !== undefined)
        formData.append("new_length_meters", String(data.new_length_meters));
      formData.append("image", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}${
          this.baseUrl
        }`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${apiClient.getToken()}` },
          body: formData,
        }
      );

      if (!response.ok) {
        let msg = "Error desconocido";
        try {
          const ct = response.headers.get("content-type");
          const body = ct?.includes("application/json")
            ? await response.json()
            : { message: response.statusText };
          msg = Array.isArray(body.message)
            ? body.message.join(", ")
            : body.message || msg;
        } catch {
          msg = `HTTP ${response.status}`;
        }
        throw new Error(msg);
      }
      return response.json();
    } else {
      const clean = { ...data };
      if (clean.description && !clean.description.trim())
        delete clean.description;
      return apiClient.post<Maintenance>(this.baseUrl, clean);
    }
  }

  async deleteMaintenance(id: number): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.MAINTENANCE.BY_ID(id));
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const MAX = 5 * 1024 * 1024;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type))
      return { valid: false, error: "Formato no permitido (JPG, PNG, WebP)" };
    if (file.size > MAX)
      return { valid: false, error: "El archivo supera 5MB" };
    return { valid: true };
  }
}

export const maintenanceService = new MaintenanceService();
