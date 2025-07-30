import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { DataTable } from "../../../components/common/DataTable";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { usePagination } from "../../../hooks/usePagination";
import { useAppStore } from "../../../store";
import { mockDataRecords } from "../../../services/mockData";
import { formatDate } from "../../../utils/formatters";
import type { DataRecord, TableColumn } from "../../../types";

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
    if (confirm("¿Estás seguro de que quieres eliminar este registro?")) {
      deleteRegistro(registroId);
    }
  };

  const columns: TableColumn<DataRecord>[] = useMemo(
    () => [
      {
        key: "codigo",
        label: "Código",
        sortable: true,
      },
      {
        key: "cliente",
        label: "Cliente",
        sortable: true,
      },
      {
        key: "equipo",
        label: "Equipo",
        sortable: true,
      },
      {
        key: "fv_anios",
        label: "FV Años",
        width: "100",
      },
      {
        key: "fv_meses",
        label: "FV Meses",
        width: "100",
      },
      {
        key: "fecha_instalacion",
        label: "F. Instalación",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (value: any) => formatDate(value as Date),
      },
      {
        key: "longitud",
        label: "Longitud",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (value: any) => `${value}m`,
      },
      {
        key: "observaciones",
        label: "Observaciones",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (value: any) =>
          value ? (
            <span className="max-w-xs truncate" title={String(value)}>
              {String(value).length > 30
                ? `${String(value).substring(0, 30)}...`
                : String(value)}
            </span>
          ) : (
            "-"
          ),
      },
      {
        key: "seec",
        label: "SEEC",
      },
      {
        key: "tipo_linea",
        label: "Tipo Línea",
        sortable: true,
      },
      {
        key: "ubicacion",
        label: "Ubicación",
      },
      {
        key: "fecha_vencimiento",
        label: "F. Vencimiento",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (value: any) => formatDate(value as Date),
      },
      {
        key: "estado_actual",
        label: "Estado",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (value: any) => {
          const estado = String(value) as DataRecord["estado_actual"];
          const variants = {
            activo: "success" as const,
            inactivo: "secondary" as const,
            mantenimiento: "warning" as const,
            vencido: "danger" as const,
          };
          return (
            <Badge variant={variants[estado] || "secondary"}>{estado}</Badge>
          );
        },
      },
      {
        key: "id",
        label: "Acciones",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, registro: DataRecord) => (
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
    ],
    [navigate]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Registros
          </h1>
          <p className="text-gray-600">
            Administra todos los registros del sistema
          </p>
        </div>
        <Button onClick={() => navigate("nuevo")} icon={Plus}>
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