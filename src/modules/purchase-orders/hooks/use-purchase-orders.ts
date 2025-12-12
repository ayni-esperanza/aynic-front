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

  const createPurchaseOrder = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const newOrder = await purchaseOrderService.create(data);
      setPurchaseOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la orden de compra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePurchaseOrder = useCallback(async (id: number, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrder = await purchaseOrderService.update(id, data);
      setPurchaseOrders(prev => 
        prev.map(order => order.id === id ? updatedOrder : order)
      );
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la orden de compra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePurchaseOrder = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await purchaseOrderService.delete(id);
      setPurchaseOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la orden de compra');
      throw err;
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
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  };
};
