import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, CheckSquare } from 'lucide-react';
import { usePurchaseOrders } from '../hooks';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderType } from '../types';

const statusColors = {
  [PurchaseOrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PurchaseOrderStatus.APPROVED]: 'bg-green-100 text-green-800',
  [PurchaseOrderStatus.REJECTED]: 'bg-red-100 text-red-800',
  [PurchaseOrderStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
  [PurchaseOrderStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
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

export const PurchaseOrderList: React.FC = () => {
  const { purchaseOrders, loading, error, deletePurchaseOrder } = usePurchaseOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<PurchaseOrderType | ''>('');

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.proveedor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.estado === statusFilter;
    const matchesType = !typeFilter || order.tipo === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta orden de compra?')) {
      try {
        await deletePurchaseOrder(id);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#18D043] border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Cargando órdenes de compra...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <XCircle size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Órdenes de Compra</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona las órdenes de compra del sistema</p>
        </div>
        <Link
          to="nuevo"
          className="inline-flex items-center px-4 py-2 bg-[#18D043] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Nueva Orden
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Código, descripción o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value={PurchaseOrderStatus.PENDING}>Pendiente</option>
              <option value={PurchaseOrderStatus.APPROVED}>Aprobada</option>
              <option value={PurchaseOrderStatus.REJECTED}>Rechazada</option>
              <option value={PurchaseOrderStatus.COMPLETED}>Completada</option>
              <option value={PurchaseOrderStatus.CANCELLED}>Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as PurchaseOrderType | '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los tipos</option>
              <option value={PurchaseOrderType.LINEA_VIDA}>Línea de Vida</option>
              <option value={PurchaseOrderType.EQUIPOS}>Equipos</option>
              <option value={PurchaseOrderType.ACCESORIOS}>Accesorios</option>
              <option value={PurchaseOrderType.SERVICIOS}>Servicios</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => {
                const StatusIcon = statusIcons[order.estado];
                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{order.codigo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={order.descripcion}>
                        {order.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{typeLabels[order.tipo]}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.estado]}`}>
                        <StatusIcon size={14} className="mr-1" />
                        {order.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${order.monto_total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{order.solicitante.nombre}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.fecha_creacion).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`detalle/${order.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`editar/${order.id}`}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Filter size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron órdenes</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter || typeFilter 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay órdenes de compra registradas aún'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
