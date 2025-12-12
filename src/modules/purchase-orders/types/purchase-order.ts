// Backend acepta solo estos campos
export interface PurchaseOrder {
  id: number;
  numero: string | null;
  termino_referencias?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePurchaseOrderData {
  numero: string;
  termino_referencias?: string | null;
}

export interface UpdatePurchaseOrderData {
  numero?: string;
  termino_referencias?: string | null;
}
