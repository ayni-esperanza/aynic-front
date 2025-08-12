import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  RefreshCw,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { DataTable } from "../../../components/common/DataTable";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useToast } from "../../../components/ui/Toast";
import { usePagination } from "../../../hooks/usePagination";
import { useApi } from "../../../hooks/useApi";
import { recordsService } from "../../../services/recordsService";
import {
  imageService,
  type ImageResponse,
} from "../../../services/imageService";
import { formatDate } from "../../../utils/formatters";
import type { DataRecord, TableColumn } from "../../../types";

export const RegistroList: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  // Estados para filtros y vista
  const [searchTerm, setSearchTerm] = useState("");
  const [equipoFilter, setEquipoFilter] = useState("");
  const [ubicacionFilter, setUbicacionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [installDateFrom, setInstallDateFrom] = useState("");
  const [installDateTo, setInstallDateTo] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showFilters, setShowFilters] = useState(false);

  // Referencias para el debounce y carga inicial
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoadRef = useRef(true);

  // Estado para datos de registros
  const [registros, setRegistros] = useState<DataRecord[]>([]);
  const [recordImages, setRecordImages] = useState<Map<string, ImageResponse>>(new Map());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const debounceRefs = useRef<Record<"codigo" | "equipo" | "ubicacion", any>>({
    codigo: null,
    equipo: null,
    ubicacion: null,
  });

  // Hook para cargar registros con función estable
  const loadRegistrosFunction = useCallback(
    (params: any) => recordsService.getRecords(params),
    []
  );

  const {
    loading,
    error: apiError,
    execute: loadRegistros,
  } = useApi(loadRegistrosFunction, {
    onSuccess: (data) => {
      setRegistros(data.data);
      setPagination(data.pagination);
      // Cargar imágenes para los registros visibles
      loadImagesForRecords(data.data);
    },
    onError: (error) => {
      showError("Error al cargar registros", error);
    },
  });

  // Hook para estadísticas con función estable
  const loadStatsFunction = useCallback(
    () => recordsService.getStatistics(),
    []
  );

  const {
    data: estadisticas,
    loading: loadingStats,
    execute: loadStats,
  } = useApi(loadStatsFunction);

  // Hook para eliminar registro con función estable
  const deleteRegistroFunction = useCallback(
    (id: string) => recordsService.deleteRecord(id),
    []
  );

  const { loading: deleting, execute: deleteRegistro } = useApi(
    deleteRegistroFunction,
    {
      onSuccess: () => {
        success("Registro eliminado exitosamente");
        refreshData();
      },
      onError: (error) => {
        showError("Error al eliminar registro", error);
      },
    }
  );

  // Función para cargar imágenes de los registros
  const loadImagesForRecords = useCallback(async (records: DataRecord[]) => {
    const imagePromises = records.map(async (record) => {
      try {
        const image = await imageService.getRecordImage(record.id);
        return { recordId: record.id, image };
      } catch (error) {
        return { recordId: record.id, image: null };
      }
    });

    const imageResults = await Promise.all(imagePromises);
    const newImageMap = new Map<string, ImageResponse>();

    imageResults.forEach(({ recordId, image }) => {
      if (image) {
        newImageMap.set(recordId, image);
      }
    });

    setRecordImages(newImageMap);
  }, []);

  // Cargar datos inicial solo una vez
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      const loadInitialData = async () => {
        try {
          await Promise.all([
            loadRegistros({
              page: 1,
              limit: 10,
              sortBy: "codigo",
              sortOrder: "ASC",
            }),
            loadStats(),
          ]);
        } catch (error) {
          console.error("Error loading initial data:", error);
        }
      };
      loadInitialData();
    }
  }, []); // Sin dependencias para ejecutar solo una vez

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
  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        loadRegistros({
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          codigo: searchTerm || undefined,
          estado_actual: statusFilter || undefined,
          sortBy: "codigo",
          sortOrder: "ASC",
        }),
        loadStats(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, []);

  const handleTextFilterChange = useCallback(
    (field: "codigo" | "equipo" | "ubicacion", setter: (v: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setter(value);

        // limpiar solo el timeout del campo actual
        const ref = debounceRefs.current[field];
        if (ref) clearTimeout(ref);

        // búsqueda automática solo si NO hay estado/fechas activos
        if (!statusFilter && !installDateFrom && !installDateTo) {
          debounceRefs.current[field] = setTimeout(() => {
            // construir payload combinando los 3 filtros de texto
            const payload = {
              page: 1,
              limit: pagination.itemsPerPage,
              codigo:
                (field === "codigo" ? value : searchTerm).trim() || undefined,
              equipo:
                (field === "equipo" ? value : equipoFilter).trim() || undefined,
              ubicacion:
                (field === "ubicacion" ? value : ubicacionFilter).trim() ||
                undefined,
              sortBy: "codigo",
              sortOrder: "ASC",
            };
            loadRegistros(payload);
          }, 500);
        }
      },
    [
      statusFilter,
      installDateFrom,
      installDateTo,
      pagination.itemsPerPage,
      loadRegistros,
      searchTerm,
      equipoFilter,
      ubicacionFilter,
    ]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      loadRegistros({
        page: newPage,
        limit: pagination.itemsPerPage,
        codigo: searchTerm || undefined,
        estado_actual: statusFilter || undefined,
        sortBy: "codigo",
        sortOrder: "ASC",
      });
    },
    [pagination.itemsPerPage, searchTerm, statusFilter, loadRegistros]
  );

  const handleDeleteRegistro = useCallback(
    async (registroId: string, codigo: string) => {
      if (
        confirm(
          `¿Estás seguro de que quieres eliminar el registro "${codigo}"?`
        )
      ) {
        await deleteRegistro(registroId);
      }
    },
    [deleteRegistro]
  );

  const getEstadoConfig = useCallback((estado: DataRecord["estado_actual"]) => {
    const configs = {
      activo: {
        variant: "success" as const,
        icon: "🟢",
        color: "text-green-600",
      },
      inactivo: {
        variant: "secondary" as const,
        icon: "⚪",
        color: "text-gray-600",
      },
      mantenimiento: {
        variant: "warning" as const,
        icon: "🔧",
        color: "text-orange-600",
      },
      por_vencer: {
        variant: "warning" as const,
        icon: "🟡",
        color: "text-yellow-600",
      },
      vencido: {
        variant: "danger" as const,
        icon: "🔴",
        color: "text-red-600",
      },
    };
    return configs[estado];
  }, []);

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
              <div className="font-semibold text-gray-900">{String(value)}</div>
              {recordImages.has(registro.id) && (
                <div className="text-xs text-orange-600">Con imagen</div>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "cliente",
        label: "Cliente",
        sortable: true,
        render: (value: any) => (
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <span className="text-sm font-semibold text-blue-600">
                {String(value).charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-medium text-gray-900">{String(value)}</span>
          </div>
        ),
      },
      {
        key: "equipo",
        label: "Equipo",
        sortable: true,
        render: (value: any) => (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#18D043] rounded-full"></div>
            <span className="font-medium text-gray-900">{String(value)}</span>
          </div>
        ),
      },
      {
        key: "fecha_instalacion",
        label: "F. Instalación",
        render: (value: any) => (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {formatDate(value as Date)}
            </div>
            <div className="text-xs text-gray-500">📅 Instalado</div>
          </div>
        ),
      },
      {
        key: "longitud",
        label: "Longitud",
        render: (value: any) => (
          <span className="inline-flex items-center px-2 py-1 font-mono text-sm text-gray-800 bg-gray-100 rounded-md">
            {value}m
          </span>
        ),
      },
      {
        key: "observaciones",
        label: "Observaciones",
        render: (value: any) =>
          value ? (
            <div className="max-w-xs">
              <span
                className="inline-flex items-center px-2 py-1 text-xs text-yellow-800 bg-yellow-100 rounded-md cursor-help"
                title={String(value)}
              >
                📝{" "}
                {String(value).length > 20
                  ? `${String(value).substring(0, 20)}...`
                  : String(value)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          ),
      },
      {
        key: "seec",
        label: "SEEC",
        render: (value: any) => (
          <span className="inline-flex items-center px-2 py-1 font-mono text-sm text-indigo-800 bg-indigo-100 rounded-md">
            {String(value)}
          </span>
        ),
      },
      {
        key: "tipo_linea",
        label: "Tipo Línea",
        sortable: true,
        render: (value: any) => {
          const iconMap: Record<string, string> = {
            "Fibra Óptica": "🔗",
            Cobre: "🔗",
            Inalámbrica: "📡",
            Satelital: "🛰️",
          };
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {iconMap[String(value)] || "🔗"} {String(value)}
            </span>
          );
        },
      },
      {
        key: "ubicacion",
        label: "Ubicación",
        render: (value: any) => (
          <div
            className="max-w-xs text-gray-600 truncate"
            title={String(value)}
          >
            📍 {String(value)}
          </div>
        ),
      },
      {
        key: "fecha_caducidad",
        label: "F. Caducidad",
        render: (value: any) => {
          const fecha = value as Date;
          const isVencido = fecha < new Date();
          return (
            <div className="text-sm">
              <div
                className={`font-medium ${
                  isVencido ? "text-red-600" : "text-gray-900"
                }`}
              >
                {formatDate(fecha)}
              </div>
              <div
                className={`text-xs ${
                  isVencido ? "text-red-500" : "text-gray-500"
                }`}
              >
                {isVencido ? "⚠️ Vencido" : "⏰ Programado"}
              </div>
            </div>
          );
        },
      },
      {
        key: "estado_actual",
        label: "Estado",
        render: (value: any) => {
          const estado = String(value) as DataRecord["estado_actual"];
          const config = getEstadoConfig(estado);
          return (
            <div className="flex items-center space-x-2">
              <span className="text-lg">{config.emoji}</span>
              <Badge variant={config.variant}>{estado}</Badge>
            </div>
          );
        },
      },
      {
        key: "id",
        label: "Acciones",
        render: (_: any, registro: DataRecord) => (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`detalle/${registro.id}`)}
              icon={Eye}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Ver detalles"
            ></Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`editar/${registro.id}`)}
              icon={Edit}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Editar registro"
            ></Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteRegistro(registro.id, registro.codigo)}
              icon={Trash2}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Eliminar registro"
              disabled={deleting}
            ></Button>
          </div>
        ),
      },
    ],
    [navigate, deleting, handleDeleteRegistro, getEstadoConfig, recordImages]
  );

  // Vista en cuadrícula
  const GridView = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {registros.map((registro) => {
        const estadoConfig = getEstadoConfig(registro.estado_actual);
        const hasImage = recordImages.has(registro.id);
        return (
          <Card
            key={registro.id}
            className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#18D043] relative"
          >
            {hasImage && (
              <div className="absolute z-10 top-2 right-2">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-xl flex items-center justify-center shadow-md">
                    <span className="font-bold text-white">
                      {registro.codigo.slice(-2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {registro.codigo}
                    </h3>
                    <p className="text-sm text-gray-500">{registro.cliente}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`text-xl ${estadoConfig.color}`}>
                    {estadoConfig.icon}
                  </span>
                  <Badge variant={estadoConfig.variant} size="sm">
                    {registro.estado_actual === "por_vencer"
                      ? "Por Vencer"
                      : registro.estado_actual}
                  </Badge>
                </div>
              </div>

              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Equipo:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {registro.equipo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tipo:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {registro.tipo_linea}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Longitud:</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {registro.longitud}m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Ubicación:</span>
                  <span
                    className="text-sm text-gray-900 truncate max-w-32"
                    title={registro.ubicacion}
                  >
                    📍 {registro.ubicacion}
                  </span>
                </div>
                {hasImage && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Imagen:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      📷 Disponible
                    </span>
                  </div>
                )}
              </div>

              <div className="flex pt-3 space-x-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`detalle/${registro.id}`)}
                  icon={Eye}
                  className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`editar/${registro.id}`)}
                  icon={Edit}
                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                >
                  Editar
                </Button>
              </div>
            </div>
          </Card>
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
          <p className="mt-4 text-gray-600">Cargando registros...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError && registros.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-4 text-red-600">⚠️</div>
          <p className="font-medium text-gray-900">Error al cargar registros</p>
          <p className="mb-4 text-gray-600">{apiError}</p>
          <Button onClick={refreshData} icon={RefreshCw}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl text-white">📊</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              Gestión de Registros
            </h1>
            <p className="flex items-center space-x-2 text-gray-600">
              <span>Administra todos los registros del sistema</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#18D043]/10 text-[#16a34a]">
                {pagination.totalItems} registros
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={refreshData}
            variant="outline"
            icon={RefreshCw}
            loading={loading}
            className="border-gray-300 hover:bg-gray-50"
          >
            Actualizar
          </Button>
          <Button
            onClick={() => navigate("nuevo")}
            icon={Plus}
            className="bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Nuevo Registro
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 items-stretch [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <Card className="h-full border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between h-full p-4">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <div className="text-2xl font-bold text-blue-900 min-h-[1.6rem] flex items-center">
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  estadisticas?.total ?? 0
                )}
              </div>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </Card>

        <Card className="h-full border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between h-full p-4">
            <div>
              <p className="text-sm font-medium text-green-600">Activos</p>
              <div className="text-2xl font-bold text-green-900 min-h-[1.6rem] flex items-center">
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  estadisticas?.activos ?? 0
                )}
              </div>
            </div>
            <div className="text-2xl">🟢</div>
          </div>
        </Card>

        <Card className="h-full border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between h-full p-4">
            <div>
              <p className="text-sm font-medium text-yellow-600">Por Vencer</p>
              <div className="text-2xl font-bold text-yellow-900 min-h-[1.6rem] flex items-center">
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  estadisticas?.por_vencer ?? 0
                )}
              </div>
            </div>
            <div className="text-2xl">🟡</div>
          </div>
        </Card>

        <Card className="h-full border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between h-full p-4">
            <div>
              <p className="text-sm font-medium text-red-600">Vencidos</p>
              <div className="text-2xl font-bold text-red-900 min-h-[1.6rem] flex items-center">
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  estadisticas?.vencidos ?? 0
                )}
              </div>
            </div>
            <div className="text-2xl">🔴</div>
          </div>
        </Card>

        <Card className="h-full border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between h-full p-4">
            <div>
              <p className="text-sm font-medium text-orange-600">
                Mantenimiento
              </p>
              <div className="text-2xl font-bold text-orange-900 min-h-[1.6rem] flex items-center">
                {loadingStats ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  estadisticas?.mantenimiento ?? 0
                )}
              </div>
            </div>
            <div className="text-2xl">🔧</div>
          </div>
        </Card>
      </div>

      {/* Controles y filtros */}
      <Card className="border border-gray-200 shadow-sm bg-gradient-to-r from-gray-50 to-white">
        <div className="p-6">
          {/* Top bar: 3 inputs con label + botones */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* 3 filtros alineados */}
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {/* Código */}
                <div className="relative">
                  <label
                    htmlFor="f-codigo"
                    className="block mb-1 text-xs font-semibold text-gray-700"
                  >
                    Código
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
                      size={18}
                      aria-hidden
                    />
                    <Input
                      id="f-codigo"
                      placeholder="Buscar por código..."
                      value={searchTerm}
                      onChange={handleTextFilterChange("codigo", setSearchTerm)}
                      className="h-10 pl-9 border-gray-300 focus:border-[#18D043] focus:ring-[#18D043]/20"
                    />
                  </div>
                </div>

                {/* Equipo */}
                <div className="relative">
                  <label
                    htmlFor="f-equipo"
                    className="block mb-1 text-xs font-semibold text-gray-700"
                  >
                    Equipo
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
                      size={18}
                      aria-hidden
                    />
                    <Input
                      id="f-equipo"
                      placeholder="Buscar por equipo..."
                      value={equipoFilter}
                      onChange={handleTextFilterChange(
                        "equipo",
                        setEquipoFilter
                      )}
                      className="h-10 pl-9 border-gray-300 focus:border-[#18D043] focus:ring-[#18D043]/20"
                    />
                  </div>
                </div>

                {/* Ubicación */}
                <div className="relative">
                  <label
                    htmlFor="f-ubicacion"
                    className="block mb-1 text-xs font-semibold text-gray-700"
                  >
                    Ubicación
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
                      size={18}
                      aria-hidden
                    />
                    <Input
                      id="f-ubicacion"
                      placeholder="Buscar por ubicación..."
                      value={ubicacionFilter}
                      onChange={handleTextFilterChange(
                        "ubicacion",
                        setUbicacionFilter
                      )}
                      className="h-10 pl-9 border-gray-300 focus:border-[#18D043] focus:ring-[#18D043]/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botonera derecha */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters((v) => !v)}
                icon={showFilters ? SlidersHorizontal : Filter}
                className={
                  showFilters
                    ? "bg-[#18D043] text-white border-[#18D043]"
                    : "border-gray-300"
                }
              >
                Filtros
              </Button>
              <div className="flex p-1 bg-white border border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded ${
                    viewMode === "table"
                      ? "bg-[#18D043] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-pressed={viewMode === "table"}
                  aria-label="Vista tabla"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-[#18D043] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-pressed={viewMode === "grid"}
                  aria-label="Vista tarjetas"
                >
                  <Grid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadRegistros({
                    page: 1,
                    limit: pagination.itemsPerPage,
                    codigo: searchTerm || undefined,
                    equipo: equipoFilter || undefined,
                    ubicacion: ubicacionFilter || undefined,
                    estado_actual: statusFilter || undefined,
                    fecha_instalacion_desde: installDateFrom || undefined,
                    fecha_instalacion_hasta: installDateTo || undefined,
                    sortBy: "codigo",
                    sortOrder: "ASC",
                  });
                }}
                className="grid grid-cols-1 gap-4 md:grid-cols-12"
              >
                {/* Estado */}
                <div className="md:col-span-3">
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Estado
                  </label>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: "", label: "Todos los estados" },
                      { value: "activo", label: "🟢 Activo" },
                      { value: "por_vencer", label: "🟡 Por Vencer" },
                      { value: "vencido", label: "🔴 Vencido" },
                      { value: "inactivo", label: "⚪ Inactivo" },
                      { value: "mantenimiento", label: "🔧 Mantenimiento" },
                    ]}
                  />
                </div>

                {/* Fechas */}
                <div className="md:col-span-4">
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Fecha instalación (desde)
                  </label>
                  <Input
                    type="date"
                    value={installDateFrom}
                    onChange={(e) => setInstallDateFrom(e.target.value)}
                    className="h-10 border-gray-300"
                    max={installDateTo || undefined}
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Fecha instalación (hasta)
                  </label>
                  <Input
                    type="date"
                    value={installDateTo}
                    onChange={(e) => setInstallDateTo(e.target.value)}
                    className="h-10 border-gray-300"
                    min={installDateFrom || undefined}
                  />
                </div>

                {/* Acciones: propia fila/col para que no se mueva */}
                <div className="flex items-center justify-end gap-2 md:col-span-12">
                  <Button
                    type="submit"
                    className="h-10 min-w-[140px] bg-[#18D043] text-white hover:bg-[#16a34a]"
                  >
                    Aplicar filtros
                  </Button>
                  {(searchTerm ||
                    equipoFilter ||
                    ubicacionFilter ||
                    statusFilter ||
                    installDateFrom ||
                    installDateTo) && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-10 text-gray-600 hover:text-gray-800"
                      onClick={() => {
                        setSearchTerm("");
                        setEquipoFilter("");
                        setUbicacionFilter("");
                        setStatusFilter("");
                        setInstallDateFrom("");
                        setInstallDateTo("");
                        loadRegistros({
                          page: 1,
                          limit: pagination.itemsPerPage,
                          sortBy: "codigo",
                          sortOrder: "ASC",
                        });
                      }}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </Card>

      {/* Contenido principal */}
      <Card className="bg-white border-0 shadow-lg">
        {viewMode === "table" ? (
          <div className="p-6">
            <DataTable
              data={registros}
              columns={columns}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </div>
        ) : (
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                <GridView />
                {/* Paginación para vista grid */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Mostrando{" "}
                      {Math.min(
                        (pagination.currentPage - 1) * pagination.itemsPerPage +
                          1,
                        pagination.totalItems
                      )}{" "}
                      a{" "}
                      {Math.min(
                        pagination.currentPage * pagination.itemsPerPage,
                        pagination.totalItems
                      )}{" "}
                      de {pagination.totalItems} registros
                    </div>
                    <div className="flex items-center space-x-2">
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            page === pagination.currentPage
                              ? "bg-[#18D043] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};