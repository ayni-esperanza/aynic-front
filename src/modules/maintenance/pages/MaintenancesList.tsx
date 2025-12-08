import React, { useState } from "react";
import { DataTable } from '../../../shared/components/common/DataTable';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card } from '../../../shared/components/ui/Card';
import { useToast } from '../../../shared/components/ui/Toast';
import { usePaginatedApi, useMutation, useApi } from '../../../shared/hooks/useApi';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import { maintenanceService } from "../services/maintenanceService";
import { formatDate, formatDateTime } from "../../../shared/utils/formatters";
import { MaintenanceForm } from "./MaintenanceForm";
import {
  Plus,
  Trash2,
  Download,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  X,
  FileText,
  Building,
  User,
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
  const modalRef = useModalClose({ isOpen: open, onClose });
  return (
    <div ref={modalRef} className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/80" style={{ margin: 0 }}>
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

/* ========== Modal de detalle de mantenimiento ========== */
const MaintenanceDetailModal: React.FC<{
  maintenance: Maintenance | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: number) => void;
  deleting?: boolean;
}> = ({ maintenance, open, onClose, onDelete, deleting }) => {
  if (!open || !maintenance) return null;
  const modalRef = useModalClose({ isOpen: open, onClose });

  const hasLengthChange = maintenance.previous_length_meters && maintenance.new_length_meters;
  const lengthChange = hasLengthChange
    ? maintenance.new_length_meters! - maintenance.previous_length_meters!
    : 0;
  const isLengthIncrease = lengthChange > 0;

  return (
    <div ref={modalRef} className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50" style={{ margin: 0 }}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-500 to-green-600">
          <div>
            <h2 className="text-base font-bold text-white">Detalle de Mantenimiento</h2>
            <p className="text-xs text-green-100">{formatDate(maintenance.maintenance_date)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white transition-colors hover:text-green-200"
            disabled={deleting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Línea de Vida */}
          {maintenance.record && (
            <Card>
              <div className="flex items-center mb-3 space-x-2">
                <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Línea de Vida</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Código</p>
                  <p className="text-sm text-gray-900 dark:text-white">{maintenance.record.codigo}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Cliente</p>
                  <p className="text-sm text-gray-900 dark:text-white">{maintenance.record.cliente}</p>
                </div>
                {maintenance.record.ubicacion && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ubicación</p>
                    <p className="text-sm text-gray-900 dark:text-white">{maintenance.record.ubicacion}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Descripción */}
          {maintenance.description && (
            <Card>
              <div className="flex items-center mb-3 space-x-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Descripción</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{maintenance.description}</p>
            </Card>
          )}

          {/* Cambio de longitud */}
          {hasLengthChange && (
            <Card>
              <div className="flex items-center mb-3 space-x-2">
                {isLengthIncrease ? (
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Cambio de Longitud</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Anterior</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{maintenance.previous_length_meters}m</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Nueva</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{maintenance.new_length_meters}m</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cambio</p>
                  <p className={`text-lg font-bold ${isLengthIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isLengthIncrease ? '+' : ''}{lengthChange.toFixed(1)}m
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Registrado por */}
          <Card>
            <div className="flex items-center mb-3 space-x-2">
              <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Registrado por</h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-900 dark:text-white">
                {maintenance.user ? `${maintenance.user.nombre} ${maintenance.user.apellidos}` : 'Sistema'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(maintenance.created_at)}</p>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={deleting}
          >
            Cerrar
          </Button>
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => {
                if (window.confirm(`¿Eliminar mantenimiento del ${formatDate(maintenance.maintenance_date)}?`)) {
                  onDelete(maintenance.id);
                }
              }}
              disabled={deleting}
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          )}
        </div>
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
  const { success, error: showError } = useToast();

  const [filters, setFilters] = useState<MaintenanceFilters>({
    page: 1,
    limit: 10,
    record_id: undefined,
  });

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | undefined>();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);

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
        setShowDetailModal(false);
        setSelectedMaintenance(null);
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

  const handleViewMaintenance = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setShowDetailModal(true);
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
        <div className="font-medium text-gray-900 dark:text-white">
          {formatDate(record.maintenance_date)}
        </div>
      ),
    },
    {
      key: "record",
      label: "Línea de Vida",
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {record.record?.codigo || "N/A"}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {record.record?.cliente || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Descripción",
      render: (_, record) => {
        const desc = record.description || "Sin descripción";
        return (
          <div className="max-w-xs">
            <div
              className="text-sm text-gray-900 truncate dark:text-white"
              title={desc}
            >
              {desc}
            </div>
          </div>
        );
      },
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
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {isIncrease ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                <span>{`${isIncrease ? "+" : ""}${change.toFixed(1)}m`}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
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
            onClick={(e) => {
              e.stopPropagation();
              openMaintenanceImage(m);
            }}
          >
            Ver
          </Button>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">Sin imagen</span>
        );
      },
    },
    {
      key: "user",
      label: "Registrado por",
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {record.user
              ? `${record.user.nombre} ${record.user.apellidos}`
              : "Sistema"}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {formatDateTime(record.created_at)}
          </div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mantenimientos</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestión de mantenimientos de líneas de vida
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" icon={Download} disabled={loading}>
            Exportar
          </Button>
          <Button icon={Plus} onClick={() => setShowFormModal(true)}>
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
          onRowClick={handleViewMaintenance}
          loading={loading}
          density="compact"
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

      {/* Modal de detalle */}
      <MaintenanceDetailModal
        maintenance={selectedMaintenance}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMaintenance(null);
        }}
        onDelete={deleteMaintenance}
        deleting={deleting}
      />

      {/* Modal de formulario */}
      <MaintenanceForm
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedRecordId(undefined);
        }}
        onSuccess={() => {
          updateFilters({});
        }}
        preselectedRecordId={selectedRecordId}
      />
    </div>
  );
};
