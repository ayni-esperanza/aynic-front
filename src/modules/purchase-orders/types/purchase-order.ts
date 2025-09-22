export interface PurchaseOrder {
  id: number;
  numero: string;
  termino_referencias?: string | null;
  created_at?: string;
  updated_at?: string;
}
