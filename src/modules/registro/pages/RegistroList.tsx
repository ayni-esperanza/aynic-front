import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { usePagination } from '../../../hooks/usePagination';
import { useAppStore } from '../../../store';
import { mockDataRecords } from '../../../services/mockData';
import { formatDate } from '../../../utils/formatters';
import type { DataRecord, TableColumn } from '../../../types';

export const RegistroList: React.FC = () => {
  const navigate = useNavigate();
  const { registros, setRegistros, deleteRegistro } = useAppStore();

  useEffect(() => {
    if (registros.length === 0) {
      setRegistros(mockDataRecords);
    }
  }, [registros.length, setRegistros]);

  const { paginatedData, paginationState, goToPage } = usePagination({
    data: registros,
    itemsPerPage: 10,
  });

  const handleDeleteRegistro = (registroId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      deleteRegistro(registroId);
    }
  };

  const columns: TableColumn<DataRecord>[] = useMemo(() => [
    {
      key: 'id',
      label: 'ID',
      width: '120',
    },
    {
      key: 'codigo',
      label: 'Código',
      sortable: true,
    },
    {
      key: 'cliente',
      label: 'Cliente',
      sortable: true,
    },
    {
      key: 'equipo',
      label: 'Equipo',
      sortable: true,
    },
    {
      key: 'fv_anios',
      label: 'FV Años',
      width: '100',
    },
    {
      key: 'fv_meses',
      label: 'FV Meses',
      width: '100',
    },
    {
      key: 'fecha_instalacion',
      label: 'F. Instalación',
      render: (value: Date) => formatDate(value),
    },
    {
      key: 'longitud',
      label: 'Longitud',
      render: (value: number) => `${value}m`,
    },
    {
      key: 'observaciones',
      label: 'Observaciones',
      render: (value: string) => value ? (
        <span className="truncate max-w-xs" title={value}>
          {value.length > 30 ? `${value.substring(0, 30)}...` : value}
        </span>
      ) : '-',
    },
    {
      key: 'seec',
      label: 'SEEC',
    },
    {
      key: 'tipo_linea',
      label: 'Tipo Línea',
      sortable: true,
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
    },
    {
      key: 'fecha_vencimiento',
      label: 'F. Vencimiento',
      render: (value: Date) => formatDate(value),
    },
    {
      key: 'estado_actual',
      label: 'Estado',
      render: (value: DataRecord['estado_actual']) => {
        const variants = {
          activo: 'success' as const,
          inactivo: 'secondary' as const,
          mantenimiento: 'warning' as const,
          vencido: 'danger' as const,
        };
        return <Badge variant={variants[value]}>{value}</Badge>;
      },
    },
    {
      key: 'id' as keyof DataRecord,
      label: 'Acciones',
      render: (_, registro: DataRecord) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`detalle/${registro.id}`)}
            icon={Eye}
          >
            Ver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`editar/${registro.id}`)}
            icon={Edit}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteRegistro(registro.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Registros</h1>
          <p className="text-gray-600">Administra todos los registros del sistema</p>
        </div>
        <Button
          onClick={() => navigate('nuevo')}
          icon={Plus}
        >
          Nuevo Registro
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