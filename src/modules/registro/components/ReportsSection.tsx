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

      // Hacer la petición para obtener el PDF
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}${url}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
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
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-200 rounded-xl">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-orange-900">
                Reporte de Líneas Vencidas
              </h3>
              <p className="text-sm sm:text-base text-orange-600">
                Genera un PDF con las líneas de vida vencidas en formato de
                tarjetas
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              icon={showFilters ? X : Filter}
              className={`w-full sm:w-auto ${
                showFilters
                  ? "bg-orange-600 text-white border-orange-600"
                  : "border-orange-300 text-orange-600 hover:bg-orange-50"
              }`}
            >
              {showFilters ? "Ocultar" : "Filtros"}
            </Button>

            <Button
              onClick={generateReport}
              loading={loading}
              icon={Download}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
            >
              {loading ? "Generando..." : "Generar PDF"}
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="p-3 sm:p-4 mb-6 border border-orange-200 bg-white/50 rounded-xl">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-orange-700">
                  <Building className="inline w-4 h-4 mr-1" />
                  Cliente
                </label>
                <Input
                  placeholder="Filtrar por cliente..."
                  value={filters.cliente || ""}
                  onChange={(e) =>
                    handleFilterChange("cliente", e.target.value)
                  }
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400/20"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-orange-700">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Ubicación
                </label>
                <Input
                  placeholder="Filtrar por ubicación..."
                  value={filters.ubicacion || ""}
                  onChange={(e) =>
                    handleFilterChange("ubicacion", e.target.value)
                  }
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400/20"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-orange-700">
                  <FileText className="inline w-4 h-4 mr-1" />
                  Código
                </label>
                <Input
                  placeholder="Filtrar por código..."
                  value={filters.codigo || ""}
                  onChange={(e) => handleFilterChange("codigo", e.target.value)}
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400/20"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-orange-700">
                  <Calendar className="inline w-4 h-4 mr-1" />
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
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400/20"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-orange-700">
                  <Calendar className="inline w-4 h-4 mr-1" />
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
                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400/20"
                />
              </div>

              <div className="flex items-end">
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearFilters}
                    className="w-full text-orange-600 hover:bg-orange-100"
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
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs sm:text-sm font-medium text-orange-600">
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
                  className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-medium text-orange-800 bg-orange-200 rounded-full max-w-full"
                >
                  <span className="truncate">
                    {labels[key]}: {value}
                  </span>
                  <button
                    onClick={() =>
                      handleFilterChange(key as keyof ReportFilters, "")
                    }
                    className="ml-1 hover:text-orange-900 flex-shrink-0"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Información adicional */}
        <div className="p-3 sm:p-4 border border-orange-200 bg-white/30 rounded-xl">
          <h4 className="mb-2 text-xs sm:text-sm font-medium text-orange-800">
            ℹ️ Información del reporte
          </h4>
          <ul className="space-y-1 text-xs sm:text-sm text-orange-700">
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
      </div>
    </Card>
  );
};
