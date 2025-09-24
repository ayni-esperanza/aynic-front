import { apiClient, ApiClientError } from "../../../shared/services/apiClient";
import { PurchaseOrder } from "../types";

class PurchaseOrderService {
  private readonly basePath = "/purchase-orders";

  /**
   * Obtener todas las órdenes de compra
   */
  async getAll(): Promise<PurchaseOrder[]> {
    try {
      return await apiClient.get<PurchaseOrder[]>(this.basePath);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      throw error;
    }
  }

  /**
   * Obtener orden de compra por ID
   */
  async getById(id: number): Promise<PurchaseOrder> {
    try {
      return await apiClient.get<PurchaseOrder>(`${this.basePath}/${id}`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Orden de compra no encontrada");
      }
      throw error;
    }
  }

  /**
   * Eliminar orden de compra
   */
  async delete(id: number): Promise<void> {
    try {
      return await apiClient.delete<void>(`${this.basePath}/${id}`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Orden de compra no encontrada");
      }
      throw error;
    }
  }

  /**
   * Verificar si una orden de compra puede ser eliminada
   */
  async canDelete(id: number): Promise<{ canDelete: boolean }> {
    try {
      return await apiClient.get<{ canDelete: boolean }>(
        `${this.basePath}/${id}/can-delete`
      );
    } catch (error) {
      console.error("Error checking if purchase order can be deleted:", error);
      // Por seguridad, si hay error en la verificación, asumir que no se puede eliminar
      return { canDelete: false };
    }
  }
}

// Exportar instancia singleton
export const purchaseOrderService = new PurchaseOrderService();
