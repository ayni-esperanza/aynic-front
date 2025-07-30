import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, Search, Filter } from "lucide-react";
import { DataTable } from "../../../components/common/DataTable";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { usePaginatedApi, useMutation } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import { activeUserService, UserFilters } from "../../../services/userService";
import { formatDateTime } from "../../../utils/formatters";
import type { User, TableColumn } from "../../../types";

export const UsuariosList: React.FC = () => {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRol, setSelectedRol] = useState<User["rol"] | "">("");
  const [selectedStatus, setSelectedStatus] = useState<boolean | "">("");

  // API hook for fetching users
  const {
    data: users,
    loading,
    error,
    pagination,
    refresh,
    updateFilters,
    hasMore,
    loadMore,
  } = usePaginatedApi(
    activeUserService.getUsers.bind(activeUserService),
    { page: 1, limit: 10 },
    {
      immediate: true,
      onError: (error) => {
        showError("Error al cargar usuarios", error);
      },
    }
  );

  // Mutation for deleting users
  const { mutate: deleteUser, loading: deleteLoading } = useMutation(
    activeUserService.deleteUser.bind(activeUserService),
    {
      onSuccess: () => {
        showSuccess(
          "Usuario eliminado",
          "El usuario ha sido eliminado correctamente."
        );
        refresh();
      },
      onError: (error) => {
        showError("Error al eliminar", error);
      },
    }
  );

  // Mutation for toggling user status
  const { mutate: toggleUserStatus, loading: toggleLoading } = useMutation(
    activeUserService.toggleUserStatus.bind(activeUserService),
    {
      onSuccess: (updatedUser) => {
        showSuccess(
          "Estado actualizado",
          `El usuario ${updatedUser.nombre} ha sido ${
            updatedUser.activo ? "activado" : "desactivado"
          }.`
        );
        refresh();
      },
      onError: (error) => {
        showError("Error al actualizar estado", error);
      },
    }
  );

  // Handle search and filters
  const handleFiltersChange = useCallback(() => {
    const filters: UserFilters = {
      page: 1,
      limit: 10,
    };

    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }

    if (selectedRol) {
      filters.rol = selectedRol;
    }

    if (selectedStatus !== "") {
      filters.activo = selectedStatus as boolean;
    }

    updateFilters(filters);
  }, [searchTerm, selectedRol, selectedStatus, updateFilters]);

  // Debounced search effect
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFiltersChange();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [handleFiltersChange]);

  const handleDeleteUser = useCallback(
    async (userId: string, userName: string) => {
      if (
        confirm(
          `¿Estás seguro de que quieres eliminar al usuario "${userName}"?`
        )
      ) {
        await deleteUser(userId);
      }
    },
    [deleteUser]
  );

  const handleToggleStatus = useCallback(
    async (userId: string) => {
      await toggleUserStatus(userId);
    },
    [toggleUserStatus]
  );

  const columns: TableColumn<User>[] = useMemo(
    () => [
      {
        key: "nombre",
        label: "Nombre",
        sortable: true,
        render: (value: string, user: User) => (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#18D043] rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {value.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{value}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
        ),
      },
      {
        key: "telefono",
        label: "Teléfono",
        render: (value: string) => value || "-",
      },
      {
        key: "rol",
        label: "Rol",
        render: (value: User["rol"]) => {
          const variants = {
            admin: "danger" as const,
            supervisor: "warning" as const,
            usuario: "secondary" as const,
          };
          return <Badge variant={variants[value]}>{value}</Badge>;
        },
      },
      {
        key: "fecha_creacion",
        label: "F. Creación",
        render: (value: Date) => formatDateTime(value),
      },
      {
        key: "activo",
        label: "Estado",
        render: (value: boolean, user: User) => (
          <div className="flex items-center space-x-2">
            <Badge variant={value ? "success" : "secondary"}>
              {value ? "Activo" : "Inactivo"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleStatus(user.id)}
              disabled={toggleLoading}
              className="text-xs"
            >
              {value ? "Desactivar" : "Activar"}
            </Button>
          </div>
        ),
      },
      {
        key: "id" as keyof User,
        label: "Acciones",
        render: (_, user: User) => (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`detalle/${user.id}`)}
              icon={Eye}
              className="text-xs"
            >
              Ver
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`editar/${user.id}`)}
              icon={Edit}
              className="text-xs"
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteUser(user.id, user.nombre)}
              disabled={deleteLoading}
              icon={Trash2}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [
      navigate,
      handleDeleteUser,
      handleToggleStatus,
      deleteLoading,
      toggleLoading,
    ]
  );

  // Error state
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">Administra los usuarios del sistema</p>
          </div>
        </div>

        <Card padding="lg">
          <div className="py-12 text-center">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Error al cargar usuarios
            </h3>
            <p className="mb-4 text-gray-600">{error}</p>
            <Button onClick={refresh} disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : "Reintentar"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        <Button
          onClick={() => navigate("nuevo")}
          icon={Plus}
          disabled={loading}
        >
          Nuevo Usuario
        </Button>
      </div>

      {/* Filters */}
      <Card padding="lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search
              className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
              size={16}
            />
          </div>

          <Select
            value={selectedRol}
            onChange={(e) => setSelectedRol(e.target.value as User["rol"] | "")}
            options={[
              { value: "", label: "Todos los roles" },
              { value: "admin", label: "Administrador" },
              { value: "supervisor", label: "Supervisor" },
              { value: "usuario", label: "Usuario" },
            ]}
          />

          <Select
            value={selectedStatus.toString()}
            onChange={(e) =>
              setSelectedStatus(
                e.target.value === "" ? "" : e.target.value === "true"
              )
            }
            options={[
              { value: "", label: "Todos los estados" },
              { value: "true", label: "Activos" },
              { value: "false", label: "Inactivos" },
            ]}
          />
        </div>

        {(searchTerm || selectedRol || selectedStatus !== "") && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {pagination.total} resultado{pagination.total !== 1 ? "s" : ""}{" "}
              encontrado{pagination.total !== 1 ? "s" : ""}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedRol("");
                setSelectedStatus("");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </Card>

      {/* Users Table */}
      <Card padding="lg">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Cargando usuarios...</span>
          </div>
        ) : (
          <>
            <DataTable
              data={users}
              columns={columns}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              onPageChange={(page) => updateFilters({ page })}
              loading={loading}
            />

            {/* Load More Button for infinite scroll alternative */}
            {hasMore && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={loadMore} disabled={loading}>
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "Cargar más usuarios"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};
