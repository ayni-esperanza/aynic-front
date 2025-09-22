import { useState, useEffect, useCallback } from 'react';
import { purchaseOrderService } from '../services';
import { PurchaseOrder } from '../types';

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseOrderService.getAll();
      setPurchaseOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las órdenes de compra');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  return {
    purchaseOrders,
    loading,
    error,
    fetchPurchaseOrders,
  };
};
