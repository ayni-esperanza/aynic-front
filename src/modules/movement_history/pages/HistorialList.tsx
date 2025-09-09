import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  History,
  Users,
  Activity,
  Calendar,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Download,
  Filter,
  Menu,
  X,
} from "lucide-react";
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useToast } from '../../../shared/components/ui/Toast';
import { SearchableSelect } from '../../../shared/components/ui/SearchableSelect';
import {
  movementHistoryService,
  type MovementHistory,
  type MovementFilters,
  type MovementStatistics,
  type ActionOption,
  type MovementAction,
} from "../services/movementHistoryService";

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
      {/* Badge */}
      <div className="mb-2">
        <Badge variant={getActionColor(movement.action)}>
          {movement.action_label}
        </Badge>
      </div>

      {/* Descripción */}
      <div className="mb-3">
        <p className="font-medium text-gray-900">
          {movement.description}
        </p>
      </div>

      {/* IP Address */}
      {movement.ip_address && (
        <div className="mb-2 text-sm text-gray-500">
          <strong>IP:</strong> {movement.ip_address.replace(/^::ffff:/, '')}
        </div>
      )}

      {/* Botón para ver detalles */}
      <div className="mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          icon={showDetails ? EyeOff : Eye}
        >
          {showDetails ? "Ocultar" : "Ver"} datos
        </Button>
      </div>

      {/* Usuario */}
      <div className="mb-2 text-sm text-gray-500">
        <strong>Usuario:</strong> {movement.user_display_name}
      </div>

      {/* Fecha */}
      <div className="mb-2 text-sm text-gray-500">
        <strong>Fecha:</strong> {movement.formatted_date}
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
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-3 sm:py-4 mt-4 sm:mt-6 bg-white border border-gray-200 shadow-sm rounded-lg">
        {/* Información de registros */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 rounded-md bg-gray-50 text-center sm:text-left">
            <span className="font-medium">
              {Math.min(
                (pagination.currentPage - 1) * 10 + 1,
                pagination.totalItems
              )}{" "}
              - {Math.min(pagination.currentPage * 10, pagination.totalItems)}
            </span>
            <span className="text-gray-500"> de </span>
            <span className="font-medium">{pagination.totalItems}</span>
            <span className="text-gray-500"> registros</span>
          </div>

          <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 rounded-md bg-blue-50 text-center sm:text-left">
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

        {/* Controles de paginación */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          {/* Botón Anterior */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || loading}
            className="w-full sm:w-auto border-gray-300 hover:border-[#18D043] hover:text-[#18D043] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Anterior</span>
            <span className="sm:hidden">← Anterior</span>
          </Button>

          {/* Números de página */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Primera página si no está visible */}
            {startPage > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={loading}
                  className="px-2 py-1.5 text-xs font-medium text-gray-700 transition-all duration-200 rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className="px-1 text-xs text-gray-500">...</span>
                )}
              </>
            )}

            {/* Páginas visibles */}
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                disabled={loading}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 disabled:opacity-50 ${pageNumber === pagination.currentPage
                    ? "bg-[#18D043] text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {pageNumber}
              </button>
            ))}

            {/* Última página si no está visible */}
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className="px-1 text-xs text-gray-500">...</span>
                )}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={loading}
                  className="px-2 py-1.5 text-xs font-medium text-gray-700 transition-all duration-200 rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          {/* Indicador de página en responsivo */}
          <div className="md:hidden flex items-center justify-center">
            <span className="text-xs text-gray-500">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
          </div>

          {/* Botón Siguiente */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={
              pagination.currentPage === pagination.totalPages || loading
            }
            className="w-full sm:w-auto border-gray-300 hover:border-[#18D043] hover:text-[#18D043] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <span className="sm:hidden">Siguiente →</span>
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

  // Estado para controlar filtros móviles
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ESTADO CON FILTROS SEPARADOS
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

  // Función de ejecución manual CONTROLADA - acepta filtros específicos
  const executeGetMovements = useCallback(
    async (customFilters?: MovementFilters) => {
      if (loading) return; // Prevenir ejecuciones múltiples

      setLoading(true);
      setError(null);

      try {
        const filtersToUse = customFilters || filters;
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
    [filters, loading, showError]
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

  // Esta función SI ejecuta la búsqueda cuando el usuario hace clic en "Buscar"
  const handleSearch = useCallback(() => {
    if (!isInitialized) return;
    executeGetMovements();
  }, [executeGetMovements, isInitialized]);

  // Ejecutar búsqueda inicial SOLO cuando se inicializa
  useEffect(() => {
    if (isInitialized && !movementsData) {
      // Solo ejecutar si no hay datos cargados aún
      executeGetMovements();
    }
  }, [isInitialized]); // ← Solo depende de isInitialized

  // Función para cambiar página CON ejecución inmediata de filtros correctos
  const handlePageChangeAndSearch = useCallback(
    (page: number) => {
      // Crear los nuevos filtros con la página actualizada
      const newFilters = { ...filters, page };

      // Actualizar el estado
      setFilters(newFilters);

      // Ejecutar INMEDIATAMENTE con los filtros correctos
      executeGetMovements(newFilters);
    },
    [filters, executeGetMovements]
  );

  const handleClearFilters = useCallback(() => {
    const clearedFilters: MovementFilters = {
      search: "",
      action: undefined,
      username: undefined,
      date_from: "",
      date_to: "",
      page: 1,
      limit: 10,
      sortBy: "action_date",
      sortOrder: "DESC",
    };
    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

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
        `No se pudo exportar: ${error instanceof Error ? error.message : "Error desconocido"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="flex items-center space-x-2 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                <History className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#18D043] flex-shrink-0" />
                <span className="truncate">Historial de Movimientos</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Registro completo y detallado de todas las acciones realizadas en las
                líneas de vida
              </p>
            </div>

            {/* Botón de filtros móviles */}
            <div className="flex items-center gap-2 sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                icon={showMobileFilters ? X : Menu}
                className="flex-shrink-0"
              >
                Filtros
              </Button>
            </div>
          </div>

          {/* Estadísticas Responsive */}
          {statistics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <Card className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                      Total Movimientos
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                      {statistics.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Hoy</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                      {statistics.today.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Esta Semana</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                      {statistics.thisWeek.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                      Usuarios Activos
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                      {statistics.activeUsers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Filtros Responsive */}
          <Card className="p-4 sm:p-6">
            {/* Filtros Desktop */}
            <div className="hidden sm:block">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Búsqueda */}
                  <Input
                    placeholder="Buscar en descripciones..."
                    value={filters.search || ""}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    icon={Search}
                  />

                  {/* Filtro por Usuario */}
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
                    placeholder="Buscar usuario..."
                  />

                  {/* Acción */}
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
                  />

                  {/* Fechas */}
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      value={filters.date_from || ""}
                      onChange={(e) =>
                        handleFilterChange("date_from", e.target.value)
                      }
                      max={today}
                      placeholder="Desde"
                    />
                    <Input
                      type="date"
                      value={filters.date_to || ""}
                      onChange={(e) => handleFilterChange("date_to", e.target.value)}
                      max={today}
                      placeholder="Hasta"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                    <Button
                      onClick={handleSearch}
                      icon={Filter}
                      disabled={loading || !isInitialized}
                      loading={loading}
                      className="w-full sm:w-auto"
                    >
                      Buscar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      icon={RotateCcw}
                      disabled={loading || !isInitialized}
                      className="w-full sm:w-auto"
                    >
                      Limpiar Filtros
                    </Button>
                  </div>

                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleSearch}
                      icon={RotateCcw}
                      disabled={loading || !isInitialized}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Recargar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      icon={Download}
                      size="sm"
                      disabled={loading || !isInitialized}
                      className="w-full sm:w-auto"
                    >
                      Exportar CSV
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros Móviles */}
            <div className={`sm:hidden ${showMobileFilters ? 'block' : 'hidden'}`}>
              <div className="space-y-4">
                <div className="space-y-3">
                  {/* Búsqueda */}
                  <Input
                    placeholder="Buscar en descripciones..."
                    value={filters.search || ""}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    icon={Search}
                  />

                  {/* Filtro por Usuario */}
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
                    placeholder="Buscar usuario..."
                  />

                  {/* Acción */}
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
                  />

                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={filters.date_from || ""}
                      onChange={(e) =>
                        handleFilterChange("date_from", e.target.value)
                      }
                      max={today}
                      placeholder="Desde"
                    />
                    <Input
                      type="date"
                      value={filters.date_to || ""}
                      onChange={(e) => handleFilterChange("date_to", e.target.value)}
                      max={today}
                      placeholder="Hasta"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleSearch}
                      icon={Filter}
                      disabled={loading || !isInitialized}
                      loading={loading}
                      size="sm"
                    >
                      Buscar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      icon={RotateCcw}
                      disabled={loading || !isInitialized}
                      size="sm"
                    >
                      Limpiar
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSearch}
                      icon={RotateCcw}
                      disabled={loading || !isInitialized}
                      size="sm"
                    >
                      Recargar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      icon={Download}
                      size="sm"
                      disabled={loading || !isInitialized}
                    >
                      Exportar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Lista de movimientos */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-gray-900">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#18D043] flex-shrink-0" />
                <span>Registro de Actividades</span>
              </h2>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-[#18D043]/20 border-t-[#18D043]"></div>
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-600 text-center">
                  Cargando movimientos...
                </p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-4">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full">
                  <span className="text-xl sm:text-2xl">⚠️</span>
                </div>
                <div className="text-center px-4">
                  <p className="mb-2 text-base sm:text-lg font-medium text-gray-900">
                    Error al cargar el historial
                  </p>
                  <p className="mb-4 text-sm sm:text-base text-gray-600">{error}</p>
                  <Button onClick={handleSearch} variant="outline" size="sm">
                    Reintentar
                  </Button>
                </div>
              </div>
            )}

            {!loading && !error && movements.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-4">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full">
                  <span className="text-xl sm:text-2xl">📄</span>
                </div>
                <div className="text-center px-4">
                  <p className="mb-2 text-base sm:text-lg font-medium text-gray-900">
                    No hay movimientos registrados
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    No se encontraron registros que coincidan con los criterios de
                    búsqueda.
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && movements.length > 0 && (
              <>
                <div className="space-y-3 sm:space-y-4 w-full">
                  {movements.map((movement) => (
                    <MovementHistoryItem key={movement.id} movement={movement} />
                  ))}
                </div>

                {/* Paginación usando handlePageChangeAndSearch */}
                <PaginationComponent
                  pagination={pagination}
                  loading={loading}
                  handlePageChange={handlePageChangeAndSearch}
                />
              </>
            )}
          </Card>

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
