import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, AlertCircle } from 'lucide-react';
import { usePurchaseOrders } from '../hooks';
import { CreatePurchaseOrderData, PurchaseOrderType } from '../types';

export const PurchaseOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { createPurchaseOrder, loading } = usePurchaseOrders();
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
      navigate('/ordenes-compra');
    } catch (error) {
      console.error('Error al crear la orden de compra:', error);
    }
  };

  const handleCancel = () => {
    navigate('/ordenes-compra');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Orden de Compra</h1>
          <p className="text-gray-600">Crea una nueva orden de compra para el sistema</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent ${
                errors.codigo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="OC-2024-001"
            />
            {errors.codigo && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.codigo}
              </p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent"
            >
              <option value={PurchaseOrderType.LINEA_VIDA}>Línea de Vida</option>
              <option value={PurchaseOrderType.EQUIPOS}>Equipos</option>
              <option value={PurchaseOrderType.ACCESORIOS}>Accesorios</option>
              <option value={PurchaseOrderType.SERVICIOS}>Servicios</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent ${
                errors.descripcion ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe detalladamente lo que se necesita comprar..."
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.descripcion}
              </p>
            )}
          </div>

          {/* Monto Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Total <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="monto_total"
                value={formData.monto_total}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent ${
                  errors.monto_total ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.monto_total && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.monto_total}
              </p>
            )}
          </div>

          {/* Fecha Requerida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Requerida
            </label>
            <input
              type="date"
              name="fecha_requerida"
              value={formData.fecha_requerida}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent"
            />
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor
            </label>
            <input
              type="text"
              name="proveedor"
              value={formData.proveedor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent"
              placeholder="Nombre del proveedor"
            />
          </div>

          {/* Observaciones */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent"
              placeholder="Observaciones adicionales..."
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <X size={20} className="mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#18D043] text-white rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save size={20} className="mr-2" />
            {loading ? 'Guardando...' : 'Guardar Orden'}
          </button>
        </div>
      </form>
    </div>
  );
};
