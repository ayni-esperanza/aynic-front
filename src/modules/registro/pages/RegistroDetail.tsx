import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  Settings,
  Zap,
  Clock,
  User,
  FileText,
  Activity,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  Camera,
  Image as ImageIcon,
  Link,
  HelpCircle,
} from "lucide-react";
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../shared/components/ui/Toast';
import { useApi } from '../../../shared/hooks/useApi';
import { registroService } from "../services/registroService";
import { relationshipService } from "../services/relationshipService";
import {
  imageService,
  type ImageResponse,
} from '../../../shared/services/imageService';
import { ImageUpload } from '../../../shared/components/common/ImageUpload';
import { formatDate, formatDateTime, isAyniUser } from '../../../shared/utils';
import { useAuthStore } from '../../../store/authStore';
import type { DataRecord } from "../types/registro";

// Función auxiliar para manejar fechas de forma segura
const safeFormatDate = (dateValue: Date | undefined): string => {
  if (!dateValue) return "Fecha no disponible";

  try {
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return formatDate(dateValue);
    }

    return "Fecha inválida";
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "Error en fecha";
  }
};

const safeFormatDateTime = (dateValue: Date | undefined): string => {
  if (!dateValue) return "Fecha no disponible";

  try {
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return formatDateTime(dateValue);
    }

    return "Fecha inválida";
  } catch (error) {
    console.warn("Error formatting datetime:", error);
    return "Error en fecha";
  }
};

