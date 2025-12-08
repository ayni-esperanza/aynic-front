import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle, ShoppingCart } from 'lucide-react';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import { usePurchaseOrders } from '../hooks';
import { CreatePurchaseOrderData, PurchaseOrderType } from '../types';

interface PurchaseOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCreatePurchaseOrder?: (data: CreatePurchaseOrderData) => Promise<any>;
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onCreatePurchaseOrder,
}) => {
  const hookResult = usePurchaseOrders();
  const createPurchaseOrder = onCreatePurchaseOrder || hookResult.createPurchaseOrder;
  const loading = hookResult.loading;
  const modalRef = useModalClose({ isOpen, onClose });
  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    codigo: '',
    descripcion: '',
    tipo: PurchaseOrderType.LINEA_VIDA,
    monto_total: 0,
    proveedor: '',
    observaciones: '',
    fecha_requerida: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        codigo: '',
        descripcion: '',
        tipo: PurchaseOrderType.LINEA_VIDA,
        monto_total: 0,
        proveedor: '',
        observaciones: '',
        fecha_requerida: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monto_total' ? parseFloat(value) || 0 : value,
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (formData.monto_total <= 0) {
      newErrors.monto_total = 'El monto debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createPurchaseOrder(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al crear la orden de compra:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={modalRef} className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50" style={{ margin: 0 }}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-sm font-bold text-white">Nueva Orden de Compra</h2>
              <p className="text-xs text-blue-100">Crea una nueva orden de compra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white transition-colors hover:text-blue-200"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Código */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleInputChange}
              className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.codigo ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="OC-2024-001"
            />
            {errors.codigo && (
              <p className="mt-0.5 text-xs text-red-600 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                {errors.codigo}
              </p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={PurchaseOrderType.LINEA_VIDA}>Línea de Vida</option>
              <option value={PurchaseOrderType.EQUIPOS}>Equipos</option>
              <option value={PurchaseOrderType.ACCESORIOS}>Accesorios</option>
              <option value={PurchaseOrderType.SERVICIOS}>Servicios</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.descripcion ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Describe detalladamente lo que se necesita comprar..."
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.descripcion}
              </p>
            )}
          </div>

          {/* Monto Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monto Total <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                name="monto_total"
                value={formData.monto_total}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.monto_total ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.monto_total && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.monto_total}
              </p>
            )}
          </div>

          {/* Fecha Requerida */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Requerida
            </label>
            <input
              type="date"
              name="fecha_requerida"
              value={formData.fecha_requerida}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proveedor
            </label>
            <input
              type="text"
              name="proveedor"
              value={formData.proveedor}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Nombre del proveedor"
            />
          </div>

          {/* Observaciones */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Observaciones adicionales..."
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center"
          >
            <X size={16} className="mr-1.5" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-[#18D043] text-white rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save size={16} className="mr-1.5" />
            {loading ? 'Guardando...' : 'Guardar Orden'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};
