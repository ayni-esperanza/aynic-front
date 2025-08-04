import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  MapPin,
  Settings,
  Info,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { SearchableSelect } from "../../../components/ui/SearchableSelect";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useToast } from "../../../components/ui/Toast";
import { useApi } from "../../../hooks/useApi";
import { recordsService } from "../../../services/recordsService";
import type { DataRecord } from "../../../types";

export const RegistroForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { success, error: showError } = useToast();

  const isEditing = Boolean(id);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
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
    cliente: "",
    equipo: "",
    fv_anios: 0,
    fv_meses: 0,
    fecha_instalacion: "",
    longitud: "" as string | number,
    observaciones: "",
    seec: "",
    tipo_linea: "",
    ubicacion: "",
    fecha_vencimiento: "",
    estado_actual: "activo" as DataRecord["estado_actual"],
  });

  // Opciones para el tipo de línea con estructura jerárquica
  const tipoLineaOptions = [
    {
      value: "permanente_horizontal",
      label: "🔗 Línea de Vida Permanente - Horizontal",
      category: "permanente",
      orientation: "horizontal",
    },
    {
      value: "permanente_vertical",
      label: "⬆️ Línea de Vida Permanente - Vertical",
      category: "permanente",
      orientation: "vertical",
    },
    {
      value: "temporal_horizontal",
      label: "🔗 Línea de Vida Temporal - Horizontal",
      category: "temporal",
      orientation: "horizontal",
    },
    {
      value: "temporal_vertical",
      label: "⬆️ Línea de Vida Temporal - Vertical",
      category: "temporal",
      orientation: "vertical",
    },
  ];

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

    // Efecto para sincronizar con el valor externo
    React.useEffect(() => {
      if (value && typeof value === "string" && value.includes("_")) {
        const parts = value.split("_");
        if (parts.length === 2) {
          setSelectedCategory(parts[0]);
          setSelectedOrientation(parts[1]);
        }
      } else {
        // Si el valor no tiene el formato esperado, limpiar
        if (!value) {
          setSelectedCategory("");
          setSelectedOrientation("");
        }
      }
    }, [value]);

    // Manejar cambio de categoría
    const handleCategoryClick = (categoryValue: string) => {
      setSelectedCategory(categoryValue);
      setSelectedOrientation(""); // Reset orientation

      // Si es temporal, auto-seleccionar horizontal ya que es la única opción
      if (categoryValue === "temporal") {
        setSelectedOrientation("horizontal");
        const finalValue = `${categoryValue}_horizontal`;
        onChange(finalValue);
      }
      // Para permanente, esperar a que el usuario seleccione
    };

    // Manejar cambio de orientación
    const handleOrientationClick = (orientationValue: string) => {
      setSelectedOrientation(orientationValue);
      if (selectedCategory) {
        const finalValue = `${selectedCategory}_${orientationValue}`;
        onChange(finalValue);
      }
    };

    const availableOrientations = getOrientations(selectedCategory);

    return (
      <div className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Tipo de Línea
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
          <p className="mb-4 text-sm text-gray-600">
            Paso 1: Selecciona el tipo de línea de vida
          </p>
        </div>

        {/* Paso 1: Seleccionar categoría */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.value}
              className={`p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 ${
                selectedCategory === category.value
                  ? "border-[#18D043] bg-[#18D043]/10 text-[#16a34a] shadow-md"
                  : "border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-sm"
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCategoryClick(category.value);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <p className="font-medium">{category.label}</p>
                    <p className="text-xs text-gray-500">
                      {category.value === "permanente"
                        ? "Instalación fija"
                        : "Instalación temporal"}
                    </p>
                  </div>
                </div>
                {selectedCategory === category.value && (
                  <div className="w-6 h-6 bg-[#18D043] rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">✓</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Paso 2: Seleccionar orientación (solo si hay categoría seleccionada y es permanente) */}
        {selectedCategory === "permanente" && (
          <div className="space-y-4 duration-300 animate-in fade-in">
            <p className="text-sm text-gray-600">
              Paso 2: Selecciona la orientación
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {availableOrientations.map((orientation) => (
                <div
                  key={orientation.value}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 ${
                    selectedOrientation === orientation.value
                      ? "border-[#18D043] bg-[#18D043]/10 text-[#16a34a] shadow-md"
                      : "border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-sm"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOrientationClick(orientation.value);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{orientation.icon}</span>
                      <div>
                        <p className="font-medium">{orientation.label}</p>
                        <p className="text-xs text-gray-500">
                          {orientation.value === "horizontal"
                            ? "Línea paralela al suelo"
                            : "Línea perpendicular al suelo"}
                        </p>
                      </div>
                    </div>
                    {selectedOrientation === orientation.value && (
                      <div className="w-6 h-6 bg-[#18D043] rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">✓</span>
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
          <div className="p-4 duration-300 border border-blue-200 bg-blue-50 rounded-xl animate-in fade-in">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Orientación automática: Horizontal
                </p>
                <p className="text-xs text-blue-600">
                  Las líneas de vida temporales solo están disponibles en
                  orientación horizontal
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resumen de selección */}
        {selectedCategory && selectedOrientation && (
          <div className="p-4 border border-[#18D043] bg-[#18D043]/5 rounded-xl animate-in fade-in duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#18D043] rounded-full flex items-center justify-center">
                <span className="font-bold text-white">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#16a34a]">
                  Selección completa:
                </p>
                <p className="text-sm text-gray-700">
                  {categories.find((c) => c.value === selectedCategory)?.icon}{" "}
                  Línea de Vida{" "}
                  {selectedCategory === "permanente"
                    ? "Permanente"
                    : "Temporal"}{" "}
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

  const {
    data: registro,
    loading: loadingRegistro,
    execute: loadRegistro,
  } = useApi(recordsService.getRecordById.bind(recordsService), {
    onSuccess: (data) => {
      const formatDateForInput = (d: Date | string | null) => {
        if (!d) return "";
        const date = d instanceof Date ? d : new Date(d);
        return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
      };

      setFormData({
        codigo: data.codigo,
        cliente: data.cliente,
        equipo: data.equipo,
        fv_anios: data.fv_anios,
        fv_meses: data.fv_meses,
        fecha_instalacion: formatDateForInput(data.fecha_instalacion),
        longitud: data.longitud,
        observaciones: data.observaciones || "",
        seec: data.seec,
        tipo_linea: data.tipo_linea,
        ubicacion: data.ubicacion,
        fecha_vencimiento: formatDateForInput(data.fecha_vencimiento),
        estado_actual: data.estado_actual,
      });
    },
    onError: (err) => {
      showError("Error al cargar registro", err);
      navigate("/registro");
    },
  });

  const { execute: createRecord, loading: creating } = useApi(
    recordsService.createRecord.bind(recordsService),
    {
      onSuccess: () => {
        success(isEditing ? "Registro actualizado" : "Registro creado");
        navigate("/registro");
      },
      onError: (err) => showError("Error al guardar", err),
    }
  );

  const { execute: updateRecord, loading: updating } = useApi(
    recordsService.updateRecord.bind(recordsService),
    {
      onSuccess: () => {
        success("Registro actualizado");
        navigate("/registro");
      },
      onError: (err) => showError("Error al actualizar", err),
    }
  );

  /* -------------------------------------------------
     Efectos
  ------------------------------------------------- */
  useEffect(() => {
    if (isEditing && id) loadRegistro(id);
  }, [isEditing, id]);

  /* -------------------------------------------------
     Validaciones por paso
  ------------------------------------------------- */
  const validateStep = (step: number) => {
    const e: Record<string, string> = {};

    if (step === 1) {
      if (!formData.codigo.trim()) e.codigo = "Requerido";
      if (!formData.cliente.trim()) e.cliente = "Requerido";
      if (!formData.equipo.trim()) e.equipo = "Requerido";
      if (!formData.seec.trim()) e.seec = "Requerido";
    }
    if (step === 2) {
      if (!formData.tipo_linea) e.tipo_linea = "Requerido";
      if (!formData.ubicacion.trim()) e.ubicacion = "Requerido";
      const val = parseFloat(String(formData.longitud));
      if (isNaN(val) || val <= 0) e.longitud = "Mayor a 0";
    }
    if (step === 3) {
      if (!formData.fecha_instalacion) e.fecha_instalacion = "Requerido";
      if (!formData.fecha_vencimiento) e.fecha_vencimiento = "Requerido";
      if (formData.fv_anios < 0) e.fv_anios = "No negativo";
      if (formData.fv_meses < 0 || formData.fv_meses > 11) e.fv_meses = "0-11";

      const inst = new Date(formData.fecha_instalacion);
      const venc = new Date(formData.fecha_vencimiento);
      if (inst >= venc)
        e.fecha_vencimiento = "Debe ser posterior a instalación";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* -------------------------------------------------
     Handlers
  ------------------------------------------------- */
  const handleNext = () =>
    validateStep(currentStep) && setCurrentStep((c) => c + 1);
  const handlePrev = () => {
    setCurrentStep((c) => c - 1);
    setErrors({});
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateStep(currentStep)) return;

    const payload: Omit<DataRecord, "id"> = {
      codigo: formData.codigo,
      cliente: formData.cliente,
      equipo: formData.equipo,
      fv_anios: formData.fv_anios,
      fv_meses: formData.fv_meses,
      fecha_instalacion: formData.fecha_instalacion, // string YYYY-MM-DD
      fecha_vencimiento: formData.fecha_vencimiento, // string YYYY-MM-DD
      longitud: Number(formData.longitud),
      observaciones: formData.observaciones || undefined,
      seec: formData.seec,
      tipo_linea: formData.tipo_linea,
      ubicacion: formData.ubicacion,
      estado_actual: formData.estado_actual,
    };

    if (isEditing && id) await updateRecord(id, payload);
    else await createRecord(payload);
  };

  const handleChange = (field: string, value: any) => {
    if (field === "longitud") {
      // Solo permitir números, punto decimal y cadena vacía
      const numericValue = value.replace(/[^0-9.]/g, "");

      // Prevenir múltiples puntos decimales
      const parts = numericValue.split(".");
      const sanitizedValue =
        parts.length > 2
          ? parts[0] + "." + parts.slice(1).join("")
          : numericValue;

      setFormData((p) => ({ ...p, [field]: sanitizedValue }));
    } else {
      setFormData((p) => ({ ...p, [field]: value }));
    }
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  // Manejar agregar nuevo cliente
  const handleAddNewClient = () => {
    if (newClientName.trim()) {
      const trimmedName = newClientName.trim();
      if (!clientesList.includes(trimmedName)) {
        setClientesList((prev) => [...prev, trimmedName]);
        setFormData((prev) => ({ ...prev, cliente: trimmedName }));
      } else {
        // Si ya existe, simplemente seleccionarlo
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

  /* -------------------------------------------------
     UI helpers
  ------------------------------------------------- */
  const steps = [
    {
      number: 1,
      title: "Información Básica",
      description: "Datos principales del registro",
      icon: Info,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      number: 2,
      title: "Especificaciones Técnicas",
      description: "Tipo de línea y ubicación",
      icon: Settings,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      number: 3,
      title: "Fechas y Estado",
      description: "Instalación y vida útil",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  const isSubmitting = creating || updating;

  /* -------------------------------------------------
     Render
  ------------------------------------------------- */
  if (isEditing && loadingRegistro) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Cargando registro...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6 space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/registro")}
              icon={ArrowLeft}
              disabled={isSubmitting}
            >
              Volver
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl text-white">
                  {isEditing ? "✏️" : "➕"}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditing ? "Editar Registro" : "Nuevo Registro"}
                </h1>
                <p className="text-gray-600">
                  {isEditing
                    ? "Modifica los datos del registro"
                    : "Completa el formulario paso a paso"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, idx) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? "bg-[#18D043] text-white border-[#18D043]"
                          : isActive
                          ? `${step.bgColor} ${step.color} border-current`
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? "✓" : <Icon size={20} />}
                    </div>
                    <div className="ml-4">
                      <p
                        className={`text-sm font-medium ${
                          isActive ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex-1 mx-6">
                      <div
                        className={`h-0.5 transition-all ${
                          isCompleted ? "bg-[#18D043]" : "bg-gray-300"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="bg-white border-0 shadow-xl">
          <form onSubmit={handleSubmit} className="p-8">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h3>
            <p className="mb-6 text-gray-600">
              {steps[currentStep - 1].description}
            </p>

            {/* ------- PASOS ------- */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Código del Registro"
                    value={formData.codigo}
                    onChange={(e) => handleChange("codigo", e.target.value)}
                    error={errors.codigo}
                    placeholder="COD-0001"
                    required
                  />

                  {/* Cliente con SearchableSelect y funcionalidad de agregar */}
                  <div>
                    {showNewClientForm ? (
                      <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                          Nuevo Cliente
                          <span className="ml-1 text-red-500">*</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            placeholder="Nombre del nuevo cliente"
                            className="flex-1"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddNewClient();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddNewClient}
                            disabled={!newClientName.trim()}
                            className="px-3"
                            icon={Check}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelNewClient}
                            className="px-3"
                            icon={X}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2">
                        <div className="flex-1">
                          <SearchableSelect
                            options={clientesList}
                            value={formData.cliente}
                            onChange={(value) => handleChange("cliente", value)}
                            placeholder="Buscar cliente..."
                            label="Cliente"
                            error={errors.cliente}
                            required
                          />
                        </div>
                        <div className="pt-8">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowNewClientForm(true)}
                            className="px-3 border-[#18D043] text-[#18D043] hover:bg-[#18D043] hover:text-white"
                            icon={Plus}
                            title="Agregar nuevo cliente"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Input
                    label="Equipo"
                    value={formData.equipo}
                    onChange={(e) => handleChange("equipo", e.target.value)}
                    error={errors.equipo}
                    placeholder="Equipo-A1"
                    required
                  />
                  <Input
                    label="SEEC"
                    value={formData.seec}
                    onChange={(e) => handleChange("seec", e.target.value)}
                    error={errors.seec}
                    placeholder="SEEC-001"
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-1">
                  <HierarchicalLineTypeSelect
                    value={formData.tipo_linea}
                    onChange={(value) => handleChange("tipo_linea", value)}
                    error={errors.tipo_linea}
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Longitud (m)"
                    type="text"
                    value={formData.longitud}
                    onChange={(e) => handleChange("longitud", e.target.value)}
                    error={errors.longitud}
                    placeholder="100.50"
                    required
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*"
                  />
                  <Input
                    label="Ubicación"
                    value={formData.ubicacion}
                    onChange={(e) => handleChange("ubicacion", e.target.value)}
                    error={errors.ubicacion}
                    placeholder="Dirección o coordenadas"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Observaciones{" "}
                    <span className="text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.observaciones}
                    onChange={(e) =>
                      handleChange("observaciones", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#18D043]/20 focus:border-[#18D043] resize-none hover:border-gray-300"
                    placeholder="Notas adicionales sobre el registro..."
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Fecha de Instalación"
                    type="date"
                    value={formData.fecha_instalacion}
                    onChange={(e) =>
                      handleChange("fecha_instalacion", e.target.value)
                    }
                    error={errors.fecha_instalacion}
                    required
                  />
                  <Input
                    label="Fecha de Vencimiento"
                    type="date"
                    value={formData.fecha_vencimiento}
                    onChange={(e) =>
                      handleChange("fecha_vencimiento", e.target.value)
                    }
                    error={errors.fecha_vencimiento}
                    required
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <Input
                    label="Vida útil años"
                    type="number"
                    value={formData.fv_anios}
                    onChange={(e) =>
                      handleChange("fv_anios", Number(e.target.value) || 0)
                    }
                    error={errors.fv_anios}
                    min={0}
                    max={50}
                    required
                  />
                  <Input
                    label="Vida útil meses"
                    type="number"
                    value={formData.fv_meses}
                    onChange={(e) =>
                      handleChange("fv_meses", Number(e.target.value) || 0)
                    }
                    error={errors.fv_meses}
                    min={0}
                    max={11}
                    required
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
                  />
                </div>
              </div>
            )}

            {/* ------- BOTONES ------- */}
            <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    icon={ArrowLeft}
                    disabled={isSubmitting}
                  >
                    Anterior
                  </Button>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/registro")}
                  icon={X}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button type="submit" icon={Save} loading={isSubmitting}>
                    {isSubmitting
                      ? isEditing
                        ? "Actualizando..."
                        : "Creando..."
                      : isEditing
                      ? "Actualizar"
                      : "Crear"}{" "}
                    Registro
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};