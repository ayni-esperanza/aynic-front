import React, { useState, useEffect } from "react";
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { DataTable } from '../../../shared/components/common/DataTable';
import { useToast } from '../../../shared/components/ui/Toast';
import { AccidentStats } from "../components/AccidentStats";
import { AccidentFilters } from "../components/AccidentFilters";
import { AccidentForm } from "./AccidentForm";
import { AccidentDetails } from "../components/AccidentDetails";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { accidentService } from "../services/accidentService";
import { formatDate } from '../../../shared/utils/formatters';
import type {
  Accident,
  AccidentFilters as FilterType,
  AccidentsPaginatedResponse,
  AccidentStatistics,
} from "../types/accident";
import { EstadoAccidente, SeveridadAccidente } from "../types/accident";
import type { TableColumn } from "../../../types";

export const AccidentsList: React.FC = () => {
  const { success, error } = useToast();
  const [filters, setFilters] = useState<FilterType>({
    page: 1,
    limit: 10,
  });
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<AccidentStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lineasVida, setLineasVida] = useState<
    Array<{ id: string; codigo: string; cliente: string; ubicacion: string }>
  >([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAccident, setSelectedAccident] = useState<
    Accident | undefined
  >();

  // Función para cargar accidentes
  const loadAccidents = async (newFilters?: FilterType) => {
    try {
      setLoading(true);
      const filtersToUse = newFilters || filters;
      const response: AccidentsPaginatedResponse =
        await accidentService.getAccidents(filtersToUse);
      setAccidents(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error loading accidents:", err);
      // Solo mostrar error si no es la carga inicial
      if (accidents.length > 0 || newFilters) {
        error("Error", "No se pudieron cargar los accidentes");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAccidents();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setStatsLoading(true);
        const stats = await accidentService.getStatistics();
        setStatistics(stats);
      } catch (err) {
        console.error("Error loading statistics:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStatistics();
  }, []);

  // Cargar líneas de vida para el filtro
  useEffect(() => {
    const loadLineasVida = async () => {
      try {
        const lineas = await accidentService.getLineasVida();
        setLineasVida(lineas);
      } catch (err) {
        console.error("Error loading líneas de vida:", err);
        // Mantener array vacío si hay error
        setLineasVida([]);
      }
    };

    loadLineasVida();
  }, []);

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    loadAccidents(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterType = {
      page: 1,
      limit: 10,
    };
    setFilters(clearedFilters);
    loadAccidents(clearedFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadAccidents(newFilters);
  };

  const handleSort = (column: keyof Accident, direction: "asc" | "desc") => {
    const newFilters = {
      ...filters,
      sortBy: column as string,
      sortOrder: direction.toUpperCase() as "ASC" | "DESC",
    };
    setFilters(newFilters);
    loadAccidents(newFilters);
  };

  const handleNewAccident = () => {
    setSelectedAccident(undefined);
    setShowForm(true);
  };

  const handleViewAccident = (accident: Accident) => {
    setSelectedAccident(accident);
    setShowDetails(true);
  };

  const handleEditAccident = (accident: Accident) => {
    setSelectedAccident(accident);
    setShowForm(true);
  };

  const handleDeleteAccident = async (accident: Accident) => {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar el accidente #${accident.id}?`
      )
    ) {
      return;
    }

    try {
      await accidentService.deleteAccident(accident.id);
      success("Éxito", "Accidente eliminado correctamente");
      loadAccidents();
    } catch (err) {
      error("Error", "No se pudo eliminar el accidente");
    }
  };

  const handleFormSuccess = () => {
    loadAccidents();
    // Recargar estadísticas también
    const loadStats = async () => {
      try {
        const stats = await accidentService.getStatistics();
        setStatistics(stats);
      } catch (err) {
        console.error("Error loading statistics:", err);
      }
    };
    loadStats();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedAccident(undefined);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedAccident(undefined);
  };

  // Función para renderizar badge de estado
  const renderEstadoBadge = (estado: EstadoAccidente) => {
    const variants = {
      REPORTADO: "warning" as const,
      EN_INVESTIGACION: "secondary" as const,
      RESUELTO: "success" as const,
    };

    const labels = {
      REPORTADO: "Reportado",
      EN_INVESTIGACION: "En Investigación",
      RESUELTO: "Resuelto",
    };

    return (
      <Badge variant={variants[estado]} size="sm">
        {labels[estado]}
      </Badge>
    );
  };

  // Función para renderizar badge de severidad
  const renderSeveridadBadge = (severidad: SeveridadAccidente) => {
    const variants = {
      LEVE: "secondary" as const,
      MODERADO: "warning" as const,
      GRAVE: "danger" as const,
      CRITICO: "danger" as const,
    };

    const labels = {
      LEVE: "Leve",
      MODERADO: "Moderado",
      GRAVE: "Grave",
      CRITICO: "Crítico",
    };

    return (
      <Badge variant={variants[severidad]} size="sm">
        {labels[severidad]}
      </Badge>
    );
  };

  // Definir columnas de la tabla
  const columns: TableColumn<Accident>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      width: "w-16",
      render: (value) => `#${value}`,
    },
    {
      key: "linea_vida_codigo",
      label: "Línea de Vida",
      sortable: false,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">
            {record.linea_vida_codigo || `ID: ${record.linea_vida_id}`}
          </div>
          {record.linea_vida_cliente && (
            <div className="text-sm text-gray-500">
              {record.linea_vida_cliente}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "fecha_accidente",
      label: "Fecha Accidente",
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      key: "descripcion",
      label: "Descripción",
      sortable: false,
      render: (value) => (
        <div className="max-w-xs">
          <p className="truncate" title={value as string}>
            {value as string}
          </p>
        </div>
      ),
    },
    {
      key: "lesiones",
      label: "Lesiones",
      sortable: false,
      render: (value) => (value as string) || "-",
    },
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (value) => renderEstadoBadge(value as EstadoAccidente),
    },
    {
      key: "severidad",
      label: "Severidad",
      sortable: true,
      render: (value) => renderSeveridadBadge(value as SeveridadAccidente),
    },
    {
      key: "created_at",
      label: "Reportado",
      sortable: false,
      render: (value) => formatDate(value as string),
    },
    {
      key: "actions" as keyof Accident,
      label: "Acciones",
      sortable: false,
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => handleViewAccident(record)}
            title="Ver detalles"
          >
            Ver
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={Edit}
            onClick={() => handleEditAccident(record)}
            title="Editar"
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={Trash2}
            onClick={() => handleDeleteAccident(record)}
            title="Eliminar"
            className="text-red-600 hover:text-red-700"
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl px-3 py-4 mx-auto sm:px-6 sm:py-6 lg:px-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Gestión de Accidentes
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Administra todos los reportes de incidentes del sistema
              </p>
            </div>
            <Button onClick={handleNewAccident} icon={Plus} className="w-full sm:w-auto">
              Nuevo Accidente
            </Button>
          </div>

          {/* Estadísticas */}
          <AccidentStats statistics={statistics} loading={statsLoading} />

          {/* Filtros */}
          <Card className="p-4 sm:p-6">
            <AccidentFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
              onClearFilters={handleClearFilters}
              lineasVida={lineasVida as any}
              loading={loading}
            />
          </Card>

          {/* Tabla de accidentes */}
          <DataTable
            data={accidents as any}
            columns={columns}
            currentPage={pagination?.page || 1}
            totalPages={pagination?.totalPages || 1}
            totalItems={pagination?.total || 0}
            onPageChange={handlePageChange}
            onSort={handleSort as any}
            loading={loading}
          />

          {/* Modal de formulario */}
          <AccidentForm
            accident={selectedAccident}
            isOpen={showForm}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
            lineasVida={lineasVida}
          />

          {/* Modal de detalles */}
          {selectedAccident && (
            <AccidentDetails
              accident={selectedAccident}
              isOpen={showDetails}
              onClose={handleCloseDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};
