import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Clock, CheckSquare, User, Calendar, DollarSign, Package, FileText } from 'lucide-react';
import { purchaseOrderService } from '../services';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderType } from '../types';

const statusColors = {
  [PurchaseOrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  [PurchaseOrderStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  [PurchaseOrderStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  [PurchaseOrderStatus.COMPLETED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  [PurchaseOrderStatus.CANCELLED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const statusIcons = {
  [PurchaseOrderStatus.PENDING]: Clock,
  [PurchaseOrderStatus.APPROVED]: CheckCircle,
  [PurchaseOrderStatus.REJECTED]: XCircle,
  [PurchaseOrderStatus.COMPLETED]: CheckSquare,
  [PurchaseOrderStatus.CANCELLED]: XCircle,
};

const typeLabels = {
  [PurchaseOrderType.LINEA_VIDA]: 'Línea de Vida',
  [PurchaseOrderType.EQUIPOS]: 'Equipos',
  [PurchaseOrderType.ACCESORIOS]: 'Accesorios',
  [PurchaseOrderType.SERVICIOS]: 'Servicios',
};

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
      <div className="py-8 text-center">
        <div className="mb-4 text-red-600 dark:text-red-400">
          <XCircle size={48} className="mx-auto" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Error al cargar</h3>
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

  const StatusIcon = statusIcons[purchaseOrder.estado];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/ordenes-compra')}
            className="p-2 text-gray-600 transition-colors rounded-lg dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orden de Compra</h1>
            <p className="text-gray-600 dark:text-gray-400">Detalles de la orden {purchaseOrder.codigo}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to={`editar/${purchaseOrder.id}`}
            className="flex items-center px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Edit size={16} className="mr-2" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
          >
            <Trash2 size={16} className="mr-2" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Información principal */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Columna izquierda */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Código</label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{purchaseOrder.codigo}</p>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Estado</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[purchaseOrder.estado]}`}>
                <StatusIcon size={16} className="mr-2" />
                {purchaseOrder.estado}
              </span>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</label>
              <p className="flex items-center text-gray-900 dark:text-white">
                <Package size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                {typeLabels[purchaseOrder.tipo]}
              </p>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Monto Total</label>
              <p className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
                <DollarSign size={20} className="mr-2 text-green-600 dark:text-green-400" />
                ${purchaseOrder.monto_total.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Solicitante</label>
              <p className="flex items-center text-gray-900 dark:text-white">
                <User size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                {purchaseOrder.solicitante.nombre}
              </p>
            </div>
            
            {purchaseOrder.aprobador && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Aprobador</label>
                <p className="flex items-center text-gray-900 dark:text-white">
                  <User size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                  {purchaseOrder.aprobador.nombre}
                </p>
              </div>
            )}
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Creación</label>
              <p className="flex items-center text-gray-900 dark:text-white">
                <Calendar size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                {new Date(purchaseOrder.fecha_creacion).toLocaleDateString()}
              </p>
            </div>
            
            {purchaseOrder.fecha_aprobacion && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Aprobación</label>
                <p className="flex items-center text-gray-900 dark:text-white">
                  <Calendar size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                  {new Date(purchaseOrder.fecha_aprobacion).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">
          <FileText size={20} className="mr-2 text-gray-500 dark:text-gray-400" />
          Descripción
        </h3>
        <p className="text-gray-700 whitespace-pre-wrap dark:text-gray-300">{purchaseOrder.descripcion}</p>
      </div>

      {/* Información adicional */}
      {(purchaseOrder.proveedor || purchaseOrder.observaciones || purchaseOrder.fecha_requerida) && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Información Adicional</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {purchaseOrder.proveedor && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Proveedor</label>
                <p className="text-gray-900 dark:text-white">{purchaseOrder.proveedor}</p>
              </div>
            )}
            
            {purchaseOrder.fecha_requerida && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Fecha Requerida</label>
                <p className="text-gray-900 dark:text-white">{new Date(purchaseOrder.fecha_requerida).toLocaleDateString()}</p>
              </div>
            )}
            
            {purchaseOrder.observaciones && (
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Observaciones</label>
                <p className="text-gray-700 whitespace-pre-wrap dark:text-gray-300">{purchaseOrder.observaciones}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
