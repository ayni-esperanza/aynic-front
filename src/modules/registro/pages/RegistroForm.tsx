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
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
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
      // Permitir cadena vacía o número válido
      setFormData((p) => ({ ...p, [field]: value }));
    } else {
      setFormData((p) => ({ ...p, [field]: value }));
    }
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
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
                  <Input
                    label="Cliente"
                    value={formData.cliente}
                    onChange={(e) => handleChange("cliente", e.target.value)}
                    error={errors.cliente}
                    placeholder="Nombre del cliente"
                    required
                  />
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
                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Tipo de Línea"
                    value={formData.tipo_linea}
                    onChange={(e) => handleChange("tipo_linea", e.target.value)}
                    error={errors.tipo_linea}
                    placeholder="Ej: horizontales, verticales, etc."
                    required
                  />
                  <Input
                    label="Longitud (m)"
                    type="number"
                    step="0.01"
                    value={formData.longitud}
                    onChange={(e) => handleChange("longitud", e.target.value)}
                    error={errors.longitud}
                    placeholder="1000.50"
                    min="0.01"
                    required
                  />
                </div>
                <Input
                  label="Ubicación"
                  value={formData.ubicacion}
                  onChange={(e) => handleChange("ubicacion", e.target.value)}
                  error={errors.ubicacion}
                  placeholder="Dirección o coordenadas"
                  required
                />
                <label className="block text-sm font-medium text-gray-700">
                  Observaciones{" "}
                  <span className="text-gray-400">(opcional)</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.observaciones}
                  onChange={(e) =>
                    handleChange("observaciones", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18D043]/20 focus:border-[#18D043] resize-none"
                  placeholder="Notas adicionales..."
                />
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