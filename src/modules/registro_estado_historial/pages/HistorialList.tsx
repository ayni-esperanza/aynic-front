import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, User, FileText } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/common/DataTable';
import { usePagination } from '../../../hooks/usePagination';
import { formatDateTime } from '../../../utils/formatters';
import type { TableColumn } from '../../../types';

interface HistorialRecord {
  id: string;
  registro_id: string;
  estado_anterior: string;
  estado_nuevo: string;
  fecha_cambio: Date;
  usuario: string;
  motivo?: string;
  observaciones?: string;
}

// Mock data para el historial
const mockHistorial: HistorialRecord[] = Array.from({ length: 25 }, (_, i) => ({
  id: `hist-${i + 1}`,
  registro_id: `record-${Math.floor(Math.random() * 10) + 1}`,
  estado_anterior: ['activo', 'inactivo', 'mantenimiento'][Math.floor(Math.random() * 3)],
  estado_nuevo: ['activo', 'inactivo', 'mantenimiento', 'vencido'][Math.floor(Math.random() * 4)],
  fecha_cambio: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)),
  usuario: `Usuario ${Math.floor(Math.random() * 5) + 1}`,
  motivo: Math.random() > 0.3 ? ['Mantenimiento programado', 'Falla técnica', 'Actualización', 'Revisión periódica'][Math.floor(Math.random() * 4)] : undefined,
  observaciones: Math.random() > 0.5 ? `Observación del cambio ${i + 1}` : undefined,
}));

export const HistorialList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const registroFilter = searchParams.get('registro');

  const filteredData = useMemo(() => {
    if (registroFilter) {
      return mockHistorial.filter(h => h.registro_id === registroFilter);
    }
    return mockHistorial;
  }, [registroFilter]);

  const { paginatedData, paginationState, goToPage } = usePagination({
    data: filteredData,
    itemsPerPage: 10,
  });

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'success' | 'secondary' | 'warning' | 'danger'> = {
      activo: 'success',
      inactivo: 'secondary',
      mantenimiento: 'warning',
      vencido: 'danger',
    };
    return <Badge variant={variants[estado] || 'secondary'}>{estado}</Badge>;
  };

  const columns: TableColumn<HistorialRecord>[] = useMemo(() => [
    {
      key: 'id',
      label: 'ID',
      width: '120',
    },
    {
      key: 'registro_id',
      label: 'Registro',
      sortable: true,
    },
    {
      key: 'estado_anterior',
      label: 'Estado Anterior',
      render: (value: string) => getEstadoBadge(value),
    },
    {
      key: 'estado_nuevo',
      label: 'Estado Nuevo',
      render: (value: string) => getEstadoBadge(value),
    },
    {
      key: 'fecha_cambio',
      label: 'Fecha de Cambio',
      render: (value: Date) => formatDateTime(value),
      sortable: true,
    },
    {
      key: 'usuario',
      label: 'Usuario',
      sortable: true,
    },
    {
      key: 'motivo',
      label: 'Motivo',
      render: (value: string) => value || '-',
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
  ], []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historial de Estados</h1>
        <p className="text-gray-600">
          {registroFilter 
            ? `Historial de cambios para el registro ${registroFilter}`
            : 'Historial completo de cambios de estado en los registros'
          }
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cambios</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredData.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(filteredData.map(h => h.usuario)).size}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Registros Afectados</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(filteredData.map(h => h.registro_id)).size}
              </p>
            </div>
          </div>
        </Card>
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