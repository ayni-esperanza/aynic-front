import { apiClient } from '../../../shared/services/apiClient';
import {
  PurchaseOrder,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
  PurchaseOrderStatus,
  PurchaseOrderType,
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
    return await apiClient.post<PurchaseOrder>(BASE_URL, data);
  },

  // Actualizar una orden de compra
  async update(id: number, data: UpdatePurchaseOrderData): Promise<PurchaseOrder> {
    return await apiClient.patch<PurchaseOrder>(`${BASE_URL}/${id}`, data);
  },

  // Eliminar una orden de compra
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // Obtener órdenes por estado
  async getByStatus(status: PurchaseOrderStatus): Promise<PurchaseOrder[]> {
    return await apiClient.get<PurchaseOrder[]>(`${BASE_URL}/status/${status}`);
  },

  // Obtener órdenes por tipo
  async getByType(type: PurchaseOrderType): Promise<PurchaseOrder[]> {
    return await apiClient.get<PurchaseOrder[]>(`${BASE_URL}/type/${type}`);
  },

  // Aprobar una orden de compra
  async approve(id: number): Promise<PurchaseOrder> {
    return this.update(id, { estado: PurchaseOrderStatus.APPROVED });
  },

  // Rechazar una orden de compra
  async reject(id: number): Promise<PurchaseOrder> {
    return this.update(id, { estado: PurchaseOrderStatus.REJECTED });
  },

  // Completar una orden de compra
  async complete(id: number): Promise<PurchaseOrder> {
    return this.update(id, { estado: PurchaseOrderStatus.COMPLETED });
  },

  // Cancelar una orden de compra
  async cancel(id: number): Promise<PurchaseOrder> {
    return this.update(id, { estado: PurchaseOrderStatus.CANCELLED });
  },
};
