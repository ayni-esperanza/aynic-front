import React, { useState } from 'react';
import { Plus, Search, Filter, CheckCircle, XCircle, Clock, CheckSquare, FileText, Building, User, DollarSign, Calendar, Trash2, Save } from 'lucide-react';
import { usePurchaseOrders } from '../hooks';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderType } from '../types';
import { PurchaseOrderForm } from './PurchaseOrderForm';
import { useModalClose } from '../../../shared/hooks/useModalClose';

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

export const PurchaseOrderList: React.FC = () => {
  const { purchaseOrders, loading, error, deletePurchaseOrder, createPurchaseOrder, updatePurchaseOrder } = usePurchaseOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<PurchaseOrderType | ''>('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.proveedor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.estado === statusFilter;
    const matchesType = !typeFilter || order.tipo === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setEditData({
      codigo: order.codigo,
      descripcion: order.descripcion,
      tipo: order.tipo,
      monto_total: order.monto_total,
      proveedor: order.proveedor || '',
      fecha_requerida: order.fecha_requerida || '',
      observaciones: order.observaciones || '',
    });
    setHasChanges(false);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
  };

  const detailModalRef = useModalClose({
    isOpen: showDetailModal,
    onClose: handleCloseDetailModal,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData((prev: any) => ({
      ...prev,
      [name]: name === 'monto_total' ? parseFloat(value) || 0 : value,
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;
    
    try {
      await updatePurchaseOrder(selectedOrder.id, editData);
      setShowDetailModal(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta orden de compra?')) {
      try {
        await deletePurchaseOrder(id);
        setShowDetailModal(false);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#18D043] border-t-transparent"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando órdenes de compra...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <XCircle size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error al cargar</h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
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
        <button
          onClick={() => setShowFormModal(true)}
          className="inline-flex items-center px-4 py-2 bg-[#18D043] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Nueva Orden
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
            <Filter className="w-4 h-4 text-[#18D043]" />
            Filtros rápidos
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Todos los estados</option>
              <option value={PurchaseOrderStatus.PENDING} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Pendiente</option>
              <option value={PurchaseOrderStatus.APPROVED} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Aprobada</option>
              <option value={PurchaseOrderStatus.REJECTED} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Rechazada</option>
              <option value={PurchaseOrderStatus.COMPLETED} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Completada</option>
              <option value={PurchaseOrderStatus.CANCELLED} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as PurchaseOrderType | '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Todos los tipos</option>
              <option value={PurchaseOrderType.LINEA_VIDA} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Línea de Vida</option>
              <option value={PurchaseOrderType.EQUIPOS} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Equipos</option>
              <option value={PurchaseOrderType.ACCESORIOS} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Accesorios</option>
              <option value={PurchaseOrderType.SERVICIOS} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Servicios</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div>
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Solicitante
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => {
                const StatusIcon = statusIcons[order.estado];
                return (
                  <tr 
                    key={order.id} 
                    onClick={() => handleViewOrder(order)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{order.codigo}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-xs text-gray-900 dark:text-white max-w-xs truncate" title={order.descripcion}>
                        {order.descripcion}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{typeLabels[order.tipo]}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[order.estado]}`}>
                        <StatusIcon size={13} className="mr-1" />
                        {order.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        ${order.monto_total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{order.solicitante.nombre}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(order.fecha_creacion).toLocaleDateString()}
                      </span>
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

      {/* Modal de formulario */}
      <PurchaseOrderForm 
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={() => {
          setShowFormModal(false);
        }}
        onCreatePurchaseOrder={createPurchaseOrder}
      />

      {/* Modal de detalle */}
      {showDetailModal && selectedOrder && (
        <div
          ref={detailModalRef}
          className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
          style={{ margin: 0 }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-white" />
                <div>
                  <h2 className="text-base font-bold text-white">Detalle de Orden de Compra</h2>
                  <p className="text-xs text-blue-100">{selectedOrder.codigo}</p>
                </div>
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="text-white transition-colors hover:text-blue-200"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={editData.codigo || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Estado
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedOrder.estado]}`}>
                    {React.createElement(statusIcons[selectedOrder.estado], { size: 14, className: 'mr-1' })}
                    {selectedOrder.estado}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={editData.descripcion || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <Building className="w-4 h-4 inline mr-1" />
                    Tipo
                  </label>
                  <select
                    name="tipo"
                    value={editData.tipo || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={PurchaseOrderType.LINEA_VIDA}>Línea de Vida</option>
                    <option value={PurchaseOrderType.EQUIPOS}>Equipos</option>
                    <option value={PurchaseOrderType.ACCESORIOS}>Accesorios</option>
                    <option value={PurchaseOrderType.SERVICIOS}>Servicios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Monto Total
                  </label>
                  <input
                    type="number"
                    name="monto_total"
                    value={editData.monto_total || 0}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Solicitante
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white px-3 py-2">{selectedOrder.solicitante.nombre}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de Creación
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white px-3 py-2">{new Date(selectedOrder.fecha_creacion).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  name="proveedor"
                  value={editData.proveedor || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Fecha Requerida
                </label>
                <input
                  type="date"
                  name="fecha_requerida"
                  value={editData.fecha_requerida || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={editData.observaciones || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Footer con botón eliminar y guardar */}
            <div className="flex items-center justify-between space-x-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => handleDelete(selectedOrder.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm"
              >
                <Trash2 size={16} className="mr-2" />
                Eliminar
              </button>
              
              {hasChanges && (
                <button
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="px-4 py-2 bg-[#18D043] text-white rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                >
                  <Save size={16} className="mr-2" />
                  Guardar Cambios
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
