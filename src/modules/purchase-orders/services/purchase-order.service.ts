import { apiClient } from '../../../shared/services/apiClient';
import {
  PurchaseOrder,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
} from '../types';

const BASE_URL = '/purchase-orders';

export const purchaseOrderService = {
  // Obtener todas las órdenes de compra
  async getAll(): Promise<PurchaseOrder[]> {
    return await apiClient.get<PurchaseOrder[]>(BASE_URL);
  },

  // Obtener una orden de compra por ID
  async getById(id: number): Promise<PurchaseOrder> {
    return await apiClient.get<PurchaseOrder>(`${BASE_URL}/${id}`);
  },

  // Crear una nueva orden de compra
  async create(data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
    // Solo enviamos campos permitidos por el backend
    const payload: CreatePurchaseOrderData = {
      numero: data.numero,
      termino_referencias: data.termino_referencias ?? null,
    };
    return await apiClient.post<PurchaseOrder>(BASE_URL, payload);
  },

  // Actualizar una orden de compra
  async update(id: number, data: UpdatePurchaseOrderData): Promise<PurchaseOrder> {
    const payload: UpdatePurchaseOrderData = {
      numero: data.numero,
      termino_referencias: data.termino_referencias ?? null,
    };
    return await apiClient.patch<PurchaseOrder>(`${BASE_URL}/${id}`, payload);
  },

  // Eliminar una orden de compra
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // Métodos adicionales removidos porque el backend no los soporta actualmente
};
