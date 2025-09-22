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
};
