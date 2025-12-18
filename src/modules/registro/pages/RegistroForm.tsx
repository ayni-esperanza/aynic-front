import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  Settings,
  Info,
  Plus,
  Check,
  Camera,
} from "lucide-react";
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { SearchableSelect } from '../../../shared/components/ui/SearchableSelect';
import { useToast } from '../../../shared/components/ui/Toast';
import { useApi } from '../../../shared/hooks/useApi';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import { registroService } from "../services/registroService";
import { ImageUpload } from '../../../shared/components/common/ImageUpload';
import type { DataRecord } from "../types/registro";

// Componente HierarchicalSelect para tipos de línea
const HierarchicalLineTypeSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedOrientation, setSelectedOrientation] = useState<string>("");

  // Opciones de categorías
  const categories = [
    { value: "permanente", label: "Línea de Vida Permanente", icon: "🔒" },
    { value: "temporal", label: "Línea de Vida Temporal", icon: "⏱️" },
  ];

  // Opciones de orientación (depende de la categoría)
  const getOrientations = (category: string) => {
    if (category === "temporal") {
      // Solo horizontal para temporal
      return [{ value: "horizontal", label: "Horizontal", icon: "🔗" }];
    } else {
      // Ambas opciones para permanente
      return [
        { value: "horizontal", label: "Horizontal", icon: "🔗" },
        { value: "vertical", label: "Vertical", icon: "⬆️" },
      ];
    }
  };

  // Efecto para sincronizar con el valor externo sin loops
  React.useEffect(() => {
    if (value && typeof value === "string" && value.includes("_")) {
      const parts = value.split("_");
      if (parts.length === 2) {
        const [category, orientation] = parts;
        setTimeout(() => {
          setSelectedCategory(category);
          setSelectedOrientation(orientation);
        }, 0);
      }
    } else if (!value) {
      setTimeout(() => {
        setSelectedCategory("");
        setSelectedOrientation("");
      }, 0);
    }
  }, [value]);

  // Manejar cambio de categoría sin re-renders
  const handleCategoryClick = React.useCallback(
    (categoryValue: string) => {
      setSelectedCategory(categoryValue);
      setSelectedOrientation(""); // Reset orientation

      // Si es temporal, auto-seleccionar horizontal ya que es la única opción
      if (categoryValue === "temporal") {
        setSelectedOrientation("horizontal");
        const finalValue = `${categoryValue}_horizontal`;
        onChange(finalValue);
      }
    },
    [onChange]
  );

  // Manejar cambio de orientación sin re-renders
  const handleOrientationClick = React.useCallback(
    (orientationValue: string) => {
      setSelectedOrientation(orientationValue);
      if (selectedCategory) {
        const finalValue = `${selectedCategory}_${orientationValue}`;
        onChange(finalValue);
      }
    },
    [selectedCategory, onChange]
  );

  const availableOrientations = getOrientations(selectedCategory);

  return (
    <div className="space-y-3">
      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Tipo de Línea
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Paso 1: Selecciona el tipo de línea de vida
        </p>
      </div>

      {/* Paso 1: Seleccionar categoría */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <div
            key={category.value}
            className={`p-3 border-2 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 ${selectedCategory === category.value
              ? "border-[#18D043] bg-[#18D043]/10 dark:bg-[#18D043]/20 text-[#16a34a] dark:text-[#18D043] shadow-md"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:shadow-sm bg-white dark:bg-gray-800"
              }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCategoryClick(category.value);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{category.icon}</span>
                <div>
                  <p className="text-sm font-medium">{category.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {category.value === "permanente"
                      ? "Instalación fija"
                      : "Instalación temporal"}
                  </p>
                </div>
              </div>
              {selectedCategory === category.value && (
                <div className="w-5 h-5 bg-[#18D043] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">✓</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Paso 2: Seleccionar orientación (solo si hay categoría seleccionada y es permanente) */}
      {selectedCategory === "permanente" && (
        <div className="space-y-3 duration-300 animate-in fade-in">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Paso 2: Selecciona la orientación
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {availableOrientations.map((orientation) => (
              <div
                key={orientation.value}
                className={`p-3 border-2 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 ${selectedOrientation === orientation.value
                  ? "border-[#18D043] bg-[#18D043]/10 dark:bg-[#18D043]/20 text-[#16a34a] dark:text-[#18D043] shadow-md"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:shadow-sm bg-white dark:bg-gray-800"
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOrientationClick(orientation.value);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{orientation.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{orientation.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {orientation.value === "horizontal"
                          ? "Línea paralela al suelo"
                          : "Línea perpendicular al suelo"}
                      </p>
                    </div>
                  </div>
                  {selectedOrientation === orientation.value && (
                    <div className="w-5 h-5 bg-[#18D043] rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional para temporal */}
      {selectedCategory === "temporal" && (
        <div className="p-3 duration-300 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl animate-in fade-in">
          <div className="flex items-center space-x-3">
            <span className="text-xl">ℹ️</span>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Orientación automática: Horizontal
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Las líneas de vida temporales solo están disponibles en
                orientación horizontal
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de selección */}
      {selectedCategory && selectedOrientation && (
        <div className="p-3 border border-[#18D043] bg-[#18D043]/5 dark:bg-[#18D043]/10 rounded-xl animate-in fade-in duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-[#18D043] rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">✓</span>
            </div>
            <div>
              <p className="text-xs font-medium text-[#16a34a] dark:text-[#18D043]">
                Selección completa:
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {categories.find((c) => c.value === selectedCategory)?.icon}{" "}
                Línea de Vida{" "}
                {selectedCategory === "permanente" ? "Permanente" : "Temporal"}{" "}
                -{" "}
                {
                  availableOrientations.find(
                    (o) => o.value === selectedOrientation
                  )?.icon
                }{" "}
                {selectedOrientation === "horizontal"
                  ? "Horizontal"
                  : "Vertical"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="flex items-center space-x-1 text-sm text-red-600">
          <span className="text-red-500">⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

interface RegistroFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const RegistroForm: React.FC<RegistroFormProps> = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const isModal = Boolean(onClose);
  const goBack = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate("/registro");
    }
  }, [navigate, onClose]);

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [clientesList, setClientesList] = useState([
    "Danper",
    "Chimu",
    "Cartavio",
    "Cartavio Rum Company",
    "Casa Grande",
    "Siderperu",
    "UPAO",
    "Universidad Nacional de Trujillo (UNT)",
    "AgroAurora",
    "Nexa Resources",
    "Jardines de la Paz",
    "Camposol",
    "Glucom",
    "AgrOlmos",
    "TRUPAL",
  ]);

  const [formData, setFormData] = useState({
    codigo: "",
    codigo_placa: "",
    cliente: "",
    equipo: "",
    fv_anios: 0,
    fv_meses: 0,
    fecha_instalacion: "",
    longitud: "" as string | number,
    observaciones: "",
    seccion: "",
    area: "",
    planta: "",
    tipo_linea: "",
    ubicacion: "",
    anclaje_equipos: "",
    fecha_caducidad: "",
    estado_actual: "activo" as DataRecord["estado_actual"],
    anclaje_tipo: "", // Nuevo campo para el tipo de anclaje
  });

  // Lógica automática de fecha de caducidad
  useEffect(() => {
    const { fecha_instalacion, fv_anios, fv_meses } = formData;

    if (fecha_instalacion && (Number(fv_anios) > 0 || Number(fv_meses) > 0)) {
      const inst = new Date(fecha_instalacion);
      if (!isNaN(inst.getTime())) {
        try {
          const venc = new Date(inst);
          const anios = Math.floor(Number(fv_anios) || 0);
          const meses = Number(fv_meses) || 0;

          // Validar que los años estén en un rango razonable (0-50)
          if (anios >= 0 && anios <= 50) {
            // Primero agregar años
            venc.setFullYear(venc.getFullYear() + anios);

            // Luego agregar meses
            venc.setMonth(venc.getMonth() + meses);

            // Corregir el día 
            const diaOriginal = inst.getDate();

            // Calcular el mes resultante y último día del mes
            const mesResultante = (inst.getMonth() + meses) % 12;
            const anioResultante = venc.getFullYear();
            const ultimoDiaMes = new Date(anioResultante, mesResultante + 1, 0).getDate();

            // Si el día original no existe en el mes resultante, usar el último día del mes
            if (diaOriginal > ultimoDiaMes) {
              const fechaCorregida = new Date(anioResultante, mesResultante, ultimoDiaMes);
              venc.setTime(fechaCorregida.getTime());
            } else {
              const fechaCorregida = new Date(anioResultante, mesResultante, diaOriginal);
              venc.setTime(fechaCorregida.getTime());
            }

            // Validar que la fecha resultante sea válida
            if (!isNaN(venc.getTime()) && venc.getFullYear() <= 9999) {
              const fechaVenc = venc.toISOString().split("T")[0];

              if (formData.fecha_caducidad !== fechaVenc) {
                setFormData((f) => ({
                  ...f,
                  fecha_caducidad: fechaVenc,
                }));
              }
            }
          }
        } catch (error) {
          console.error('Error calculando fecha de caducidad:', error);
        }
      }
    }
  }, [formData.fecha_instalacion, formData.fv_anios, formData.fv_meses]);

  // Hook para crear registro con función estable
  const createRecordFunction = useCallback(
    (data: any) => registroService.createRecord(data),
    []
  );

  const { execute: createRecord, loading: creating } = useApi(
    createRecordFunction,
    {
      onSuccess: (createdRecord) => {
        setSavedRecordId(createdRecord.id);
        success(
          "Registro creado exitosamente",
          "Ahora puedes agregar una imagen o finalizar"
        );
        onSuccess?.();
      },
      onError: (err) => showError("Error al guardar", err),
    }
  );

  const validateStep = (step: number) => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!formData.codigo.trim()) e.codigo = "Requerido";
      if (formData.codigo_placa && formData.codigo_placa.length > 50) {
        e.codigo_placa = "No puede exceder 50 caracteres";
      }
    }
    if (step === 2) {
      const val = parseFloat(String(formData.longitud));
      if (formData.longitud && (isNaN(val) || val <= 0)) e.longitud = "Mayor a 0";
      if (formData.anclaje_equipos && formData.anclaje_equipos.length > 100) {
        e.anclaje_equipos = "No puede exceder 100 caracteres";
      }
    }
    if (step === 3) {
      if (formData.fecha_instalacion) {
        const fechaInstalacion = new Date(formData.fecha_instalacion);
        const fechaActual = new Date();
        fechaActual.setHours(23, 59, 59, 999); // Fin del día actual

        // Validación más estricta: no puede ser mayor al día actual
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Inicio del día actual

        if (fechaInstalacion > hoy) {
          e.fecha_instalacion = "La fecha de instalación no puede ser futura";
        }
      }

      // Validación corregida para años
      if (formData.fv_anios < 0) e.fv_anios = "No negativo";

      // Validación corregida para meses
      const meses = Number(formData.fv_meses);
      if (formData.fv_meses !== undefined && formData.fv_meses !== null && formData.fv_meses !== '') {
        if (isNaN(meses)) {
          e.fv_meses = "Debe ser un número válido";
        } else if (meses < 0 || meses > 11) {
          e.fv_meses = "Debe estar entre 0 y 11 meses";
        } else if (!Number.isInteger(meses)) {
          e.fv_meses = "Debe ser un número entero";
        }
      }

      const inst = new Date(formData.fecha_instalacion);
      const venc = new Date(formData.fecha_caducidad);
      if (inst >= venc) e.fecha_caducidad = "Debe ser posterior a instalación";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep((c) => c + 1);
  };

  const handlePrev = useCallback(() => {
    setCurrentStep((c) => c - 1);
    setErrors({});
  }, []);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    // Si estamos en el paso 4 y ya se creó el registro, NO hacer nada
    if (currentStep === 4 && savedRecordId) {
      return; // Salir sin hacer nada
    }

    if (!validateStep(currentStep)) return;

    if (currentStep < 4) {
      handleNext();
      return;
    }

    const payload: Omit<DataRecord, "id"> = {
      codigo: formData.codigo,
      codigo_placa: formData.codigo_placa || undefined,
      cliente: formData.cliente,
      equipo: formData.equipo,
      fv_anios: formData.fv_anios,
      fv_meses: formData.fv_meses,
      fecha_instalacion: formData.fecha_instalacion,
      fecha_caducidad: formData.fecha_caducidad,
      longitud: Number(formData.longitud),
      observaciones: formData.observaciones || undefined,
      seccion: formData.seccion,
      area: formData.area,
      planta: formData.planta,
      tipo_linea: formData.tipo_linea,
      ubicacion: formData.ubicacion,
      anclaje_equipos: formData.anclaje_equipos || undefined,
      anclaje_tipo: formData.anclaje_tipo || undefined, // Incluir anclaje_tipo
      estado_actual: formData.estado_actual,
    };

    if (!savedRecordId) {
      await createRecord(payload);
    }
  };

  const handleChange = useCallback(
    (field: string, value: any) => {
      setTimeout(() => {
        if (field === "longitud") {
          const numericValue = value.replace(/[^0-9.]/g, "");
          const parts = numericValue.split(".");
          const sanitizedValue =
            parts.length > 2
              ? parts[0] + "." + parts.slice(1).join("")
              : numericValue;

          setFormData((p) => ({ ...p, [field]: sanitizedValue }));
        } else if (field === "fv_anios") {
          // Asegurar que siempre sea un entero
          const intValue = Math.floor(Number(value) || 0);
          setFormData((p) => ({ ...p, [field]: intValue }));
        } else if (field === "fv_meses") {
          // Asegurar que siempre sea un entero entre 0 y 11
          const intValue = Math.floor(Number(value) || 0);
          const clampedValue = Math.max(0, Math.min(11, intValue));
          setFormData((p) => ({ ...p, [field]: clampedValue }));
        } else if (field === "tipo_linea") {
          // Reset anclaje_tipo cuando cambia tipo_linea
          setFormData((p) => ({ ...p, [field]: value, anclaje_tipo: "" }));
        } else {
          setFormData((p) => ({ ...p, [field]: value }));
        }

        if (errors[field]) {
          setErrors((p) => ({ ...p, [field]: "" }));
        }
      }, 0);
    },
    [errors]
  );

  // Manejar agregar nuevo cliente
  const handleAddNewClient = () => {
    if (newClientName.trim()) {
      const trimmedName = newClientName.trim();
      if (!clientesList.includes(trimmedName)) {
        setClientesList((prev) => [...prev, trimmedName]);
        setFormData((prev) => ({ ...prev, cliente: trimmedName }));
      } else {
        setFormData((prev) => ({ ...prev, cliente: trimmedName }));
      }
      setNewClientName("");
      setShowNewClientForm(false);
    }
  };

  const handleCancelNewClient = () => {
    setNewClientName("");
    setShowNewClientForm(false);
  };

  const newClientModalRef = useModalClose({
    isOpen: showNewClientForm,
    onClose: handleCancelNewClient,
  });

  const handleImageUploaded = useCallback(
    () => {
      setHasImage(true);
      success("Imagen agregada exitosamente");
    },
    [success]
  );

  const handleImageDeleted = useCallback(() => {
    setHasImage(false);
    success("Imagen eliminada");
  }, [success]);

  const handleFinishWithoutImage = useCallback(() => {
    goBack();
  }, [goBack]);

  const steps = [
    {
      number: 1,
      title: "Información Básica",
      description: "Datos generales",
      icon: Info,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      number: 2,
      title: "Especificaciones Técnicas",
      description: "Detalles técnicos",
      icon: Settings,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      number: 3,
      title: "Fechas y Estado",
      description: "Información temporal",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      number: 4,
      title: "Imagen del Registro",
      description: "Fotografía",
      icon: Camera,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const outerContainerClass = isModal
    ? "w-full h-full flex-1 flex flex-col min-h-0"
    : "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100";

  const contentWrapperClass = isModal
    ? "w-full h-full flex flex-col min-h-0 px-3 py-3 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
    : "max-w-4xl px-4 py-6 mx-auto sm:px-6 lg:px-8";
  
  const formScrollClass = isModal ? "flex-1 min-h-0 overflow-y-auto px-0.5" : "";

  const headerWrapperClass = isModal ? "mb-1" : "mb-8";
  const headerFlexClass = isModal
    ? "flex items-center mb-1 space-x-2"
    : "flex items-center mb-6 space-x-4";
  const headerIconClass = isModal
    ? "w-9 h-9"
    : "w-12 h-12";
  const headerTitleClass = isModal
    ? "text-xl font-bold text-gray-900"
    : "text-3xl font-bold text-gray-900";
  const headerSubtitleClass = isModal ? "text-xs text-gray-600" : "text-gray-600";

  const progressWrapperClass = isModal
    ? "flex items-center justify-center gap-1.5 mb-2"
    : "flex items-center justify-between mb-8";
  const stepCircleSizeClass = isModal ? "w-9 h-9" : "w-12 h-12";
  const stepConnectorMarginClass = isModal ? "flex-1 mx-3" : "flex-1 mx-6";
  const stepIconSize = isModal ? 16 : 20;

  const formPaddingClass = isModal ? "p-3 flex flex-col flex-1 min-h-0 overflow-hidden" : "p-8";
  const formIntroSpacingClass = isModal ? "mb-1.5" : "mb-6";
  const sectionSpacingClass = isModal ? "space-y-3" : "space-y-6";
  const gridGapClass = isModal ? "gap-3" : "gap-6";
  const inputHeightClass = isModal ? "!py-1.25 !text-[13px]" : "";
  const labelSizeClass = isModal ? "!text-[11px]" : "";
  const buttonSizeClass = isModal ? "sm" : "md";
  const footerSpacingClass = isModal ? "pt-2 mt-2" : "pt-8 mt-8";
  const clienteLabelClass = isModal ? "text-[11px]" : "text-sm";

  return (
    <div className={outerContainerClass}>
      <div className={contentWrapperClass}>
        {!isModal && (
          <>
            {/* Header */}
            <div className={headerWrapperClass}>
              <div className={headerFlexClass}>
                <div className="flex items-center space-x-4">
                  <div
                    className={`${headerIconClass} bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-lg text-white">➕</span>
                  </div>
                  <div>
                    <h1 className={headerTitleClass}>Nuevo Registro</h1>
                    <p className={headerSubtitleClass}>Completa el formulario paso a paso</p>
                  </div>
                </div>
              </div>

          {/* Progress */}
          <div className={progressWrapperClass}>
            {steps.map((step, idx) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const Icon = step.icon;
              return (
                <div key={step.number} className={isModal ? "flex items-center" : "flex items-center flex-1"}>
                  <div className="flex items-center">
                    <div
                      className={`${stepCircleSizeClass} rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                        ? "bg-[#18D043] text-white border-[#18D043]"
                        : isActive
                          ? `${step.bgColor} ${step.color} border-current`
                          : "bg-gray-100 border-gray-300 text-gray-400"
                        }`}
                    >
                      {isCompleted ? "✓" : <Icon size={stepIconSize} />}
                    </div>
                    {!isModal && (
                      <div className="ml-4">
                        <p
                          className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-500"
                            }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {step.description}
                        </p>
                      </div>
                    )}
                  </div>
                  {!isModal && idx < steps.length - 1 && (
                    <div className={stepConnectorMarginClass}>
                      <div
                        className={`h-0.5 transition-all ${isCompleted ? "bg-[#18D043]" : "bg-gray-300"
                          }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
          </>
        )}

        <Card
          unstyled={isModal}
          padding={isModal ? "none" : "md"}
          className={isModal ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "border-0 shadow-xl"}
        >
          <form onSubmit={handleSubmit} className={formPaddingClass}>
            {isModal && (
              <div className="mb-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h1 className="text-base font-semibold text-gray-900 dark:text-white">Nuevo Registro</h1>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Completa el formulario paso a paso</p>
                  </div>
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="relative">
                  <div className="flex items-start justify-between gap-1 mb-2">
                    {steps.map((step, idx) => {
                      const isActive = currentStep === step.number;
                      const isCompleted = currentStep > step.number;
                      const Icon = step.icon;
                      return (
                        <div key={step.number} className="flex flex-col items-center flex-1 relative">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all mb-1 relative z-10 ${
                              isCompleted
                                ? "bg-[#18D043] text-white border-[#18D043]"
                                : isActive
                                ? `${step.bgColor} ${step.color} border-current bg-white dark:bg-gray-800`
                                : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {isCompleted ? "✓" : <Icon size={14} />}
                          </div>
                          {idx < steps.length - 1 && (
                            <div className="absolute top-4 left-1/2 w-full h-0.5 -z-0">
                              <div className={`h-full ${isCompleted ? "bg-[#18D043]" : "bg-gray-300 dark:bg-gray-600"}`} />
                            </div>
                          )}
                          <p className={`text-[10px] font-medium text-center leading-tight ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                            {step.title}
                          </p>
                          <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center mt-0.5 leading-tight">
                            {step.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {!isModal && (
              <>
                <h3 className="mb-1 text-xl font-semibold text-gray-900">
                  {steps[currentStep - 1].title}
                </h3>
                <p className={`${formIntroSpacingClass} text-gray-600`}>
                  {steps[currentStep - 1].description}
                </p>
              </>
            )}

            {/* ------- PASOS ------- */}
            <div className={formScrollClass}>
            {currentStep === 1 && (
              <div className={sectionSpacingClass}>
                <div className={`grid ${gridGapClass} md:grid-cols-2`}>
                  <Input
                    label="Código del Registro"
                    value={formData.codigo}
                    onChange={(e) => handleChange("codigo", e.target.value)}
                    error={errors.codigo}
                    placeholder="COD-0001"
                    required
                    className={inputHeightClass}
                  />
                  <Input
                    label="Código de Placa"
                    value={formData.codigo_placa}
                    onChange={(e) => handleChange("codigo_placa", e.target.value)}
                    error={errors.codigo_placa}
                    placeholder="PLC-001-A"
                    className={inputHeightClass}
                  />

                  {/* Cliente con SearchableSelect y funcionalidad de agregar */}
                  <div>
                    <label className={`block mb-2 font-semibold text-gray-700 dark:text-gray-300 ${clienteLabelClass}`}>
                      Cliente
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <SearchableSelect
                          options={clientesList}
                          value={formData.cliente}
                          onChange={(value) => handleChange("cliente", value)}
                          placeholder="Buscar cliente..."
                          error={errors.cliente}
                          required={false}
                          size={isModal ? "compact" : "default"}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewClientForm(true)}
                        className={`${isModal ? "h-9 w-9" : "h-10 w-10"} !p-0 !gap-0 border-[#18D043] text-[#18D043] hover:bg-[#18D043] hover:text-white flex-shrink-0`}
                        icon={Plus}
                        title="Agregar nuevo cliente"
                      >
                        <span className="sr-only">Agregar cliente</span>
                      </Button>
                    </div>
                  </div>

                  <Input
                    label="Equipo"
                    value={formData.equipo}
                    onChange={(e) => handleChange("equipo", e.target.value)}
                    error={errors.equipo}
                    placeholder="Equipo-A1"
                    className={inputHeightClass}
                  />
                  <Input
                    label="Sección"
                    value={formData.seccion}
                    onChange={(e) => handleChange("seccion", e.target.value)}
                    error={errors.seccion}
                    placeholder="Sección A"
                    className={inputHeightClass}
                  />
                  <Input
                    label="Área"
                    value={formData.area}
                    onChange={(e) => handleChange("area", e.target.value)}
                    error={errors.area}
                    placeholder="Área 1"
                    className={inputHeightClass}
                  />
                  <Input
                    label="Planta"
                    value={formData.planta}
                    onChange={(e) => handleChange("planta", e.target.value)}
                    error={errors.planta}
                    placeholder="Planta 1"
                    className={inputHeightClass}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className={sectionSpacingClass}>
                <div className={`grid ${gridGapClass} md:grid-cols-1`}>
                  <HierarchicalLineTypeSelect
                    value={formData.tipo_linea}
                    onChange={(value) => handleChange("tipo_linea", value)}
                    error={errors.tipo_linea}
                  />
                </div>

                {/* Opciones de anclaje basadas en tipo_linea */}
                {formData.tipo_linea && (
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tipo de Anclaje
                    </label>
                    
                    {/* Opciones para Línea de Vida Horizontal */}
                    {(formData.tipo_linea === "permanente_horizontal" || formData.tipo_linea === "temporal_horizontal") && (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {[
                          { value: "anclaje_terminal", label: "Anclaje Terminal", icon: "🔗" },
                          { value: "anclaje_intermedio", label: "Anclaje Intermedio", icon: "🔗" },
                          { value: "anclaje_intermedio_basculante", label: "Anclaje Intermedio Basculante", icon: "🔗" },
                          { value: "absorbedor_impacto", label: "Absorbedor Impacto", icon: "🛡️" }
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-2.5 border-2 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 ${
                              formData.anclaje_tipo === option.value
                                ? "border-[#18D043] bg-[#18D043]/10 dark:bg-[#18D043]/20 text-[#16a34a] dark:text-[#18D043] shadow-md"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:shadow-sm bg-white dark:bg-gray-800"
                            }`}
                            onClick={() => handleChange("anclaje_tipo", option.value)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{option.icon}</span>
                                <div>
                                  <p className="text-sm font-medium">{option.label}</p>
                                </div>
                              </div>
                              {formData.anclaje_tipo === option.value && (
                                <div className="w-5 h-5 bg-[#18D043] rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">✓</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Opciones para Línea de Vida Vertical */}
                    {formData.tipo_linea === "permanente_vertical" && (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {[
                          { value: "anclaje_superior", label: "Anclaje Superior", icon: "⬆️" },
                          { value: "anclaje_inferior", label: "Anclaje Inferior", icon: "⬇️" },
                          { value: "anclaje_impacto", label: "Anclaje Impacto", icon: "🛡️" }
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`p-2.5 border-2 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 ${
                              formData.anclaje_tipo === option.value
                                ? "border-[#18D043] bg-[#18D043]/10 dark:bg-[#18D043]/20 text-[#16a34a] dark:text-[#18D043] shadow-md"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:shadow-sm bg-white dark:bg-gray-800"
                            }`}
                            onClick={() => handleChange("anclaje_tipo", option.value)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{option.icon}</span>
                                <div>
                                  <p className="text-sm font-medium">{option.label}</p>
                                </div>
                              </div>
                              {formData.anclaje_tipo === option.value && (
                                <div className="w-5 h-5 bg-[#18D043] rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">✓</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mensaje de error si no se ha seleccionado anclaje */}
                    {errors.anclaje_tipo && (
                      <p className="flex items-center space-x-1 text-sm text-red-600">
                        <span className="text-red-500">⚠️</span>
                        <span>{errors.anclaje_tipo}</span>
                      </p>
                    )}
                  </div>
                )}

                <div className={`grid ${gridGapClass} md:grid-cols-2`}>
                  <Input
                    label="Longitud (m)"
                    type="text"
                    value={formData.longitud}
                    onChange={(e) => handleChange("longitud", e.target.value)}
                    error={errors.longitud}
                    placeholder="100.50"
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*"
                    className={inputHeightClass}
                  />
                  <Input
                    label="Ubicación"
                    value={formData.ubicacion}
                    onChange={(e) => handleChange("ubicacion", e.target.value)}
                    error={errors.ubicacion}
                    placeholder="Dirección o coordenadas"
                    className={inputHeightClass}
                  />
                </div>

                <div className={`grid ${gridGapClass} md:grid-cols-1`}>
                  <Input
                    label="Anclaje de equipos"
                    value={formData.anclaje_equipos}
                    onChange={(e) =>
                      handleChange("anclaje_equipos", e.target.value)
                    }
                    error={errors.anclaje_equipos}
                    placeholder="Tipo/estado del anclaje (ej. 'I M12 química', 'Puntos fijos 2xD-Ring')"
                    maxLength={100}
                    className={inputHeightClass}
                  />
                  <p className="-mt-4 text-xs text-gray-500">
                    Máx. 100 caracteres. Dejar vacío si no corresponde — se
                    mostrará “No registrado”.
                  </p>
                </div>

                <div>
                  <label className={`block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ${labelSizeClass}`}>
                    Observaciones{" "}
                    <span className="text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    rows={isModal ? 2 : 4}
                    value={formData.observaciones}
                    onChange={(e) =>
                      handleChange("observaciones", e.target.value)
                    }
                    className={`w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-200 font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#18D043]/20 dark:focus:ring-[#18D043]/30 focus:border-[#18D043] resize-none hover:border-gray-300 dark:hover:border-gray-600 ${inputHeightClass}`}
                    placeholder="Notas adicionales sobre el registro..."
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className={sectionSpacingClass}>
                <div className={`grid ${gridGapClass} md:grid-cols-2`}>
                  <Input
                    label="Fecha de Instalación"
                    type="date"
                    value={formData.fecha_instalacion}
                    onChange={(e) =>
                      handleChange("fecha_instalacion", e.target.value)
                    }
                    error={errors.fecha_instalacion}
                    max={(() => {
                      const hoy = new Date();
                      hoy.setDate(hoy.getDate() - 1); // Ayer como máximo
                      return hoy.toISOString().split('T')[0];
                    })()}
                    icon={Calendar}
                    iconPosition="right"
                    className={inputHeightClass}
                  />
                  <Input
                    label="Fecha de Caducidad"
                    type="date"
                    value={formData.fecha_caducidad}
                    onChange={(e) => handleChange("fecha_caducidad", e.target.value)}
                    error={errors.fecha_caducidad}
                    icon={Calendar}
                    iconPosition="right"
                    className={inputHeightClass}
                  />
                </div>
                <div className={`grid ${gridGapClass} md:grid-cols-3`}>
                  <Input
                    label="Vida útil años"
                    type="number"
                    value={formData.fv_anios}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Permitir números enteros, bloquear punto decimal
                      if (value === '' || /^\d+$/.test(value)) {
                        const intValue = Math.floor(Number(value) || 0);
                        handleChange("fv_anios", intValue);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Bloquear teclas que no sean números, backspace, delete, arrow keys
                      if (!/[\d\b\Delete\ArrowLeft\ArrowRight\ArrowUp\ArrowDown\Tab]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    error={errors.fv_anios}
                    min={0}
                    max={50}
                    step={1}
                    className={inputHeightClass}
                  />
                  <Input
                    label="Vida útil meses"
                    type="number"
                    value={formData.fv_meses}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir números enteros entre 0 y 11
                      if (value === '' || /^\d{1,2}$/.test(value)) {
                        const numValue = Number(value) || 0;
                        if (numValue >= 0 && numValue <= 11) {
                          handleChange("fv_meses", numValue);
                        }
                      }
                    }}
                    error={errors.fv_meses}
                    min={0}
                    max={11}
                    maxLength={2}
                    className={inputHeightClass}
                  />
                  <Select
                    label="Estado"
                    value={formData.estado_actual}
                    onChange={(e) =>
                      handleChange("estado_actual", e.target.value)
                    }
                    options={[
                      { value: "activo", label: "🟢 Activo" },
                      { value: "por_vencer", label: "🟡 Por Vencer" },
                      { value: "vencido", label: "🔴 Vencido" },
                      { value: "inactivo", label: "⚪ Inactivo" },
                      { value: "mantenimiento", label: "🔧 Mantenimiento" },
                    ]}
                    className={inputHeightClass}
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className={sectionSpacingClass}>
                {savedRecordId && (
                  <div className="mb-6 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
                      <Camera className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      Imagen del Registro
                    </h3>
                    <p className="max-w-lg mx-auto text-gray-600">
                      Agrega una fotografía del equipo o instalación para
                      completar el registro. Esta imagen será comprimida
                      automáticamente para optimizar el almacenamiento.
                    </p>
                  </div>
                )}

                {savedRecordId ? (
                  <div onSubmit={(e) => e.preventDefault()}>
                    <ImageUpload
                      recordId={savedRecordId}
                      recordCode={formData.codigo}
                      onImageUploaded={handleImageUploaded}
                      onImageDeleted={handleImageDeleted}
                      className="max-w-2xl mx-auto"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
                      <Info className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-yellow-900 dark:text-yellow-100">
                      Primero guarda el registro
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Para agregar una imagen, primero debes completar y guardar
                      la información básica del registro.
                    </p>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* ------- BOTONES ------- */}
            <div className={`flex justify-between border-t border-gray-200 dark:border-gray-700 ${footerSpacingClass} ${isModal ? 'flex-shrink-0' : ''}`}>
              <div>
                {/* Solo mostrar "Anterior" si no estamos en el paso 4 con imagen subida */}
                {currentStep > 1 && !(currentStep === 4 && hasImage) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    icon={ArrowLeft}
                    disabled={creating}
                    size={buttonSizeClass as "sm" | "md" | "lg"}
                  >
                    Anterior
                  </Button>
                )}
              </div>

              <div className="flex space-x-3">
                {/* Solo mostrar "Cancelar" si no estamos en el paso 4 con imagen subida */}
                {!(currentStep === 4 && hasImage) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    icon={X}
                    disabled={creating}
                    size={buttonSizeClass as "sm" | "md" | "lg"}
                  >
                    Cancelar
                  </Button>
                )}

                {currentStep === 4 ? (
                  <div className="flex space-x-3">
                    {/* Para nuevos registros sin guardar */}
                    {!savedRecordId && (
                      <Button
                        type="submit"
                        icon={Save}
                        loading={creating}
                        className="bg-gradient-to-r from-[#18D043] to-[#16a34a]"
                        size={buttonSizeClass as "sm" | "md" | "lg"}
                      >
                        {creating ? "Creando..." : "Crear Registro"}
                      </Button>
                    )}

                    {/* Para registros ya creados */}
                    {savedRecordId && (
                      <Button
                        type="button"
                        onClick={handleFinishWithoutImage}
                        className="bg-gradient-to-r from-[#18D043] to-[#16a34a]"
                        size={buttonSizeClass as "sm" | "md" | "lg"}
                      >
                        Finalizar
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      if (validateStep(currentStep)) handleNext();
                    }}
                    disabled={creating}
                    className="bg-gradient-to-r from-[#18D043] to-[#16a34a]"
                    size={buttonSizeClass as "sm" | "md" | "lg"}
                  >
                    Siguiente
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      </div>

      {/* Modal para agregar nuevo cliente */}
      {showNewClientForm && (
        <div
          ref={newClientModalRef}
          className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          style={{ margin: 0, padding: '1rem' }}
        >
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancelNewClient}
              className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
            
            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Agregar Nuevo Cliente
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Nombre del Cliente"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Ingrese el nombre del cliente"
                required
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNewClient();
                  }
                }}
              />
              
              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelNewClient}
                  icon={X}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleAddNewClient}
                  disabled={!newClientName.trim()}
                  className="bg-gradient-to-r from-[#18D043] to-[#16a34a]"
                  icon={Check}
                >
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
