import React from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { Button } from '../../../shared/components/ui/Button';
import type { UserFilters } from "../types";

interface UserFiltersProps {
  filters: UserFilters;
  onUpdateFilters: (filters: Partial<UserFilters>) => void;
  onClearFilters: () => void;
}

export const UserFiltersComponent: React.FC<UserFiltersProps> = ({
  filters,
  onUpdateFilters,
  onClearFilters,
}) => {
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          <Filter className="w-4 h-4 text-[#18D043]" />
          Filtros rápidos
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
        {/* Búsqueda */}
        <div>
          <label className="block mb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Nombre, email o usuario..."
              value={filters.search || ""}
              onChange={(e) => onUpdateFilters({ search: e.target.value })}
              className="pl-10 h-10 text-sm"
            />
          </div>
        </div>

        {/* Rol */}
        <div>
          <label className="block mb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
            Rol
          </label>
          <Select
            value={filters.rol || ""}
            onChange={(e) =>
              onUpdateFilters({ rol: e.target.value as UserFilters["rol"] })
            }
            options={[
              { value: "", label: "Todos los roles" },
              { value: "admin", label: "Administrador" },
              { value: "supervisor", label: "Supervisor" },
              { value: "usuario", label: "Usuario" },
            ]}
            className="h-10 text-sm"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block mb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
            Estado
          </label>
          <Select
            value={filters.activo?.toString() || ""}
            onChange={(e) =>
              onUpdateFilters({
                activo: e.target.value === "" ? undefined : e.target.value === "true",
              })
            }
            options={[
              { value: "", label: "Todos los estados" },
              { value: "true", label: "Activo" },
              { value: "false", label: "Inactivo" },
            ]}
            className="h-10 text-sm"
          />
        </div>

        {/* Empresa */}
        <div>
          <label className="block mb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
            Empresa
          </label>
          <Input
            type="text"
            placeholder="Filtrar por empresa..."
            value={filters.empresa || ""}
            onChange={(e) => onUpdateFilters({ empresa: e.target.value })}
            className="h-10 text-sm"
          />
        </div>
      </div>

      {/* Mostrar filtros activos */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold uppercase tracking-wide">
              Filtros activos:
            </span>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  Búsqueda: {filters.search}
                </span>
              )}
              {filters.rol && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  Rol: {filters.rol}
                </span>
              )}
              {filters.activo !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                  Estado: {filters.activo ? "Activo" : "Inactivo"}
                </span>
              )}
              {filters.empresa && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                  Empresa: {filters.empresa}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
