import React, { useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { DataTable } from '../../../shared/components/common/DataTable';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../shared/components/ui/Toast';

import type { TableColumn } from "../../../types";
import { useUserData } from "../hooks";
import {
  UserFilters,
  UserStats,
  UserDetailModal,
  UserCreateModal,
} from "../components";
import type { FrontendUser } from "../services/userService";

export const UsuariosList: React.FC = () => {
  const { success, error: showError } = useToast();
  const [selectedUser, setSelectedUser] = useState<FrontendUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Usar el hook personalizado para datos de usuarios
  const {
    users: usuarios,
    filteredUsers,
    filters,
    loading,
    deleting,
    apiError,
    deleteSuccess,
    updateFilters,
    clearFilters,
    refreshData,
    handleDeleteUser,
  } = useUserData();

  // Mostrar errores si los hay
  React.useEffect(() => {
    if (apiError) {
      showError("Error al cargar usuarios", apiError);
    }
  }, [apiError, showError]);

  // Mostrar mensaje de éxito cuando se elimina un usuario
  React.useEffect(() => {
    if (deleteSuccess) {
      success("Usuario eliminado exitosamente");
      setModalOpen(false);
      setSelectedUser(null);
    }
  }, [deleteSuccess, success]);

  const columns: TableColumn<FrontendUser>[] = useMemo(
    () => [
      {
        key: "usuario",
        label: "Usuario",
        sortable: true,
        render: (value: any, user: FrontendUser) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-full flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">
                {String(user.nombre).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{String(value)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{user.nombre}</div>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        label: "Email",
        sortable: true,
        render: (value: any) => (
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">@</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{String(value)}</span>
          </div>
        ),
      },
      {
        key: "empresa",
        label: "Empresa",
        sortable: true,
        render: (value: any) => (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#18D043] rounded-full"></div>
            <span className="font-medium text-gray-900 dark:text-white">{String(value)}</span>
          </div>
        ),
      },
      {
        key: "cargo",
        label: "Cargo",
        render: (value: any) =>
          value ? (
            <span className="inline-flex items-center px-2 py-1 text-sm text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/40 rounded-md">
              {String(value)}
            </span>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          ),
      },
      {
        key: "telefono",
        label: "Teléfono",
        render: (value: any) =>
          value ? (
            <span className="inline-flex items-center px-2 py-1 font-mono text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md">
              {String(value)}
            </span>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          ),
      },
      {
        key: "rol",
        label: "Rol",
        sortable: true,
        render: (value: any) => {
          const variants = {
            admin: "danger" as const,
            supervisor: "warning" as const,
            usuario: "secondary" as const,
          };
          const rol = String(value) as FrontendUser["rol"];
          const labels = {
            admin: "Administrador",
            supervisor: "Supervisor",
            usuario: "Usuario",
          };
          return <Badge variant={variants[rol]}>{labels[rol]}</Badge>;
        },
      },
    ],
    []
  );

  // Mock de paginación simple (puedes implementar paginación real más tarde)
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleFilterClick = (filterType: 'all' | 'admin' | 'supervisor' | 'active') => {
    switch (filterType) {
      case 'all':
        updateFilters({ rol: undefined, activo: undefined });
        break;
      case 'admin':
        updateFilters({ rol: 'admin' });
        break;
      case 'supervisor':
        updateFilters({ rol: 'supervisor' });
        break;
      case 'active':
        updateFilters({ activo: true });
        break;
    }
  };

  // Loading state inicial
  if (loading && usuarios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError && usuarios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-4 text-red-600">⚠️</div>
          <p className="font-medium text-gray-900 dark:text-white">Error al cargar usuarios</p>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{apiError}</p>
          <Button onClick={refreshData} icon={RefreshCw}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h1>
          <p className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <span>Administra los usuarios del sistema</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#18D043]/10 dark:bg-[#18D043]/20 text-[#16a34a] dark:text-[#18D043]">
              {totalItems} usuarios
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setCreateModalOpen(true)}
            icon={Plus}
            className="bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <UserStats users={usuarios} loading={loading} onFilterClick={handleFilterClick} />

      {/* Filtros */}
      <UserFilters
        filters={filters}
        onUpdateFilters={updateFilters}
        onClearFilters={clearFilters}
      />

      {/* Users Table */}
      <DataTable
        data={paginatedUsers}
        columns={columns}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        loading={loading}
        onRowClick={(user) => {
          setSelectedUser(user);
          setModalOpen(true);
        }}
        density="compact"
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPageOptions={[5, 10, 25, 50, 100]}
      />

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedUser(null);
          }}
          onUpdated={refreshData}
          onDelete={handleDeleteUser}
          deleting={deleting}
        />
      )}

      <UserCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={refreshData}
      />
    </div>
  );
};
