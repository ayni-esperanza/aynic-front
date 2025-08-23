import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataTable } from "../../../components/common/DataTable";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { useApi } from "../../../hooks/useApi";
import { maintenanceService } from "../services/maintenanceService";
import { formatDate, formatDateTime } from "../../../utils/formatters";
import {
  ChevronLeft,
  Plus,
  Eye,
  Image,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building,
} from "lucide-react";
import type { Maintenance } from "../types/maintenance";
import type { TableColumn } from "../../../types";

export const MaintenanceRecordView: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();

  const {
    data: maintenances,
    loading,
    error,
  } = useApi(
    () => maintenanceService.getMaintenancesByRecord(Number(recordId)),
    { immediate: true }
  );

  const handleViewImage = (imageUrl: string) => {
    window.open(imageUrl, "_blank");
  };

  const columns: TableColumn<Maintenance>[] = [
    {
      key: "maintenance_date",
      label: "Fecha",
      sortable: true,
      render: (value) => (
        <div className="font-medium text-gray-900">
          {formatDate(value as Date)}
        </div>
      ),
    },
    {
      key: "description",
      label: "Descripción",
      render: (value) => (
        <div className="max-w-xs">
          <div
            className="text-sm text-gray-900 truncate"
            title={value as string}
          >
            {value || "Sin descripción"}
          </div>
        </div>
      ),
    },
    {
      key: "new_length_meters",
      label: "Cambio Longitud",
      render: (value, record) => {
        if (record.previous_length_meters && record.new_length_meters) {
          const change =
            record.new_length_meters - record.previous_length_meters;
          const isIncrease = change > 0;

          return (
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isIncrease
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isIncrease ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                <span>
                  {isIncrease ? "+" : ""}
                  {change.toFixed(1)}m
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {record.previous_length_meters}m → {record.new_length_meters}m
              </div>
            </div>
          );
        }

        return (
          <Badge variant="secondary" size="sm">
            Sin cambio
          </Badge>
        );
      },
    },
    {
      key: "image_url",
      label: "Imagen",
      render: (value) =>
        value ? (
          <Button
            variant="ghost"
            size="sm"
            icon={Image}
            onClick={() => handleViewImage(value as string)}
          >
            Ver
          </Button>
        ) : (
          <span className="text-sm text-gray-400">Sin imagen</span>
        ),
    },
    {
      key: "user",
      label: "Registrado por",
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {record.user
              ? `${record.user.nombre} ${record.user.apellidos}`
              : "Sistema"}
          </div>
          <div className="text-gray-500">
            {formatDateTime(record.created_at)}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_, record) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={() => navigate(`/mantenimiento/${record.id}`)}
        >
          Ver Detalle
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="w-1/3 h-8 mb-6 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl py-12 mx-auto text-center">
        <div className="mb-4 text-red-600">
          <Building className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Error al cargar mantenimientos
        </h3>
        <p className="mb-6 text-gray-600">{error}</p>
        <Button onClick={() => navigate("/mantenimiento")} icon={ChevronLeft}>
          Volver al listado
        </Button>
      </Card>
    );
  }

  const record = maintenances?.[0]?.record;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/mantenimiento")}
            icon={ChevronLeft}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mantenimientos del Registro
            </h1>
            {record && (
              <p className="text-gray-600">
                {record.codigo} - {record.cliente}
              </p>
            )}
          </div>
        </div>
        <Button
          icon={Plus}
          onClick={() =>
            navigate("/mantenimiento/nuevo", {
              state: { selectedRecordId: recordId },
            })
          }
        >
          Nuevo Mantenimiento
        </Button>
      </div>

      {/* Información del registro */}
      {record && (
        <Card>
          <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Información del Registro
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Código
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {record.codigo}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Cliente
              </label>
              <p className="text-gray-900">{record.cliente}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Ubicación
              </label>
              <p className="text-gray-900">{record.ubicacion}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Estadísticas rápidas */}
      {maintenances && maintenances.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="text-center">
            <div className="p-4">
              <div className="mb-2 text-2xl font-bold text-blue-600">
                {maintenances.length}
              </div>
              <div className="text-sm text-gray-600">Total Mantenimientos</div>
            </div>
          </Card>
          <Card className="text-center">
            <div className="p-4">
              <div className="mb-2 text-2xl font-bold text-green-600">
                {
                  maintenances.filter(
                    (m) => m.new_length_meters && m.previous_length_meters
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">
                Con Cambio de Longitud
              </div>
            </div>
          </Card>
          <Card className="text-center">
            <div className="p-4">
              <div className="mb-2 text-2xl font-bold text-purple-600">
                {maintenances.filter((m) => m.image_url).length}
              </div>
              <div className="text-sm text-gray-600">Con Imagen</div>
            </div>
          </Card>
          <Card className="text-center">
            <div className="p-4">
              <div className="mb-2 text-2xl font-bold text-orange-600">
                {formatDate(maintenances[0]?.maintenance_date)}
              </div>
              <div className="text-sm text-gray-600">Último Mantenimiento</div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabla de mantenimientos */}
      <Card>
        <DataTable
          data={maintenances || []}
          columns={columns}
          currentPage={1}
          totalPages={1}
          totalItems={maintenances?.length || 0}
          onPageChange={() => {}}
          loading={loading}
          stickyHeader={false}
        />
      </Card>
    </div>
  );
};
