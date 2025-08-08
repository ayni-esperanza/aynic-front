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
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useToast } from "../../../components/ui/Toast";
import { useApi } from "../../../hooks/useApi";
import { recordsService } from "../../../services/recordsService";
import {
  imageService,
  type ImageResponse,
} from "../../../services/imageService";
import { ImageUpload } from "../../../components/common/ImageUpload";
import { formatDate, formatDateTime } from "../../../utils/formatters";
import type { DataRecord } from "../../../types";

// Función auxiliar para manejar fechas de forma segura
const safeFormatDate = (dateValue: Date | string | undefined): string => {
  if (!dateValue) return "Fecha no disponible";

  try {
    if (typeof dateValue === "string") {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? "Fecha inválida" : formatDate(parsed);
    }

    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return formatDate(dateValue);
    }

    return "Fecha inválida";
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "Error en fecha";
  }
};

const safeFormatDateTime = (dateValue: Date | string | undefined): string => {
  if (!dateValue) return "Fecha no disponible";

  try {
    if (typeof dateValue === "string") {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime())
        ? "Fecha inválida"
        : formatDateTime(parsed);
    }

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
  const [activeTab, setActiveTab] = useState("general");
  const [currentImage, setCurrentImage] = useState<ImageResponse | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

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
  } = useApi(recordsService.getRecordById.bind(recordsService), {
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
      } catch (error) {
        console.error("Error loading data:", error);
        isLoadingRef.current = false;
      }
    },
    [loadRegistro]
  );

  // Effect principal - Solo se ejecuta cuando cambia el ID
  useEffect(() => {
    if (id && id !== loadedIdRef.current) {
      // Resetear estado cuando cambia el ID
      hasLoadedRef.current = false;
      isLoadingRef.current = false;
      setCurrentImage(null);

      loadData(id);
    }
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

    return configs[estado as keyof typeof configs] || configs["activo"];
  };

  const estadoConfig = getEstadoConfig(registro.estado_actual);
  const EstadoIcon = estadoConfig.icon;

  const tabs = [
    { id: "general", label: "General", icon: FileText },
    { id: "tecnico", label: "Técnico", icon: Settings },
    { id: "fechas", label: "Fechas", icon: Calendar },
    { id: "imagen", label: "Imagen", icon: Camera },
    { id: "actividad", label: "Actividad", icon: Activity },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center p-4 space-x-3 border border-blue-200 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Código</p>
                    <p className="font-mono text-lg font-bold text-blue-900">
                      {registro.codigo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 space-x-3 border border-purple-200 bg-purple-50 rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      Cliente
                    </p>
                    <p className="text-lg font-bold text-purple-900">
                      {registro.cliente}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 space-x-3 border border-green-200 bg-green-50 rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Equipo</p>
                    <p className="text-lg font-bold text-green-900">
                      {registro.equipo}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 space-x-3 border border-orange-200 bg-orange-50 rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                    <Settings className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-600">SEEC</p>
                    <p className="font-mono text-lg font-bold text-orange-900">
                      {registro.seec}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 space-x-3 border border-indigo-200 bg-indigo-50 rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-600">
                      Ubicación
                    </p>
                    <p className="text-lg font-bold text-indigo-900">
                      {registro.ubicacion}
                    </p>
                  </div>
                </div>

                <div
                  className={
                    estadoConfig.bgColor +
                    " p-4 rounded-xl border " +
                    estadoConfig.borderColor
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 ${estadoConfig.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <EstadoIcon className={`w-5 h-5 ${estadoConfig.color}`} />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${estadoConfig.color}`}
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
              <div className="p-6 border border-gray-200 bg-gray-50 rounded-xl">
                <h4 className="flex items-center mb-3 space-x-2 text-lg font-semibold text-gray-900">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span>Observaciones</span>
                </h4>
                <p className="p-4 leading-relaxed text-gray-700 bg-white border border-gray-100 rounded-lg">
                  {registro.observaciones}
                </p>
              </div>
            )}
          </div>
        );

      case "tecnico":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-200 rounded-full">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <h4 className="mb-2 font-semibold text-blue-900">
                    Tipo de Línea
                  </h4>
                  <p className="font-medium text-blue-700">
                    {registro.tipo_linea}
                  </p>
                </div>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-200 rounded-full">
                    <Gauge className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="mb-2 font-semibold text-green-900">
                    Longitud
                  </h4>
                  <p className="text-xl font-medium text-green-700">
                    {registro.longitud}m
                  </p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <div className="p-6">
                  <h4 className="flex items-center mb-4 space-x-2 text-lg font-semibold text-gray-900">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>Especificaciones</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Código de Equipo:</span>
                      <span className="px-2 py-1 font-mono font-medium bg-gray-100 rounded">
                        {registro.equipo}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Sistema SEEC:</span>
                      <span className="px-2 py-1 font-mono font-medium bg-gray-100 rounded">
                        {registro.seec}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Tecnología:</span>
                      <Badge variant="primary">{registro.tipo_linea}</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Extensión:</span>
                      <span className="font-medium">
                        {registro.longitud.toLocaleString()} metros
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
                          const installDate =
                            typeof registro.fecha_instalacion === "string"
                              ? new Date(registro.fecha_instalacion)
                              : registro.fecha_instalacion;

                          if (installDate && !isNaN(installDate.getTime())) {
                            return Math.floor(
                              (new Date().getTime() - installDate.getTime()) /
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
                          const vencDate =
                            typeof registro.fecha_caducidad === "string"
                              ? new Date(registro.fecha_caducidad)
                              : registro.fecha_caducidad;

                          if (vencDate && !isNaN(vencDate.getTime())) {
                            const today = new Date();
                            const diffDays = Math.floor(
                              (vencDate.getTime() - today.getTime()) /
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
                            const installDate =
                              typeof registro.fecha_instalacion === "string"
                                ? new Date(registro.fecha_instalacion)
                                : registro.fecha_instalacion;

                            if (!installDate || isNaN(installDate.getTime())) {
                              return (
                                <div className="space-y-3">
                                  <div className="text-red-600">
                                    Fecha de instalación no válida
                                  </div>
                                </div>
                              );
                            }

                            const totalDays = Math.floor(
                              (new Date().getTime() - installDate.getTime()) /
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

            {loadingImage ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Cargando imagen...</p>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <ImageUpload
                  key={`image-upload-${registro.id}`}
                  recordId={registro.id}
                  recordCode={registro.codigo}
                  skipInitialLoad={false}
                  onImageUploaded={handleImageUploaded}
                  onImageDeleted={handleImageDeleted}
                />
              </div>
            )}

            {/* Información adicional sobre imágenes */}
            <Card className="border-blue-200 bg-blue-50">
              <div className="p-6">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      Información sobre imágenes
                    </h4>
                    <p className="text-sm text-blue-700">
                      Detalles técnicos y recomendaciones
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                  <div className="p-3 bg-white border border-blue-200 rounded-lg">
                    <div className="mb-1 font-medium text-blue-900">
                      Formatos admitidos
                    </div>
                    <div className="text-blue-700">JPG, JPEG, PNG</div>
                  </div>
                  <div className="p-3 bg-white border border-blue-200 rounded-lg">
                    <div className="mb-1 font-medium text-blue-900">
                      Tamaño máximo
                    </div>
                    <div className="text-blue-700">10 MB por imagen</div>
                  </div>
                  <div className="p-3 bg-white border border-blue-200 rounded-lg">
                    <div className="mb-1 font-medium text-blue-900">
                      Compresión automática
                    </div>
                    <div className="text-blue-700">
                      Optimización inteligente
                    </div>
                  </div>
                </div>

                {currentImage?.compression_info && (
                  <div className="p-4 mt-4 bg-white border border-blue-200 rounded-lg">
                    <h5 className="mb-2 font-medium text-blue-900">
                      Estadísticas de compresión
                    </h5>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div>
                        Tamaño original:{" "}
                        {imageService.formatFileSize(
                          currentImage.compression_info.original_size
                        )}
                      </div>
                      <div>
                        Tamaño final:{" "}
                        {imageService.formatFileSize(
                          currentImage.compression_info.compressed_size
                        )}
                      </div>
                      <div>
                        Ahorro: {currentImage.compression_info.savings_kb}KB (
                        {currentImage.compression_info.compression_ratio.toFixed(
                          1
                        )}
                        % reducción)
                      </div>
                      <div>
                        Dimensiones:{" "}
                        {currentImage.compression_info.dimensions.width}×
                        {currentImage.compression_info.dimensions.height}px
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
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
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity!.type === "create"
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
                            const installDate =
                              typeof registro.fecha_instalacion === "string"
                                ? new Date(registro.fecha_instalacion)
                                : registro.fecha_instalacion;

                            if (installDate && !isNaN(installDate.getTime())) {
                              return Math.floor(
                                (new Date().getTime() - installDate.getTime()) /
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/registro")}
                icon={ArrowLeft}
                className="border-gray-300 hover:bg-gray-50"
              >
                Volver
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">📊</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Detalle del Registro
                  </h1>
                  <p className="flex items-center space-x-2 text-gray-600">
                    <span>Información completa del registro</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#18D043]/10 text-[#16a34a] font-mono">
                      {registro.codigo}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/historial?registro=${registro.id}`)}
                icon={Activity}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Ver Historial
              </Button>
              <Button
                onClick={() => navigate(`/registro/editar/${registro.id}`)}
                icon={Edit}
                className="bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Editar Registro
              </Button>
            </div>
          </div>
        </div>

        {/* Card principal con información destacada */}
        <Card className="mb-8 overflow-hidden bg-white border-0 shadow-xl">
          <div className="bg-gradient-to-r from-[#18D043] to-[#16a34a] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl">
                  <span className="text-3xl font-bold text-white">
                    {registro.codigo.slice(-2)}
                  </span>
                </div>
                <div>
                  <h2 className="mb-1 text-2xl font-bold">{registro.codigo}</h2>
                  <p className="text-lg text-green-100">{registro.cliente}</p>
                  <p className="text-sm text-green-200">
                    {registro.equipo} • {registro.tipo_linea}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center mb-2 space-x-3">
                  <span className="text-2xl">{estadoConfig.emoji}</span>
                  <Badge
                    variant={estadoConfig.variant}
                    size="md"
                    className="text-white bg-white/20 border-white/30"
                  >
                    {registro.estado_actual}
                  </Badge>
                </div>
                <p className="text-sm text-green-100">
                  Instalado: {formatDate(registro.fecha_instalacion)}
                </p>
                {currentImage && (
                  <p className="mt-1 text-xs text-green-200">
                    📷 Con imagen documentada
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Navegación por tabs */}
        <div className="mb-8">
          <div className="bg-white border-b border-gray-200 rounded-t-lg shadow-sm">
            <nav className="flex px-6 space-x-8">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "border-[#18D043] text-[#16a34a]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <TabIcon size={16} />
                    <span>{tab.label}</span>
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
        <div className="p-8 bg-white border-0 rounded-b-lg shadow-xl">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};