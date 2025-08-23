import { apiClient } from "../../../services/apiClient";

// Tipos exactos de tu API
export interface CreateChildRecordDto {
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

export interface CreateRelationshipDto {
  parent_record_id: number;
  relationship_type: "DIVISION" | "REPLACEMENT" | "UPGRADE";
  child_records: CreateChildRecordDto[];
  notes?: string;
}

export interface CreateRelationshipResponseDto {
  parent_record: {
    id: number;
    codigo: string;
    new_status: string;
  };
  child_records: Array<{
    id: number;
    codigo: string;
  }>;
  relationships: any[];
  message: string;
}

export const relationshipService = {
  async createRelationship(
    data: CreateRelationshipDto
  ): Promise<CreateRelationshipResponseDto> {
    return apiClient.post<CreateRelationshipResponseDto>(
      "/record-relationships",
      data
    );
  },

  async canBeParent(recordId: number): Promise<{
    canBeParent: boolean;
    reason?: string;
    currentStatus?: string;
    hasChildren?: boolean;
  }> {
    return apiClient.get(`/record-relationships/can-be-parent/${recordId}`);
  },
};
