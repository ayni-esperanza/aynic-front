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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Nombre, email o usuario..."
              value={filters.search || ""}
              onChange={(e) => onUpdateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          />
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Empresa
          </label>
          <Input
            type="text"
            placeholder="Filtrar por empresa..."
            value={filters.empresa || ""}
            onChange={(e) => onUpdateFilters({ empresa: e.target.value })}
          />
        </div>
      </div>

      {/* Mostrar filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtros activos:
            </span>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  Búsqueda: {filters.search}
                </span>
              )}
              {filters.rol && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  Rol: {filters.rol}
                </span>
              )}
              {filters.activo !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                  Estado: {filters.activo ? "Activo" : "Inactivo"}
                </span>
              )}
              {filters.empresa && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
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
