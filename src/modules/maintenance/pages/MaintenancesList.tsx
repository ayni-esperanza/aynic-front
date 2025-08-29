import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from '../../../shared/components/common/DataTable';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card } from '../../../shared/components/ui/Card';
import { useToast } from '../../../shared/components/ui/Toast';
import { usePaginatedApi, useMutation, useApi } from '../../../shared/hooks/useApi';
import { maintenanceService } from "../services/maintenanceService";
import { formatDate, formatDateTime } from "../../../shared/utils/formatters";
import {
  Plus,
  Eye,
  Trash2,
  Download,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";
import { SearchableSelect } from '../../../shared/components/ui/SearchableSelect';
import type { Maintenance, MaintenanceFilters } from "../types/maintenance";
import type { TableColumn } from "../../../types";

/* ========== Modal de imagen muy simple ========== */
const ImagePreviewModal: React.FC<{
  open: boolean;
  src?: string;
  title?: string;
  onClose: () => void;
  onError?: () => void;
}> = ({ open, src, title, onClose, onError }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative max-w-5xl max-h-full">
        <Button
          className="absolute z-10 text-white top-3 right-3 bg-black/60 hover:bg-black/80"
          onClick={onClose}
          icon={X}
          size="sm"
        >
          Cerrar
        </Button>
        <img
          src={src}
          alt={title || "Imagen"}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg bg-black/20"
          onError={onError}
        />
      </div>
    </div>
  );
};
/* ================================================ */

/** Construye la URL de la imagen del mantenimiento
 *  Prioriza `image_url` (ya lista del backend).
 *  Si sólo viene `image_r2_key`, la arma con `VITE_R2_PUBLIC_URL`.
 */
const getMaintenanceImageUrl = (m: Maintenance): string | undefined => {
  if ((m as any)?.image_url) return (m as any).image_url as string;
  const key = (m as any)?.image_r2_key as string | undefined;
  const base = import.meta.env.VITE_R2_PUBLIC_URL as string | undefined;
  if (key && base) return `${base}/${key}`;
  return undefined;
};

