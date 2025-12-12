import React, { useState } from 'react';
import { Plus, Search, Filter, XCircle, FileText, Trash2, Save } from 'lucide-react';
import { usePurchaseOrders } from '../hooks';
import { PurchaseOrder } from '../types';
import { PurchaseOrderForm } from './PurchaseOrderForm';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import { ConfirmDeleteModal } from '../../../shared/components/ui/ConfirmDeleteModal';

// Sin estados/tipos porque el backend solo expone numero y termino_referencias

export const PurchaseOrderList: React.FC = () => {
  const { purchaseOrders, loading, error, deletePurchaseOrder, createPurchaseOrder, updatePurchaseOrder } = usePurchaseOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [editData, setEditData] = useState<Partial<PurchaseOrder>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = (order.numero?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (order.termino_referencias?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setEditData({
      numero: order.numero || '',
      termino_referencias: order.termino_referencias || '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;
    const payload: Partial<PurchaseOrder> = {
      numero: (editData.numero || '').trim(),
      termino_referencias: (editData.termino_referencias || '').trim(),
    };

    if (!payload.numero) {
      alert('El código es obligatorio.');
      return;
    }

    try {
      await updatePurchaseOrder(selectedOrder.id, payload);
      setShowDetailModal(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const handleDelete = async () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;
    
    setDeleting(true);
    try {
      await deletePurchaseOrder(selectedOrder.id);
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
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
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Código o términos de referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
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
                  Términos/Referencias
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Creada el
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => {
                const fechaRaw = order.created_at || order.updated_at;
                const fechaCreacion = fechaRaw ? new Date(fechaRaw).toLocaleDateString() : '—';
                const codigo = order.numero ?? '—';
                const descripcion = order.termino_referencias ?? '—';
                return (
                  <tr 
                    key={order.id} 
                    onClick={() => handleViewOrder(order)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{codigo}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-xs text-gray-900 dark:text-white max-w-xs truncate" title={descripcion}>
                        {descripcion}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{fechaCreacion}</span>
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
              {searchTerm
                ? 'Intenta ajustar la búsqueda'
                : 'No hay órdenes de compra registradas aún'}
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
        (() => {
          const numero = editData.numero ?? selectedOrder.numero ?? '';
          const termino = editData.termino_referencias ?? selectedOrder.termino_referencias ?? '';
          const fechaCreacion = selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : '—';
          const fechaActualizacion = selectedOrder.updated_at ? new Date(selectedOrder.updated_at).toLocaleDateString() : '—';
          return (
        <div
          ref={detailModalRef}
          className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          style={{ margin: 0 }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-white" />
                <div>
                  <h2 className="text-base font-bold text-white">Detalle de Orden de Compra</h2>
                    <p className="text-xs text-blue-100">{selectedOrder.numero || 'Sin código'}</p>
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
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    name="numero"
                    value={numero}
                    onChange={handleInputChange}
                    className="w-full h-[38px] px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Términos / Referencias
                  </label>
                  <input
                    type="text"
                    name="termino_referencias"
                    value={termino}
                    onChange={handleInputChange}
                    className="w-full h-[38px] px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Creada el
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white py-1">{fechaCreacion}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Actualizada el
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white py-1">{fechaActualizacion}</p>
                </div>
              </div>
            </div>

            {/* Footer con botón eliminar y guardar */}
            <div className="flex items-center justify-between space-x-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} className="mr-2" />
                {deleting ? 'Eliminando...' : 'Eliminar'}
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
          );
        })()
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Eliminar Orden de Compra"
        message="¿Estás seguro de que deseas eliminar esta orden de compra?"
        itemName={selectedOrder?.numero}
      />
    </div>
  );
};
