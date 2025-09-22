import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, XCircle } from 'lucide-react';
import { purchaseOrderService } from '../services';
import { PurchaseOrder } from '../types';

export const PurchaseOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        setLoading(true);
        const data = await purchaseOrderService.getById(Number(id));
        setPurchaseOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la orden de compra');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPurchaseOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#18D043] border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Cargando orden de compra...</span>
      </div>
    );
  }

  if (error || !purchaseOrder) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <XCircle size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
        <p className="text-gray-600">{error || 'Orden de compra no encontrada'}</p>
        <button
          onClick={() => navigate('/ordenes-compra')}
          className="mt-4 px-4 py-2 bg-[#18D043] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/ordenes-compra')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orden de Compra</h1>
            <p className="text-gray-600">Nº {purchaseOrder.numero}</p>
          </div>
        </div>
      </div>

      {/* Información principal */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nº Orden</label>
            <p className="text-lg font-semibold text-gray-900">{purchaseOrder.numero}</p>
          </div>
          {purchaseOrder.termino_referencias && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Término y Referencias</label>
              <p className="text-gray-800 whitespace-pre-wrap">{purchaseOrder.termino_referencias}</p>
            </div>
          )}
          <div className="text-sm text-gray-500">
            Creado: {purchaseOrder.created_at ? new Date(purchaseOrder.created_at).toLocaleString() : '—'}
          </div>
        </div>
      </div>

    </div>
  );
};
