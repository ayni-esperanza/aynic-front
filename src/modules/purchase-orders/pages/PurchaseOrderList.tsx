import React, { useState } from "react";
import {
  Search,
  Filter,
  Menu,
  X,
  RotateCcw,
  Download,
  XCircle,
  CheckSquare,
  Trash2,
} from "lucide-react";
import { usePurchaseOrders } from "../hooks";
import { purchaseOrderService } from "../services";
import { useAuth } from "../../../shared/hooks/useAuth";

export const PurchaseOrderList: React.FC = () => {
  const { purchaseOrders, loading, error, fetchPurchaseOrders } =
    usePurchaseOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, isAdmin } = useAuth();

  // Estado para controlar filtros móviles
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Estados para el modal de error
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredOrders = purchaseOrders.filter((order) => {
    const target = `${order.numero} ${
      order.termino_referencias || ""
    }`.toLowerCase();
    return target.includes(searchTerm.toLowerCase());
  });

  // Función para verificar si una orden puede ser eliminada
  const checkIfOrderCanBeDeleted = async (
    orderId: number
  ): Promise<boolean> => {
    try {
      const response = await purchaseOrderService.canDelete(orderId);
      return response.canDelete;
    } catch (error) {
      // Si hay error en la verificación, asumir que no se puede eliminar por seguridad
      console.error("Error verificando si se puede eliminar:", error);
      return false;
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) return;

    // Verificar primero si se puede eliminar
    const canDelete = await checkIfOrderCanBeDeleted(id);

    if (!canDelete) {
      setErrorMessage(
        "No se puede eliminar esta orden de compra porque existen registros asociados a ella. Primero debe eliminar o modificar los registros que hacen referencia a esta orden."
      );
      setShowErrorModal(true);
      return;
    }

    if (
      confirm(
        "¿Estás seguro de que deseas eliminar esta orden de compra? Esta acción no se puede deshacer."
      )
    ) {
      try {
        setIsDeleting(true);
        await purchaseOrderService.delete(id);
        await fetchPurchaseOrders();
      } catch (error: any) {
        console.error("Error al eliminar la orden de compra:", error);
        setErrorMessage("Error inesperado al eliminar la orden de compra.");
        setShowErrorModal(true);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="px-4 py-4 mx-auto w-full max-w-7xl sm:px-6 lg:px-8 sm:py-6">
          <div className="flex flex-col justify-center items-center space-y-4 h-48 sm:h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-[#18D043]/20 border-t-[#18D043]"></div>
            </div>
            <p className="text-sm font-medium text-center text-gray-600 sm:text-base">
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
        <div className="px-4 py-4 mx-auto w-full max-w-7xl sm:px-6 lg:px-8 sm:py-6">
          <div className="flex flex-col justify-center items-center space-y-4 h-48 sm:h-64">
            <div className="flex justify-center items-center w-12 h-12 bg-red-100 rounded-full sm:w-16 sm:h-16">
              <XCircle className="w-6 h-6 text-red-600 sm:w-8 sm:h-8" />
            </div>
            <div className="px-4 text-center">
              <p className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                Error al cargar las órdenes
              </p>
              <p className="mb-4 text-sm text-gray-600 sm:text-base">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-4 py-4 mx-auto w-full max-w-7xl sm:px-6 lg:px-8 sm:py-6">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header Responsive */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="flex items-center space-x-2 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
                <CheckSquare className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#18D043] flex-shrink-0" />
                <span className="truncate">Órdenes de Compra</span>
              </h1>
              <p className="mt-1 text-sm text-gray-600 sm:text-base">
                Gestiona las órdenes de compra del sistema
              </p>
            </div>

            {/* Botón de filtros móviles */}
            <div className="flex gap-2 items-center sm:hidden">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#18D043] focus:border-transparent flex-shrink-0"
              >
                {showMobileFilters ? (
                  <X size={16} className="mr-2" />
                ) : (
                  <Menu size={16} className="mr-2" />
                )}
                Filtros
              </button>
            </div>
          </div>

          {/* Filtros Responsive */}
          <div className="p-4 bg-white rounded-lg border border-gray-200 sm:p-6">
            {/* Filtros Desktop */}
            <div className="hidden sm:block">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search
                      size={20}
                      className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2"
                    />
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
                      onClick={() => {
                        /* TODO: Implementar exportación */
                      }}
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
            <div
              className={`sm:hidden ${showMobileFilters ? "block" : "hidden"}`}
            >
              <div className="space-y-4">
                <div className="space-y-3">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search
                      size={20}
                      className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2"
                    />
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
                      onClick={() => {
                        /* TODO: Implementar exportación */
                      }}
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
          <div className="p-4 bg-white rounded-lg border border-gray-200 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="flex items-center space-x-2 text-base font-semibold text-gray-900 sm:text-lg">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#18D043] flex-shrink-0" />
                <span>Lista de Órdenes</span>
              </h2>
            </div>

            {/* Tabla Desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Nº Orden
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Término y Referencias
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Creado
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {order.numero}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="max-w-xl text-sm text-gray-900 truncate"
                          title={order.termino_referencias || ""}
                        >
                          {order.termino_referencias || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(order.id)}
                            disabled={isDeleting}
                            className="text-red-600 transition-colors hover:text-red-800"
                            title="Eliminar orden de compra"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards Móviles */}
            <div className="space-y-3 lg:hidden">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {order.numero}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Orden vinculada
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>

                  <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                    {order.termino_referencias || "—"}
                  </p>

                  <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
                    <span>
                      ID:{" "}
                      <span className="font-medium text-gray-900">
                        #{order.id}
                      </span>
                    </span>
                    <span>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">&nbsp;</span>
                    <div className="flex items-center space-x-2">
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          disabled={isDeleting}
                          className="p-1 text-red-600 transition-colors hover:text-red-800"
                          title="Eliminar orden de compra"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="flex flex-col justify-center items-center space-y-4 h-48 sm:h-64">
                <div className="flex justify-center items-center w-12 h-12 bg-gray-100 rounded-full sm:w-16 sm:h-16">
                  <Filter className="w-6 h-6 text-gray-400 sm:w-8 sm:h-8" />
                </div>
                <div className="px-4 text-center">
                  <p className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                    No se encontraron órdenes
                  </p>
                  <p className="text-sm text-gray-600 sm:text-base">
                    {searchTerm
                      ? "Intenta ajustar los filtros de búsqueda"
                      : "No hay órdenes de compra registradas aún"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info pie */}
          <div className="flex justify-center items-center">
            <div className="flex flex-col items-center px-3 py-2 space-y-2 text-xs text-gray-500 bg-gray-50 rounded-full sm:flex-row sm:space-y-0 sm:space-x-4 sm:px-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-[#18D043] rounded-full flex-shrink-0"></div>
                <span>Datos en tiempo real</span>
              </div>
              <div className="hidden w-1 h-1 bg-gray-300 rounded-full sm:block"></div>
              <div className="flex items-center space-x-1">
                <span className="text-center sm:text-left">
                  Última actualización: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de error */}
      {showErrorModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-md bg-white rounded-lg">
            <div className="flex items-center mb-4 space-x-3">
              <div className="flex-shrink-0">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  No se puede eliminar
                </h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">{errorMessage}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md border border-transparent shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};