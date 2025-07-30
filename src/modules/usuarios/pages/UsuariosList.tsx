import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { DataTable } from "../../../components/common/DataTable";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { usePagination } from "../../../hooks/usePagination";
import { formatDateTime } from "../../../utils/formatters";
import type { User, TableColumn } from "../../../types";

// Simple local mock data - no external dependencies
const localMockUsers: User[] = [
  {
    id: "user-1",
    nombre: "Ana García",
    email: "ana.garcia@example.com",
    telefono: "+34 600 123 456",
    rol: "admin",
    fecha_creacion: new Date(2023, 0, 15),
    activo: true,
  },
  {
    id: "user-2",
    nombre: "Carlos López",
    email: "carlos.lopez@example.com",
    telefono: "+34 600 234 567",
    rol: "supervisor",
    fecha_creacion: new Date(2023, 1, 20),
    activo: true,
  },
  {
    id: "user-3",
    nombre: "María Rodríguez",
    email: "maria.rodriguez@example.com",
    telefono: "+34 600 345 678",
    rol: "usuario",
    fecha_creacion: new Date(2023, 2, 10),
    activo: false,
  },
  {
    id: "user-4",
    nombre: "Juan Martínez",
    email: "juan.martinez@example.com",
    telefono: "+34 600 456 789",
    rol: "usuario",
    fecha_creacion: new Date(2023, 3, 5),
    activo: true,
  },
  {
    id: "user-5",
    nombre: "Laura Sánchez",
    email: "laura.sanchez@example.com",
    telefono: "+34 600 567 890",
    rol: "supervisor",
    fecha_creacion: new Date(2023, 4, 12),
    activo: true,
  },
];

export const UsuariosList: React.FC = () => {
  const navigate = useNavigate();

  // Local state - completely independent
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRol, setSelectedRol] = useState<User["rol"] | "">("");
  const [selectedStatus, setSelectedStatus] = useState<boolean | "">("");

  // Initialize data only once
  useEffect(() => {
    setUsers(localMockUsers);
  }, []);

  // Filter users based on search criteria
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.nombre.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    if (selectedRol) {
      filtered = filtered.filter((user) => user.rol === selectedRol);
    }

    if (selectedStatus !== "") {
      filtered = filtered.filter((user) => user.activo === selectedStatus);
    }

    return filtered;
  }, [users, searchTerm, selectedRol, selectedStatus]);

  const { paginatedData, paginationState, goToPage } = usePagination({
    data: filteredUsers,
    itemsPerPage: 10,
  });

  const handleDeleteUser = useCallback((userId: string, userName: string) => {
    if (
      confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"?`)
    ) {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    }
  }, []);

  const handleToggleStatus = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, activo: !user.activo } : user
      )
    );
  }, []);

  const columns: TableColumn<User>[] = useMemo(
    () => [
      {
        key: "nombre",
        label: "Nombre",
        sortable: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (value: any, user: User) => (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#18D043] rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {String(value).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{String(value)}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
        ),
      },
      {
        key: "telefono",
        label: "Teléfono",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (value: any) => String(value) || "-",
      },
      {
        key: "rol",
        label: "Rol",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (value: any) => {
          const variants = {
            admin: "danger" as const,
            supervisor: "warning" as const,
            usuario: "secondary" as const,
          };
          const rol = String(value) as User["rol"];
          return <Badge variant={variants[rol]}>{rol}</Badge>;
        },
      },
      {
        key: "fecha_creacion",
        label: "F. Creación",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (value: any) => formatDateTime(value as Date),
      },
      {
        key: "activo",
        label: "Estado",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (value: any, user: User) => (
          <div className="flex items-center space-x-2">
            <Badge variant={value ? "success" : "secondary"}>
              {value ? "Activo" : "Inactivo"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleStatus(user.id)}
              className="text-xs"
            >
              {value ? "Desactivar" : "Activar"}
            </Button>
          </div>
        ),
      },
      {
        key: "id",
        label: "Acciones",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, user: User) => (
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
              icon={Trash2}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [navigate, handleDeleteUser, handleToggleStatus]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        <Button onClick={() => navigate("nuevo")} icon={Plus}>
          Nuevo Usuario
        </Button>
      </div>

      {/* Filters */}
      <Card padding="lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
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
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </Card>

      {/* Users Table */}
      <Card padding="lg">
        <DataTable
          data={paginatedData}
          columns={columns}
          currentPage={paginationState.currentPage}
          totalPages={paginationState.totalPages}
          totalItems={paginationState.totalItems}
          onPageChange={goToPage}
        />
      </Card>
    </div>
  );
};