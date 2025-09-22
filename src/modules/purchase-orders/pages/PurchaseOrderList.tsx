import React, { useState } from 'react';
import { Search, Filter, Menu, X, RotateCcw, Download, XCircle, CheckSquare } from 'lucide-react';
import { usePurchaseOrders } from '../hooks';
import { PurchaseOrder } from '../types';

export const PurchaseOrderList: React.FC = () => {
  const { purchaseOrders, loading, error } = usePurchaseOrders();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para controlar filtros móviles
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredOrders = purchaseOrders.filter(order => {
    const target = `${order.numero} ${order.termino_referencias || ''}`.toLowerCase();
    return target.includes(searchTerm.toLowerCase());
  });

  const handleClearFilters = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-[#18D043]/20 border-t-[#18D043]"></div>
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-600 text-center">
              Cargando órdenes de compra...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
            <div className="text-center px-4">
              <p className="mb-2 text-base sm:text-lg font-medium text-gray-900">
                Error al cargar las órdenes
              </p>
              <p className="mb-4 text-sm sm:text-base text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="flex items-center space-x-2 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                <CheckSquare className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#18D043] flex-shrink-0" />
                <span className="truncate">Órdenes de Compra</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Gestiona las órdenes de compra del sistema
              </p>
            </div>

            {/* Botón de filtros móviles */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#18D043] focus:border-transparent flex-shrink-0"
              >
                {showMobileFilters ? <X size={16} className="mr-2" /> : <Menu size={16} className="mr-2" />}
                Filtros
              </button>
            </div>
          </div>

          {/* Filtros Responsive */}
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            {/* Filtros Desktop */}
            <div className="hidden sm:block">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Código, descripción o proveedor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent"
                    />
                  </div>

                  {/* Filtros simplificados sin enums */}
                  <div />
                  <div />
                </div>

                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={handleClearFilters}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#18D043] focus:border-transparent w-full sm:w-auto justify-center"
                    >
                      <RotateCcw size={16} className="mr-2" />
                      Limpiar Filtros
                    </button>
                  </div>

                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#18D043] focus:border-transparent w-full sm:w-auto justify-center"
                    >
                      <RotateCcw size={16} className="mr-2" />
                      Recargar
                    </button>
                    <button
                      onClick={() => {/* TODO: Implementar exportación */}}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#18D043] focus:border-transparent w-full sm:w-auto justify-center"
                    >
                      <Download size={16} className="mr-2" />
                      Exportar CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros Móviles - Simplificados */}
            <div className={`sm:hidden ${showMobileFilters ? 'block' : 'hidden'}`}>
              <div className="space-y-4">
                <div className="space-y-3">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Código, descripción o proveedor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18D043] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleClearFilters}
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#18D043] focus:border-transparent"
                    >
                      <RotateCcw size={16} className="mr-2" />
                      Limpiar
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#18D043] focus:border-transparent"
                    >
                      <RotateCcw size={16} className="mr-2" />
                      Recargar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => {/* TODO: Implementar exportación */}}
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#18D043] focus:border-transparent"
                    >
                      <Download size={16} className="mr-2" />
                      Exportar CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de órdenes */}
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-gray-900">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#18D043] flex-shrink-0" />
                <span>Lista de Órdenes</span>
              </h2>
            </div>

            {/* Tabla Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Orden</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Término y Referencias</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{order.numero}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xl truncate" title={order.termino_referencias || ''}>
                          {order.termino_referencias || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards Móviles */}
            <div className="lg:hidden space-y-3">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{order.numero}</h3>
                      <p className="text-xs text-gray-500 mt-1">Orden vinculada</p>
                    </div>
                    <span className="text-xs text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{order.termino_referencias || '—'}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>ID: <span className="font-medium text-gray-900">#{order.id}</span></span>
                    <span>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">&nbsp;</span>
                    <div className="flex items-center space-x-2" />
                  </div>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-4">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full">
                  <Filter className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <div className="text-center px-4">
                  <p className="mb-2 text-base sm:text-lg font-medium text-gray-900">
                    No se encontraron órdenes
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    {searchTerm
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'No hay órdenes de compra registradas aún'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info pie */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 px-3 sm:px-4 py-2 text-xs text-gray-500 rounded-full bg-gray-50">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-[#18D043] rounded-full flex-shrink-0"></div>
                <span>Datos en tiempo real</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center space-x-1">
                <span className="text-center sm:text-left">Última actualización: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};