export const RegistroDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { error: showError, success } = useToast();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("general");
  const [currentImage, setCurrentImage] = useState<ImageResponse | null>(null);
  const [hasImage, setHasImage] = useState<boolean | null>(null); // null = loading, true = has image, false = no image
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Estados para relaciones
  const [parentRelation, setParentRelation] = useState<any>(null);
  const [childRelations, setChildRelations] = useState<any[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);

  // Referencias para evitar solicitudes duplicadas
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const loadedIdRef = useRef<string | null>(null);

  // Hook para cargar el registro
  const {
    data: registro,
    loading,
    error,
    execute: loadRegistro,
  } = useApi((...args: unknown[]) => registroService.getRecordById(args[0] as string), {
    onError: (error) => {
      showError("Error al cargar registro", error);
      isLoadingRef.current = false;
    },
    onSuccess: () => {
      isLoadingRef.current = false;
      hasLoadedRef.current = true;
    },
  });

  // Hook para cargar imagen del registro - Función memoizada estable
  const loadImageFunction = useCallback(
    (recordId: string) => imageService.getRecordImage(recordId),
    [] // Sin dependencias para mantener la función estable
  );

  const [loadingImage] = useState(false);

  // Hook para verificar si el registro tiene imagen
  const {
    loading: checkingImage,
    execute: checkImage,
  } = useApi((...args: unknown[]) => imageService.getRecordImage(args[0] as string), {
    onSuccess: (image) => {
      setHasImage(true);
      setCurrentImage(image);
    },
    onError: (error: any) => {
      // Si es 404, significa que no hay imagen
      if (error?.message?.includes("404") || error?.message?.includes("Not Found")) {
        setHasImage(false);
        setCurrentImage(null);
      } else {
        console.warn("Error checking image:", error);
        setHasImage(false);
      }
    },
  });

  const mountedRef = useRef(true);

  // Función de carga controlada para evitar duplicados
  const loadData = useCallback(
    async (recordId: string) => {
      // Evitar cargas duplicadas
      if (
        isLoadingRef.current ||
        (hasLoadedRef.current && loadedIdRef.current === recordId)
      ) {
        return;
      }

      isLoadingRef.current = true;
      loadedIdRef.current = recordId;

      try {
        await loadRegistro(recordId);
        // Verificar si el registro tiene imagen
        await checkImage(recordId);
      } catch (error) {
        console.error("Error loading data:", error);
        isLoadingRef.current = false;
      }
    },
    [loadRegistro, checkImage]
  );

  // Función para cargar relaciones
  const loadRelations = useCallback(async (recordId: string) => {
    if (!recordId) return;

    setLoadingRelations(true);
    try {
      const [parentData, childrenData] = await Promise.all([
        relationshipService
          .getParentRecord(parseInt(recordId))
          .catch(() => null),
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

  // Effect principal - Solo se ejecuta cuando cambia el ID
  useEffect(() => {
    mountedRef.current = true;

    if (id && id !== loadedIdRef.current && mountedRef.current) {
      hasLoadedRef.current = false;
      isLoadingRef.current = false;

      setCurrentImage(null);

      loadData(id);
      loadRelations(id);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [id, loadData]);

  // Handlers para imagen - Funciones estables
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

  // Loading state
  if (loading && !registro) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando registro...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !registro) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md text-center shadow-xl">
          <div className="p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Registro no encontrado
            </h3>
            <p className="mb-6 text-gray-600">
              {error || "El registro que buscas no existe o ha sido eliminado."}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/registro")}
              icon={ArrowLeft}
              className="w-full"
            >
              Volver a Registros
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
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        emoji: "🟢",
        label: "Activo",
      },
      inactivo: {
        variant: "secondary" as const,
        icon: XCircle,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        emoji: "⚪",
        label: "Inactivo",
      },
      mantenimiento: {
        variant: "warning" as const,
        icon: Wrench,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        emoji: "🔧",
        label: "Mantenimiento",
      },
      por_vencer: {
        variant: "warning" as const,
        icon: AlertTriangle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        emoji: "🟡",
        label: "Por Vencer",
      },
      vencido: {
        variant: "danger" as const,
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        emoji: "🔴",
        label: "Vencido",
      },
    } as const;

    // Si no hay estado o es inválido, retornar configuración para "no registrado"
    if (!estado || estado === "undefined" || estado === "null") {
      return {
        variant: "secondary" as const,
        icon: HelpCircle,
        color: "text-gray-500",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        emoji: "❓",
        label: "No registrado",
      };
    }

    return configs[estado as keyof typeof configs] || configs["inactivo"];
  };

  const estadoConfig = getEstadoConfig(registro.estado_actual);
  const EstadoIcon = estadoConfig.icon;

  const tabs = [
    { id: "general", label: "General", icon: FileText },
    { id: "tecnico", label: "Técnico", icon: Settings },
    { id: "fechas", label: "Fechas", icon: Calendar },
    { id: "relaciones", label: "Relaciones", icon: Link },
    { id: "imagen", label: "Imagen", icon: Camera },
    { id: "actividad", label: "Actividad", icon: Activity },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              <div className="space-y-3 sm:space-y-4">
                {registro.purchase_order_num && (
                  <div className="flex items-center p-3 space-x-3 border sm:p-4 border-emerald-200 bg-emerald-50 rounded-xl">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg sm:w-10 sm:h-10 bg-emerald-100">
                      <span className="text-sm sm:text-lg">🧾</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium sm:text-sm text-emerald-600">
                        Nº Orden de Compra
                      </p>
                      <p className="font-mono text-sm font-bold truncate sm:text-lg text-emerald-900">
                        {registro.purchase_order_num}
                      </p>
                    </div>
                  </div>
                )}

                {registro.purchase_order_termino_referencias && (
                  <div className="p-3 border sm:p-4 border-emerald-200 bg-emerald-50 rounded-xl">
                    <div className="flex items-center mb-2 space-x-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100">
                        <span className="text-sm">⚖️</span>
                      </div>
                      <h4 className="text-xs font-semibold sm:text-sm text-emerald-700">
                        Término y Referencias (OC)
                      </h4>
                    </div>
                    <p className="text-sm whitespace-pre-line sm:text-base text-emerald-900">
                      {registro.purchase_order_termino_referencias}
                    </p>
                  </div>
                )}

                <div className="flex items-center p-3 space-x-3 border border-blue-200 sm:p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg sm:w-10 sm:h-10">
                    <FileText className="w-4 h-4 text-blue-600 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-600 sm:text-sm">
                      Código
                    </p>
                    <p className="font-mono text-sm font-bold text-blue-900 truncate sm:text-lg">
                      {registro.codigo}
                    </p>
                  </div>
                </div>

                {registro.codigo_placa && (
                  <div className="flex items-center p-3 space-x-3 border border-purple-200 sm:p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg sm:w-10 sm:h-10">
                      <span className="text-sm sm:text-lg">🏷️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-purple-600 sm:text-sm">
                        Código de Placa
                      </p>
                      <p className="font-mono text-sm font-bold text-purple-900 truncate sm:text-lg">
                        {registro.codigo_placa}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center p-3 space-x-3 border border-purple-200 sm:p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg sm:w-10 sm:h-10">
                    <User className="w-4 h-4 text-purple-600 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-purple-600 sm:text-sm">
                      Cliente
                    </p>
                    <p className="text-sm font-bold text-purple-900 truncate sm:text-lg">
                      {registro.cliente}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-3 space-x-3 border border-green-200 sm:p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg sm:w-10 sm:h-10">
                    <Zap className="w-4 h-4 text-green-600 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-600 sm:text-sm">
                      Equipo
                    </p>
                    <p className="text-sm font-bold text-green-900 truncate sm:text-lg">
                      {registro.equipo}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col items-start p-3 space-y-3 border border-orange-200 sm:flex-row sm:items-center sm:p-4 sm:space-y-0 sm:space-x-3 bg-orange-50 rounded-xl">
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg sm:w-10 sm:h-10">
                    <Settings className="w-4 h-4 text-orange-600 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex flex-col w-full space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-orange-600 sm:text-sm">
                        Sección
                      </p>
                      <p className="font-mono text-sm font-bold text-orange-900 truncate sm:text-lg">
                        {registro.seccion}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-orange-600 sm:text-sm">
                        Área
                      </p>
                      <p className="font-mono text-sm font-bold text-orange-900 truncate sm:text-lg">
                        {registro.area}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-orange-600 sm:text-sm">
                        Planta
                      </p>
                      <p className="font-mono text-sm font-bold text-orange-900 truncate sm:text-lg">
                        {registro.planta}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 space-x-3 border border-indigo-200 sm:p-4 bg-indigo-50 rounded-xl">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg sm:w-10 sm:h-10">
                    <MapPin className="w-4 h-4 text-indigo-600 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-indigo-600 sm:text-sm">
                      Ubicación
                    </p>
                    <p className="text-sm font-bold text-indigo-900 truncate sm:text-lg">
                      {registro.ubicacion}
                    </p>
                  </div>
                </div>

                <div
                  className={
                    estadoConfig.bgColor +
                    " p-3 sm:p-4 rounded-xl border " +
                    estadoConfig.borderColor
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 ${estadoConfig.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <EstadoIcon
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${estadoConfig.color}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-medium ${estadoConfig.color}`}
                      >
                        Estado Actual
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{estadoConfig.emoji}</span>
                        <Badge variant={estadoConfig.variant}>
                          {estadoConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {registro.observaciones && (
              <div className="p-4 border border-gray-200 sm:p-6 bg-gray-50 rounded-xl">
                <h4 className="flex items-center mb-3 space-x-2 text-base font-semibold text-gray-900 sm:text-lg">
                  <FileText className="w-4 h-4 text-gray-600 sm:w-5 sm:h-5" />
                  <span>Observaciones</span>
                </h4>
                <p className="p-3 text-sm leading-relaxed text-gray-700 bg-white border border-gray-100 rounded-lg sm:p-4 sm:text-base">
                  {registro.observaciones}
                </p>
              </div>
            )}
          </div>
        );

      case "tecnico":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="p-4 text-center sm:p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-200 rounded-full sm:w-16 sm:h-16 sm:mb-4">
                    <span className="text-lg sm:text-2xl">🔗</span>
                  </div>
                  <h4 className="mb-2 text-sm font-semibold text-blue-900 sm:text-base">
                    Tipo de Línea
                  </h4>
                  <p className="text-sm font-medium text-blue-700 sm:text-base">
                    {registro.tipo_linea}
                  </p>
                </div>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <div className="p-4 text-center sm:p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-200 rounded-full sm:w-16 sm:h-16 sm:mb-4">
                    <Gauge className="w-6 h-6 text-green-600 sm:w-8 sm:h-8" />
                  </div>
                  <h4 className="mb-2 text-sm font-semibold text-green-900 sm:text-base">
                    Longitud
                  </h4>
                  <p className="text-lg font-medium text-green-700 sm:text-xl">
                    {registro.longitud || 0}m
                  </p>
                </div>
              </Card>

              {registro.codigo_placa && (
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="p-4 text-center sm:p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-200 rounded-full sm:w-16 sm:h-16 sm:mb-4">
                      <span className="text-lg sm:text-2xl">🏷️</span>
                    </div>
                    <h4 className="mb-2 text-sm font-semibold text-purple-900 sm:text-base">
                      Código de Placa
                    </h4>
                    <p className="font-mono text-sm font-medium text-purple-700 sm:text-lg">
                      {registro.codigo_placa}
                    </p>
                  </div>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              <Card>
                <div className="p-4 sm:p-6">
                  <h4 className="flex items-center mb-3 space-x-2 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
                    <Settings className="w-4 h-4 text-gray-600 sm:w-5 sm:h-5" />
                    <span>Especificaciones</span>
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col py-2 space-y-1 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <span className="text-sm text-gray-600 sm:text-base">Código de Equipo:</span>
                      <span className="px-2 py-1 font-mono text-xs font-medium bg-gray-100 rounded sm:text-sm">
                        {registro.equipo}
                      </span>
                    </div>
                    {registro.codigo_placa && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Código de Placa:</span>
                        <span className="px-2 py-1 font-mono font-medium text-purple-800 bg-purple-100 rounded">
                          {registro.codigo_placa}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Sección:</span>
                      <span className="px-2 py-1 font-mono font-medium bg-gray-100 rounded">
                        {registro.seccion}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Área:</span>
                      <span className="px-2 py-1 font-mono font-medium bg-gray-100 rounded">
                        {registro.area}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Planta:</span>
                      <span className="px-2 py-1 font-mono font-medium bg-gray-100 rounded">
                        {registro.planta}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Tecnología:</span>
                      <Badge variant="primary">{registro.tipo_linea}</Badge>
                    </div>
                    {registro.anclaje_tipo && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Tipo de Anclaje:</span>
                        <Badge variant="secondary">{registro.anclaje_tipo}</Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Extensión:</span>
                      <span className="font-medium">
                        {(registro.longitud || 0).toLocaleString()} metros
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h4 className="flex items-center mb-4 space-x-2 text-lg font-semibold text-gray-900">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span>Ubicación</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="mb-2 text-gray-700">
                        📍 <strong>Dirección:</strong>
                      </p>
                      <p className="text-gray-900">{registro.ubicacion}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 text-center rounded-lg bg-blue-50">
                        <p className="font-medium text-blue-600">Región</p>
                        <p className="font-semibold text-blue-900">Principal</p>
                      </div>
                      <div className="p-3 text-center rounded-lg bg-green-50">
                        <p className="font-medium text-green-600">Zona</p>
                        <p className="font-semibold text-green-900">Urbana</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case "fechas":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="p-6">
                  <div className="flex items-center mb-4 space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-200 rounded-full">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-green-900">
                        Fecha de Instalación
                      </h4>
                      <p className="text-green-600">Inicio de operaciones</p>
                    </div>
                  </div>
                  <div className="py-4 text-center">
                    <p className="mb-2 text-3xl font-bold text-green-900">
                      {safeFormatDate(registro.fecha_instalacion)}
                    </p>
                    <p className="text-green-600">
                      Hace{" "}
                      {(() => {
                        try {
                          if (registro.fecha_instalacion && !isNaN(registro.fecha_instalacion.getTime())) {
                            return Math.floor(
                              (new Date().getTime() - registro.fecha_instalacion.getTime()) /
                              (1000 * 60 * 60 * 24)
                            );
                          }
                          return 0;
                        } catch {
                          return 0;
                        }
                      })()}{" "}
                      días
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-100">
                <div className="p-6">
                  <div className="flex items-center mb-4 space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-200 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-red-900">
                        Fecha de Caducidad
                      </h4>
                      <p className="text-red-600">Límite de operación</p>
                    </div>
                  </div>
                  <div className="py-4 text-center">
                    <p className="mb-2 text-3xl font-bold text-red-900">
                      {safeFormatDate(registro.fecha_caducidad)}
                    </p>
                    <p className="text-red-600">
                      {(() => {
                        try {
                          if (registro.fecha_caducidad && !isNaN(registro.fecha_caducidad.getTime())) {
                            const today = new Date();
                            const diffDays = Math.floor(
                              (registro.fecha_caducidad.getTime() - today.getTime()) /
                              (1000 * 60 * 60 * 24)
                            );

                            if (diffDays > 0) {
                              return `En ${diffDays} días`;
                            } else {
                              return `Vencido hace ${Math.abs(diffDays)} días`;
                            }
                          }
                          return "Fecha no válida";
                        } catch {
                          return "Error en cálculo";
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-100">
                <div className="p-6">
                  <div className="flex items-center mb-4 space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-teal-200 rounded-full">
                      <Calendar className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-teal-900">
                        Próximo Mantenimiento
                      </h4>
                      <p className="text-teal-600">Fecha programada</p>
                    </div>
                  </div>
                  <div className="py-4 text-center">
                    <p className="mb-2 text-3xl font-bold text-teal-900">
                      {safeFormatDate((registro as any).fecha_mantenimiento)}
                    </p>
                    <p className="text-teal-700">
                      {(() => {
                        try {
                          const fm = (registro as any).fecha_mantenimiento as Date | undefined;
                          if (fm && !isNaN(fm.getTime())) {
                            const today = new Date();
                            const diffDays = Math.floor(
                              (fm.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                            );
                            if (diffDays > 0) return `En ${diffDays} días`;
                            if (diffDays === 0) return 'Hoy';
                            return `Hace ${Math.abs(diffDays)} días`;
                          }
                          return 'Sin fecha';
                        } catch {
                          return 'Error en cálculo';
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Línea de tiempo y estadísticas adicionales */}
            <Card>
              <div className="p-6">
                <h4 className="flex items-center mb-6 space-x-2 text-lg font-semibold text-gray-900">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span>Información de Vida Útil</span>
                </h4>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <div className="p-6">
                      <h4 className="mb-4 text-lg font-semibold text-gray-900">
                        Tiempo Transcurrido
                      </h4>
                      <div className="space-y-3">
                        {(() => {
                          try {
                            if (!registro.fecha_instalacion || isNaN(registro.fecha_instalacion.getTime())) {
                              return (
                                <div className="space-y-3">
                                  <div className="text-red-600">
                                    Fecha de instalación no válida
                                  </div>
                                </div>
                              );
                            }

                            const totalDays = Math.floor(
                              (new Date().getTime() - registro.fecha_instalacion.getTime()) /
                              (1000 * 60 * 60 * 24)
                            );
                            const years = Math.floor(totalDays / 365);
                            const months = Math.floor((totalDays % 365) / 30);
                            const days = totalDays % 30;

                            return (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Años:</span>
                                  <span className="text-2xl font-semibold text-green-600">
                                    {years}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Meses:</span>
                                  <span className="text-2xl font-semibold text-green-600">
                                    {months}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Días:</span>
                                  <span className="text-xl font-semibold text-green-600">
                                    {days}
                                  </span>
                                </div>
                                <div className="pt-2 border-t border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                      Total días:
                                    </span>
                                    <span className="text-xl font-bold text-gray-900">
                                      {totalDays}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          } catch (error) {
                            console.warn(
                              "Error calculating time elapsed:",
                              error
                            );
                            return (
                              <div className="text-red-600">
                                Error calculando tiempo transcurrido
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        );

      case "relaciones":
        return (
          <div className="space-y-6">
            {loadingRelations ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Línea Padre */}
                {parentRelation && (
                  <Card className="border-blue-200 bg-blue-50">
                    <div className="p-6">
                      <h4 className="flex items-center mb-4 space-x-2 text-lg font-semibold text-blue-900">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Línea Original</span>
                      </h4>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-blue-500 rounded-lg">
                            {parentRelation.parent_record?.codigo?.slice(-2) ||
                              "P"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {parentRelation.parent_record?.codigo}
                            </p>
                            <p className="text-sm text-gray-600">
                              {parentRelation.parent_record?.cliente}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                            {parentRelation.relationship_type === "DIVISION"
                              ? "División"
                              : parentRelation.relationship_type ===
                                "REPLACEMENT"
                                ? "Reemplazo"
                                : "Actualización"}
                          </span>
                          <p className="mt-1 text-sm text-gray-500">
                            Estado:{" "}
                            {parentRelation.parent_record?.estado_actual}
                          </p>
                        </div>
                      </div>
                      {parentRelation.notes && (
                        <div className="p-3 mt-4 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            {parentRelation.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Líneas Derivadas */}
                {childRelations.length > 0 && (
                  <Card className="border-green-200 bg-green-50">
                    <div className="p-6">
                      <h4 className="flex items-center mb-4 space-x-2 text-lg font-semibold text-green-900">
                        <Link className="w-5 h-5" />
                        <span>Líneas Derivadas ({childRelations.length})</span>
                      </h4>
                      <div className="space-y-3">
                        {childRelations.map((relation, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-white rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-green-500 rounded-lg">
                                {relation.child_record?.codigo?.slice(-2) ||
                                  index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {relation.child_record?.codigo}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {relation.child_record?.cliente}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                                {relation.relationship_type === "DIVISION"
                                  ? "División"
                                  : relation.relationship_type === "REPLACEMENT"
                                    ? "Reemplazo"
                                    : "Actualización"}
                              </span>
                              <p className="mt-1 text-sm text-gray-500">
                                Estado: {relation.child_record?.estado_actual}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Sin relaciones */}
                {!parentRelation && childRelations.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                      <Link className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Sin Relaciones
                    </h3>
                    <p className="text-gray-600">
                      Esta línea no tiene relaciones con otras líneas del
                      sistema.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "imagen":
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
                <Camera className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Imagen del Registro
              </h3>
              <p className="max-w-lg mx-auto text-gray-600">
                Fotografía del equipo o instalación asociada a este registro.
                {!currentImage &&
                  " Agrega una imagen para completar la documentación."}
              </p>
            </div>

            {checkingImage ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Verificando imagen...</p>
                </div>
              </div>
            ) : hasImage === false ? (
              <div className="max-w-4xl mx-auto">
                <Card className="border-2 border-gray-300 border-dashed">
                  <div className="p-16 text-center">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full">
                      <ImageIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="mb-3 text-xl font-medium text-gray-900">
                      Sin imagen disponible
                    </h4>
                    <p className="max-w-sm mx-auto text-gray-500">
                      No se ha asociado ninguna imagen a este registro.
                      <br />
                      <span className="text-sm text-gray-400">
                        Las imágenes solo se pueden subir durante la creación del registro.
                      </span>
                    </p>
                  </div>
                </Card>
              </div>
            ) : hasImage === true ? (
              <div className="max-w-4xl mx-auto">
                <ImageUpload
                  recordId={registro.id}
                  recordCode={registro.codigo}
                  skipInitialLoad={false}
                  readOnly={true}
                  onImageUploaded={handleImageUploaded}
                  onImageDeleted={handleImageDeleted}
                />
              </div>
            ) : null}
          </div>
        );

      case "actividad":
        return (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h4 className="flex items-center mb-6 space-x-2 text-lg font-semibold text-gray-900">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <span>Actividad Reciente</span>
                </h4>

                <div className="space-y-4">
                  {[
                    {
                      action: "Registro creado",
                      time: safeFormatDateTime(registro.fecha_instalacion),
                      type: "create",
                    },
                    {
                      action: "Estado actualizado a " + registro.estado_actual,
                      time: safeFormatDateTime(new Date()),
                      type: "update",
                    },
                    currentImage && {
                      action: "Imagen agregada",
                      time: safeFormatDateTime(currentImage.upload_date),
                      type: "image",
                    },
                    {
                      action: "Última revisión completada",
                      time: safeFormatDateTime(new Date(Date.now() - 86400000)),
                      type: "review",
                    },
                  ]
                    .filter(Boolean)
                    .map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start p-4 space-x-4 rounded-lg bg-gray-50"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${activity!.type === "create"
                            ? "bg-green-100"
                            : activity!.type === "update"
                              ? "bg-blue-100"
                              : activity!.type === "image"
                                ? "bg-orange-100"
                                : "bg-purple-100"
                            }`}
                        >
                          {activity!.type === "create" && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {activity!.type === "update" && (
                            <Edit className="w-5 h-5 text-blue-600" />
                          )}
                          {activity!.type === "image" && (
                            <Camera className="w-5 h-5 text-orange-600" />
                          )}
                          {activity!.type === "review" && (
                            <Settings className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {activity!.action}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity!.time}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <div className="p-6">
                  <h4 className="mb-4 text-lg font-semibold text-gray-900">
                    Estadísticas
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                      <span className="font-medium text-blue-600">
                        Tiempo activo
                      </span>
                      <span className="font-semibold text-blue-900">
                        {(() => {
                          try {
                            if (registro.fecha_instalacion && !isNaN(registro.fecha_instalacion.getTime())) {
                              return Math.floor(
                                (new Date().getTime() - registro.fecha_instalacion.getTime()) /
                                (1000 * 60 * 60 * 24)
                              );
                            }
                            return 0;
                          } catch {
                            return 0;
                          }
                        })()}{" "}
                        días
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <span className="font-medium text-green-600">
                        Estado actual
                      </span>
                      <Badge variant={estadoConfig.variant}>
                        {registro.estado_actual}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                      <span className="font-medium text-purple-600">
                        Última actualización
                      </span>
                      <span className="font-semibold text-purple-900">Hoy</span>
                    </div>
                    {currentImage && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                        <span className="font-medium text-orange-600">
                          Imagen
                        </span>
                        <span className="font-semibold text-orange-900">
                          Disponible
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h4 className="mb-4 text-lg font-semibold text-gray-900">
                    Próximas Acciones
                  </h4>
                  <div className="space-y-3">
                    {/* Acciones según el estado */}
                    {registro.estado_actual === "vencido" && (
                      <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <p className="font-medium text-red-800">
                          🚨 Renovación urgente
                        </p>
                        <p className="text-sm text-red-600">
                          Linea vencido - Contactar soporte
                        </p>
                      </div>
                    )}

                    {registro.estado_actual === "por_vencer" && (
                      <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                        <p className="font-medium text-yellow-800">
                          ⚠️ Próximo a vencer
                        </p>
                        <p className="text-sm text-yellow-600">
                          Planificar renovación o mantenimiento
                        </p>
                      </div>
                    )}

                    {registro.estado_actual === "mantenimiento" && (
                      <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                        <p className="font-medium text-orange-800">
                          🔧 En mantenimiento
                        </p>
                        <p className="text-sm text-orange-600">
                          Completar tareas pendientes
                        </p>
                      </div>
                    )}

                    {!currentImage && (
                      <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                        <p className="font-medium text-blue-800">
                          📷 Agregar imagen
                        </p>
                        <p className="text-sm text-blue-600">
                          Documentar con una fotografía del equipo
                        </p>
                      </div>
                    )}

                    <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                      <p className="font-medium text-blue-800">
                        📊 Revisión programada
                      </p>
                      <p className="text-sm text-blue-600">
                        Próxima revisión en 30 días
                      </p>
                    </div>
                    <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                      <p className="font-medium text-green-800">
                        📋 Generar reporte
                      </p>
                      <p className="text-sm text-green-600">
                        Reporte mensual disponible
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header mejorado */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/registro")}
                icon={ArrowLeft}
                className="w-full border-gray-300 hover:bg-gray-50 sm:w-auto"
              >
                <span className="hidden sm:inline">Volver</span>
                <span className="sm:hidden">← Volver</span>
              </Button>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl text-white sm:text-2xl">📊</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Detalle del Registro
                  </h1>
                  <p className="flex flex-col space-y-1 text-sm text-gray-600 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 sm:text-base">
                    <span>Información completa del registro</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#18D043]/10 text-[#16a34a] font-mono w-fit">
                      {registro.codigo}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:space-x-3 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => navigate(`/historial?registro=${registro.id}`)}
                icon={Activity}
                className="w-full text-blue-600 border-blue-300 hover:bg-blue-50 sm:w-auto"
              >
                <span className="hidden sm:inline">Ver Historial</span>
                <span className="sm:hidden">Historial</span>
              </Button>
              <Button
                onClick={() => navigate(`/registro/editar/${registro.id}`)}
                icon={Edit}
                className="bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                disabled={!isAyniUser(user?.empresa)}
              >
                <span className="hidden sm:inline">Editar Registro</span>
                <span className="sm:hidden">Editar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Card principal con información destacada */}
        <Card className="mb-6 overflow-hidden bg-white border-0 shadow-xl sm:mb-8">
          <div className="bg-gradient-to-r from-[#18D043] to-[#16a34a] p-4 sm:p-6 text-white">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl">
                  <span className="text-2xl font-bold text-white sm:text-3xl">
                    {registro.codigo.slice(-2)}
                  </span>
                </div>
                <div>
                  <h2 className="mb-1 text-xl font-bold sm:text-2xl">{registro.codigo}</h2>
                  <p className="text-base text-green-100 sm:text-lg">{registro.cliente}</p>
                  <p className="text-xs text-green-200 sm:text-sm">
                    {registro.equipo} • {registro.tipo_linea}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="flex items-center mb-2 space-x-2 sm:space-x-3">
                  <span className="text-xl sm:text-2xl">{estadoConfig.emoji}</span>
                  <Badge
                    variant={estadoConfig.variant}
                    size="md"
                    className={`${estadoConfig.color} ${estadoConfig.bgColor} ${estadoConfig.borderColor} font-semibold`}
                  >
                    {registro.estado_actual}
                  </Badge>
                </div>
                <p className="text-xs text-green-100 sm:text-sm">
                  Instalado: {formatDate(registro.fecha_instalacion)}
                </p>
                {currentImage && (
                  <p className="mt-1 text-xs text-green-200">
                    Con imagen documentada
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Navegación por tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white border-b border-gray-200 rounded-t-lg shadow-sm">
            <nav className="flex px-3 space-x-2 overflow-x-auto sm:px-6 sm:space-x-8">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 whitespace-nowrap ${activeTab === tab.id
                      ? "border-[#18D043] text-[#16a34a]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    <TabIcon size={14} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    {tab.id === "imagen" && currentImage && (
                      <div className="w-2 h-2 bg-[#18D043] rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenido del tab activo */}
        <div className="p-4 bg-white border-0 rounded-b-lg shadow-xl sm:p-6 lg:p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
