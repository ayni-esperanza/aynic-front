import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { DataTable } from "../../../components/common/DataTable";
import { useToast } from "../../../components/ui/Toast";
import { AccidentStats } from "../components/AccidentStats";
import { AccidentFilters } from "../components/AccidentFilters";
import { AccidentForm } from "./AccidentForm";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { accidentService } from "../services/accidentService";
import { formatDate } from "../../../utils/formatters";
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
    console.log("Ver accidente:", accident);
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
      key: "lineaVida",
      label: "Línea de Vida",
      sortable: false,
      render: (value, record) => (
        <div>
          <div className="font-medium text-gray-900">
            {record.lineaVida?.codigo || `ID: ${record.linea_vida_id}`}
          </div>
          {record.lineaVida?.cliente && (
            <div className="text-sm text-gray-500">
              {record.lineaVida.cliente}
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
      key: "descripcion_incidente",
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
      key: "persona_involucrada",
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
    {
      key: "acciones",
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
          />
          <Button
            size="sm"
            variant="outline"
            icon={Edit}
            onClick={() => handleEditAccident(record)}
            title="Editar"
          />
          <Button
            size="sm"
            variant="outline"
            icon={Trash2}
            onClick={() => handleDeleteAccident(record)}
            title="Eliminar"
            className="text-red-600 hover:text-red-700"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Accidentes
          </h1>
          <p className="text-gray-600">
            Administra todos los reportes de incidentes del sistema
          </p>
        </div>
        <Button onClick={handleNewAccident} icon={Plus}>
          Nuevo Accidente
        </Button>
      </div>

      {/* Estadísticas */}
      <AccidentStats statistics={statistics} loading={statsLoading} />

      {/* Filtros */}
      <Card className="p-6">
        <AccidentFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
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
      />

      {/* Modal de formulario */}
      <AccidentForm
        accident={selectedAccident}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        lineasVida={lineasVida}
      />
    </div>
  );
};
