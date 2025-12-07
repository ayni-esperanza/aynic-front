import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  X,
  Calendar,
  MapPin,
  Settings,
  Zap,
  User,
  FileText,
  Camera,
  Link,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Input } from '../../../shared/components/ui/Input';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../shared/components/ui/Toast';
import { useApi } from '../../../shared/hooks/useApi';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import { registroService } from "../services/registroService";
import { relationshipService } from "../services/relationshipService";
import {
  imageService,
  type ImageResponse,
} from '../../../shared/services/imageService';
import { ImageUpload } from '../../../shared/components/common/ImageUpload';
import { formatDate } from '../../../shared/utils/formatters';
import { useAuthStore } from '../../../store/authStore';
import type { DataRecord } from "../types/registro";

interface RegistroDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registroId: string;
  onDelete: (registro: DataRecord) => void;
  onCreateDerivadas: (registro: DataRecord) => void;
}

export const RegistroDetailModal: React.FC<RegistroDetailModalProps> = ({
  isOpen,
  onClose,
  registroId,
  onDelete,
  onCreateDerivadas,
}) => {
  const modalRef = useModalClose({ isOpen, onClose });
  const { error: showError, success } = useToast();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("general");
  const [currentImage, setCurrentImage] = useState<ImageResponse | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [parentRelation, setParentRelation] = useState<any>(null);
  const [childRelations, setChildRelations] = useState<any[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  
  // Estados para edición
  const [editData, setEditData] = useState<Partial<DataRecord>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const loadedIdRef = useRef<string | null>(null);

  const handleLoadRegistroError = useCallback(
    (message: string) => {
      showError("Error al cargar registro", message);
      isLoadingRef.current = false;
    },
    [showError]
  );

  const handleLoadRegistroSuccess = useCallback(() => {
    isLoadingRef.current = false;
    hasLoadedRef.current = true;
  }, []);

  const handleImageSuccess = useCallback((image: ImageResponse | null) => {
    setCurrentImage(image ?? null);
  }, []);

  const handleImageError = useCallback(
    (message: string) => {
      if (message?.includes("404") || message?.toLowerCase().includes("not found")) {
        setCurrentImage(null);
        return;
      }

      console.warn("Error checking image:", message);
      setCurrentImage(null);
    },
    []
  );

  const handleImageApiError = useCallback(
    (error: string) => {
      handleImageError(error);
    },
    [handleImageError]
  );

  const fetchRegistro = useCallback(
    (recordId: string) => registroService.getRecordById(recordId),
    []
  );

  const {
    data: registro,
    loading,
    error,
    execute: loadRegistro,
  } = useApi(fetchRegistro, {
    onError: handleLoadRegistroError,
    onSuccess: handleLoadRegistroSuccess,
  });

  const safeGetRecordImage = useCallback(
    async (recordId: string) => {
      const image = await imageService.getRecordImage(recordId);
      return image ?? null;
    },
    []
  );

  const {
    loading: checkingImage,
    execute: checkImage,
  } = useApi((recordId: string) => safeGetRecordImage(recordId), {
    onSuccess: handleImageSuccess,
    onError: handleImageApiError,
  });

  const loadData = useCallback(
    async (recordId: string) => {
      if (isLoadingRef.current || (hasLoadedRef.current && loadedIdRef.current === recordId)) {
        return;
      }

      isLoadingRef.current = true;
      loadedIdRef.current = recordId;

      try {
        await loadRegistro(recordId);
        await checkImage(recordId);
      } catch (error) {
        console.error("Error loading data:", error);
        isLoadingRef.current = false;
      }
    },
    [loadRegistro, checkImage]
  );

  const loadRelations = useCallback(async (recordId: string) => {
    if (!recordId) return;

    setLoadingRelations(true);
    try {
      const [parentData, childrenData] = await Promise.all([
        relationshipService.getParentRecord(parseInt(recordId)).catch(() => null),
        relationshipService.getChildRecords(parseInt(recordId)).catch(() => []),
      ]);

      setParentRelation(parentData);
      setChildRelations(childrenData || []);
    } catch (error) {
      console.error("Error loading relations:", error);
    } finally {
      setLoadingRelations(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !registroId) {
      return;
    }

    const alreadyLoadedSameRecord =
      hasLoadedRef.current && loadedIdRef.current === registroId;

    if (alreadyLoadedSameRecord || isLoadingRef.current) {
      return;
    }

    // Preparar estados visuales para el nuevo registro
    setActiveTab("general");
    setCurrentImage(null);

    loadData(registroId);
    loadRelations(registroId);
  }, [isOpen, registroId, loadData, loadRelations]);

  useEffect(() => {
    if (!isOpen) {
      hasLoadedRef.current = false;
      isLoadingRef.current = false;
      loadedIdRef.current = null;
      setEditData({});
      setHasChanges(false);
    }
  }, [isOpen]);
  
  // Inicializar editData cuando se carga el registro
  useEffect(() => {
    if (registro) {
      setEditData({
        equipo: registro.equipo,
        ubicacion: registro.ubicacion,
        seccion: registro.seccion,
        area: registro.area,
        planta: registro.planta,
        observaciones: registro.observaciones,
        longitud: registro.longitud,
        tipo_linea: registro.tipo_linea,
        anclaje_tipo: registro.anclaje_tipo,
      });
      setHasChanges(false);
    }
  }, [registro]);
  
  // Manejar cambios en los campos editables
  const handleFieldChange = useCallback((field: keyof DataRecord, value: any) => {
    setEditData((prev) => {
      const newData = { ...prev, [field]: value };
      return newData;
    });
    setHasChanges(true);
  }, []);
  
  // Guardar cambios
  const handleSave = useCallback(async () => {
    if (!registro || !hasChanges) return;
    
    setIsSaving(true);
    try {
      await registroService.updateRecord(registro.id, editData);
      success("Registro actualizado exitosamente");
      setHasChanges(false);
      // Recargar datos
      await loadData(registroId);
    } catch (error: any) {
      showError("Error al actualizar registro", error?.message || "Ocurrió un error al guardar");
    } finally {
      setIsSaving(false);
    }
  }, [registro, hasChanges, editData, success, showError, loadData, registroId]);

  const handleImageUploaded = useCallback(
    (image: ImageResponse) => {
      setCurrentImage(image);
      setShowImageUpload(false);
      success("Imagen agregada exitosamente");
    },
    [success]
  );

  const handleImageDeleted = useCallback(() => {
    setCurrentImage(null);
    success("Imagen eliminada");
  }, [success]);

  if (!isOpen) return null;

  if (loading && !registro) {
    return (
      <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white">Cargando registro...</p>
        </div>
      </div>
    );
  }

  if (error || !registro) {
    return (
      <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <Card className="w-full max-w-md text-center shadow-xl">
          <div className="p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Registro no encontrado
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {error || "El registro que buscas no existe o ha sido eliminado."}
            </p>
            <Button variant="outline" onClick={onClose} className="w-full">
              Cerrar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getEstadoConfig = (estado: DataRecord["estado_actual"] | string) => {
    const configs = {
      activo: {
        variant: "success" as const,
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/30",
        borderColor: "border-green-200 dark:border-green-700",
        emoji: "🟢",
        label: "Activo",
      },
      inactivo: {
        variant: "secondary" as const,
        icon: XCircle,
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-gray-800",
        borderColor: "border-gray-200 dark:border-gray-700",
        emoji: "⚪",
        label: "Inactivo",
      },
      mantenimiento: {
        variant: "warning" as const,
        icon: Wrench,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-900/30",
        borderColor: "border-orange-200 dark:border-orange-700",
        emoji: "🔧",
        label: "Mantenimiento",
      },
      por_vencer: {
        variant: "warning" as const,
        icon: AlertTriangle,
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
        borderColor: "border-yellow-200 dark:border-yellow-700",
        emoji: "🟡",
        label: "Por Vencer",
      },
      vencido: {
        variant: "danger" as const,
        icon: AlertTriangle,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/30",
        borderColor: "border-red-200 dark:border-red-700",
        emoji: "🔴",
        label: "Vencido",
      },
    } as const;

    if (!estado || estado === "undefined" || estado === "null") {
      return {
        variant: "secondary" as const,
        icon: HelpCircle,
        color: "text-gray-500",
        bgColor: "bg-gray-50 dark:bg-gray-800",
        borderColor: "border-gray-200 dark:border-gray-700",
        emoji: "❓",
        label: "No registrado",
      };
    }

    return configs[estado as keyof typeof configs] || configs["inactivo"];
  };

  const estadoConfig = getEstadoConfig(registro.estado_actual);
  const EstadoIcon = estadoConfig.icon;
  const isAyniUser = user?.empresa === 'ayni' || user?.empresa === 'Ayni' || user?.empresa === 'AYNI';

  const tabs = [
    { id: "general", label: "General", icon: FileText },
    { id: "tecnico", label: "Técnico", icon: Settings },
    { id: "fechas", label: "Fechas", icon: Calendar },
    { id: "relaciones", label: "Relaciones", icon: Link },
    { id: "imagen", label: "Imagen", icon: Camera },
  ];

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center p-3 space-x-3 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Código</p>
              <p className="font-mono text-lg font-bold text-blue-900 dark:text-blue-100">{registro.codigo}</p>
            </div>
          </div>

          {registro.codigo_placa && (
            <div className="flex items-center p-3 space-x-3 border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <span className="text-lg">🏷️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Código de Placa</p>
                <p className="font-mono text-lg font-bold text-purple-900 dark:text-purple-100">{registro.codigo_placa}</p>
              </div>
            </div>
          )}

          <div className="flex items-center p-3 space-x-3 border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Cliente</p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{registro.cliente}</p>
            </div>
          </div>

          <div className="border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Equipo</p>
            </div>
            <Input
              value={editData.equipo || ''}
              onChange={(e) => handleFieldChange('equipo', e.target.value)}
              className="bg-white dark:bg-gray-800 border-green-300 dark:border-green-600"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 space-y-3 border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Ubicación</p>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-orange-700 dark:text-orange-300">Sección:</label>
                <Input
                  value={editData.seccion || ''}
                  onChange={(e) => handleFieldChange('seccion', e.target.value)}
                  className="mt-1 bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-600"
                />
              </div>
              <div>
                <label className="text-xs text-orange-700 dark:text-orange-300">Área:</label>
                <Input
                  value={editData.area || ''}
                  onChange={(e) => handleFieldChange('area', e.target.value)}
                  className="mt-1 bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-600"
                />
              </div>
              <div>
                <label className="text-xs text-orange-700 dark:text-orange-300">Planta:</label>
                <Input
                  value={editData.planta || ''}
                  onChange={(e) => handleFieldChange('planta', e.target.value)}
                  className="mt-1 bg-white dark:bg-gray-800 border-orange-300 dark:border-orange-600"
                />
              </div>
            </div>
          </div>

          <div className="border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Ubicación específica</p>
            </div>
            <Input
              value={editData.ubicacion || ''}
              onChange={(e) => handleFieldChange('ubicacion', e.target.value)}
              className="bg-white dark:bg-gray-800 border-indigo-300 dark:border-indigo-600"
            />
          </div>

          <div className={`${estadoConfig.bgColor} p-3 rounded-xl border ${estadoConfig.borderColor}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${estadoConfig.bgColor} rounded-lg flex items-center justify-center`}>
                <EstadoIcon className={`w-5 h-5 ${estadoConfig.color}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${estadoConfig.color}`}>Estado Actual</p>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{estadoConfig.emoji}</span>
                  <Badge variant={estadoConfig.variant}>{estadoConfig.label}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h4 className="flex items-center mb-2 space-x-2 text-base font-semibold text-gray-900 dark:text-white">
          <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span>Observaciones</span>
        </h4>
        <textarea
          value={editData.observaciones || ''}
          onChange={(e) => handleFieldChange('observaciones', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          placeholder="Agregar observaciones..."
        />
      </div>
    </div>
  );

  const renderTecnicoTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
          <div className="p-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-200 dark:bg-blue-800 rounded-full">
              <span className="text-xl">🔗</span>
            </div>
            <p className="mb-2 text-xs font-medium text-center text-blue-600 dark:text-blue-400">Tipo de Línea</p>
            <Input
              value={editData.tipo_linea || ''}
              onChange={(e) => handleFieldChange('tipo_linea', e.target.value)}
              className="bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 text-center"
            />
          </div>
        </Card>

        <Card className="border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
          <div className="p-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-200 dark:bg-purple-800 rounded-full">
              <span className="text-xl">📏</span>
            </div>
            <p className="mb-2 text-xs font-medium text-center text-purple-600 dark:text-purple-400">Longitud (metros)</p>
            <Input
              type="number"
              value={editData.longitud || ''}
              onChange={(e) => handleFieldChange('longitud', e.target.value)}
              className="bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-600 text-center"
            />
          </div>
        </Card>

        <Card className="border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
          <div className="p-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-200 dark:bg-green-800 rounded-full">
              <span className="text-xl">⚙️</span>
            </div>
            <p className="mb-2 text-xs font-medium text-center text-green-600 dark:text-green-400">Tipo Anclaje</p>
            <Input
              value={editData.anclaje_tipo || ''}
              onChange={(e) => handleFieldChange('anclaje_tipo', e.target.value)}
              className="bg-white dark:bg-gray-800 border-green-300 dark:border-green-600 text-center"
              placeholder="No especificado"
            />
          </div>
        </Card>
      </div>
      
      {registro.anclaje_equipos && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Anclaje de Equipos</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">{registro.anclaje_equipos}</p>
        </div>
      )}
    </div>
  );

  const renderFechasTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="p-4 border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 rounded-xl">
          <div className="flex items-center mb-2 space-x-2">
            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Fecha de Instalación</p>
          </div>
          <p className="text-lg font-bold text-green-900 dark:text-green-100">
            {registro.fecha_instalacion ? formatDate(registro.fecha_instalacion) : "No registrada"}
          </p>
        </div>

        <div className="p-4 border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
          <div className="flex items-center mb-2 space-x-2">
            <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Fecha de Caducidad</p>
          </div>
          <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
            {registro.fecha_caducidad ? formatDate(registro.fecha_caducidad) : "No registrada"}
          </p>
        </div>
      </div>
    </div>
  );

  const renderRelacionesTab = () => (
    <div className="space-y-4">
      {loadingRelations ? (
        <div className="text-center py-8">
          <LoadingSpinner size="md" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando relaciones...</p>
        </div>
      ) : (
        <>
          {parentRelation && (
            <div className="p-4 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <h4 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">Línea Madre</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">{parentRelation.codigo}</p>
            </div>
          )}

          {childRelations.length > 0 && (
            <div className="p-4 border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <h4 className="mb-2 text-sm font-semibold text-green-900 dark:text-green-100">Líneas Derivadas ({childRelations.length})</h4>
              <div className="space-y-2">
                {childRelations.map((child) => (
                  <div key={child.id} className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-white">{child.codigo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!parentRelation && childRelations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay relaciones registradas</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderImagenTab = () => (
    <div className="space-y-4">
      {checkingImage ? (
        <div className="text-center py-8">
          <LoadingSpinner size="md" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando imagen...</p>
        </div>
      ) : currentImage ? (
        <div className="text-center">
          <img
            src={currentImage.image_url}
            alt={registro.codigo}
            className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
          />
          {isAyniUser && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleImageDeleted}
              className="mt-4"
            >
              Eliminar Imagen
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">No hay imagen registrada</p>
          {isAyniUser && (
            <Button
              variant="outline"
              onClick={() => setShowImageUpload(true)}
            >
              Agregar Imagen
            </Button>
          )}
        </div>
      )}

      {showImageUpload && (
        <div className="mt-4">
          <ImageUpload
            recordId={registro.id}
            recordCode={registro.codigo}
            onImageUploaded={handleImageUploaded}
          />
          <Button
            variant="outline"
            onClick={() => setShowImageUpload(false)}
            className="mt-2"
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralTab();
      case "tecnico":
        return renderTecnicoTab();
      case "fechas":
        return renderFechasTab();
      case "relaciones":
        return renderRelacionesTab();
      case "imagen":
        return renderImagenTab();
      default:
        return null;
    }
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl border border-white/10 dark:border-gray-700/60"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#18D043] to-[#16a34a] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl">
                <span className="text-2xl font-bold text-white">{registro.codigo.slice(-2)}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{registro.codigo}</h2>
                <p className="text-green-100">{registro.cliente} • {registro.equipo}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <nav className="flex px-6 space-x-6 overflow-x-auto">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[#18D043] text-[#16a34a] dark:text-[#18D043]"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <TabIcon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          {renderTabContent()}
        </div>

        {/* Footer con acciones */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => onCreateDerivadas(registro)}
                icon={LinkIcon}
                className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
              >
                Crear Derivadas
              </Button>
              
              {isAyniUser && (
                <Button
                  variant="danger"
                  onClick={() => onDelete(registro)}
                  icon={Trash2}
                >
                  Eliminar
                </Button>
              )}
            </div>
            
            {hasChanges && (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