export const MaintenancesList: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [filters, setFilters] = useState<MaintenanceFilters>({
    page: 1,
    limit: 10,
    record_id: undefined,
  });

  // ---- líneas de vida (para el filtro) ----
  const { data: initialLineas } = useApi(
    () => maintenanceService.searchRecordsForSelect(),
    { immediate: true }
  );
  const { data: searchLineas, execute: execSearch } = useApi(async (...args: unknown[]) => {
    const term = args[0] as string;
    return maintenanceService.searchRecordsForSelect(term);
  });

  const allLineas = searchLineas ?? initialLineas ?? [];
  const lineaOptions = allLineas.map((l) => l.codigo);
  const selectedLineaCodigo =
    allLineas.find((l) => l.id === filters.record_id)?.codigo ?? "";

  // ---- datos paginados ----
  const {
    data: maintenances,
    pagination,
    loading,
    error,
    updateFilters,
  } = usePaginatedApi(
    (f: MaintenanceFilters) => maintenanceService.getMaintenances(f),
    filters,
    { immediate: true }
  );

  // eliminar
  const { mutate: deleteMaintenance, loading: deleting } = useMutation(
    (id: number) => maintenanceService.deleteMaintenance(id),
    {
      onSuccess: () => {
        success("Éxito", "Mantenimiento eliminado correctamente");
        updateFilters({}); // refrescar
      },
      onError: (err) => showError("Error", `Error al eliminar: ${err}`),
    }
  );

  const handleLineaChange = (codigo: string) => {
    const found = allLineas.find((l) => l.codigo === codigo);
    const record_id = found?.id;
    const newFilters: MaintenanceFilters = { ...filters, record_id, page: 1 };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  // ======= estado del modal de imagen =======
  const [imgOpen, setImgOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [imgTitle, setImgTitle] = useState<string | undefined>(undefined);

  const openMaintenanceImage = (m: Maintenance) => {
    const url = getMaintenanceImageUrl(m);
    if (!url) {
      showError("Sin imagen", "Este mantenimiento no tiene imagen.");
      return;
    }
    const code =
      (m as any)?.record?.codigo ??
      (m as any)?.record_code ??
      `Mantenimiento #${m.id}`;
    setImgTitle(`Imagen · ${code}`);
    setImgSrc(url);
    setImgOpen(true);
  };
  // ==========================================

  const columns: TableColumn<Maintenance>[] = [
    {
      key: "maintenance_date",
      label: "Fecha",
      sortable: true,
      render: (_, record) => (
        <div className="font-medium text-gray-900">
          {formatDate(record.maintenance_date)}
        </div>
      ),
    },
    {
      key: "record",
      label: "Línea de Vida",
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">
            {record.record?.codigo || "N/A"}
          </div>
          <div className="text-sm text-gray-600">
            {record.record?.cliente || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Descripción",
      render: (value) => (
        <div className="max-w-xs">
          <div
            className="text-sm text-gray-900 truncate"
            title={value as string}
          >
            {value || "Sin descripción"}
          </div>
        </div>
      ),
    },
    {
      key: "new_length_meters",
      label: "Cambio Longitud",
      render: (_, record) => {
        if (
          record.previous_length_meters != null &&
          record.new_length_meters != null
        ) {
          const change =
            Number(record.new_length_meters) -
            Number(record.previous_length_meters);
          const isIncrease = change > 0;
          return (
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isIncrease
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isIncrease ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                <span>{`${isIncrease ? "+" : ""}${change.toFixed(1)}m`}</span>
              </div>
              <div className="text-xs text-gray-500">
                {record.previous_length_meters}m → {record.new_length_meters}m
              </div>
            </div>
          );
        }
        return (
          <Badge variant="secondary" size="sm">
            Sin cambio
          </Badge>
        );
      },
    },
    {
      key: "image_url",
      label: "Imagen",
      render: (_value, m: Maintenance) => {
        const hasImage = Boolean(
          (m as any)?.image_url || (m as any)?.image_r2_key
        );
        return hasImage ? (
          <Button
            variant="ghost"
            size="sm"
            icon={ImageIcon}
            onClick={() => openMaintenanceImage(m)}
          >
            Ver
          </Button>
        ) : (
          <span className="text-sm text-gray-400">Sin imagen</span>
        );
      },
    },
    {
      key: "user",
      label: "Registrado por",
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {record.user
              ? `${record.user.nombre} ${record.user.apellidos}`
              : "Sistema"}
          </div>
          <div className="text-gray-500">
            {formatDateTime(record.created_at)}
          </div>
        </div>
      ),
    },
    {
      key: "actions" as keyof Maintenance,
      label: "Acciones",
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/mantenimiento/${record.id}`)}
          >
            Ver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => {
              if (
                window.confirm(
                  `¿Eliminar mantenimiento del ${formatDate(
                    record.maintenance_date
                  )}?`
                )
              ) {
                deleteMaintenance(record.id);
              }
            }}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <Card className="py-12 text-center">
        <div className="mb-4 text-red-600">⚠️</div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Error al cargar los datos
        </h3>
        <p className="text-gray-600">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mantenimientos</h1>
          <p className="text-gray-600">
            Gestión de mantenimientos de líneas de vida
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" icon={Download} disabled={loading}>
            Exportar
          </Button>
          <Button icon={Plus} onClick={() => navigate("/mantenimiento/nuevo")}>
            Nuevo Mantenimiento
          </Button>
        </div>
      </div>

      {/* Filtro mínimo: Línea de Vida */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SearchableSelect
            label="Línea de Vida *"
            value={selectedLineaCodigo}
            options={lineaOptions}
            onChange={handleLineaChange}
            onSearch={(term) => execSearch(term)}
            placeholder="Buscar por código, cliente o ubicación..."
            required
          />
        </div>
      </Card>

      {/* Tabla o vacío */}
      {!filters.record_id ? (
        <Card className="py-10 text-center text-gray-600">
          Selecciona una <b>Línea de Vida</b> en los filtros para ver sus
          mantenimientos.
        </Card>
      ) : (
        <DataTable
          data={maintenances}
          columns={columns}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(page) => updateFilters({ ...filters, page })}
          loading={loading}
          stickyHeader
          maxBodyHeight="60vh"
        />
      )}

      {/* Modal de imagen */}
      <ImagePreviewModal
        open={imgOpen}
        src={imgSrc}
        title={imgTitle}
        onClose={() => setImgOpen(false)}
        onError={() => {
          setImgOpen(false);
          showError(
            "No se pudo mostrar la imagen",
            "La URL es inválida o el objeto no es público."
          );
        }}
      />
    </div>
  );
};
