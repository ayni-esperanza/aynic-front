import { useState, useCallback, useEffect } from "react";
import { useApi } from '../../../shared/hooks/useApi';
import { userService } from "../services/userService";
import type { UserFilters } from "../types";
import type { FrontendUser } from "../services/userService";

export const useUserData = (initialFilters?: UserFilters) => {
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<FrontendUser[]>([]);
  const [filters, setFilters] = useState<UserFilters>(initialFilters || {});

  // Hook para cargar usuarios
  const {
    loading,
    error: apiError,
    execute: loadUsers,
  } = useApi(userService.getUsers.bind(userService), {
    onSuccess: (data) => {
      setUsers(data);
    },
  });

  // Hook para eliminar usuario
  const { loading: deleting, execute: deleteUser } = useApi(
    async (...args: unknown[]) => {
      const id = args[0] as string;
      return userService.deleteUser(id);
    },
    {
      onSuccess: () => {
        // Recargar datos después de eliminar
        loadUsers();
        setDeleteSuccess(true);
        // Resetear el estado después de un tiempo
        setTimeout(() => setDeleteSuccess(false), 100);
      },
    }
  );

  // Cargar datos inicial
  useEffect(() => {
    loadUsers();
  }, []);

  // Aplicar filtros cuando cambian los datos o filtros
  useEffect(() => {
    let filtered = users;

    if (filters.search?.trim()) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.nombre.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.usuario.toLowerCase().includes(search)
      );
    }

    if (filters.rol) {
      filtered = filtered.filter((user) => user.rol === filters.rol);
    }

    if (filters.activo !== undefined) {
      filtered = filtered.filter((user) => user.activo === filters.activo);
    }

    if (filters.empresa?.trim()) {
      const empresa = filters.empresa.toLowerCase();
      filtered = filtered.filter((user) =>
        user.empresa.toLowerCase().includes(empresa)
      );
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const refreshData = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDeleteUser = useCallback(
    async (userId: string, userName: string) => {
      await deleteUser(userId);
    },
    [deleteUser]
  );

  return {
    // Datos
    users,
    filteredUsers,
    filters,
    
    // Estados de carga
    loading,
    deleting,
    apiError,
    deleteSuccess,
    
    // Acciones
    updateFilters,
    clearFilters,
    refreshData,
    handleDeleteUser,
    loadUsers,
  };
};
