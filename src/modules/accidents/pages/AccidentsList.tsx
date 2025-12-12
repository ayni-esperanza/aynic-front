import React, { useState, useEffect } from "react";
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { DataTable } from '../../../shared/components/common/DataTable';
import { useToast } from '../../../shared/components/ui/Toast';
import { ConfirmDeleteModal } from '../../../shared/components/ui/ConfirmDeleteModal';
import { AccidentStats } from "../components/AccidentStats";
import { AccidentFilters } from "../components/AccidentFilters";
import { AccidentForm } from "./AccidentForm";
import { Plus, Edit } from "lucide-react";
import { accidentService } from "../services/accidentService";
import { formatDate } from '../../../shared/utils/formatters';
import type {
  Accident,
  AccidentFilters as FilterType,
  EstadoAccidente,
  SeveridadAccidente,
  AccidentsPaginatedResponse,
} from "../types/accident";
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
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lineasVida, setLineasVida] = useState<
    Array<{ id: number; codigo: string; cliente: string; ubicacion: string }>
  >([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAccident, setSelectedAccident] = useState<
    Accident | undefined
  >();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [accidentToDelete, setAccidentToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    loadAccidents(newFilters);
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

  const handleItemsPerPageChange = (limit: number) => {
    const newFilters = { ...filters, page: 1, limit };
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

  const handleFilterClick = (filterType: 'all' | 'reportado' | 'investigacion' | 'resuelto' | 'critico') => {
    let newFilters: FilterType = { ...filters, page: 1 };
    
    switch (filterType) {
      case 'all':
        // Limpiar filtros de estado y severidad
        delete newFilters.estado;
        delete newFilters.severidad;
        break;
      case 'reportado':
        newFilters.estado = 'REPORTADO' as EstadoAccidente;
        delete newFilters.severidad;
        break;
      case 'investigacion':
        newFilters.estado = 'EN_INVESTIGACION' as EstadoAccidente;
        delete newFilters.severidad;
        break;
      case 'resuelto':
        newFilters.estado = 'RESUELTO' as EstadoAccidente;
        delete newFilters.severidad;
        break;
      case 'critico':
        delete newFilters.estado;
        newFilters.severidad = 'CRITICO' as SeveridadAccidente;
        break;
    }
    
    setFilters(newFilters);
    loadAccidents(newFilters);
  };

  const handleNewAccident = () => {
    setSelectedAccident(undefined);
    setShowForm(true);
  };

  const handleViewAccident = (accident: Accident) => {
    setSelectedAccident(accident);
    setShowForm(true);
  };

  const handleDeleteAccident = async (accidentId: number) => {
    setAccidentToDelete(accidentId);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!accidentToDelete) return;

    setDeleting(true);
    try {
      await accidentService.deleteAccident(accidentToDelete);
      success("Éxito", "Accidente eliminado correctamente");
      loadAccidents();
      setShowForm(false);
      setSelectedAccident(undefined);
    } catch (err) {
      error("Error", "No se pudo eliminar el accidente");
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
      setAccidentToDelete(null);
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
      render: (value, record) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {record.linea_vida_codigo || `ID: ${record.linea_vida_id}`}
          </div>
          {record.linea_vida_cliente && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
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
      render: (value) => formatDate(value as Date),
    },
    {
      key: "descripcion",
      label: "Descripción",
      sortable: false,
      render: (value) => (
        <div className="max-w-xs">
          <p className="truncate text-gray-900 dark:text-white" title={value as string}>
            {value as string}
          </p>
        </div>
      ),
    },
    {
      key: "lesiones",
      label: "Persona Involucrada",
      sortable: false,
      render: (value) => value || "-",
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
      key: "usuario",
      label: "Reportado Por",
      sortable: false,
      render: (value, record) =>
        record.usuario
          ? `${record.usuario.nombre} ${record.usuario.apellidos}`
          : "-",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Accidentes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra todos los reportes de incidentes del sistema
          </p>
        </div>
        <Button onClick={handleNewAccident} icon={Plus}>
          Nuevo Accidente
        </Button>
      </div>

      {/* Estadísticas */}
      <AccidentStats statistics={statistics} loading={statsLoading} onFilterClick={handleFilterClick} />

      {/* Filtros */}
      <Card className="p-6">
        <AccidentFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          lineasVida={lineasVida}
          loading={loading}
        />
      </Card>

      {/* Tabla de accidentes */}
      <DataTable
        data={accidents}
        columns={columns}
        currentPage={pagination?.page || 1}
        totalPages={pagination?.totalPages || 1}
        totalItems={pagination?.total || 0}
        onPageChange={handlePageChange}
        onSort={handleSort}
        loading={loading}
        onRowClick={handleViewAccident}
        itemsPerPage={filters.limit || 10}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPageOptions={[5, 10, 25, 50, 100]}
        density="compact"
      />

      {/* Modal de formulario */}
      <AccidentForm
        accident={selectedAccident}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        onDelete={handleDeleteAccident}
        lineasVida={lineasVida}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setAccidentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Eliminar Accidente"
        message="¿Estás seguro de que deseas eliminar este accidente?"
        itemName={accidentToDelete ? `#${accidentToDelete}` : undefined}
      />
    </div>
  );
};
