import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { DataTable } from "../../../components/common/DataTable";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { usePagination } from "../../../hooks/usePagination";
import { useAppStore } from "../../../store";
import { mockDataRecords } from "../../../services/mockData";
import { formatDate } from "../../../utils/formatters";
import type { DataRecord, TableColumn } from "../../../types";

export const RegistroList: React.FC = () => {
  const navigate = useNavigate();
  const { registros, setRegistros, deleteRegistro } = useAppStore();

  // Estados para filtros y vista
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (registros.length === 0) {
      setRegistros(mockDataRecords);
    }
  }, [registros.length, setRegistros]);

  // Filtros aplicados
  const filteredRegistros = useMemo(() => {
    let filtered = registros;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (registro) =>
          registro.codigo.toLowerCase().includes(search) ||
          registro.cliente.toLowerCase().includes(search) ||
          registro.equipo.toLowerCase().includes(search) ||
          registro.ubicacion.toLowerCase().includes(search)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (registro) => registro.estado_actual === statusFilter
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(
        (registro) => registro.tipo_linea === typeFilter
      );
    }

    return filtered;
  }, [registros, searchTerm, statusFilter, typeFilter]);

  const { paginatedData, paginationState, goToPage } = usePagination({
    data: filteredRegistros,
    itemsPerPage: 10,
  });

  const handleDeleteRegistro = (registroId: string, codigo: string) => {
    if (
      confirm(`¿Estás seguro de que quieres eliminar el registro "${codigo}"?`)
    ) {
      deleteRegistro(registroId);
    }
  };

  const getEstadoConfig = (estado: DataRecord["estado_actual"]) => {
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
  };

  const columns: TableColumn<DataRecord>[] = useMemo(
    () => [
      {
        key: "codigo",
        label: "Código",
        sortable: true,
        render: (value: any) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">
                {String(value).slice(-2)}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{String(value)}</div>
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
        key: "fv_anios",
        label: "FV Años",
        width: "100",
        render: (value: any) => (
          <span className="inline-flex items-center px-2 py-1 font-mono text-sm text-purple-800 bg-purple-100 rounded-md">
            {value}
          </span>
        ),
      },
      {
        key: "fv_meses",
        label: "FV Meses",
        width: "100",
        render: (value: any) => (
          <span className="inline-flex items-center px-2 py-1 font-mono text-sm text-purple-800 bg-purple-100 rounded-md">
            {value}
          </span>
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
        key: "fecha_vencimiento",
        label: "F. Vencimiento",
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
            ></Button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  // Vista en cuadrícula
  const GridView = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {paginatedData.map((registro) => {
        const estadoConfig = getEstadoConfig(registro.estado_actual);
        return (
          <Card
            key={registro.id}
            className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#18D043]"
          >
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
                    {registro.estado_actual}
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

  // Estadísticas rápidas
  const estadisticasResumen = useMemo(() => {
    const total = filteredRegistros.length;
    const activos = filteredRegistros.filter(
      (r) => r.estado_actual === "activo"
    ).length;
    const mantenimiento = filteredRegistros.filter(
      (r) => r.estado_actual === "mantenimiento"
    ).length;
    const vencidos = filteredRegistros.filter(
      (r) => r.estado_actual === "vencido"
    ).length;

    return { total, activos, mantenimiento, vencidos };
  }, [filteredRegistros]);

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
                {estadisticasResumen.total} registros
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900">
                {estadisticasResumen.total}
              </p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </Card>
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-green-600">Activos</p>
              <p className="text-2xl font-bold text-green-900">
                {estadisticasResumen.activos}
              </p>
            </div>
            <div className="text-2xl">🟢</div>
          </div>
        </Card>
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-yellow-600">
                Mantenimiento
              </p>
              <p className="text-2xl font-bold text-yellow-900">
                {estadisticasResumen.mantenimiento}
              </p>
            </div>
            <div className="text-2xl">🟡</div>
          </div>
        </Card>
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-red-600">Vencidos</p>
              <p className="text-2xl font-bold text-red-900">
                {estadisticasResumen.vencidos}
              </p>
            </div>
            <div className="text-2xl">🔴</div>
          </div>
        </Card>
      </div>

      {/* Controles y filtros */}
      <Card className="border border-gray-200 shadow-sm bg-gradient-to-r from-gray-50 to-white">
        <div className="p-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            {/* Barra de búsqueda */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search
                  className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                  size={20}
                />
                <Input
                  placeholder="Buscar por código, cliente, equipo o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#18D043] focus:ring-[#18D043]/20"
                />
              </div>
            </div>

            {/* Controles de vista y filtros */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
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
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded ${
                    viewMode === "table"
                      ? "bg-[#18D043] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-[#18D043] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Grid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: "", label: "Todos los estados" },
                    { value: "activo", label: "🟢 Activo" },
                    { value: "inactivo", label: "⚪ Inactivo" },
                    { value: "mantenimiento", label: "🟡 Mantenimiento" },
                    { value: "vencido", label: "🔴 Vencido" },
                  ]}
                />
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  options={[
                    { value: "", label: "Todos los tipos" },
                    { value: "Fibra Óptica", label: "🔗 Fibra Óptica" },
                    { value: "Cobre", label: "🔗 Cobre" },
                    { value: "Inalámbrica", label: "📡 Inalámbrica" },
                    { value: "Satelital", label: "🛰️ Satelital" },
                  ]}
                />
                <div className="flex items-center space-x-2">
                  {(searchTerm || statusFilter || typeFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("");
                        setTypeFilter("");
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Contenido principal */}
      <Card className="bg-white border-0 shadow-lg">
        {viewMode === "table" ? (
          <div className="p-6">
            <DataTable
              data={paginatedData}
              columns={columns}
              currentPage={paginationState.currentPage}
              totalPages={paginationState.totalPages}
              totalItems={paginationState.totalItems}
              onPageChange={goToPage}
            />
          </div>
        ) : (
          <div className="p-6">
            <GridView />
            {/* Paginación para vista grid */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Mostrando{" "}
                {Math.min(
                  (paginationState.currentPage - 1) * 10 + 1,
                  paginationState.totalItems
                )}{" "}
                a{" "}
                {Math.min(
                  paginationState.currentPage * 10,
                  paginationState.totalItems
                )}{" "}
                de {paginationState.totalItems} registros
              </div>
              <div className="flex items-center space-x-2">
                {Array.from(
                  { length: paginationState.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      page === paginationState.currentPage
                        ? "bg-[#18D043] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};