import React, { useState, useRef, useEffect } from "react";
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { SearchableSelect } from '../../../shared/components/ui/SearchableSelect';
import { useToast } from '../../../shared/components/ui/Toast';
import { useMutation, useApi } from '../../../shared/hooks/useApi';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import { maintenanceService } from "../services/maintenanceService";
import {
  Save,
  Upload,
  X,
  AlertCircle,
  Building,
  Calendar,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import type { CreateMaintenanceDto } from "../types/maintenance";

interface RecordData {
  id: number;
  codigo: string;
  cliente: string;
  longitud: number;
  ubicacion: string;
}

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedRecordId?: number;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedRecordId,
}) => {
  const { success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useModalClose({ isOpen, onClose });

  // Estado del formulario
  const [formData, setFormData] = useState<CreateMaintenanceDto>({
    record_id: 0,
    maintenance_date: new Date().toISOString().split("T")[0],
    description: "",
    new_length_meters: undefined,
  });

  // Estado para archivos
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Estado para errores
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar registros para el select
  const { data: records, loading: recordsLoading } = useApi<RecordData[]>(
    () => maintenanceService.getRecordsForSelect(),
    { immediate: true }
  );

  // Crear mantenimiento
  const { mutate: createMaintenance, loading } = useMutation(
    ({ data, file }: { data: CreateMaintenanceDto; file?: File }) =>
      maintenanceService.createMaintenance(data, file),
    {
      onSuccess: () => {
        success("Éxito", "Mantenimiento registrado correctamente");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          record_id: 0,
          maintenance_date: new Date().toISOString().split("T")[0],
          description: "",
          new_length_meters: undefined,
        });
        setSelectedFile(null);
        setFilePreview(null);
        setErrors({});
      },
      onError: (error) => {
        showError("Error", error);
      },
    }
  );

  // Preseleccionar registro si viene como prop o al abrir modal
  useEffect(() => {
    if (isOpen && preselectedRecordId) {
      setFormData((prev) => ({ ...prev, record_id: preselectedRecordId }));
    }
  }, [isOpen, preselectedRecordId]);

  // Encontrar registro seleccionado
  const selectedRecord = records?.find((r) => r.id === formData.record_id);

  // ========= Helpers para SearchableSelect (igual enfoque que Accidentes) =========
  const buildLabel = (r: RecordData) =>
    [r.codigo, r.cliente, r.ubicacion].filter(Boolean).join(" · ");

  const recordOptions = (records ?? []).map(buildLabel);

  const getSelectedRecordLabel = () => {
    if (!formData.record_id) return "";
    const r = records?.find((x) => x.id === formData.record_id);
    return r ? buildLabel(r) : "";
  };

  const handleRecordChange = (value: string) => {
    if (!value) {
      setFormData((prev) => ({ ...prev, record_id: 0 }));
      if (errors.record_id) setErrors((p) => ({ ...p, record_id: "" }));
      return;
    }
    // 1) buscar por etiqueta completa
    let found = records?.find((r) => buildLabel(r) === value);
    // 2) por si el componente devuelve solo el código (fallback)
    if (!found) {
      const code = value.split(" · ")[0];
      found = records?.find((r) => r.codigo === code);
    }
    setFormData((prev) => ({ ...prev, record_id: found?.id ?? 0 }));
    if (errors.record_id) setErrors((p) => ({ ...p, record_id: "" }));
  };
  // ===============================================================================

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.record_id)
      newErrors.record_id = "Debe seleccionar un registro";

    if (!formData.maintenance_date) {
      newErrors.maintenance_date = "La fecha es obligatoria";
    } else {
      const maintenanceDate = new Date(formData.maintenance_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (maintenanceDate > today) {
        newErrors.maintenance_date = "La fecha no puede ser futura";
      }
    }

    if (formData.new_length_meters !== undefined) {
      if (formData.new_length_meters <= 0) {
        newErrors.new_length_meters = "La longitud debe ser mayor a cero";
      }
      if (formData.new_length_meters > 10000) {
        newErrors.new_length_meters =
          "La longitud no puede superar 10,000 metros";
      }
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "La descripción no puede exceder 500 caracteres";
    }

    if (selectedFile) {
      const fileValidation = maintenanceService.validateFile(selectedFile);
      if (!fileValidation.valid) {
        newErrors.file = fileValidation.error || "Archivo no válido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleInputChange = (
    field: keyof CreateMaintenanceDto,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = maintenanceService.validateFile(file);
    if (!validation.valid) {
      setErrors((prev) => ({
        ...prev,
        file: validation.error || "Archivo no válido",
      }));
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFilePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (errors.file) setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (errors.file) setErrors((prev) => ({ ...prev, file: "" }));
  };

  // Enviar formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.record_id || formData.record_id === 0) {
      setErrors((prev) => ({
        ...prev,
        record_id: "Debe seleccionar un registro",
      }));
      showError("Formulario incompleto", "Selecciona una línea de vida");
      return;
    }
    if (!validateForm()) {
      showError(
        "Formulario incompleto",
        "Por favor, corrige los errores marcados"
      );
      return;
    }
    createMaintenance({ data: formData, file: selectedFile || undefined });
  };

  if (!isOpen) return null;

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-5 h-5 bg-white rounded bg-opacity-20">
              <span className="text-sm text-white">🔧</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                Nuevo Mantenimiento
              </h2>
              <p className="text-xs text-blue-100 leading-tight">
                Registra un mantenimiento realizado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white transition-colors hover:text-blue-200 p-1"
            style={{ lineHeight: 0 }}
            disabled={loading}
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Información Básica */}
          <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center mb-2 space-x-2">
              <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Información Básica
              </h2>
            </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <SearchableSelect
                options={recordOptions}
                value={getSelectedRecordLabel()}
                onChange={handleRecordChange}
                placeholder="Buscar por código, cliente o ubicación..."
                label="Línea de Vida *"
                error={errors.record_id}
                required
              />
              {recordsLoading && (
                <p className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="w-3 h-3 mr-2 border border-gray-400 rounded-full animate-spin border-t-transparent"></span>
                  Cargando registros...
                </p>
              )}
              {!recordsLoading && (records?.length ?? 0) === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  No se encontraron líneas de vida. Verifica que existan
                  registros.
                </p>
              )}
            </div>

            <Input
              type="date"
              label="Fecha del Mantenimiento"
              value={formData.maintenance_date}
              onChange={(e) =>
                handleInputChange("maintenance_date", e.target.value)
              }
              error={errors.maintenance_date}
              required
              disabled={loading}
              max={new Date().toISOString().split("T")[0]}
              icon={Calendar}
            />
          </div>

          {/* Información del registro seleccionado */}
          {selectedRecord && (
            <div className="p-4 mt-6 border border-indigo-200 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50">
              <h3 className="flex items-center mb-3 font-semibold text-indigo-900">
                <span className="mr-2 text-indigo-600">📍</span>
                Información del Registro Seleccionado
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="text-sm font-medium text-indigo-700">
                    Código
                  </label>
                  <p className="font-semibold text-indigo-900">
                    {selectedRecord.codigo}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-indigo-700">
                    Cliente
                  </label>
                  <p className="text-indigo-900">{selectedRecord.cliente}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-indigo-700">
                    Longitud Actual
                  </label>
                  <p className="font-semibold text-indigo-900">
                    {selectedRecord.longitud}m
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-indigo-700">
                    Ubicación
                  </label>
                  <p className="text-indigo-900">
                    {selectedRecord.ubicacion || "No especificada"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detalles del Mantenimiento */}
        <Card>
          <div className="flex items-center mb-2 space-x-2">
            <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Detalles del Mantenimiento
            </h2>
          </div>

          <div className="space-y-3">
            {/* Descripción */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Descripción del mantenimiento{" "}
                <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">
                  (opcional)
                </span>
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe las actividades de mantenimiento realizadas..."
                className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                  errors.description
                    ? "border-red-300 focus:border-red-500 dark:border-red-600 dark:focus:border-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:border-indigo-500 dark:border-gray-600 dark:hover:border-gray-500 dark:focus:border-indigo-400"
                }`}
                rows={3}
                maxLength={500}
                disabled={loading}
              />
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <span className="mr-1">💡</span>
                  Describe qué trabajo se realizó
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(formData.description || "").length}/500
                </p>
              </div>
              {errors.description && (
                <p className="flex items-center mt-1 space-x-1 text-sm text-red-600">
                  <span className="text-red-500">⚠️</span>
                  <span>{errors.description}</span>
                </p>
              )}
            </div>

            {/* Nueva longitud */}
            <div>
              <Input
                type="number"
                label="Nueva Longitud (metros)"
                value={formData.new_length_meters?.toString() || ""}
                onChange={(e) =>
                  handleInputChange(
                    "new_length_meters",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder={
                  selectedRecord
                    ? `Actual: ${selectedRecord.longitud}m`
                    : "Longitud en metros"
                }
                error={errors.new_length_meters}
                helperText="Solo completar si se modificó la longitud durante el mantenimiento"
                step="0.1"
                min="0.1"
                max="10000"
                disabled={loading}
              />

              {formData.new_length_meters &&
                selectedRecord &&
                formData.new_length_meters !== selectedRecord.longitud && (
                  <div className="p-3 mt-3 border border-yellow-200 rounded-lg bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="flex-shrink-0 w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          Cambio de longitud detectado
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                          {selectedRecord.longitud}m →{" "}
                          {formData.new_length_meters}m{" "}
                          <span
                            className={`font-semibold ${
                              formData.new_length_meters >
                              selectedRecord.longitud
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            (
                            {formData.new_length_meters >
                            selectedRecord.longitud
                              ? "+"
                              : ""}
                            {(
                              formData.new_length_meters -
                              selectedRecord.longitud
                            ).toFixed(1)}
                            m)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </Card>

        {/* Imagen del Mantenimiento */}
        <Card>
          <div className="flex items-center mb-2 space-x-2">
            <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Imagen del Mantenimiento{" "}
              <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                (opcional)
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {!selectedFile ? (
              <div className="p-6 text-center transition-colors border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-indigo-400 group dark:border-gray-600 dark:hover:border-indigo-500">
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400 transition-colors group-hover:text-indigo-500 dark:text-gray-500" />
                <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Subir imagen del mantenimiento
                </h3>
                <p className="max-w-sm mx-auto mb-3 text-xs text-gray-600 dark:text-gray-400">
                  Sube una fotografía que documente el trabajo realizado
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  icon={Upload}
                  disabled={loading}
                >
                  Seleccionar Imagen
                </Button>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <p className="font-medium">JPG, PNG, WebP - Máx. 5MB</p>
                </div>
              </div>
            ) : (
              <div className="p-3 border border-gray-200 bg-gray-50 rounded-xl dark:border-gray-700 dark:bg-gray-700/50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      src={filePreview!}
                      alt="Preview del mantenimiento"
                      className="object-cover w-20 h-20 border border-gray-300 rounded-lg shadow-sm dark:border-gray-600"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      {selectedFile.name}
                    </h4>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Tipo: {selectedFile.type}
                      </p>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        ✓ Archivo válido
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    icon={X}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            )}

            {errors.file && (
              <div className="flex items-center p-3 space-x-2 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                <AlertCircle className="flex-shrink-0 w-4 h-4" />
                <span>{errors.file}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Confirmación de cambios importantes */}
        {formData.new_length_meters &&
          selectedRecord &&
          formData.new_length_meters !== selectedRecord.longitud && (
            <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-700">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-amber-900 dark:text-amber-200">
                    Confirmación de Cambio de Longitud
                  </h3>
                  <p className="mb-4 text-amber-800 dark:text-amber-300">
                    Estás registrando un cambio en la longitud de la línea de
                    vida. Este cambio se guardará permanentemente en el
                    historial.
                  </p>

                  <div className="grid grid-cols-1 gap-4 p-4 rounded-lg md:grid-cols-3 bg-white/70 dark:bg-gray-800/70">
                    <div className="text-center">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Longitud Actual
                      </p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                        {selectedRecord.longitud}m
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Nueva Longitud
                      </p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                        {formData.new_length_meters}m
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Diferencia
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          formData.new_length_meters > selectedRecord.longitud
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formData.new_length_meters > selectedRecord.longitud
                          ? "+"
                          : ""}
                        {(
                          formData.new_length_meters - selectedRecord.longitud
                        ).toFixed(1)}
                        m
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end pt-3 space-x-2 border-t border-gray-200 dark:border-gray-700">
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
              icon={Save}
              loading={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {loading ? "Registrando..." : "Registrar Mantenimiento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
