import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Camera,
  FileText,
} from "lucide-react";
import { DataTable } from '../../../shared/components/common/DataTable';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../shared/components/ui/Toast';
import { useApi } from '../../../shared/hooks/useApi';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import { registroService } from "../services/registroService";
import type { ImageResponse } from '../../../shared/services/imageService';
import { RelationshipModal } from "../components/RelationshipModal";
import { RegistroDetailModal } from "../components/RegistroDetailModal";
import { formatDate } from "../../../shared/utils/formatters";
import { DeleteModal } from "../../solicitudes/components/DeleteModal";
import { apiClient } from '../../../shared/services/apiClient';
import { ReportsSection } from "../components/ReportsSection";
import { RegistroForm } from "./RegistroForm";
import type { DataRecord } from "../types/registro";
import type { TableColumn } from "../../../types";
import { useRegistroData } from "../hooks/useRegistroData";

export const RegistroList: React.FC = () => {
  const { success, error: showError } = useToast();

  // Estados para filtros y vista
  const [searchTerm, setSearchTerm] = useState("");
  const [equipoFilter, setEquipoFilter] = useState("");
  const [ubicacionFilter, setUbicacionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [empresaFilter, setEmpresaFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [codigoPlacaFilter, setCodigoPlacaFilter] = useState("");
  const [installDateFrom, setInstallDateFrom] = useState("");
  const [installDateTo, setInstallDateTo] = useState("");
  const [anclajeTipoFilter, setAnclajeTipoFilter] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [selectedRecordForRelation, setSelectedRecordForRelation] =
    useState<DataRecord | null>(null);

  const [showReports, setShowReports] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);

  type AppliedFilters = {
    codigo?: string;
    codigo_placa?: string;
    equipo?: string;
    ubicacion?: string;
    cliente?: string; // empresa
    seccion?: string; // sección
    area?: string; // área
    planta?: string; // planta
    estado_actual?: string;
    fecha_instalacion_desde?: string;
    fecha_instalacion_hasta?: string;
    anclaje_tipo?: string;
  };

  type SortOrder = "ASC" | "DESC";
  type SortState = { field: "fecha_instalacion" | string; order: SortOrder };

  // CAMBIO: Orden por defecto ahora es fecha_instalacion DESC
  const DEFAULT_SORT: SortState = { field: "fecha_instalacion", order: "DESC" };
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});

  const lastQueryRef = useRef<any>(null);

  // Referencias para el debounce y carga inicial
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoadRef = useRef(true);

  // Estado para datos de registros
  const [recordImages, setRecordImages] = useState<Map<string, ImageResponse>>(
    new Map()
  );

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DataRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debounceRefs = useRef<Record<string, any>>({
    codigo: null,
    codigo_placa: null,
    equipo: null,
    ubicacion: null,
    empresa: null,
    area: null,
  });

  const {
    records: registros,
    pagination,
    loading,
    updateFilters,
    handlePageChange,
    handleItemsPerPageChange,
    refreshData,
  } = useRegistroData();

  // Hook para estadísticas con función estable
  const loadStatsFunction = useCallback(
    async () => registroService.getStatistics(),
    []
  );

  const {
    data: estadisticas,
    loading: loadingStats,
    execute: loadStats,
  } = useApi(loadStatsFunction);

  const buildParams = useCallback(
    (overrides?: Partial<AppliedFilters>, page?: number) => {
      const f = { ...appliedFilters, ...overrides };
      return {
        page: page ?? pagination.currentPage,
        limit: pagination.itemsPerPage,
        codigo: f.codigo || undefined,
        codigo_placa: f.codigo_placa || undefined,
        equipo: f.equipo || undefined,
        ubicacion: f.ubicacion || undefined,
        cliente: f.cliente || undefined,
        seccion: f.seccion || undefined,
        area: f.area || undefined,
        planta: f.planta || undefined,
        estado_actual: f.estado_actual || undefined,
        anclaje_tipo: f.anclaje_tipo || undefined,
        fecha_instalacion_desde: f.fecha_instalacion_desde || undefined,
        fecha_instalacion_hasta: f.fecha_instalacion_hasta || undefined,
        sortBy: sort.field,
        sortOrder: sort.order,
      };
    },
    [appliedFilters, pagination.currentPage, pagination.itemsPerPage, sort]
  );

  const fetchWith = useCallback(
    async (overrides?: Partial<AppliedFilters>, page?: number) => {
      setAppliedFilters((prev) => ({ ...prev, ...overrides }));
      const params = buildParams(overrides, page);
      lastQueryRef.current = params;

      // Solo resetear imágenes si cambia de página, no si se aplican filtros
      if (page && page !== pagination.currentPage) {
        setRecordImages(new Map());
      }

      updateFilters(params);
    },
    [buildParams, updateFilters, pagination.currentPage]
  );

  // Cargar datos inicial solo una vez
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      const loadInitialData = async () => {
        try {
          // Restaurar filtros guardados
          const savedFilters = localStorage.getItem('registroFilters');
          if (savedFilters) {
            const filters = JSON.parse(savedFilters);
            setAppliedFilters(filters);
            setSearchTerm(filters.codigo || "");
            setCodigoPlacaFilter(filters.codigo_placa || "");
            setEquipoFilter(filters.equipo || "");
            setUbicacionFilter(filters.ubicacion || "");
            setEmpresaFilter(filters.cliente || "");
            setAreaFilter(filters.area || "");
            setStatusFilter(filters.estado_actual || "");
            setAnclajeTipoFilter(filters.anclaje_tipo || "");
            setInstallDateFrom(filters.fecha_instalacion_desde || "");
            setInstallDateTo(filters.fecha_instalacion_hasta || "");

            // Aplicar los filtros restaurados después de un delay
            setTimeout(() => {
              const params = buildParams(filters, 1);
              updateFilters(params);
            }, 100);
          }

          await loadStats();
        } catch (error) {
          console.error("Error loading initial data:", error);
        }
      };
      loadInitialData();
    }
  }, [buildParams, updateFilters, loadStats]); // Agregar dependencias necesarias

  // Guardar filtros en localStorage cuando cambien
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      localStorage.setItem('registroFilters', JSON.stringify(appliedFilters));
    }
  }, [appliedFilters]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(debounceRefs.current).forEach((t) => t && clearTimeout(t));
    };
  }, []);

  // refreshData con dependencias estables
  const refreshDataCallback = useCallback(async () => {
    try {
      await fetchWith({}, pagination.currentPage);
      await loadStats();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [fetchWith, loadStats, pagination.currentPage]);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    refreshDataCallback();
  }, [refreshDataCallback]);

  const createModalRef = useModalClose({
    isOpen: showCreateModal,
    onClose: handleCloseCreateModal,
  });

  const handleTextFilterChange = useCallback(
    (field: string, setter: (v: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setter(value);

        // limpiar solo el timeout del campo actual
        const ref = debounceRefs.current[field];
        if (ref) clearTimeout(ref);

        // búsqueda automática solo si NO hay estado/fechas activos
        if (!statusFilter && !installDateFrom && !installDateTo) {
          debounceRefs.current[field] = setTimeout(() => {
            const patch: Partial<AppliedFilters> = {
              codigo:
                (field === "codigo" ? value : searchTerm).trim() || undefined,
              // ← AGREGAR ESTAS 2 LÍNEAS
              codigo_placa:
                (field === "codigo_placa" ? value : codigoPlacaFilter).trim() ||
                undefined,
              equipo:
                (field === "equipo" ? value : equipoFilter).trim() || undefined,
              ubicacion:
                (field === "ubicacion" ? value : ubicacionFilter).trim() ||
                undefined,
              cliente:
                (field === "empresa" ? value : empresaFilter).trim() ||
                undefined,
              area: (field === "area" ? value : areaFilter).trim() || undefined,
            };
            // Aplica filtros y resetea a página 1
            fetchWith(patch, 1);
          }, 500);
        }
      },
    [
      statusFilter,
      installDateFrom,
      installDateTo,
      empresaFilter,
      areaFilter,
      searchTerm,
      codigoPlacaFilter,
      equipoFilter,
      ubicacionFilter,
      fetchWith,
    ]
  );

  const handleExpandedFilterChange = useCallback(
    (setter: (v: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setter(value);
      },
    []
  );

  // Aplica el estado seleccionado en filtros (cards o combo)
  const applyStatusFilter = useCallback(
    (value: string) => {
      setStatusFilter(value);
      fetchWith({ estado_actual: value || undefined }, 1);
    },
    [fetchWith]
  );

  // Handler para filtros de select que se aplican inmediatamente
  const handleStatusFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      applyStatusFilter(e.target.value);
    },
    [applyStatusFilter]
  );

  const handleAnclajeTipoFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setAnclajeTipoFilter(value);
      fetchWith({ anclaje_tipo: value || undefined }, 1);
    },
    [fetchWith]
  );

  // Handler para fechas que se aplican inmediatamente
  const handleInstallDateFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInstallDateFrom(value);
      fetchWith({ fecha_instalacion_desde: value || undefined }, 1);
    },
    [fetchWith]
  );

  const handleInstallDateToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInstallDateTo(value);
      fetchWith({ fecha_instalacion_hasta: value || undefined }, 1);
    },
    [fetchWith]
  );

  const handleDeleteRegistro = useCallback((registro: DataRecord) => {
    setRecordToDelete(registro);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(
    async (authorizationCode?: string) => {
      if (!recordToDelete) return;

      setDeleting(true);
      try {
        const params = new URLSearchParams();
        if (authorizationCode) {
          params.append("authorization_code", authorizationCode);
        }

        const url = `/records/${recordToDelete.id}${params.toString() ? `?${params.toString()}` : ""
          }`;

        await apiClient.delete(url);

        success("Registro eliminado exitosamente");
        setDeleteModalOpen(false);
        setRecordToDelete(null);
        refreshData();
        await loadStats();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al eliminar registro";
        showError("Error al eliminar registro", errorMessage);
      } finally {
        setDeleting(false);
      }
    },
    [recordToDelete, success, showError, refreshData, loadStats]
  );

  const handleCreateDerivadas = useCallback((registro: DataRecord) => {
    setSelectedRecordForRelation(registro);
    setShowRelationshipModal(true);
  }, []);

  const handleRelationshipSuccess = useCallback(() => {
    setShowRelationshipModal(false);
    setSelectedRecordForRelation(null);
    refreshData();
    loadStats();
  }, [refreshData, loadStats]);

  const handleRowClick = useCallback((registro: DataRecord) => {
    setSelectedRecord(registro);
    setShowDetailModal(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedRecord(null);
  }, []);

  const getEstadoConfig = useCallback((estado: DataRecord["estado_actual"]) => {
    const configs = {
      activo: {
        variant: "success" as const,
        color: "text-green-600",
      },
      inactivo: {
        variant: "secondary" as const,
        color: "text-gray-600",
      },
      mantenimiento: {
        variant: "warning" as const,
        color: "text-orange-600",
      },
      por_vencer: {
        variant: "warning" as const,
        color: "text-yellow-600",
      },
      vencido: {
        variant: "danger" as const,
        color: "text-red-600",
      },
    };
    // Si no hay estado o es inválido, retornar configuración para "no registrado"
    if (!estado || estado === "undefined" || estado === "null") {
      return {
        variant: "secondary" as const,
        color: "text-gray-500",
      };
    }
    return configs[estado as keyof typeof configs] || configs.inactivo;
  }, []);

  const NoResultsMessage = () => {
    const hasActiveFilters = Object.values(appliedFilters).some(Boolean);

    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="flex items-center justify-center w-20 h-20 mb-6 bg-gray-100 dark:bg-gray-800 rounded-full">
          <span className="text-3xl">🔍</span>
        </div>
        <div className="max-w-md text-center">
          <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
            No se encontró ningún registro
          </h3>
          {hasActiveFilters ? (
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                No hay registros que coincidan con los criterios de búsqueda
                aplicados.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Intenta ajustar o eliminar algunos filtros para obtener más
                resultados.
              </p>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No hay registros de líneas de vida disponibles en el sistema.
            </p>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            className="mt-6"
            onClick={async () => {
              // Limpiar todos los filtros de estado
              setSearchTerm("");
              setCodigoPlacaFilter("");
              setEquipoFilter("");
              setUbicacionFilter("");
              setEmpresaFilter("");
              setAreaFilter("");
              setStatusFilter("");
              setAnclajeTipoFilter("");
              setInstallDateFrom("");
              setInstallDateTo("");
              setAppliedFilters({});
              // Limpiar localStorage
              localStorage.removeItem('registroFilters');
              // Cargar todos los registros sin filtros
              try {
                await loadStats();
              } catch (error) {
                console.error("Error al limpiar filtros:", error);
              }
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    );
  };

  const columns: TableColumn<DataRecord>[] = useMemo(
    () => [
      {
        key: "codigo",
        label: "Código",
        sortable: true,
        render: (value: any, registro: DataRecord) => (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">
                  {String(value).slice(-2)}
                </span>
              </div>
              {recordImages.has(registro.id) && (
                <div className="absolute flex items-center justify-center w-4 h-4 bg-orange-500 rounded-full -top-1 -right-1">
                  <Camera className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{String(value)}</div>
              {recordImages.has(registro.id) && (
                <div className="text-xs text-orange-600 dark:text-orange-400">Con imagen</div>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "codigo_placa",
        label: "Código Placa",
        sortable: true,
        render: (value: any) =>
          value ? (
            <span className="inline-flex items-center px-2 py-1 font-mono text-sm text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-md">
              {String(value)}
            </span>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
          ),
      },
      {
        key: "cliente",
        label: "Empresa",
        sortable: true,
        render: (value: any) => (
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {String(value).charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{String(value)}</span>
          </div>
        ),
      },
      {
        key: "seccion",
        label: "Sección",
        render: (value: any) => (
          <span className="inline-flex items-center px-2 py-1 font-mono text-sm text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
            {String(value)}
          </span>
        ),
      },
      {
        key: "equipo",
        label: "Equipo",
        sortable: true,
        render: (value: any) => (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#18D043] rounded-full"></div>
            <span className="font-medium text-gray-900 dark:text-white">{String(value)}</span>
          </div>
        ),
      },
      {
        key: "fecha_instalacion",
        label: "F. Instalación",
        sortable: true,
        render: (value: any) => {
          if (!value) {
            return (
              <div className="text-sm">
                <div className="font-medium text-gray-400 dark:text-gray-500">
                  No registrada
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Sin fecha
                </div>
              </div>
            );
          }

          return (
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">
                {formatDate(value as Date)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Instalado</div>
            </div>
          );
        },
      },
      {
        key: "longitud",
        label: "Longitud",
        render: (value: any) => (
          <span className="inline-flex items-center px-2 py-1 font-mono text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md">
            {value}m
          </span>
        ),
      },
      {
        key: "anclaje_equipos",
        label: "Anclaje de equipos",
        sortable: true,
        width: "min-w-[220px]",
        render: (value) => {
          const text = (value as string | undefined)?.trim();
          return text && text.length > 0 ? (
            <span
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
              title={text}
            >
              {text}
            </span>
          ) : (
            <span className="text-xs italic text-gray-400 dark:text-gray-500">No registrado</span>
          );
        },
      },
      {
        key: "anclaje_tipo",
        label: "Tipo de Anclaje",
        sortable: true,
        render: (value: any) => {
          if (!value) {
            return (
              <span className="text-xs italic text-gray-400 dark:text-gray-500">No seleccionado</span>
            );
          }
          
          const getAnclajeConfig = (tipo: string) => {
            const configs: Record<string, { color: string; bgColor: string; icon: string }> = {
              anclaje_terminal: { color: "text-blue-700", bgColor: "bg-blue-100", icon: "🔗" },
              anclaje_intermedio: { color: "text-green-700", bgColor: "bg-green-100", icon: "🔗" },
              anclaje_intermedio_basculante: { color: "text-purple-700", bgColor: "bg-purple-100", icon: "🔗" },
              absorvedor_impacto: { color: "text-orange-700", bgColor: "bg-orange-100", icon: "🛡️" },
              anclaje_superior: { color: "text-indigo-700", bgColor: "bg-indigo-100", icon: "⬆️" },
              anclaje_inferior: { color: "text-teal-700", bgColor: "bg-teal-100", icon: "⬇️" },
              anclaje_impacto: { color: "text-red-700", bgColor: "bg-red-100", icon: "🛡️" },
            };
            return configs[tipo] || { color: "text-gray-700", bgColor: "bg-gray-100", icon: "🔗" };
          };

          const config = getAnclajeConfig(value);
          const label = value.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          
          const darkModeColors: Record<string, { bgColor: string; color: string }> = {
            anclaje_terminal: { bgColor: "dark:bg-blue-900/30", color: "dark:text-blue-300" },
            anclaje_intermedio: { bgColor: "dark:bg-green-900/30", color: "dark:text-green-300" },
            anclaje_intermedio_basculante: { bgColor: "dark:bg-purple-900/30", color: "dark:text-purple-300" },
            absorvedor_impacto: { bgColor: "dark:bg-orange-900/30", color: "dark:text-orange-300" },
            anclaje_superior: { bgColor: "dark:bg-indigo-900/30", color: "dark:text-indigo-300" },
            anclaje_inferior: { bgColor: "dark:bg-teal-900/30", color: "dark:text-teal-300" },
            anclaje_impacto: { bgColor: "dark:bg-red-900/30", color: "dark:text-red-300" },
          };
          const darkConfig = darkModeColors[value] || { bgColor: "dark:bg-gray-900/30", color: "dark:text-gray-300" };
          
          return (
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${darkConfig.bgColor} ${config.color} ${darkConfig.color}`}
              title={label}
            >
              <span className="mr-1">{config.icon}</span>
              {label}
            </span>
          );
        },
      },
      {
        key: "observaciones",
        label: "Observaciones",
        render: (value: any) =>
          value ? (
            <div className="max-w-xs">
              <span
                className="inline-flex items-center px-2 py-1 text-xs text-yellow-800 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 rounded-md cursor-help"
                title={String(value)}
              >
                {String(value).length > 20
                  ? `${String(value).substring(0, 20)}...`
                  : String(value)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
          ),
      },
      {
        key: "tipo_linea",
        label: "Tipo Línea",
        sortable: true,
        render: (value: any) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
            {String(value)}
          </span>
        ),
      },
      {
        key: "ubicacion",
        label: "Ubicación",
        render: (value: any) => (
          <div
            className="max-w-xs text-gray-600 dark:text-gray-300 truncate"
            title={String(value)}
          >
            {String(value)}
          </div>
        ),
      },
      {
        key: "fecha_caducidad",
        label: "F. Caducidad",
        render: (value: any) => {
          if (!value) {
            return (
              <div className="text-sm">
                <div className="font-medium text-gray-400 dark:text-gray-500">
                  No registrada
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Sin fecha
                </div>
              </div>
            );
          }

          const fecha = value as Date;
          const isVencido = fecha < new Date();
          return (
            <div className="text-sm">
              <div
                className={`font-medium ${isVencido ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
                  }`}
              >
                {formatDate(fecha)}
              </div>
              <div
                className={`text-xs ${isVencido ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                  }`}
              >
                {isVencido ? "Vencido" : "Programado"}
              </div>
            </div>
          );
        },
      },
      {
        key: "estado_actual",
        label: "Estado",
        render: (value: any) => {
          // Si no hay estado registrado, mostrar "No registrado"
          if (!value || value === "undefined" || value === "null") {
            return (
              <Badge variant="secondary" className="text-gray-500">
                No registrado
              </Badge>
            );
          }

          const estado = String(value) as DataRecord["estado_actual"];
          const config = getEstadoConfig(estado);
          return <Badge variant={config.variant}>{estado}</Badge>;
        },
      },
    ],
    [getEstadoConfig, recordImages]
  );

  // Vista en cuadrícula (actualizada para mostrar empresa y área)
  const GridView = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {registros.map((registro) => {
        const estadoConfig = getEstadoConfig(registro.estado_actual);
        const hasImage = recordImages.has(registro.id);
        return (
          <div
            key={registro.id}
            onClick={() => handleRowClick(registro)}
            className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#18D043] relative cursor-pointer bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            {hasImage && (
              <div className="absolute z-10 top-1.5 right-1.5">
                <div className="flex items-center justify-center w-6 h-6 bg-orange-500 rounded-full shadow-lg">
                  <Camera className="w-3 h-3 text-white" />
                </div>
              </div>
            )}

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-white">
                      {registro.codigo.slice(-2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {registro.codigo}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{registro.cliente}</p>
                  </div>
                </div>
                <Badge variant={estadoConfig.variant} size="sm">
                  {!registro.estado_actual || registro.estado_actual === "undefined" || registro.estado_actual === "null"
                    ? "No registrado"
                    : registro.estado_actual === "por_vencer"
                      ? "Por Vencer"
                      : registro.estado_actual}
                </Badge>
              </div>

              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Empresa:</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {registro.cliente}
                  </span>
                </div>
                {registro.codigo_placa && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Código Placa:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                      {registro.codigo_placa}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Área:</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                    {registro.area}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Equipo:</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {registro.equipo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Tipo:</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {registro.tipo_linea}
                  </span>
                </div>
                {registro.anclaje_tipo && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Anclaje:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      {registro.anclaje_tipo.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Longitud:</span>
                  <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded">
                    {registro.longitud}m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Ubicación:</span>
                  <span
                    className="text-xs text-gray-900 dark:text-white truncate max-w-32"
                    title={registro.ubicacion}
                  >
                    {registro.ubicacion}
                  </span>
                </div>
                {hasImage && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Imagen:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                      Disponible
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Loading state inicial
  if (loading && registros.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando registros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Registros
          </h1>
          <p className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <span>Administra todos los registros del sistema</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#18D043]/10 dark:bg-[#18D043]/20 text-[#16a34a] dark:text-[#18D043]">
              {pagination.totalItems} registros
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowReports(!showReports)}
            variant="outline"
            icon={FileText}
            className={
              showReports
                ? "bg-orange-500 text-white border-orange-500"
                : "border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30"
            }
          >
            Reportes
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={Plus}
            className="bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Nuevo Registro
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <div
          className="cursor-pointer hover:shadow-md active:scale-95 transition-all duration-200"
          onClick={() => {
            applyStatusFilter("");
          }}
        >
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40">
            <div className="flex items-center justify-between p-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">Total</p>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 flex items-center">
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  estadisticas?.total ?? 0
                )}
              </div>
            </div>
            <div className="text-lg flex-shrink-0">📊</div>
          </div>
        </Card>
        </div>

        <div
          className="cursor-pointer hover:shadow-md active:scale-95 transition-all duration-200"
          onClick={() => {
            applyStatusFilter("activo");
          }}
        >
          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40">
            <div className="flex items-center justify-between p-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 truncate">Activos</p>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100 flex items-center">
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  estadisticas?.activos ?? 0
                )}
              </div>
            </div>
            <div className="text-lg flex-shrink-0">🟢</div>
          </div>
        </Card>
        </div>

        <div
          className="cursor-pointer hover:shadow-md active:scale-95 transition-all duration-200"
          onClick={() => {
            applyStatusFilter("por_vencer");
          }}
        >
          <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40">
            <div className="flex items-center justify-between p-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 truncate">Por Vencer</p>
              <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 flex items-center">
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  estadisticas?.por_vencer ?? 0
                )}
              </div>
            </div>
            <div className="text-lg flex-shrink-0">🟡</div>
          </div>
        </Card>
        </div>

        <div
          className="cursor-pointer hover:shadow-md active:scale-95 transition-all duration-200"
          onClick={() => {
            applyStatusFilter("vencido");
          }}
        >
          <Card className="border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40">
            <div className="flex items-center justify-between p-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 truncate">Vencidos</p>
              <div className="text-3xl font-bold text-red-900 dark:text-red-100 flex items-center">
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  estadisticas?.vencidos ?? 0
                )}
              </div>
            </div>
            <div className="text-lg flex-shrink-0">🔴</div>
          </div>
        </Card>
        </div>

        <div
          className="cursor-pointer hover:shadow-md active:scale-95 transition-all duration-200"
          onClick={() => {
            applyStatusFilter("mantenimiento");
          }}
        >
          <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/40">
            <div className="flex items-center justify-between p-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 truncate">
                Mantenimiento
              </p>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 flex items-center">
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  estadisticas?.mantenimiento ?? 0
                )}
              </div>
            </div>
            <div className="text-lg flex-shrink-0">🔧</div>
          </div>
        </Card>
        </div>
      </div>

      {/* Sección de Reportes */}
      {showReports && <ReportsSection />}

      {/* Controles y filtros */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
        <div className="p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              <Filter className="w-4 h-4 text-[#18D043]" />
              Filtros rápidos
            </div>
          </div>
          {/* Top bar: filtros + botones */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
            {/* Contenedor de inputs de filtro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-1 gap-2">
              {/* Código */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search
                    className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2"
                    size={16}
                    aria-hidden
                  />
                  <Input
                    id="f-codigo"
                    placeholder="Código..."
                    value={searchTerm}
                    onChange={handleTextFilterChange("codigo", setSearchTerm)}
                    className="h-9 pl-8 text-sm border-gray-300 dark:border-gray-600 focus:border-[#18D043] focus:ring-[#18D043]/20"
                  />
                </div>
              </div>

              {/* Código Placa */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search
                    className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2"
                    size={16}
                    aria-hidden
                  />
                  <Input
                    id="f-codigo-placa"
                    placeholder="Código placa..."
                    value={codigoPlacaFilter}
                    onChange={handleTextFilterChange(
                      "codigo_placa",
                      setCodigoPlacaFilter
                    )}
                    className="h-9 pl-8 text-sm border-gray-300 dark:border-gray-600 focus:border-[#18D043] focus:ring-[#18D043]/20"
                  />
                </div>
              </div>

              {/* Empresa */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search
                    className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2"
                    size={16}
                    aria-hidden
                  />
                  <Input
                    id="f-empresa"
                    placeholder="Empresa..."
                    value={empresaFilter}
                    onChange={handleTextFilterChange(
                      "empresa",
                      setEmpresaFilter
                    )}
                    className="h-9 pl-8 text-sm border-gray-300 dark:border-gray-600 focus:border-[#18D043] focus:ring-[#18D043]/20"
                  />
                </div>
              </div>

              {/* Área */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search
                    className="absolute text-gray-400 -translate-y-1/2 left-2 top-1/2"
                    size={16}
                    aria-hidden
                  />
                  <Input
                    id="f-area"
                    placeholder="Área..."
                    value={areaFilter}
                    onChange={handleTextFilterChange("area", setAreaFilter)}
                    className="h-9 pl-8 text-sm border-gray-300 dark:border-gray-600 focus:border-[#18D043] focus:ring-[#18D043]/20"
                  />
                </div>
              </div>
            </div>

            {/* Botonera derecha */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters((v) => !v)}
                icon={showFilters ? SlidersHorizontal : Filter}
                className={
                  showFilters
                    ? "bg-[#18D043] text-white border-[#18D043] h-9"
                    : "border-gray-300 dark:border-gray-600 h-9"
                }
              >
                Filtros
              </Button>
              <div className="flex p-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded ${viewMode === "table"
                    ? "bg-[#18D043] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  aria-pressed={viewMode === "table"}
                  aria-label="Vista tabla"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${viewMode === "grid"
                    ? "bg-[#18D043] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  aria-pressed={viewMode === "grid"}
                  aria-label="Vista tarjetas"
                >
                  <Grid size={16} />
                </button>
              </div>
            </div>
          </div>
          {/* Indicador de filtros activos */}
          {Object.values(appliedFilters).some(Boolean) && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="mr-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                Filtros activos:
              </span>

              {[
                { key: "codigo", label: "Código" },
                { key: "codigo_placa", label: "Código Placa" },
                { key: "cliente", label: "Empresa" },
                { key: "seec", label: "Área" },
                { key: "equipo", label: "Equipo" },
                { key: "ubicacion", label: "Ubicación" },
                { key: "estado_actual", label: "Estado" },
                { key: "fecha_instalacion_desde", label: "Desde" },
                { key: "fecha_instalacion_hasta", label: "Hasta" },
              ].map(({ key, label }) => {
                const val = (appliedFilters as any)[key];
                if (!val) return null;

                // Normaliza visualmente algunos valores si quieres
                const display =
                  key === "estado_actual" && val === "por_vencer"
                    ? "Por Vencer"
                    : String(val);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      // al quitar chip, sincronizamos input visible y aplicamos
                      if (key === "codigo") setSearchTerm("");
                      if (key === "codigo_placa") setCodigoPlacaFilter("");
                      if (key === "cliente") setEmpresaFilter("");
                      if (key === "area") setAreaFilter("");
                      if (key === "equipo") setEquipoFilter("");
                      if (key === "ubicacion") setUbicacionFilter("");
                      if (key === "estado_actual") setStatusFilter("");
                      if (key === "fecha_instalacion_desde")
                        setInstallDateFrom("");
                      if (key === "fecha_instalacion_hasta")
                        setInstallDateTo("");

                      // aplica removiendo solo ese filtro y vuelve a página 1
                      fetchWith({ [key]: undefined } as any, 1);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                    title={`${label}: ${val}`}
                  >
                    <span className="font-medium">{label}:</span>
                    <span className="truncate max-w-[140px]">{display}</span>
                    <span className="ml-1 rounded-full bg-emerald-600/10 dark:bg-emerald-400/20 px-1.5">
                      ✕
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {/* Panel de filtros */}
          <div
            className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
              showFilters ? "max-h-[1200px] mt-4" : "max-h-0"
            }`}
            aria-hidden={!showFilters}
          >
            <div
              className={`pt-4 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${
                showFilters
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Estado */}
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Estado
                  </label>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="h-10"
                    options={[
                      { value: "", label: "Todos los estados" },
                      { value: "activo", label: "Activo" },
                      { value: "por_vencer", label: "Por Vencer" },
                      { value: "vencido", label: "Vencido" },
                      { value: "inactivo", label: "Inactivo" },
                      { value: "mantenimiento", label: "Mantenimiento" },
                    ]}
                  />
                </div>

                {/* Equipo */}
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Equipo
                  </label>
                  <Input
                    placeholder="Buscar por equipo..."
                    value={equipoFilter}
                    onChange={handleExpandedFilterChange(
                      setEquipoFilter
                    )}
                    className="h-10 border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Ubicación
                  </label>
                  <Input
                    placeholder="Buscar por ubicación..."
                    value={ubicacionFilter}
                    onChange={handleExpandedFilterChange(
                      setUbicacionFilter
                    )}
                    className="h-10 border-gray-300 dark:border-gray-600"
                  />
                </div>

                {/* Tipo de Anclaje */}
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Tipo de Anclaje
                  </label>
                  <Select
                    value={anclajeTipoFilter}
                    onChange={handleAnclajeTipoFilterChange}
                    className="h-10"
                    options={[
                      { value: "", label: "Todos los tipos" },
                      { value: "anclaje_terminal", label: "Anclaje Terminal" },
                      { value: "anclaje_intermedio", label: "Anclaje Intermedio" },
                      { value: "anclaje_intermedio_basculante", label: "Anclaje Intermedio Basculante" },
                      { value: "absorvedor_impacto", label: "Absorbedor Impacto" },
                      { value: "anclaje_superior", label: "Anclaje Superior" },
                      { value: "anclaje_inferior", label: "Anclaje Inferior" },
                      { value: "anclaje_impacto", label: "Anclaje Impacto" },
                    ]}
                  />
                </div>

                {/* Fechas */}
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Fecha instalación (desde)
                  </label>
                  <Input
                    type="date"
                    value={installDateFrom}
                    onChange={handleInstallDateFromChange}
                    className="h-10 border-gray-300 dark:border-gray-600"
                    max={installDateTo || undefined}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Fecha instalación (hasta)
                  </label>
                  <Input
                    type="date"
                    value={installDateTo}
                    onChange={handleInstallDateToChange}
                    className="h-10 border-gray-300 dark:border-gray-600"
                    min={installDateFrom || undefined}
                  />
                </div>
              </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 mt-4">
                  {(searchTerm ||
                    codigoPlacaFilter ||
                    equipoFilter ||
                    ubicacionFilter ||
                    empresaFilter ||
                    areaFilter ||
                    statusFilter ||
                    installDateFrom ||
                    installDateTo) && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                        onClick={async () => {
                          setSearchTerm("");
                          setCodigoPlacaFilter("");
                          setEquipoFilter("");
                          setUbicacionFilter("");
                          setEmpresaFilter("");
                          setAreaFilter("");
                          setStatusFilter("");
                          setAnclajeTipoFilter("");
                          setInstallDateFrom("");
                          setInstallDateTo("");
                          setAppliedFilters({});
                          // Limpiar localStorage
                          localStorage.removeItem('registroFilters');
                          // Cargar todos los registros sin filtros
                          try {
                            await loadStats();
                          } catch (error) {
                            console.error("Error al limpiar filtros:", error);
                          }
                        }}
                      >
                        Limpiar
                      </Button>
                    )}
                </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Contenido principal */}
      {viewMode === "table" ? (
        <>
          {loading && registros.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-gray-600">Cargando registros...</p>
              </div>
            </div>
          ) : registros.length === 0 ? (
            <NoResultsMessage />
          ) : (
            <DataTable
              data={registros}
              columns={columns}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
              loading={loading}
              sortColumn={sort.field as any}
              sortDirection={sort.order.toLowerCase() as "asc" | "desc"}
              onSort={(column, direction) => {
                setSort({
                  field: String(column),
                  order: direction.toUpperCase() as SortOrder,
                });
                fetchWith({}, pagination.currentPage);
              }}
              onRowClick={handleRowClick}
              density="compact"
              itemsPerPage={pagination.itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[5, 10, 25, 50, 100]}
            />
          )}
        </>
      ) : (
        <div className="p-6">
          {loading && registros.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-gray-600">Cargando registros...</p>
              </div>
            </div>
          ) : registros.length === 0 ? (
            <NoResultsMessage />
          ) : (
            <>
              <GridView />
              {/* Paginación para vista grid */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Mostrando{" "}
                    <span className="font-semibold">
                      {Math.min(
                        (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
                        pagination.totalItems
                      )}
                    </span>
                    {" "}-{" "}
                    <span className="font-semibold">
                      {Math.min(
                        pagination.currentPage * pagination.itemsPerPage,
                        pagination.totalItems
                      )}
                    </span>
                    {" "}de{" "}
                    <span className="font-semibold">{pagination.totalItems}</span>
                    {" "}registros
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="text-xs px-2 py-1"
                    >
                      Anterior
                    </Button>
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            page === pagination.currentPage
                              ? "bg-[#18D043] text-white shadow-md"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <div className="sm:hidden text-xs font-medium text-gray-700 dark:text-gray-300 px-2">
                      {pagination.currentPage} / {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="text-xs px-2 py-1"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {/* Modal de eliminación con autorización */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRecordToDelete(null);
        }}
        record={recordToDelete}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
      {/* Modal de relaciones */}
      {selectedRecordForRelation && (
        <RelationshipModal
          isOpen={showRelationshipModal}
          onClose={() => {
            setShowRelationshipModal(false);
            setSelectedRecordForRelation(null);
          }}
          onSuccess={handleRelationshipSuccess}
          parentRecord={selectedRecordForRelation}
        />
      )}

      {showCreateModal && (
        <div
          ref={createModalRef}
          className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center px-4 py-6 bg-black/70 backdrop-blur-sm"
          style={{ margin: 0 }}
        >
          <div className="relative w-full max-w-[min(90vw,_950px)] max-h-[88vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-white/10 dark:border-gray-700/60 flex">
            <RegistroForm onClose={handleCloseCreateModal} onSuccess={handleCreateSuccess} />
          </div>
        </div>
      )}

      {/* Modal de detalles del registro */}
      {selectedRecord && (
        <RegistroDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          registroId={selectedRecord.id}
          registro={selectedRecord}
          deleting={deleting}
          onDelete={(registro) => {
            handleDeleteRegistro(registro);
          }}
          onCreateDerivadas={(registro) => {
            handleCreateDerivadas(registro);
            setShowDetailModal(false);
          }}
        />
      )}
    </div>
  );
};
