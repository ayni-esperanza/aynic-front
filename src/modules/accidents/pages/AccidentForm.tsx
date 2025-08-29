import React, { useState, useEffect } from "react";
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { SearchableSelect } from '../../../shared/components/ui/SearchableSelect';
import { X, Upload } from "lucide-react";
import { useToast } from '../../../shared/components/ui/Toast';
import { accidentService } from "../services/accidentService";
import type {
  Accident,
  CreateAccidentDto,
  UpdateAccidentDto,
  SeveridadAccidente,
} from "../types/accident";

interface AccidentFormProps {
  accident?: Accident;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lineasVida: Array<{
    id: number;
    codigo: string;
    cliente: string;
    ubicacion: string;
  }>;
}

interface FormData {
  linea_vida_id: number | null;
  fecha_accidente: string;
  descripcion_incidente: string;
  persona_involucrada: string;
  acciones_correctivas: string;
  severidad: SeveridadAccidente;
  evidencias_urls: string[];
}

export const AccidentForm: React.FC<AccidentFormProps> = ({
  accident,
  isOpen,
  onClose,
  onSuccess,
  lineasVida,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const [formData, setFormData] = useState<FormData>({
    linea_vida_id: null,
    fecha_accidente: "",
    descripcion_incidente: "",
    persona_involucrada: "",
    acciones_correctivas: "",
    severidad: "LEVE",
    evidencias_urls: [],
  });

  const isEditing = !!accident;

  // Inicializar formulario cuando se abre o cambia el accidente
  useEffect(() => {
    if (isOpen) {
      if (accident) {
        setFormData({
          linea_vida_id: accident.linea_vida_id,
          fecha_accidente: new Date(accident.fecha_accidente)
            .toISOString()
            .split("T")[0],
          descripcion_incidente: accident.descripcion_incidente,
          persona_involucrada: accident.persona_involucrada || "",
          acciones_correctivas: accident.acciones_correctivas || "",
          severidad: accident.severidad,
          evidencias_urls: accident.evidencias_urls || [],
        });
      } else {
        setFormData({
          linea_vida_id: null,
          fecha_accidente: "",
          descripcion_incidente: "",
          persona_involucrada: "",
          acciones_correctivas: "",
          severidad: "LEVE",
          evidencias_urls: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, accident]);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.linea_vida_id) {
      newErrors.linea_vida_id = "La línea de vida es obligatoria";
    }

    if (!formData.fecha_accidente) {
      newErrors.fecha_accidente = "La fecha del accidente es obligatoria";
    } else {
      const fechaAccidente = new Date(formData.fecha_accidente);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);

      if (fechaAccidente > hoy) {
        newErrors.fecha_accidente = "La fecha no puede ser futura";
      }
    }

    if (!formData.descripcion_incidente.trim()) {
      newErrors.descripcion_incidente = "La descripción es obligatoria";
    } else if (formData.descripcion_incidente.length > 2000) {
      newErrors.descripcion_incidente =
        "La descripción no puede exceder 2000 caracteres";
    }

    if (
      formData.acciones_correctivas &&
      formData.acciones_correctivas.length > 2000
    ) {
      newErrors.acciones_correctivas =
        "Las acciones correctivas no pueden exceder 2000 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData: CreateAccidentDto | UpdateAccidentDto = {
        linea_vida_id: formData.linea_vida_id!,
        fecha_accidente: formData.fecha_accidente,
        descripcion_incidente: formData.descripcion_incidente,
        persona_involucrada: formData.persona_involucrada || undefined,
        acciones_correctivas: formData.acciones_correctivas || undefined,
        severidad: formData.severidad,
        evidencias_urls:
          formData.evidencias_urls.length > 0
            ? formData.evidencias_urls
            : undefined,
      };

      if (isEditing) {
        await accidentService.updateAccident(accident.id, submitData);
        success("Éxito", "Accidente actualizado correctamente");
      } else {
        await accidentService.createAccident(submitData as CreateAccidentDto);
        success("Éxito", "Accidente registrado correctamente");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      error("Error", err?.message || "Error al procesar el accidente");
    } finally {
      setLoading(false);
    }
  };

  // Opciones para líneas de vida - simplificado para debugging
  const lineaVidaOptions = lineasVida.map((linea) => linea.codigo);

  const getSelectedLineaVida = () => {
    if (!formData.linea_vida_id) return "";
    const linea = lineasVida.find((l) => l.id === formData.linea_vida_id);
    return linea ? linea.codigo : "";
  };

  const handleLineaVidaChange = (value: string) => {
    if (!value) {
      handleChange("linea_vida_id", null);
      return;
    }

    const linea = lineasVida.find((l) => l.codigo === value);
    if (linea) {
      handleChange("linea_vida_id", linea.id);
    }
  };

  // Opciones de severidad como botones
  const severidadOptions = [
    {
      value: "LEVE",
      label: "Leve",
      color: "bg-gray-100 text-gray-700 border-gray-300",
    },
    {
      value: "MODERADO",
      label: "Moderado",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    },
    {
      value: "GRAVE",
      label: "Grave",
      color: "bg-orange-100 text-orange-700 border-orange-300",
    },
    {
      value: "CRITICO",
      label: "Crítico",
      color: "bg-red-100 text-red-700 border-red-300",
    },
  ];

  const handleFileUpload = () => {
    // TODO: Implementar upload de archivos
    console.log("Upload de evidencias");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
        {/* Cambié de max-w-2xl a max-w-4xl */}
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg bg-opacity-20">
              <span className="text-xl text-white">⚠️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "Editar Accidente" : "Registrar Nuevo Accidente"}
              </h2>
              <p className="text-red-100">
                {isEditing
                  ? "Actualizar información del incidente"
                  : "Reporte detallado de incidente en línea de vida"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white transition-colors hover:text-red-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <span className="flex items-center justify-center w-6 h-6 mr-2 text-sm text-white bg-red-500 rounded-full">
                1
              </span>
              Información Básica del Incidente
            </h3>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SearchableSelect
                options={lineaVidaOptions}
                value={getSelectedLineaVida()}
                onChange={handleLineaVidaChange}
                placeholder="Buscar por código, cliente o ubicación..."
                label="Línea de Vida Asociada"
                error={errors.linea_vida_id}
                required
              />

              <Input
                label="Fecha del Accidente"
                type="date"
                value={formData.fecha_accidente}
                onChange={(e) =>
                  handleChange("fecha_accidente", e.target.value)
                }
                error={errors.fecha_accidente}
                helperText="La fecha no puede ser futura"
                required
              />
            </div>
          </div>

          {/* Detalles del Incidente */}
          <div>
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <span className="flex items-center justify-center w-6 h-6 mr-2 text-sm text-white bg-red-500 rounded-full">
                2
              </span>
              Detalles del Incidente
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Descripción del Incidente{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.descripcion_incidente}
                  onChange={(e) =>
                    handleChange("descripcion_incidente", e.target.value)
                  }
                  placeholder="Describe detalladamente lo que ocurrió durante el accidente..."
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 font-medium resize-none
                    focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500
                    ${
                      errors.descripcion_incidente
                        ? "border-red-300"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                  rows={4}
                  maxLength={2000}
                />
                <div className="flex justify-between mt-1">
                  {errors.descripcion_incidente && (
                    <p className="text-sm text-red-600">
                      {errors.descripcion_incidente}
                    </p>
                  )}
                  <p className="ml-auto text-xs text-gray-500">
                    {formData.descripcion_incidente.length}/2000 caracteres
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Input
                  label="Persona Involucrada"
                  value={formData.persona_involucrada}
                  onChange={(e) =>
                    handleChange("persona_involucrada", e.target.value)
                  }
                  placeholder="Nombre completo (opcional)"
                />

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Severidad del Accidente{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {severidadOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange("severidad", option.value)}
                        className={`p-3 text-sm font-medium border-2 rounded-xl transition-all duration-200
                          ${
                            formData.severidad === option.value
                              ? `${option.color} border-current`
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Correctivas */}
          <div>
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <span className="flex items-center justify-center w-6 h-6 mr-2 text-sm text-white bg-red-500 rounded-full">
                3
              </span>
              Acciones Correctivas
            </h3>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Acciones Correctivas Tomadas/Propuestas
              </label>
              <textarea
                value={formData.acciones_correctivas}
                onChange={(e) =>
                  handleChange("acciones_correctivas", e.target.value)
                }
                placeholder="Describe las medidas correctivas implementadas o que se planean implementar..."
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 font-medium resize-none
                  focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500
                  ${
                    errors.acciones_correctivas
                      ? "border-red-300"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
                rows={3}
                maxLength={2000}
              />
              <div className="flex justify-between mt-1">
                {errors.acciones_correctivas && (
                  <p className="text-sm text-red-600">
                    {errors.acciones_correctivas}
                  </p>
                )}
                <p className="ml-auto text-xs text-gray-500">
                  {formData.acciones_correctivas.length}/2000 caracteres
                </p>
              </div>
            </div>
          </div>

          {/* Evidencias */}
          <div>
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <span className="flex items-center justify-center w-6 h-6 mr-2 text-sm text-white bg-red-500 rounded-full">
                4
              </span>
              Evidencias Adjuntas
            </h3>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Evidencias Fotográficas o Documentales
              </label>
              <div
                className="p-8 text-center transition-colors border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-gray-400"
                onClick={handleFileUpload}
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 mb-2 text-gray-400" />
                  <p className="font-medium text-gray-600">
                    Haga clic para seleccionar archivos
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    PNG, JPG, PDF hasta 5MB por archivo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end pt-6 space-x-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {isEditing ? "Actualizar Accidente" : "Registrar Accidente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
