import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  Activity,
  Calendar,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Download,
  Filter,
} from "lucide-react";
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useToast } from '../../../shared/components/ui/Toast';
import { SearchableSelect } from '../../../shared/components/ui/SearchableSelect';
import { movementHistoryService } from "../services/movementHistoryService";
import type {
  MovementHistory,
  MovementFilters,
  MovementStatistics,
  ActionOption,
  MovementAction,
} from "../types/movement";

// Componente para mostrar datos JSON expandibles
const JsonDataView: React.FC<{
  title: string;
  data: Record<string, unknown> | null;
  expanded?: boolean;
}> = ({ title, data, expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  if (!data) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>{title}</span>
      </button>

      {isExpanded && (
        <div className="p-3 mt-2 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
          <pre className="overflow-x-auto text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
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
    <div className="p-4 transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md">
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
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {movement.record_code}
                </span>
              )}
            </div>

            {/* Descripción */}
            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {movement.description}
            </p>

            {/* Metadatos */}
            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <Users size={14} />
                <span>{movement.user_display_name}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{movement.formatted_date}</span>
              </span>
              {movement.ip_address && (
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded">
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
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
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
              <h4 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Campos modificados:
              </h4>
              <div className="flex flex-wrap gap-1">
                {movement.changed_fields.map((field: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900 rounded"
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
              <h4 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                Navegador:
              </h4>
              <p className="p-2 font-mono text-xs text-gray-500 dark:text-gray-400 rounded bg-gray-50 dark:bg-gray-700">
                {movement.user_agent}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente de paginación FUERA del componente principal
interface PaginationComponentProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  loading: boolean;
  handlePageChange: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = React.memo(
  ({ pagination, loading, handlePageChange }) => {
    if (pagination.totalPages <= 1) return null;

    // Calcular rango de páginas a mostrar (máximo 10)
    const maxVisiblePages = 10;
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar si no hay suficientes páginas al final
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col items-center justify-between px-3 sm:px-4 py-3 mt-6 space-y-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-t border-gray-200 dark:border-gray-600 shadow-sm sm:flex-row sm:space-y-0 rounded-lg">
        {/* Información de registros */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:space-x-3">
          <div className="px-2 sm:px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
            <span className="font-semibold">
              {Math.min(
                (pagination.currentPage - 1) * 10 + 1,
                pagination.totalItems
              )}
            </span>
            <span className="text-gray-500 dark:text-gray-400"> - </span>
            <span className="font-semibold">
              {Math.min(pagination.currentPage * 10, pagination.totalItems)}
            </span>
            <span className="text-gray-500 dark:text-gray-400"> de </span>
            <span className="font-semibold">{pagination.totalItems}</span>
          </div>

          <div className="px-2 sm:px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <span className="text-gray-500 dark:text-gray-400">Pág </span>
            <span className="font-semibold text-[#16a34a] dark:text-[#18D043]">
              {pagination.currentPage}
            </span>
            <span className="text-gray-500 dark:text-gray-400"> / </span>
            <span className="font-semibold text-[#16a34a] dark:text-[#18D043]">
              {pagination.totalPages}
            </span>
          </div>
        </div>

        {/* Controles de paginación */}
        <div className="flex items-center gap-1 sm:space-x-2">
          {/* Botón Anterior */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || loading}
            className="border-gray-300 dark:border-gray-600 hover:border-[#18D043] hover:text-[#18D043] disabled:opacity-50 disabled:cursor-not-allowed text-xs h-8"
          >
            Anterior
          </Button>

          {/* Números de página */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Primera página si no está visible */}
            {startPage > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={loading}
                  className="px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className="px-1 text-xs text-gray-500 dark:text-gray-400">...</span>
                )}
              </>
            )}

            {/* Páginas visibles */}
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                disabled={loading}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 disabled:opacity-50 ${
                  pageNumber === pagination.currentPage
                    ? "bg-gradient-to-r from-[#18D043] to-[#16a34a] text-white shadow-md shadow-[#18D043]/25 scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            {/* Última página si no está visible */}
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className="px-1 text-xs text-gray-500 dark:text-gray-400">...</span>
                )}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={loading}
                  className="px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          {/* Botón Siguiente */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={
              pagination.currentPage === pagination.totalPages || loading
            }
            className="border-gray-300 dark:border-gray-600 hover:border-[#18D043] hover:text-[#18D043] disabled:opacity-50 disabled:cursor-not-allowed text-xs h-8"
          >
            Siguiente
          </Button>
        </div>
      </div>
    );
  }
);

// Componente principal
export const HistorialList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useToast();

  // ESTADO CON FILTROS SEPARADOS: rol y usuario
  const [filters, setFilters] = useState<MovementFilters>({
    search: searchParams.get("search") || "",
    action: (searchParams.get("action") as MovementAction) || undefined,
    username: searchParams.get("username") || undefined,
    date_from: searchParams.get("date_from") || "",
    date_to: searchParams.get("date_to") || "",
    page: 1,
    limit: 10, // 10 elementos por página
    sortBy: "action_date",
    sortOrder: "DESC",
  });

  // Estados para datos iniciales
  const [statistics, setStatistics] = useState<MovementStatistics | null>(null);
  const [actionOptions, setActionOptions] = useState<ActionOption[]>([]);
  const [usernameOptions, setUsernameOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // CONTROL MANUAL COMPLETO 
  const [movementsData, setMovementsData] = useState<{
    data: MovementHistory[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función de ejecución manual CONTROLADA - recibe filtros específicos
  const executeGetMovements = useCallback(
    async (filtersToUse: MovementFilters) => {
      setLoading(true);
      setError(null);

      try {
        const result = await movementHistoryService.getMovements(filtersToUse);
        setMovementsData(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Movement fetch error:", errorMessage);
        showError("Error", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  // CARGAR DATOS INICIALES UNA SOLA VEZ
  useEffect(() => {
    const loadInitialData = async () => {
      if (isInitialized) return;

      try {
        // Cargar estadísticas
        const stats = await movementHistoryService.getStatistics();
        setStatistics(stats);

        // Cargar opciones de acciones
        const actions = await movementHistoryService.getAvailableActions();
        setActionOptions(actions);

        // Cargar usernames únicos
        const usernames = await movementHistoryService.getUniqueUsernames();
        setUsernameOptions(usernames);

        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading initial data:", error);
        showError("Error", "Error al cargar datos iniciales");
        setIsInitialized(true);
      }
    };

    loadInitialData();
  }, [showError]);

  // FUNCIONES DE MANEJO - Solo ejecutan cuando el usuario hace clic
  const handleFilterChange = useCallback(
    (field: string, value: string) => {
      const newFilters = { ...filters, [field]: value || undefined, page: 1 };
      setFilters(newFilters);

      // Actualizar URL
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, val]) => {
        if (
          val &&
          val !== "" &&
          key !== "page" &&
          key !== "limit" &&
          key !== "sortBy" &&
          key !== "sortOrder"
        ) {
          params.set(key, String(val));
        }
      });
      setSearchParams(params);
    },
    [filters, setSearchParams]
  );

  // Ejecutar automáticamente cada vez que cambien los filtros
  useEffect(() => {
    if (!isInitialized) return;
    executeGetMovements(filters);
  }, [filters, isInitialized, executeGetMovements]);

  // Función para cambiar página CON ejecución inmediata de filtros correctos
  const handlePageChangeAndSearch = useCallback(
    (page: number) => {
      const newFilters = { ...filters, page };
      setFilters(newFilters);
    },
    [filters]
  );

  const handleRetry = useCallback(() => {
    if (!isInitialized) return;
    executeGetMovements(filters);
  }, [executeGetMovements, filters, isInitialized]);

  const handleExport = useCallback(async () => {
    try {
      const exportFilters = { ...filters, page: 1, limit: 100 };
      const exportData = await movementHistoryService.getMovements(exportFilters);

      if (exportData.pagination.totalItems > 100) {
        showError(
          "Información",
          `Se exportaron los primeros 100 registros de ${exportData.pagination.totalItems} total.`
        );
      }

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
        movement.description.replace(/,/g, ";"),
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

      success("Éxito", "Archivo exportado correctamente");
    } catch (error) {
      console.error("Export error:", error);
      showError(
        "Error",
        `No se pudo exportar: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }, [filters, showError, success]);

  // Obtener fecha de hoy
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
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Historial de Actividades
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Registro completo y detallado de todas las acciones realizadas en las
            líneas de vida
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          icon={Download}
          size="sm"
          disabled={loading || !isInitialized}
          className="self-start"
        >
          Exportar CSV
        </Button>
      </div>

      {/* Estadísticas */}
      {statistics && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Movimientos
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {statistics.total}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hoy</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {statistics.today}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Esta Semana</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {statistics.thisWeek}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Usuarios Activos
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {statistics.activeUsers}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Separador */}
      {statistics && <div className="border-t border-gray-200 dark:border-gray-700" />}

      {/* FILTROS CON ROL Y USUARIO */}
      <Card padding="sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              <Filter className="w-4 h-4 text-[#18D043]" />
              Filtros rápidos
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3 lg:grid-cols-5">
            {/* Búsqueda */}
            <div>
              <label className="block mb-0.5 text-[10px] font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                Buscar
              </label>
              <Input
                placeholder="Descripción, código o usuario"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Filtro por Usuario */}
            <div>
              <label className="block mb-0.5 text-[10px] font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                Usuario
              </label>
              <SearchableSelect
                options={[
                  "Todos los usuarios",
                  ...usernameOptions.map((option) => option.value),
                ]}
                value={filters.username ? filters.username : "Todos los usuarios"}
                onChange={(value) =>
                  handleFilterChange(
                    "username",
                    value === "Todos los usuarios" ? "" : value
                  )
                }
                placeholder="Filtrar por usuario"
                size="compact"
                className="text-sm !h-9 !min-h-9"
              />
            </div>

            {/* Acción */}
            <div>
              <label className="block mb-0.5 text-[10px] font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                Acción
              </label>
              <Select
                value={filters.action || ""}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                options={[
                  { value: "", label: "Todas las acciones" },
                  ...actionOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  })),
                ]}
                className="h-9 text-sm"
              />
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block mb-0.5 text-[10px] font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                Desde
              </label>
              <Input
                type="date"
                value={filters.date_from || ""}
                onChange={(e) =>
                  handleFilterChange("date_from", e.target.value)
                }
                max={today}
                className="h-9 text-sm"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block mb-0.5 text-[10px] font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                Hasta
              </label>
              <Input
                type="date"
                value={filters.date_to || ""}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                max={today}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Separador */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Lista de movimientos */}
      <Card padding="md">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#18D043]/20 border-t-[#18D043]"></div>
            </div>
            <p className="ml-4 font-medium text-gray-600 dark:text-gray-300">
              Cargando movimientos...
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-center">
              <p className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Error al cargar el historial
              </p>
              <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
              <Button onClick={handleRetry} variant="outline">
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && movements.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full">
              <span className="text-2xl">📄</span>
            </div>
            <div className="text-center">
              <p className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                No hay movimientos registrados
              </p>
              <p className="text-gray-600 dark:text-gray-400">
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

            {/* Paginación usa handlePageChangeAndSearch */}
            <PaginationComponent
              pagination={pagination}
              loading={loading}
              handlePageChange={handlePageChangeAndSearch}
            />
          </>
        )}
      </Card>
    </div>
  );
};
