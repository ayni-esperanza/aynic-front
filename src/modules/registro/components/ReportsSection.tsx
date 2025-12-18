import React, { useState } from "react";
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { useToast } from '../../../shared/components/ui/Toast';
import {
  FileText,
  Download,
  Filter,
  X,
  Calendar,
  MapPin,
  Building,
  AlertCircle,
} from "lucide-react";
import { apiClient } from '../../../shared/services/apiClient';

interface ReportFilters {
  cliente?: string;
  ubicacion?: string;
  codigo?: string;
  fecha_vencimiento_desde?: string;
  fecha_vencimiento_hasta?: string;
}

export const ReportsSection: React.FC = () => {
  const { success, error: showError } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({});

  const handleFilterChange = (field: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams();

      if (filters.cliente) params.append("cliente", filters.cliente);
      if (filters.ubicacion) params.append("ubicacion", filters.ubicacion);
      if (filters.codigo) params.append("codigo", filters.codigo);
      if (filters.fecha_vencimiento_desde) {
        params.append(
          "fecha_vencimiento_desde",
          filters.fecha_vencimiento_desde
        );
      }
      if (filters.fecha_vencimiento_hasta) {
        params.append(
          "fecha_vencimiento_hasta",
          filters.fecha_vencimiento_hasta
        );
      }

      const queryString = params.toString();
      const url = `/reports/expired-records/pdf${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}${url}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Para incluir cookies de sesión
        }
      );

      if (!response.ok) {
        throw new Error("Error al generar el reporte");
      }

      // Obtener el blob del PDF
      const blob = await response.blob();

      // Obtener el nombre del archivo desde los headers o usar uno por defecto
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "reporte-lineas-vencidas.pdf";

      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          contentDisposition
        );
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // Crear URL del blob y descargar
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Obtener información adicional del reporte si está disponible
      const totalRecords = response.headers.get("X-Report-Records");

      success(
        "Reporte generado exitosamente",
        totalRecords
          ? `Se incluyeron ${totalRecords} líneas vencidas`
          : undefined
      );
    } catch (error) {
      console.error("Error generating report:", error);
      showError(
        "Error al generar reporte",
        error instanceof Error ? error.message : "Error desconocido"
      );
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value.trim() !== ""
  );

  return (
    <Card className="border-emerald-200 dark:border-emerald-700/50 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900">
      <div className="p-2 sm:p-3">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-emerald-200 dark:bg-emerald-900/50 rounded-xl">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-emerald-900 dark:text-emerald-100">
                Reporte de Líneas Vencidas
              </h3>
              <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-300">
                Genera un PDF con las líneas de vida vencidas en formato de
                tarjetas
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              icon={showFilters ? X : Filter}
              className={`w-full sm:w-auto h-8 ${
                showFilters
                  ? "bg-emerald-600 dark:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-600"
                  : "border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
              }`}
            >
              {showFilters ? "Ocultar" : "Filtros"}
            </Button>

            <Button
              onClick={generateReport}
              loading={loading}
              icon={Download}
              className="w-full sm:w-auto h-8 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 hover:from-emerald-700 hover:to-emerald-800 dark:hover:from-emerald-600 dark:hover:to-emerald-700"
            >
              {loading ? "Generando..." : "Generar PDF"}
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="p-2 sm:p-2.5 mb-2 border border-emerald-200 dark:border-emerald-700/50 bg-white/50 dark:bg-gray-800/80 rounded-xl">
            <div className="grid grid-cols-1 gap-2 sm:gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block mb-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <Building className="inline w-3.5 h-3.5 mr-1" />
                  Cliente
                </label>
                <Input
                  placeholder="Filtrar por cliente..."
                  value={filters.cliente || ""}
                  onChange={(e) =>
                    handleFilterChange("cliente", e.target.value)
                  }
                  className="h-8 text-sm border-emerald-200 dark:border-emerald-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:border-emerald-400 dark:focus:border-emerald-400 focus:ring-emerald-400/20"
                />
              </div>

              <div>
                <label className="block mb-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <MapPin className="inline w-3.5 h-3.5 mr-1" />
                  Ubicación
                </label>
                <Input
                  placeholder="Filtrar por ubicación..."
                  value={filters.ubicacion || ""}
                  onChange={(e) =>
                    handleFilterChange("ubicacion", e.target.value)
                  }
                  className="h-8 text-sm border-emerald-200 dark:border-emerald-700 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-emerald-400/20"
                />
              </div>

              <div>
                <label className="block mb-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <FileText className="inline w-3.5 h-3.5 mr-1" />
                  Código
                </label>
                <Input
                  placeholder="Filtrar por código..."
                  value={filters.codigo || ""}
                  onChange={(e) => handleFilterChange("codigo", e.target.value)}
                  className="h-8 text-sm border-emerald-200 dark:border-emerald-700 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-emerald-400/20"
                />
              </div>

              <div>
                <label className="block mb-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <Calendar className="inline w-3.5 h-3.5 mr-1" />
                  Fecha vencimiento (desde)
                </label>
                <Input
                  type="date"
                  value={filters.fecha_vencimiento_desde || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "fecha_vencimiento_desde",
                      e.target.value
                    )
                  }
                  className="h-8 text-sm border-emerald-200 dark:border-emerald-700 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-emerald-400/20"
                />
              </div>

              <div>
                <label className="block mb-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <Calendar className="inline w-3.5 h-3.5 mr-1" />
                  Fecha vencimiento (hasta)
                </label>
                <Input
                  type="date"
                  value={filters.fecha_vencimiento_hasta || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "fecha_vencimiento_hasta",
                      e.target.value
                    )
                  }
                  className="h-8 text-sm border-emerald-200 dark:border-emerald-700 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-emerald-400/20"
                />
              </div>

              <div className="flex items-end">
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearFilters}
                    className="w-full h-8 text-sm text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Indicadores de filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-300">
              Filtros activos:
            </span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;

              const labels: Record<string, string> = {
                cliente: "Cliente",
                ubicacion: "Ubicación",
                codigo: "Código",
                fecha_vencimiento_desde: "Desde",
                fecha_vencimiento_hasta: "Hasta",
              };

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-100 bg-emerald-200 dark:bg-emerald-800/60 rounded-full max-w-full"
                >
                  <span className="truncate">
                    {labels[key]}: {value}
                  </span>
                  <button
                    onClick={() =>
                      handleFilterChange(key as keyof ReportFilters, "")
                    }
                    className="ml-1 hover:text-emerald-900 dark:hover:text-emerald-100 flex-shrink-0"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Información adicional - Solo se muestra cuando hay filtros activos */}
        {hasActiveFilters && (
          <div className="p-2 sm:p-2.5 border border-emerald-200 dark:border-emerald-700/50 bg-white/30 dark:bg-gray-800/60 rounded-xl">
            <h4 className="mb-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Información del reporte
            </h4>
            <ul className="space-y-0.5 text-xs text-emerald-700 dark:text-emerald-300">
              <li>
                • Se generarán tarjetas solo para líneas de vida con estado
                "VENCIDO"
              </li>
              <li>
                • Cada tarjeta incluye: código, cliente, ubicación, fecha de
                vencimiento y días vencidos
              </li>
              <li>• El PDF incluirá fecha de generación y filtros aplicados</li>
              <li>
                • Si no hay líneas vencidas, se generará un reporte indicando "sin
                datos"
              </li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
