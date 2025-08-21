import React, { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { SearchableSelect } from "../../../components/ui/SearchableSelect";
import { Search, X } from "lucide-react";
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
  onSearch,
  onClearFilters,
  lineasVida,
  loading = false,
}) => {
  const [localFilters, setLocalFilters] =
    useState<AccidentFiltersType>(filters);

  const handleFilterChange = (
    key: keyof AccidentFiltersType,
    value: string | number | undefined
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearch = () => {
    onSearch();
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
    const linea = lineasVida.find((l) => l.id === localFilters.linea_vida_id);
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
    <div className="space-y-6">
      {/* Primera fila de filtros */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SearchableSelect
          options={lineaVidaOptions}
          value={getSelectedLineaVida()}
          onChange={handleLineaVidaChange}
          placeholder="Buscar por código, cliente o ubicación..."
          label="Línea de Vida"
        />

        <Select
          label="Estado"
          value={localFilters.estado || ""}
          onChange={(e) =>
            handleFilterChange("estado", e.target.value || undefined)
          }
          options={estadoOptions}
        />

        <Select
          label="Severidad"
          value={localFilters.severidad || ""}
          onChange={(e) =>
            handleFilterChange("severidad", e.target.value || undefined)
          }
          options={severidadOptions}
        />

        <Input
          label="Fecha Desde"
          type="date"
          value={localFilters.fecha_desde || ""}
          onChange={(e) =>
            handleFilterChange("fecha_desde", e.target.value || undefined)
          }
        />
      </div>

      {/* Segunda fila de filtros */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

        <div className="flex items-end space-x-3">
          <Button
            onClick={handleSearch}
            disabled={loading}
            loading={loading}
            className="flex-1"
          >
            Buscar
          </Button>

          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={loading}
            icon={X}
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};
