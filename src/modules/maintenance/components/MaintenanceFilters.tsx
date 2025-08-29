import React, { useState } from "react";
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { SearchableSelect } from '../../../shared/components/ui/SearchableSelect';
import { Search, Filter, X, Calendar } from "lucide-react";
import type { MaintenanceFilters } from "../types/maintenance";
import { useApi } from '../../../shared/hooks/useApi';
import { maintenanceService } from "../services/maintenanceService";

type LineaVida = {
  id: number;
  codigo: string;
  cliente: string;
  ubicacion: string;
};

interface Props {
  filters: MaintenanceFilters;
  onFiltersChange: (filters: MaintenanceFilters) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const MaintenanceFilters: React.FC<Props> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // mismas líneas de vida que usa el formulario (búsqueda en backend)
  const { data: records = [], loading: recordsLoading } = useApi<LineaVida[]>(
    () => maintenanceService.searchRecordsForSelect(),
    { immediate: true }
  );

  const buildLabel = (r: LineaVida) =>
    [r.codigo, r.cliente, r.ubicacion].filter(Boolean).join(" · ");

  const options = records.map(buildLabel);

  const currentLabel = filters.record_id
    ? (() => {
        const r = records.find((x) => x.id === filters.record_id);
        return r ? buildLabel(r) : "";
      })()
    : "";

  const handleRecordChange = (value: string) => {
    if (!value) {
      onFiltersChange({ ...filters, record_id: undefined, page: 1 });
      return;
    }
    let found = records.find((r) => buildLabel(r) === value);
    if (!found) {
      const code = value.split(" · ")[0]; // fallback si solo vuelve el código
      found = records.find((r) => r.codigo === code);
    }
    onFiltersChange({ ...filters, record_id: found?.id, page: 1 });
  };

  const handle = (
    field: keyof MaintenanceFilters,
    value: string | number | boolean | undefined
  ) => onFiltersChange({ ...filters, [field]: value });

  const hasActive =
    !!filters.search ||
    !!filters.record_id ||
    !!filters.date_from ||
    !!filters.date_to ||
    filters.has_length_change !== undefined;

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {hasActive && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#18D043]/10 text-[#16a34a]">
              Activos
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActive && (
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

      {/* Filtros principales */}
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
        <Input
          placeholder="Buscar por descripción..."
          value={filters.search || ""}
          onChange={(e) => handle("search", e.target.value)}
          icon={Search}
          disabled={loading}
        />

        <SearchableSelect
          options={options}
          value={currentLabel}
          onChange={handleRecordChange}
          placeholder="Buscar por código, cliente o ubicación..."
          label="Línea de Vida *"
          required
          className="md:col-span-1"
        />
        {recordsLoading && (
          <div className="text-sm text-gray-500 md:col-span-1">
            Cargando líneas de vida…
          </div>
        )}

        <select
          className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:outline-none"
          value={filters.has_length_change?.toString() || ""}
          onChange={(e) =>
            handle(
              "has_length_change",
              e.target.value === "" ? undefined : e.target.value === "true"
            )
          }
          disabled={loading}
          aria-label="Cambio de longitud"
        >
          <option value="">Cambio de longitud</option>
          <option value="true">Con cambio de longitud</option>
          <option value="false">Sin cambio de longitud</option>
        </select>
      </div>

      {/* Filtros avanzados */}
      {isExpanded && (
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              type="date"
              label="Fecha desde"
              value={filters.date_from || ""}
              onChange={(e) => handle("date_from", e.target.value)}
              icon={Calendar}
              disabled={loading}
            />
            <Input
              type="date"
              label="Fecha hasta"
              value={filters.date_to || ""}
              onChange={(e) => handle("date_to", e.target.value)}
              icon={Calendar}
              disabled={loading}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default MaintenanceFilters;
export { MaintenanceFilters };
export const MaintenanceFiltersComponent = MaintenanceFilters; // alias de compatibilidad
