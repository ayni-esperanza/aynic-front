import { useState, useCallback, useEffect } from "react";
import { useApi } from '../../../shared/hooks/useApi';
import { userService } from "../services/userService";
import type { User, UserFilters } from "../types";

export const useUserData = (initialFilters?: UserFilters) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
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
    userService.deleteUser.bind(userService),
    {
      onSuccess: () => {
        // Recargar datos después de eliminar
        loadUsers();
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

  return {
    // Datos
    users,
    filteredUsers,
    filters,
    
    // Estados de carga
    loading,
    deleting,
    apiError,
    
    // Acciones
    updateFilters,
    clearFilters,
    refreshData,
    handleDeleteUser,
    loadUsers,
  };
};
