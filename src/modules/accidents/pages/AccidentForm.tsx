import React, { useState, useEffect } from "react";
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { SearchableSelect } from '../../../shared/components/ui/SearchableSelect';
import { X, Upload, Trash2 } from "lucide-react";
import { useToast } from '../../../shared/components/ui/Toast';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import { accidentService } from "../services/accidentService";
import type {
  Accident,
  CreateAccidentDto,
} from "../types/accident";
import { SeveridadAccidente, EstadoAccidente } from "../types/accident";

interface AccidentFormProps {
  accident?: Accident;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (accidentId: number) => void;
  lineasVida: Array<{
    id: number;
    codigo: string;
    cliente: string;
    ubicacion: string;
  }>;
}

interface FormData {
  linea_vida_id: string | null;
  fecha_accidente: string;
  descripcion: string;
  lesiones: string;
  medidas_correctivas: string;
  severidad: SeveridadAccidente;
}

export const AccidentForm: React.FC<AccidentFormProps> = ({
  accident,
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  lineasVida,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const modalRef = useModalClose({ isOpen, onClose });

  const [formData, setFormData] = useState<FormData>({
    linea_vida_id: null,
    fecha_accidente: "",
    descripcion: "",
    lesiones: "",
    medidas_correctivas: "",
    severidad: SeveridadAccidente.LEVE,
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
          descripcion: accident.descripcion || "",
          lesiones: accident.lesiones || "",
          medidas_correctivas: accident.medidas_correctivas || "",
          severidad: accident.severidad,
        });
      } else {
        setFormData({
          linea_vida_id: null,
          fecha_accidente: "",
          descripcion: "",
          lesiones: "",
          medidas_correctivas: "",
          severidad: SeveridadAccidente.LEVE,
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
      newErrors.linea_vida_id = "La línea de vida es obligatoria" as any;
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

    if (!formData.descripcion || !formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    } else if (formData.descripcion.length > 2000) {
      newErrors.descripcion =
        "La descripción no puede exceder 2000 caracteres";
    }

    if (
      formData.medidas_correctivas &&
      formData.medidas_correctivas.length > 2000
    ) {
      newErrors.medidas_correctivas =
        "Las medidas correctivas no pueden exceder 2000 caracteres";
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
      const submitData: CreateAccidentDto = {
        linea_vida_id: formData.linea_vida_id!,
        fecha_accidente: formData.fecha_accidente,
        descripcion: formData.descripcion,
        lesiones: formData.lesiones || undefined,
        medidas_correctivas: formData.medidas_correctivas || undefined,
        severidad: formData.severidad,
        estado: accident?.estado || EstadoAccidente.REPORTADO,
      };

      if (isEditing) {
        await accidentService.updateAccident(accident.id, { ...submitData, id: accident.id });
        success("Éxito", "Accidente actualizado correctamente");
      } else {
        await accidentService.createAccident(submitData);
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
    const linea = lineasVida.find((l) => l.id.toString() === formData.linea_vida_id);
    return linea ? linea.codigo : "";
  };

  const handleLineaVidaChange = (value: string) => {
    if (!value) {
      handleChange("linea_vida_id", null);
      return;
    }

    const linea = lineasVida.find((l) => l.codigo === value);
    if (linea) {
      handleChange("linea_vida_id", linea.id.toString());
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
    <div ref={modalRef} className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" style={{ margin: 0 }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header reducido y modal más ancha */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-500 to-red-600">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-6 h-6 bg-white rounded bg-opacity-20">
              <span className="text-base text-white">⚠️</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {isEditing ? "Editar Accidente" : "Registrar Nuevo Accidente"}
              </h2>
              <p className="text-xs text-red-100 leading-tight">
                {isEditing
                  ? "Actualizar información del incidente"
                  : "Reporte detallado de incidente en línea de vida"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white transition-colors hover:text-red-200 p-1"
            style={{ lineHeight: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Información Básica */}
          <div>

            <div className="grid grid-cols-1 gap-0.5 lg:grid-cols-2">
              <SearchableSelect
                options={lineaVidaOptions}
                value={getSelectedLineaVida()}
                onChange={handleLineaVidaChange}
                placeholder="Buscar por código, cliente o ubicación..."
                label="Línea de Vida Asociada"
                error={errors.linea_vida_id as any}
                required
                size="compact"
                className="!min-h-11 !h-11"
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
                className="!py-2.5 !h-11"
                required
              />
            </div>
          </div>




          {/* Detalles del Incidente */}
          <div>
            <div className="grid grid-cols-1 gap-0.5 lg:grid-cols-2">
              <Input
                label="Lesiones o Daños"
                value={formData.lesiones}
                onChange={(e) =>
                  handleChange("lesiones", e.target.value)
                }
                placeholder="Describe lesiones o daños (opcional)"
                className="!py-2.5 !h-11"
              />

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Severidad del Accidente <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.severidad}
                  onChange={e => handleChange("severidad", e.target.value)}
                  className="w-full h-11 px-3 py-2.5 border-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {severidadOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Descripción del Incidente */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción del Incidente <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                handleChange("descripcion", e.target.value)
              }
              placeholder="Describe detalladamente lo que ocurrió durante el accidente..."
              className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 resize-none text-sm
                bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500
                ${
                  errors.descripcion
                    ? "border-red-300 dark:border-red-600"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }
              `}
              rows={3}
              maxLength={2000}
            />
            <div className="flex justify-between mt-1">
              {errors.descripcion && (
                <p className="text-sm text-red-600">
                  {errors.descripcion}
                </p>
              )}
              <p className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {formData.descripcion.length}/2000 caracteres
              </p>
            </div>
          </div>

          {/* Medidas Correctivas */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Medidas Correctivas Tomadas/Propuestas
            </label>
            <textarea
              value={formData.medidas_correctivas}
              onChange={(e) =>
                handleChange("medidas_correctivas", e.target.value)
              }
              placeholder="Describe las medidas correctivas implementadas o que se planean implementar..."
              className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 resize-none text-sm
                bg-white text-gray-900 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500
                ${
                  errors.medidas_correctivas
                    ? "border-red-300 dark:border-red-600"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }
              `}
              rows={3}
              maxLength={2000}
            />
            <div className="flex justify-between mt-1">
              {errors.medidas_correctivas && (
                <p className="text-sm text-red-600">
                  {errors.medidas_correctivas}
                </p>
              )}
              <p className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {formData.medidas_correctivas.length}/2000 caracteres
              </p>
            </div>
          </div>

          {/* Evidencias */}
          <div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                Evidencias Fotográficas o Documentales
              </label>
              <div
                className="p-1 text-center transition-colors border-2 border-gray-300 dark:border-gray-600 border-dashed cursor-pointer rounded-md hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700/40"
                onClick={handleFileUpload}
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-4 h-4 mb-0 text-gray-400 dark:text-gray-300" />
                  <p className="font-medium text-gray-600 dark:text-gray-200 text-[10px]">
                    Haga clic para seleccionar archivos
                  </p>
                  <p className="mt-0 text-[9px] text-gray-500 dark:text-gray-400">
                    PNG, JPG, PDF hasta 5MB por archivo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-between pt-1 space-x-0.5 border-t border-gray-200 dark:border-gray-700">
            <div>
              {isEditing && onDelete && accident && (
                <Button
                  type="button"
                  variant="outline"
                  icon={Trash2}
                  onClick={() => onDelete(Number(accident.id))}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Eliminar
                </Button>
              )}
            </div>
            <div className="flex space-x-0.5">
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
          </div>
        </form>
      </div>
    </div>
  );
};
