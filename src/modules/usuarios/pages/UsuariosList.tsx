import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { usePagination } from '../../../hooks/usePagination';
import { useAppStore } from '../../../store';
import { mockUsers } from '../../../services/mockData';
import { formatDateTime } from '../../../utils/formatters';
import type { User, TableColumn } from '../../../types';

export const UsuariosList: React.FC = () => {
  const navigate = useNavigate();
  const { users, setUsers, deleteUser } = useAppStore();

  useEffect(() => {
    if (users.length === 0) {
      setUsers(mockUsers);
    }
  }, [users.length, setUsers]);

  const { paginatedData, paginationState, goToPage } = usePagination({
    data: users,
    itemsPerPage: 10,
  });

  const handleDeleteUser = (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteUser(userId);
    }
  };

  const columns: TableColumn<User>[] = useMemo(() => [
    {
      key: 'id',
      label: 'ID',
      width: '120',
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (value: string) => value || '-',
    },
    {
      key: 'rol',
      label: 'Rol',
      render: (value: User['rol']) => {
        const variants = {
          admin: 'danger' as const,
          supervisor: 'warning' as const,
          usuario: 'secondary' as const,
        };
        return <Badge variant={variants[value]}>{value}</Badge>;
      },
    },
    {
      key: 'fecha_creacion',
      label: 'F. Creación',
      render: (value: Date) => formatDateTime(value),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'id' as keyof User,
      label: 'Acciones',
      render: (_, user: User) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`detalle/${user.id}`)}
            icon={Eye}
          >
            Ver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`editar/${user.id}`)}
            icon={Edit}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteUser(user.id)}
            icon={Trash2}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ], [navigate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        <Button
          onClick={() => navigate('nuevo')}
          icon={Plus}
        >
          Nuevo Usuario
        </Button>
      </div>

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