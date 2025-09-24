import { apiClient } from '../../../shared/services/apiClient';
import { PurchaseOrder } from '../types';

const BASE_URL = '/purchase-orders';

export const purchaseOrderService = {
  async getAll(): Promise<PurchaseOrder[]> {
    return await apiClient.get<PurchaseOrder[]>(BASE_URL);
  },

  async getById(id: number): Promise<PurchaseOrder> {
    return await apiClient.get<PurchaseOrder>(`${BASE_URL}/${id}`);
  },

  async delete(id: number): Promise<void> {
    return await apiClient.delete<void>(`${BASE_URL}/${id}`);
  },

  async canDelete(id: number): Promise<{ canDelete: boolean }> {
    return await apiClient.get<{ canDelete: boolean }>(
      `${BASE_URL}/${id}/can-delete`
    );
  },
};
