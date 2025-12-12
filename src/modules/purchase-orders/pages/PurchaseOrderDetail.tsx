import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, XCircle, Calendar, FileText } from 'lucide-react';
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

  const handleDelete = async () => {
    if (!purchaseOrder) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar esta orden de compra?')) {
      try {
        await purchaseOrderService.delete(purchaseOrder.id);
        navigate('/ordenes-compra');
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#18D043] border-t-transparent"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando orden de compra...</span>
      </div>
    );
  }

  if (error || !purchaseOrder) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <XCircle size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error al cargar</h3>
        <p className="text-gray-600 dark:text-gray-400">{error || 'Orden de compra no encontrada'}</p>
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
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orden de Compra</h1>
            <p className="text-gray-600 dark:text-gray-400">Detalles de la orden {purchaseOrder.numero || 'Sin código'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to={`editar/${purchaseOrder.id}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Edit size={16} className="mr-2" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Trash2 size={16} className="mr-2" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Información principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Código</label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{purchaseOrder.numero || '—'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Términos / Referencias</label>
              <p className="text-gray-900 dark:text-white">{purchaseOrder.termino_referencias || '—'}</p>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha de Creación</label>
              <p className="text-gray-900 dark:text-white flex items-center">
                <Calendar size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                {purchaseOrder.created_at ? new Date(purchaseOrder.created_at).toLocaleDateString() : '—'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Actualizada el</label>
              <p className="text-gray-900 dark:text-white flex items-center">
                <Calendar size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                {purchaseOrder.updated_at ? new Date(purchaseOrder.updated_at).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción básica */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <FileText size={20} className="mr-2 text-gray-500 dark:text-gray-400" />
          Detalle
        </h3>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {purchaseOrder.termino_referencias || 'Sin términos registrados'}
        </p>
      </div>
    </div>
  );
};
