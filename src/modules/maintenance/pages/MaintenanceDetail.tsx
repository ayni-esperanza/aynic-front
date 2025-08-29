import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { useApi } from '../../../shared/hooks/useApi';
import { maintenanceService } from "../services/maintenanceService";
import { formatDate, formatDateTime } from "../../../shared/utils/formatters";
import {
  ChevronLeft,
  Calendar,
  User,
  FileText,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  MapPin,
  Building,
} from "lucide-react";
import type { Maintenance } from "../types/maintenance";

export const MaintenanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: maintenance,
    loading,
    error,
  } = useApi(() => maintenanceService.getMaintenance(Number(id)), {
    immediate: true,
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="w-1/4 h-8 mb-4 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="bg-gray-200 h-96 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !maintenance) {
    return (
      <Card className="max-w-2xl py-12 mx-auto text-center">
        <div className="mb-4 text-red-600">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.73 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Mantenimiento no encontrado
        </h3>
        <p className="mb-6 text-gray-600">
          El mantenimiento solicitado no existe o ha sido eliminado.
        </p>
        <Button onClick={() => navigate("/mantenimiento")} icon={ChevronLeft}>
          Volver al listado
        </Button>
      </Card>
    );
  }

  const hasLengthChange =
    maintenance.previous_length_meters && maintenance.new_length_meters;
  const lengthChange = hasLengthChange
    ? maintenance.new_length_meters! - maintenance.previous_length_meters!
    : 0;
  const isLengthIncrease = lengthChange > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              Detalle de Mantenimiento
            </h1>
            <p className="text-gray-600">
              Mantenimiento registrado el{" "}
              {formatDate(maintenance.maintenance_date)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contenido principal */}
        <div className="space-y-6 lg:col-span-2">
          {/* Información del registro */}
          {maintenance.record && (
            <Card>
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Building className="w-5 h-5 mr-2 text-blue-600" />
                Línea de Vida
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Código
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {maintenance.record.codigo}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Cliente
                    </label>
                    <p className="text-gray-900">
                      {maintenance.record.cliente}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    Ubicación
                  </label>
                  <p className="text-gray-900">
                    {maintenance.record.ubicacion}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Detalles del mantenimiento */}
          <Card>
            <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Detalles del Mantenimiento
            </h2>

            <div className="space-y-4">
              <div className="flex items-center p-4 space-x-4 border border-green-200 rounded-lg bg-green-50">
                <Calendar className="w-6 h-6 text-green-600" />
                <div>
                  <label className="text-sm font-medium text-green-700">
                    Fecha de mantenimiento
                  </label>
                  <p className="text-lg font-semibold text-green-900">
                    {formatDate(maintenance.maintenance_date)}
                  </p>
                </div>
              </div>

              {maintenance.description && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">
                    Descripción
                  </label>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {maintenance.description}
                    </p>
                  </div>
                </div>
              )}

              {hasLengthChange && (
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <label className="flex items-center block mb-2 text-sm font-medium text-blue-700">
                    {isLengthIncrease ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    Cambio de Longitud
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-blue-600">Anterior</p>
                      <p className="text-xl font-bold text-blue-900">
                        {maintenance.previous_length_meters}m
                      </p>
                    </div>
                    <div className="text-blue-400">→</div>
                    <div className="text-center">
                      <p className="text-sm text-blue-600">Nueva</p>
                      <p className="text-xl font-bold text-blue-900">
                        {maintenance.new_length_meters}m
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-600">Cambio</p>
                      <p
                        className={`text-xl font-bold ${
                          isLengthIncrease ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isLengthIncrease ? "+" : ""}
                        {lengthChange.toFixed(1)}m
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Imagen del mantenimiento */}
          {maintenance.image_url && (
            <Card>
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
                Imagen del Mantenimiento
              </h2>
              <div className="space-y-4">
                <div className="overflow-hidden border border-gray-200 rounded-xl">
                  <img
                    src={maintenance.image_url}
                    alt="Imagen del mantenimiento"
                    className="object-contain w-full h-auto max-h-96 bg-gray-50"
                    onClick={() => window.open(maintenance.image_url, "_blank")}
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{maintenance.image_filename}</span>
                  {maintenance.image_size && (
                    <span>
                      {(maintenance.image_size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open(maintenance.image_url, "_blank")}
                  icon={ImageIcon}
                  className="w-full"
                >
                  Ver imagen completa
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar con información adicional */}
        <div className="space-y-6">
          {/* Información de registro */}
          <Card>
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <User className="w-5 h-5 mr-2 text-gray-600" />
              Información de Registro
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Registrado por
                </label>
                <p className="font-medium text-gray-900">
                  {maintenance.user
                    ? `${maintenance.user.nombre} ${maintenance.user.apellidos}`
                    : "Sistema"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Fecha de registro
                </label>
                <p className="text-gray-900">
                  {formatDateTime(maintenance.created_at)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">ID</label>
                <p className="font-mono text-sm text-gray-900">
                  #{maintenance.id}
                </p>
              </div>
            </div>
          </Card>

          {/* Estado y etiquetas */}
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Estado</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tipo:</span>
                <Badge variant="primary">Mantenimiento</Badge>
              </div>

              {hasLengthChange && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Cambio longitud:
                  </span>
                  <Badge variant={isLengthIncrease ? "success" : "warning"}>
                    {isLengthIncrease ? "Incremento" : "Reducción"}
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Con imagen:</span>
                <Badge
                  variant={maintenance.image_url ? "success" : "secondary"}
                >
                  {maintenance.image_url ? "Sí" : "No"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Acciones */}
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Acciones
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/registro/${maintenance.record_id}`)}
              >
                Ver Línea de Vida
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  navigate(`/mantenimiento/record/${maintenance.record_id}`)
                }
              >
                Ver Todos los Mantenimientos
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
