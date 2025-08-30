import { apiClient, ApiClientError } from "./apiClient";

// ===== INTERFACES PARA EL BACKEND =====
export interface BackendImageResponse {
  id: number;
  record_id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  description?: string;
  upload_date: string;
  uploaded_by?: number;
  image_url: string;
  compression_info?: {
    original_size: number;
    compressed_size: number;
    compression_ratio: number;
    dimensions: {
      width: number;
      height: number;
    };
    quality: number;
    savings_kb: number;
    savings_percentage: string;
  };
}

export interface BackendImageStatistics {
  total: number;
  totalSize: number;
  totalOriginalSize: number;
  totalSavings: number;
  averageCompressionRatio: number;
  byMimeType: Array<{ mime_type: string; count: number }>;
  storageEfficiency: {
    currentStorageUsed: number;
    originalStorageWouldBe: number;
    spaceSaved: number;
    efficiencyPercentage: number;
  };
}

// ===== INTERFACES PARA EL FRONTEND =====
export interface ImageResponse {
  id: string;
  record_id: string;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  description?: string;
  upload_date: Date;
  uploaded_by?: string;
  image_url: string;
  compression_info?: {
    original_size: number;
    compressed_size: number;
    compression_ratio: number;
    dimensions: {
      width: number;
      height: number;
    };
    quality: number;
    savings_kb: number;
    savings_percentage: string;
  };
}

export interface ImageStatistics {
  total: number;
  totalSize: number;
  totalOriginalSize: number;
  totalSavings: number;
  averageCompressionRatio: number;
  byMimeType: Array<{ mime_type: string; count: number }>;
  storageEfficiency: {
    currentStorageUsed: number;
    originalStorageWouldBe: number;
    spaceSaved: number;
    efficiencyPercentage: number;
  };
}

export interface UploadImageDto {
  description?: string;
}

export interface UpdateImageDto {
  description?: string;
}

class ImageService {
  /**
   * Mapear imagen del backend al formato del frontend
   */
  private mapBackendToFrontend(
    backendImage: BackendImageResponse
  ): ImageResponse {
    return {
      id: backendImage.id.toString(),
      record_id: backendImage.record_id.toString(),
      filename: backendImage.filename,
      original_name: backendImage.original_name,
      file_size: backendImage.file_size,
      mime_type: backendImage.mime_type,
      description: backendImage.description,
      upload_date: new Date(backendImage.upload_date),
      uploaded_by: backendImage.uploaded_by?.toString(),
      image_url: backendImage.image_url,
      compression_info: backendImage.compression_info,
    };
  }

  /**
   * Subir imagen para un record
   */
  async uploadImage(
    recordId: string,
    file: File,
    data?: UploadImageDto
  ): Promise<ImageResponse> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      if (data?.description) {
        formData.append("description", data.description);
      }

      // Usar fetch directamente para FormData (no JSON)
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/records/${recordId}/image/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message || "Error al subir imagen";

        throw new ApiClientError(
          errorMessage,
          response.status,
          errorData.error
        );
      }

      const result: BackendImageResponse = await response.json();
      return this.mapBackendToFrontend(result);
    } catch (error) {
      console.error("Error uploading image:", error);
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError("Error al subir imagen", 500);
    }
  }

  /**
   * Reemplazar imagen existente
   */
  async replaceImage(
    recordId: string,
    file: File,
    data?: UploadImageDto
  ): Promise<ImageResponse> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      if (data?.description) {
        formData.append("description", data.description);
      }

      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/records/${recordId}/image/replace`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message || "Error al reemplazar imagen";

        throw new ApiClientError(
          errorMessage,
          response.status,
          errorData.error
        );
      }

      const result: BackendImageResponse = await response.json();
      return this.mapBackendToFrontend(result);
    } catch (error) {
      console.error("Error replacing image:", error);
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError("Error al reemplazar imagen", 500);
    }
  }

  /**
   * Obtener imagen de un record
   */
  async getRecordImage(recordId: string): Promise<ImageResponse | null> {
    try {
      const response = await apiClient.get<BackendImageResponse>(
        `/records/${recordId}/image`
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      // Si es 404, no hay imagen para este record
      if (error instanceof ApiClientError && error.status === 404) {
        return null;
      }
      
      // Si es un error de parsing JSON, probablemente no hay imagen
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return null;
      }
      
      // Para otros errores, solo retornar null en lugar de throw
      return null;
    }
  }

  /**
   * Actualizar metadatos de imagen
   */
  async updateImageMetadata(
    recordId: string,
    data: UpdateImageDto
  ): Promise<ImageResponse> {
    try {
      const response = await apiClient.patch<BackendImageResponse>(
        `/records/${recordId}/image/metadata`,
        data
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Imagen no encontrada");
      }
      throw error;
    }
  }

  /**
   * Eliminar imagen de un record
   */
  async deleteRecordImage(recordId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/records/${recordId}/image`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Imagen no encontrada");
      }
      throw error;
    }
  }

  /**
   * Verificar si un record tiene imagen
   */
  async hasImage(recordId: string): Promise<{ hasImage: boolean }> {
    try {
      const response = await apiClient.get<{ hasImage: boolean }>(
        `/records/${recordId}/image/exists`
      );
      return response;
    } catch (error) {
      return { hasImage: false };
    }
  }

  /**
   * Validar archivo de imagen antes de subir
   */
  validateImageFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      errors.push("Solo se permiten archivos JPG, JPEG y PNG");
    }

    // Validar tamaño (10MB máximo antes de compresión)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push(
        `El archivo es muy grande. Máximo permitido: ${(
          maxSize /
          1024 /
          1024
        ).toFixed(1)}MB`
      );
    }

    // Validar que el archivo no esté vacío
    if (file.size === 0) {
      errors.push("El archivo está vacío");
    }

    // Validar nombre de archivo
    if (file.name.length > 255) {
      errors.push("El nombre del archivo es muy largo");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";

    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  /**
   * Obtener información de compresión formateada
   */
  getCompressionSummary(
    compressionInfo?: ImageResponse["compression_info"]
  ): string {
    if (!compressionInfo) {
      return "Sin información de compresión";
    }

    return `${this.formatFileSize(
      compressionInfo.original_size
    )} → ${this.formatFileSize(
      compressionInfo.compressed_size
    )} (${compressionInfo.compression_ratio.toFixed(1)}% reducción)`;
  }
}

// Exportar instancia singleton
export const imageService = new ImageService();