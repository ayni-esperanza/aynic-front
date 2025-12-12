import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle, ShoppingCart } from 'lucide-react';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import { usePurchaseOrders } from '../hooks';
import { CreatePurchaseOrderData } from '../types';

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
  const { createPurchaseOrder: defaultCreatePurchaseOrder, loading } = usePurchaseOrders();
  const createPurchaseOrder = onCreatePurchaseOrder || defaultCreatePurchaseOrder;
  const modalRef = useModalClose({ isOpen, onClose });
  const [formData, setFormData] = useState<{ numero: string; termino_referencias: string }>(
    { numero: '', termino_referencias: '' }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ numero: '', termino_referencias: '' });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.numero.trim()) {
      newErrors.numero = 'El número es requerido';
    } else if (formData.numero.length > 50) {
      newErrors.numero = 'El número debe tener máximo 50 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await createPurchaseOrder({
        numero: formData.numero,
        termino_referencias: formData.termino_referencias || null,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al crear la orden de compra:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      style={{ margin: 0 }}
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-sm font-bold text-white">Nueva Orden de Compra</h2>
              <p className="text-xs text-blue-100">Crea una nueva orden de compra</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white transition-colors hover:text-blue-200" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                maxLength={50}
                onChange={handleInputChange}
                className={`w-full h-[38px] px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.numero ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="OC-2024-001"
              />
              {errors.numero && (
                <p className="mt-0.5 text-xs text-red-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  {errors.numero}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Término / Referencias</label>
              <textarea
                name="termino_referencias"
                value={formData.termino_referencias}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                placeholder="Notas o referencias de la orden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-200 dark:border-gray-700">
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
