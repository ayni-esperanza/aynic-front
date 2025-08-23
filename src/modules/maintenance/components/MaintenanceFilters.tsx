import React, { useState } from "react";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { Search, Filter, X, Calendar } from "lucide-react";
import type { MaintenanceFilters } from "../types/maintenance";

interface MaintenanceFiltersProps {
  filters: MaintenanceFilters;
  onFiltersChange: (filters: MaintenanceFilters) => void;
  onClearFilters: () => void;
  loading?: boolean;
  records?: Array<{ id: number; codigo: string; cliente: string }>;
}

export const MaintenanceFiltersComponent: React.FC<MaintenanceFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false,
  records = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (
    field: keyof MaintenanceFilters,
    value: string | number | boolean | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.record_id ||
      filters.date_from ||
      filters.date_to ||
      filters.has_length_change !== undefined
    );
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {hasActiveFilters() && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#18D043]/10 text-[#16a34a]">
              Activos
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              icon={X}
              disabled={loading}
            >
              Limpiar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={loading}
          >
            {isExpanded ? "Contraer" : "Expandir"}
          </Button>
        </div>
      </div>

      {/* Filtros principales - siempre visibles */}
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
        <Input
          placeholder="Buscar por descripción..."
          value={filters.search || ""}
          onChange={(e) => handleInputChange("search", e.target.value)}
          icon={Search}
          disabled={loading}
        />

        <Select
          placeholder="Seleccionar registro"
          value={filters.record_id?.toString() || ""}
          onChange={(e) =>
            handleInputChange(
              "record_id",
              e.target.value ? parseInt(e.target.value) : undefined
            )
          }
          options={[
            { value: "", label: "Todos los registros" },
            ...records.map((record) => ({
              value: record.id.toString(),
              label: `${record.codigo} - ${record.cliente}`,
            })),
          ]}
          disabled={loading}
        />

        <Select
          placeholder="Cambio de longitud"
          value={filters.has_length_change?.toString() || ""}
          onChange={(e) =>
            handleInputChange(
              "has_length_change",
              e.target.value === "" ? undefined : e.target.value === "true"
            )
          }
          options={[
            { value: "", label: "Todos" },
            { value: "true", label: "Con cambio de longitud" },
            { value: "false", label: "Sin cambio de longitud" },
          ]}
          disabled={loading}
        />
      </div>

      {/* Filtros avanzados - colapsables */}
      {isExpanded && (
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              type="date"
              label="Fecha desde"
              value={filters.date_from || ""}
              onChange={(e) => handleInputChange("date_from", e.target.value)}
              icon={Calendar}
              disabled={loading}
            />

            <Input
              type="date"
              label="Fecha hasta"
              value={filters.date_to || ""}
              onChange={(e) => handleInputChange("date_to", e.target.value)}
              icon={Calendar}
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Información de resultados */}
      {hasActiveFilters() && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-[#18D043] rounded-full"></div>
            <span>Filtros aplicados</span>
          </div>
        </div>
      )}
    </Card>
  );
};
