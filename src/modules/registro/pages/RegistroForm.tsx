import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  MapPin,
  Settings,
  Zap,
  Info,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { useAppStore } from "../../../store";
import type { DataRecord } from "../../../types";

export const RegistroForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { registros, addRegistro, updateRegistro } = useAppStore();

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
    longitud: 0,
    observaciones: "",
    seec: "",
    tipo_linea: "",
    ubicacion: "",
    fecha_vencimiento: "",
    estado_actual: "activo" as DataRecord["estado_actual"],
  });

  useEffect(() => {
    if (isEditing && id) {
      const registro = registros.find((r) => r.id === id);
      if (registro) {
        setFormData({
          codigo: registro.codigo,
          cliente: registro.cliente,
          equipo: registro.equipo,
          fv_anios: registro.fv_anios,
          fv_meses: registro.fv_meses,
          fecha_instalacion: registro.fecha_instalacion
            .toISOString()
            .split("T")[0],
          longitud: registro.longitud,
          observaciones: registro.observaciones || "",
          seec: registro.seec,
          tipo_linea: registro.tipo_linea,
          ubicacion: registro.ubicacion,
          fecha_vencimiento: registro.fecha_vencimiento
            .toISOString()
            .split("T")[0],
          estado_actual: registro.estado_actual,
        });
      }
    }
  }, [id, isEditing, registros]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.codigo.trim()) newErrors.codigo = "El código es requerido";
      if (!formData.cliente.trim())
        newErrors.cliente = "El cliente es requerido";
      if (!formData.equipo.trim()) newErrors.equipo = "El equipo es requerido";
      if (!formData.seec.trim()) newErrors.seec = "El SEEC es requerido";
    }

    if (step === 2) {
      if (!formData.tipo_linea)
        newErrors.tipo_linea = "El tipo de línea es requerido";
      if (!formData.ubicacion.trim())
        newErrors.ubicacion = "La ubicación es requerida";
      if (formData.longitud <= 0)
        newErrors.longitud = "La longitud debe ser mayor a 0";
    }

    if (step === 3) {
      if (!formData.fecha_instalacion)
        newErrors.fecha_instalacion = "La fecha de instalación es requerida";
      if (!formData.fecha_vencimiento)
        newErrors.fecha_vencimiento = "La fecha de vencimiento es requerida";
      if (formData.fv_anios < 0)
        newErrors.fv_anios = "Los años de vida útil no pueden ser negativos";
      if (formData.fv_meses < 0 || formData.fv_meses > 11)
        newErrors.fv_meses = "Los meses deben estar entre 0 y 11";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    const registroData: Omit<DataRecord, "id"> = {
      ...formData,
      fecha_instalacion: new Date(formData.fecha_instalacion),
      fecha_vencimiento: new Date(formData.fecha_vencimiento),
    };

    if (isEditing && id) {
      updateRegistro(id, registroData);
    } else {
      const newRegistro: DataRecord = {
        id: `record-${Date.now()}`,
        ...registroData,
      };
      addRegistro(newRegistro);
    }

    navigate("/registro");
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Input
                  label="Código del Registro"
                  value={formData.codigo}
                  onChange={(e) => handleChange("codigo", e.target.value)}
                  error={errors.codigo}
                  placeholder="COD-0001"
                  className="font-mono"
                  required
                />
                <p className="text-sm text-gray-500">
                  Identificador único del registro
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  label="Cliente"
                  value={formData.cliente}
                  onChange={(e) => handleChange("cliente", e.target.value)}
                  error={errors.cliente}
                  placeholder="Nombre del cliente"
                  required
                />
                <p className="text-sm text-gray-500">
                  Empresa o persona responsable
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Input
                  label="Equipo"
                  value={formData.equipo}
                  onChange={(e) => handleChange("equipo", e.target.value)}
                  error={errors.equipo}
                  placeholder="Equipo-A1"
                  required
                />
                <p className="text-sm text-gray-500">
                  Identificación del equipo instalado
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  label="SEEC"
                  value={formData.seec}
                  onChange={(e) => handleChange("seec", e.target.value)}
                  error={errors.seec}
                  placeholder="SEEC-001"
                  className="font-mono"
                  required
                />
                <p className="text-sm text-gray-500">
                  Sistema de Equipos de Comunicación
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Select
                  label="Tipo de Línea"
                  value={formData.tipo_linea}
                  onChange={(e) => handleChange("tipo_linea", e.target.value)}
                  options={[
                    { value: "", label: "Selecciona un tipo" },
                    { value: "Fibra Óptica", label: "🔗 Fibra Óptica" },
                    { value: "Cobre", label: "🔗 Cobre" },
                    { value: "Inalámbrica", label: "📡 Inalámbrica" },
                    { value: "Satelital", label: "🛰️ Satelital" },
                  ]}
                  error={errors.tipo_linea}
                  required
                />
                <p className="text-sm text-gray-500">
                  Tecnología de conexión empleada
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  label="Longitud (metros)"
                  type="number"
                  value={formData.longitud}
                  onChange={(e) =>
                    handleChange("longitud", parseInt(e.target.value) || 0)
                  }
                  error={errors.longitud}
                  placeholder="1000"
                  min="1"
                  required
                />
                <p className="text-sm text-gray-500">
                  Extensión total de la instalación
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                label="Ubicación"
                value={formData.ubicacion}
                onChange={(e) => handleChange("ubicacion", e.target.value)}
                error={errors.ubicacion}
                placeholder="Dirección o coordenadas"
                required
              />
              <p className="text-sm text-gray-500">
                📍 Localización geográfica del registro
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Observaciones <span className="text-gray-400">(opcional)</span>
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleChange("observaciones", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18D043]/20 focus:border-[#18D043] resize-none"
                placeholder="Notas adicionales sobre la instalación..."
              />
              <p className="text-sm text-gray-500">
                Información complementaria del registro
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
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
                <p className="text-sm text-gray-500">
                  📅 Cuándo se realizó la instalación
                </p>
              </div>

              <div className="space-y-2">
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
                <p className="text-sm text-gray-500">
                  ⏰ Fecha límite de operación
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Input
                  label="Vida Útil - Años"
                  type="number"
                  value={formData.fv_anios}
                  onChange={(e) =>
                    handleChange("fv_anios", parseInt(e.target.value) || 0)
                  }
                  error={errors.fv_anios}
                  min="0"
                  max="50"
                  required
                />
                <p className="text-sm text-gray-500">Años de funcionamiento</p>
              </div>

              <div className="space-y-2">
                <Input
                  label="Vida Útil - Meses"
                  type="number"
                  value={formData.fv_meses}
                  onChange={(e) =>
                    handleChange("fv_meses", parseInt(e.target.value) || 0)
                  }
                  error={errors.fv_meses}
                  min="0"
                  max="11"
                  required
                />
                <p className="text-sm text-gray-500">Meses adicionales</p>
              </div>

              <div className="space-y-2">
                <Select
                  label="Estado Actual"
                  value={formData.estado_actual}
                  onChange={(e) =>
                    handleChange("estado_actual", e.target.value)
                  }
                  options={[
                    { value: "activo", label: "🟢 Activo" },
                    { value: "inactivo", label: "⚪ Inactivo" },
                    { value: "mantenimiento", label: "🟡 Mantenimiento" },
                    { value: "vencido", label: "🔴 Vencido" },
                  ]}
                  required
                />
                <p className="text-sm text-gray-500">Estado operativo actual</p>
              </div>
            </div>

            {/* Vista previa del registro */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[#18D043]/5 to-green-50 rounded-xl border border-[#18D043]/20">
              <h4 className="flex items-center mb-4 space-x-2 text-lg font-semibold text-gray-900">
                <span>👁️</span>
                <span>Vista Previa del Registro</span>
              </h4>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <span className="font-medium text-gray-600">Código:</span>
                  <span className="px-2 py-1 ml-2 font-mono bg-white rounded">
                    {formData.codigo || "Sin definir"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Cliente:</span>
                  <span className="ml-2">
                    {formData.cliente || "Sin definir"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Tipo de Línea:
                  </span>
                  <span className="ml-2">
                    {formData.tipo_linea || "Sin definir"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Longitud:</span>
                  <span className="ml-2">
                    {formData.longitud
                      ? `${formData.longitud}m`
                      : "Sin definir"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Estado:</span>
                  <span className="ml-2 capitalize">
                    {formData.estado_actual}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Vida Útil:</span>
                  <span className="ml-2">
                    {formData.fv_anios} años, {formData.fv_meses} meses
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex items-center mb-6 space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/registro")}
              icon={ArrowLeft}
              className="border-gray-300 hover:bg-gray-50"
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

          {/* Indicador de progreso */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const StepIcon = step.icon;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                        isCompleted
                          ? "bg-[#18D043] border-[#18D043] text-white"
                          : isActive
                          ? `${step.bgColor} ${step.color} border-current`
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <span className="text-lg">✓</span>
                      ) : (
                        <StepIcon size={20} />
                      )}
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
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-6">
                      <div
                        className={`h-0.5 transition-all duration-200 ${
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

        {/* Formulario */}
        <Card className="bg-white border-0 shadow-xl">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-8">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-gray-600">
                {steps[currentStep - 1].description}
              </p>
            </div>

            {renderStepContent()}

            {/* Botones de navegación */}
            <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    icon={ArrowLeft}
                    className="text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Anterior
                  </Button>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/registro")}
                  icon={X}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  Cancelar
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg"
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    icon={Save}
                    className="bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {isEditing ? "Actualizar" : "Crear"} Registro
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