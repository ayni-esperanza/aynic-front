import React, { useState } from "react";
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { SearchableSelect } from '../../../shared/components/ui/SearchableSelect';
import { Search, X, Filter } from "lucide-react";
import type { AccidentFilters as AccidentFiltersType } from "../types/accident";

interface AccidentFiltersProps {
  filters: AccidentFiltersType;
  onFiltersChange: (filters: AccidentFiltersType) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  lineasVida: Array<{
    id: number;
    codigo: string;
    cliente: string;
    ubicacion: string;
  }>;
  loading?: boolean;
}

export const AccidentFilters: React.FC<AccidentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  lineasVida,
  loading = false,
}) => {
  const [localFilters, setLocalFilters] =
    useState<AccidentFiltersType>(filters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sincronizar filtros locales cuando cambian los filtros externos (por ejemplo, al hacer clic en cards)
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (
    key: keyof AccidentFiltersType,
    value: string | number | undefined
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: AccidentFiltersType = {
      page: 1,
      limit: 10,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  // Opciones para los selects
  const estadoOptions = [
    { value: "", label: "Todos los estados..." },
    { value: "REPORTADO", label: "Reportado" },
    { value: "EN_INVESTIGACION", label: "En Investigación" },
    { value: "RESUELTO", label: "Resuelto" },
  ];

  const severidadOptions = [
    { value: "", label: "Todas las severidades..." },
    { value: "LEVE", label: "Leve" },
    { value: "MODERADO", label: "Moderado" },
    { value: "GRAVE", label: "Grave" },
    { value: "CRITICO", label: "Crítico" },
  ];

  // Opciones para líneas de vida - mejorar formato y búsqueda
  const lineaVidaOptions = [
    "Todas las líneas...", // Opción por defecto
    ...lineasVida.map(
      (linea) => `${linea.codigo} | ${linea.cliente} | ${linea.ubicacion}`
    ),
  ];

  const getSelectedLineaVida = () => {
    if (!localFilters.linea_vida_id) return "";
    const linea = lineasVida.find((l) => l.id === Number(localFilters.linea_vida_id));
    return linea
      ? `${linea.codigo} | ${linea.cliente} | ${linea.ubicacion}`
      : "";
  };

  const handleLineaVidaChange = (value: string) => {
    if (!value || value === "Todas las líneas...") {
      handleFilterChange("linea_vida_id", undefined);
      return;
    }

    const codigo = value.split(" | ")[0];
    const linea = lineasVida.find((l) => l.codigo === codigo);
    if (linea) {
      handleFilterChange("linea_vida_id", linea.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros principales compactos */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <SearchableSelect
          options={lineaVidaOptions}
          value={getSelectedLineaVida()}
          onChange={handleLineaVidaChange}
          placeholder="Buscar línea de vida..."
        />

        <Select
          value={localFilters.estado || ""}
          onChange={(e) =>
            handleFilterChange("estado", e.target.value || undefined)
          }
          options={estadoOptions}
          className="px-3 py-2 text-sm"
        />

        <Select
          value={localFilters.severidad || ""}
          onChange={(e) =>
            handleFilterChange("severidad", e.target.value || undefined)
          }
          options={severidadOptions}
          className="px-3 py-2 text-sm"
        />

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`w-full inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 border-2 text-[#18D043] dark:text-[#18D043] hover:bg-[#18D043] hover:text-white dark:hover:bg-[#18D043] dark:hover:text-white focus:ring-[#18D043]/20 dark:focus:ring-[#18D043]/30 shadow-sm hover:shadow-lg px-2 py-1 text-xs gap-1.5 min-h-[36px] ${
            showAdvancedFilters 
              ? "bg-[#18D043] text-white border-[#18D043] dark:border-[#18D043]" 
              : "border-gray-300 dark:border-gray-600"
          }`}
          aria-expanded={showAdvancedFilters}
          aria-controls="accident-advanced-filters"
        >
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {/* Filtros avanzados colapsables */}
      <div
        id="accident-advanced-filters"
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          showAdvancedFilters ? "max-h-[600px] mt-3" : "max-h-0"
        }`}
        aria-hidden={!showAdvancedFilters}
      >
        <div
          className={`grid grid-cols-1 gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 md:grid-cols-3 transition-all duration-300 ${
            showAdvancedFilters
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <Input
            label="Fecha Desde"
            type="date"
            value={localFilters.fecha_desde || ""}
            onChange={(e) =>
              handleFilterChange("fecha_desde", e.target.value || undefined)
            }
          />

          <Input
            label="Fecha Hasta"
            type="date"
            value={localFilters.fecha_hasta || ""}
            onChange={(e) =>
              handleFilterChange("fecha_hasta", e.target.value || undefined)
            }
          />

          <Input
            label="Buscar en Descripción"
            placeholder="Buscar en descripciones..."
            value={localFilters.search || ""}
            onChange={(e) =>
              handleFilterChange("search", e.target.value || undefined)
            }
            icon={Search}
          />

          <div className="flex items-end md:col-span-3">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={loading}
              icon={X}
              className="w-full"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
