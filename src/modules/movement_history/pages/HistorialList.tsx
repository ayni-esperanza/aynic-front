import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  History,
  Users,
  Activity,
  Calendar,
  Search,
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { useToast } from "../../../components/ui/Toast";
import { useApi } from "../../../hooks/useApi";
import {
  getMovements,
  getStatistics,
  getAvailableActions,
  type MovementHistory,
  type MovementFilters,
  type MovementStatistics,
  type ActionOption,
  type MovementAction,
} from "../../../services/movementHistoryService";

// Componente para mostrar datos JSON expandibles
const JsonDataView: React.FC<{
  title: string;
  data: Record<string, any> | null;
  expanded?: boolean;
}> = ({ title, data, expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  if (!data) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-800"
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>{title}</span>
      </button>

      {isExpanded && (
        <div className="p-3 mt-2 border rounded-lg bg-gray-50">
          <pre className="overflow-x-auto text-xs text-gray-800 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Componente para cada registro de movimiento
const MovementHistoryItem: React.FC<{
  movement: MovementHistory;
}> = ({ movement }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getActionIcon = (action: MovementAction) => {
    const icons: Record<MovementAction, string> = {
      create: "➕",
      update: "✏️",
      delete: "🗑️",
      restore: "🔄",
      status_change: "🔄",
      image_upload: "📤",
      image_replace: "🔄",
      image_delete: "🗑️",
      location_change: "📍",
      company_change: "🏢",
      maintenance: "🔧",
    };
    return icons[action] || "📝";
  };

  const getActionColor = (
    action: MovementAction
  ): "success" | "primary" | "danger" | "warning" | "secondary" => {
    const colors: Record<
      MovementAction,
      "success" | "primary" | "danger" | "warning" | "secondary"
    > = {
      create: "success",
      update: "primary",
      delete: "danger",
      restore: "warning",
      status_change: "primary",
      image_upload: "success",
      image_replace: "warning",
      image_delete: "danger",
      location_change: "primary",
      company_change: "primary",
      maintenance: "warning",
    };
    return colors[action] || "secondary";
  };

  return (
    <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {/* Icono de acción */}
          <div
            className={`p-2 rounded-lg bg-${getActionColor(
              movement.action
            )}-100`}
          >
            <span className="text-lg">{getActionIcon(movement.action)}</span>
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center space-x-2">
              <Badge variant={getActionColor(movement.action)}>
                {movement.action_label}
              </Badge>
              {movement.record_code && (
                <span className="text-sm text-gray-500">
                  {movement.record_code}
                </span>
              )}
            </div>

            {/* Descripción */}
            <p className="mt-1 font-medium text-gray-900">
              {movement.description}
            </p>

            {/* Metadatos */}
            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Users size={14} />
                <span>{movement.user_display_name}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{movement.formatted_date}</span>
              </span>
              {movement.ip_address && (
                <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                  IP: {movement.ip_address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botón para ver detalles */}
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            icon={showDetails ? EyeOff : Eye}
          >
            {showDetails ? "Ocultar" : "Ver"} datos
          </Button>
        </div>
      </div>

      {/* Detalles expandibles */}
      {showDetails && (
        <div className="pt-4 mt-4 border-t border-gray-200">
          <JsonDataView
            title="Ver datos eliminados"
            data={movement.previous_values}
          />
          <JsonDataView
            title="Ver datos completos"
            data={movement.new_values}
          />

          {movement.changed_fields && movement.changed_fields.length > 0 && (
            <div className="mt-3">
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                Campos modificados:
              </h4>
              <div className="flex flex-wrap gap-1">
                {movement.changed_fields.map((field, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {movement.additional_metadata && (
            <JsonDataView
              title="Metadatos adicionales"
              data={movement.additional_metadata}
            />
          )}

          {movement.user_agent && (
            <div className="mt-3">
              <h4 className="mb-1 text-sm font-medium text-gray-600">
                Navegador:
              </h4>
              <p className="p-2 font-mono text-xs text-gray-500 rounded bg-gray-50">
                {movement.user_agent}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente principal
export const HistorialList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { error: showError } = useToast();

  // Estado local para filtros
  const [filters, setFilters] = useState<MovementFilters>({
    search: searchParams.get("search") || "",
    action: (searchParams.get("action") as MovementAction) || undefined,
    user_id: searchParams.get("user_id") || undefined,
    date_from: searchParams.get("date_from") || "",
    date_to: searchParams.get("date_to") || "",
    page: 1,
    limit: 10,
    sortBy: "action_date",
    sortOrder: "DESC",
  });

  // Estados locales
  const [statistics, setStatistics] = useState<MovementStatistics | null>(null);
  const [actionOptions, setActionOptions] = useState<ActionOption[]>([]);
  const [userOptions, setUserOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // ✅ SOLUCIÓN 1: Crear función estable que no cambie en cada render
  const stableGetMovements = useMemo(() => {
    return () => getMovements(filters);
  }, [filters]); // Solo se recrea cuando cambian los filtros

  // ✅ SOLUCIÓN 2: useApi SIN immediate, sin dependencias problemáticas
  const {
    data: movementsData,
    loading,
    error,
    execute: executeGetMovements,
  } = useApi(stableGetMovements, {
    immediate: false, // ← IMPORTANTE: No ejecutar automáticamente
    onError: (error) => showError("Error", error),
  });

  // ✅ SOLUCIÓN 3: useEffect que solo depende de filters, NO de executeGetMovements
  useEffect(() => {
    executeGetMovements();
  }, [filters]); // ← Solo filters, sin executeGetMovements

  // ✅ SOLUCIÓN 4: Cargar datos iniciales por separado
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar estadísticas
        const stats = await getStatistics();
        setStatistics(stats);

        // Cargar opciones de acciones
        const actions = await getAvailableActions();
        setActionOptions(actions);

        // Crear opciones de usuarios desde las estadísticas
        if (stats.byUser.length > 0) {
          const users = stats.byUser.map(
            (user: { username: string; count: number }) => ({
              value: user.username,
              label: user.username,
            })
          );
          setUserOptions(users);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []); // ← Solo una vez al montar el componente

  // ✅ SOLUCIÓN 5: Funciones de manejo estables
  const handleFilterChange = useCallback(
    (newFilters: Partial<MovementFilters>) => {
      const updatedFilters = { ...filters, ...newFilters, page: 1 };
      setFilters(updatedFilters);

      // Actualizar URL
      const params = new URLSearchParams();
      if (updatedFilters.search) params.set("search", updatedFilters.search);
      if (updatedFilters.action) params.set("action", updatedFilters.action);
      if (updatedFilters.user_id) params.set("user_id", updatedFilters.user_id);
      if (updatedFilters.date_from)
        params.set("date_from", updatedFilters.date_from);
      if (updatedFilters.date_to) params.set("date_to", updatedFilters.date_to);
      setSearchParams(params);
    },
    [filters, setSearchParams]
  );

  const handleClearFilters = useCallback(() => {
    const clearedFilters: MovementFilters = {
      page: 1,
      limit: 10,
      sortBy: "action_date",
      sortOrder: "DESC",
    };
    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const handlePageChange = useCallback(
    (page: number) => {
      const updatedFilters = { ...filters, page };
      setFilters(updatedFilters);
    },
    [filters]
  );

  // ✅ SOLUCIÓN 6: Función refresh estable (solo recargar datos actuales)
  const refresh = useCallback(() => {
    executeGetMovements();
  }, [executeGetMovements]);

  // ✅ SOLUCIÓN 7: Función para exportar datos
  const handleExport = useCallback(async () => {
    try {
      // Obtener todos los datos sin paginación para exportar
      const exportData = await getMovements({
        ...filters,
        page: 1,
        limit: 10000, // Obtener muchos registros para exportar
      });

      // Crear CSV
      const headers = [
        "ID",
        "Código",
        "Acción",
        "Descripción",
        "Fecha",
        "Usuario",
        "IP",
      ];

      const csvData = exportData.data.map((movement) => [
        movement.id,
        movement.record_code || "",
        movement.action_label,
        movement.description.replace(/,/g, ";"), // Reemplazar comas para CSV
        movement.formatted_date,
        movement.user_display_name,
        movement.ip_address || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.join(",")),
      ].join("\n");

      // Descargar archivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `historial-movimientos-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showError("Éxito", "Archivo exportado correctamente");
    } catch (error) {
      showError("Error", "No se pudo exportar el archivo");
    }
  }, [filters, showError]);

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Extraer datos de la respuesta
  const movements = movementsData?.data || [];
  const pagination = movementsData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
          <History className="w-8 h-8 text-[#18D043]" />
          <span>Historial de Movimientos</span>
        </h1>
        <p className="text-gray-600">
          Registro completo y detallado de todas las acciones realizadas en las
          líneas de vida
        </p>
      </div>

      {/* Estadísticas */}
      {statistics && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Movimientos
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.total}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.today}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.thisWeek}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Usuarios Activos
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statistics.activeUsers}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card padding="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {/* Búsqueda */}
            <Input
              placeholder="Buscar en descripciones..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              icon={Search}
            />

            {/* Acción */}
            <Select
              value={filters.action || ""}
              onChange={(e) =>
                handleFilterChange({
                  action: (e.target.value as MovementAction) || undefined,
                })
              }
              options={[
                { value: "", label: "Todas las acciones" },
                ...actionOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
            />

            {/* Usuario */}
            <Select
              value={filters.user_id || ""}
              onChange={(e) =>
                handleFilterChange({ user_id: e.target.value || undefined })
              }
              options={[
                { value: "", label: "Todos los usuarios" },
                ...userOptions,
              ]}
            />

            {/* Fecha Desde */}
            <Input
              type="date"
              value={filters.date_from || ""}
              onChange={(e) =>
                handleFilterChange({ date_from: e.target.value })
              }
              max={today}
            />

            {/* Fecha Hasta */}
            <Input
              type="date"
              value={filters.date_to || ""}
              onChange={(e) => handleFilterChange({ date_to: e.target.value })}
              max={today}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <Button
                onClick={() => executeGetMovements()}
                icon={Filter}
                disabled={loading}
              >
                Filtrar
              </Button>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                icon={RotateCcw}
                disabled={loading}
              >
                Limpiar Filtros
              </Button>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={refresh}
                icon={RotateCcw}
                disabled={loading}
                size="sm"
              >
                Recargar
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                icon={Download}
                size="sm"
                disabled={loading}
              >
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de movimientos */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
            <Activity className="w-5 h-5 text-[#18D043]" />
            <span>Registro de Actividades</span>
          </h2>
          {/* Eliminado: botón de exportar duplicado */}
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#18D043]/20 border-t-[#18D043]"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#18D043] animate-ping"></div>
            </div>
            <p className="font-medium text-gray-600">Cargando movimientos...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-center">
              <p className="mb-2 text-lg font-medium text-gray-900">
                Error al cargar el historial
              </p>
              <p className="mb-4 text-gray-600">{error}</p>
              <Button onClick={refresh} variant="outline">
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && movements.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <span className="text-2xl">📄</span>
            </div>
            <div className="text-center">
              <p className="mb-2 text-lg font-medium text-gray-900">
                No hay movimientos registrados
              </p>
              <p className="text-gray-600">
                No se encontraron registros que coincidan con los criterios de
                búsqueda.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && movements.length > 0 && (
          <>
            <div className="space-y-4">
              {movements.map((movement) => (
                <MovementHistoryItem key={movement.id} movement={movement} />
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col items-center justify-between px-6 py-4 mt-6 space-y-4 bg-white border border-gray-200 shadow-sm sm:flex-row sm:space-y-0 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="px-3 py-2 text-sm text-gray-700 rounded-lg bg-gray-50">
                    <span className="font-medium">
                      {Math.min(
                        (pagination.currentPage - 1) * pagination.itemsPerPage +
                          1,
                        pagination.totalItems
                      )}{" "}
                      -{" "}
                      {Math.min(
                        pagination.currentPage * pagination.itemsPerPage,
                        pagination.totalItems
                      )}
                    </span>
                    <span className="text-gray-500"> de </span>
                    <span className="font-medium">{pagination.totalItems}</span>
                    <span className="text-gray-500"> registros</span>
                  </div>

                  <div className="px-3 py-2 text-sm text-gray-500 rounded-lg bg-blue-50">
                    Página{" "}
                    <span className="font-medium text-blue-600">
                      {pagination.currentPage}
                    </span>{" "}
                    de{" "}
                    <span className="font-medium text-blue-600">
                      {pagination.totalPages}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Anterior
                  </Button>

                  {/* Números de página */}
                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        const pageNumber =
                          Math.max(
                            1,
                            Math.min(
                              pagination.totalPages - 4,
                              pagination.currentPage - 2
                            )
                          ) + i;

                        if (pageNumber > pagination.totalPages) return null;

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${
                              pageNumber === pagination.currentPage
                                ? "bg-gradient-to-r from-[#18D043] to-[#16a34a] text-white shadow-lg shadow-[#18D043]/25"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Info pie */}
      <div className="flex items-center justify-center">
        <div className="flex items-center px-4 py-2 space-x-4 text-xs text-gray-500 rounded-full bg-gray-50">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-[#18D043] rounded-full"></div>
            <span>Datos en tiempo real</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <span>Última actualización: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
