import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, Search, RefreshCw } from "lucide-react";
import { DataTable } from "../../../components/common/DataTable";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useToast } from "../../../components/ui/Toast";
import { useApi } from "../../../hooks/useApi";
import { userService, type User } from "../../../services/userService";
import { formatDateTime } from "../../../utils/formatters";
import type { TableColumn } from "../../../types";

export const UsuariosList: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRol, setSelectedRol] = useState<User["rol"] | "">("");
  const [selectedStatus, setSelectedStatus] = useState<boolean | "">("");

  // Estado para datos de usuarios
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Hook para cargar usuarios
  const {
    loading,
    error: apiError,
    execute: loadUsuarios,
  } = useApi(userService.getUsers.bind(userService), {
    onSuccess: (data) => {
      setUsuarios(data);
    },
    onError: (error) => {
      showError("Error al cargar usuarios", error);
    },
  });

  // Hook para eliminar usuario
  const { loading: deleting, execute: deleteUsuario } = useApi(
    userService.deleteUser.bind(userService),
    {
      onSuccess: () => {
        success("Usuario eliminado exitosamente");
        refreshData();
      },
      onError: (error) => {
        showError("Error al eliminar usuario", error);
      },
    }
  );

  // Cargar datos inicial
  useEffect(() => {
    loadUsuarios();
  }, []);

  // Aplicar filtros cuando cambian los datos o filtros
  useEffect(() => {
    let filtered = usuarios;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.nombre.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.usuario.toLowerCase().includes(search)
      );
    }

    if (selectedRol) {
      filtered = filtered.filter((user) => user.rol === selectedRol);
    }

    if (selectedStatus !== "") {
      filtered = filtered.filter((user) => user.activo === selectedStatus);
    }

    setFilteredUsers(filtered);
  }, [usuarios, searchTerm, selectedRol, selectedStatus]);

  const refreshData = useCallback(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  const handleDeleteUser = useCallback(
    async (userId: string, userName: string) => {
      if (
        confirm(
          `¿Estás seguro de que quieres eliminar al usuario "${userName}"?`
        )
      ) {
        await deleteUsuario(userId);
      }
    },
    [deleteUsuario]
  );

  const columns: TableColumn<User>[] = useMemo(
    () => [
      {
        key: "usuario",
        label: "Usuario",
        sortable: true,
        render: (value: any, user: User) => (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-full flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">
                {String(user.nombre).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{String(value)}</div>
              <div className="text-sm text-gray-500">{user.nombre}</div>
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
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <span className="text-sm font-semibold text-blue-600">@</span>
            </div>
            <span className="font-medium text-gray-900">{String(value)}</span>
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
            <span className="font-medium text-gray-900">{String(value)}</span>
          </div>
        ),
      },
      {
        key: "cargo",
        label: "Cargo",
        render: (value: any) =>
          value ? (
            <span className="inline-flex items-center px-2 py-1 text-sm text-purple-800 bg-purple-100 rounded-md">
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
            <span className="inline-flex items-center px-2 py-1 font-mono text-sm text-gray-800 bg-gray-100 rounded-md">
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
          const rol = String(value) as User["rol"];
          const labels = {
            admin: "Administrador",
            supervisor: "Supervisor",
            usuario: "Usuario",
          };
          return <Badge variant={variants[rol]}>{labels[rol]}</Badge>;
        },
      },
      {
        key: "apellidos",
        label: "Apellidos",
        render: (value: any) =>
          value ? (
            <span className="text-gray-900">{String(value)}</span>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          ),
      },
      {
        key: "activo",
        label: "Estado",
        render: (value: any) => (
          <Badge variant={value ? "success" : "secondary"}>
            {value ? "Activo" : "Inactivo"}
          </Badge>
        ),
      },
      {
        key: "id",
        label: "Acciones",
        render: (_: any, user: User) => (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`detalle/${user.id}`)}
              icon={Eye}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Ver detalles"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`editar/${user.id}`)}
              icon={Edit}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Editar usuario"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteUser(user.id, user.nombre)}
              icon={Trash2}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Eliminar usuario"
              disabled={deleting}
            />
          </div>
        ),
      },
    ],
    [navigate, handleDeleteUser, deleting]
  );

  // Mock de paginación simple (puedes implementar paginación real más tarde)
  const itemsPerPage = 10;
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
          <p className="font-medium text-gray-900">Error al cargar usuarios</p>
          <p className="mb-4 text-gray-600">{apiError}</p>
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
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl text-white">👥</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="flex items-center space-x-2 text-gray-600">
              <span>Administra los usuarios del sistema</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#18D043]/10 text-[#16a34a]">
                {totalItems} usuarios
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={refreshData}
            variant="outline"
            icon={RefreshCw}
            loading={loading}
            className="border-gray-300 hover:bg-gray-50"
          >
            Actualizar
          </Button>
          <Button
            onClick={() => navigate("nuevo")}
            icon={Plus}
            className="bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <div className="text-2xl font-bold text-blue-900">
                {usuarios.length}
              </div>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </Card>
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-green-600">Activos</p>
              <div className="text-2xl font-bold text-green-900">
                {usuarios.filter((u) => u.activo).length}
              </div>
            </div>
            <div className="text-2xl">🟢</div>
          </div>
        </Card>
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-red-600">
                Administradores
              </p>
              <div className="text-2xl font-bold text-red-900">
                {usuarios.filter((u) => u.rol === "admin").length}
              </div>
            </div>
            <div className="text-2xl">👑</div>
          </div>
        </Card>
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Supervisores
              </p>
              <div className="text-2xl font-bold text-purple-900">
                {usuarios.filter((u) => u.rol === "supervisor").length}
              </div>
            </div>
            <div className="text-2xl">👨‍💼</div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border border-gray-200 shadow-sm bg-gradient-to-r from-gray-50 to-white">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Input
                placeholder="Buscar por nombre, email o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-[#18D043] focus:ring-[#18D043]/20"
              />
              <Search
                className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                size={16}
              />
            </div>

            <Select
              value={selectedRol}
              onChange={(e) =>
                setSelectedRol(e.target.value as User["rol"] | "")
              }
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
                {filteredUsers.length} resultado
                {filteredUsers.length !== 1 ? "s" : ""} encontrado
                {filteredUsers.length !== 1 ? "s" : ""}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRol("");
                  setSelectedStatus("");
                  setCurrentPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-white border-0 shadow-lg">
        <div className="p-6">
          <DataTable
            data={paginatedUsers}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      </Card>
    </div>
  );
};