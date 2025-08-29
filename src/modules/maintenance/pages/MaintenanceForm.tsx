import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { SearchableSelect } from '../../../shared/components/ui/SearchableSelect';
import { useToast } from '../../../shared/components/ui/Toast';
import { useMutation, useApi } from '../../../shared/hooks/useApi';
import { maintenanceService } from "../services/maintenanceService";
import {
  ChevronLeft,
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

export const MaintenanceForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        navigate("/mantenimiento");
      },
      onError: (error) => {
        showError("Error", error);
      },
    }
  );

  // Preseleccionar registro si viene del state de navegación
  useEffect(() => {
    if (location.state?.selectedRecordId) {
      const recordId = parseInt(location.state.selectedRecordId);
      setFormData((prev) => ({ ...prev, record_id: recordId }));
    }
  }, [location.state]);

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/mantenimiento")}
            icon={ChevronLeft}
            disabled={loading}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Nuevo Mantenimiento
            </h1>
            <p className="text-gray-600">
              Registra un mantenimiento realizado en una línea de vida
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <div className="flex items-center mb-4 space-x-2">
            <Building className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Información Básica
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <SearchableSelect
                options={recordOptions}
                value={getSelectedRecordLabel()}
                onChange={handleRecordChange}
                placeholder="Buscar por código, cliente o ubicación..."
                label="Línea de Vida *"
                error={errors.record_id}
                required
                disabled={recordsLoading || loading}
              />
              {recordsLoading && (
                <p className="flex items-center mt-1 text-sm text-gray-500">
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
        </Card>

        {/* Detalles del Mantenimiento */}
        <Card>
          <div className="flex items-center mb-4 space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Detalles del Mantenimiento
            </h2>
          </div>

          <div className="space-y-6">
            {/* Descripción */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Descripción del mantenimiento{" "}
                <span className="ml-1 font-normal text-gray-500">
                  (opcional)
                </span>
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe las actividades de mantenimiento realizadas (revisión, limpieza, reparación, etc.)..."
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none ${
                  errors.description
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:border-indigo-500"
                }`}
                rows={4}
                maxLength={500}
                disabled={loading}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-1">💡</span>
                  Describe qué trabajo se realizó en la línea de vida
                </div>
                <p className="text-sm text-gray-500">
                  {(formData.description || "").length}/500 caracteres
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
                  <div className="p-3 mt-3 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="flex-shrink-0 w-4 h-4 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800">
                          Cambio de longitud detectado
                        </p>
                        <p className="text-sm text-yellow-700">
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
          <div className="flex items-center mb-4 space-x-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Imagen del Mantenimiento{" "}
              <span className="ml-2 text-sm font-normal text-gray-500">
                (opcional)
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {!selectedFile ? (
              <div className="p-8 text-center transition-colors border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-indigo-400 group">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 transition-colors group-hover:text-indigo-500" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Subir imagen del mantenimiento
                </h3>
                <p className="max-w-sm mx-auto mb-4 text-gray-600">
                  Sube una fotografía que documente el trabajo de mantenimiento
                  realizado
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
                <div className="mt-3 text-sm text-gray-500">
                  <p className="font-medium">Formatos: JPG, PNG, WebP</p>
                  <p>Tamaño máximo: 5MB</p>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-gray-200 bg-gray-50 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={filePreview!}
                      alt="Preview del mantenimiento"
                      className="object-cover w-24 h-24 border border-gray-300 rounded-lg shadow-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </h4>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-600">
                        Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </p>
                      <p className="text-sm text-gray-600">
                        Tipo: {selectedFile.type}
                      </p>
                    </div>
                    <div className="flex items-center mt-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
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
            <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-amber-900">
                    Confirmación de Cambio de Longitud
                  </h3>
                  <p className="mb-4 text-amber-800">
                    Estás registrando un cambio en la longitud de la línea de
                    vida. Este cambio se guardará permanentemente en el
                    historial.
                  </p>

                  <div className="grid grid-cols-1 gap-4 p-4 rounded-lg md:grid-cols-3 bg-white/70">
                    <div className="text-center">
                      <p className="text-sm font-medium text-amber-700">
                        Longitud Actual
                      </p>
                      <p className="text-2xl font-bold text-amber-900">
                        {selectedRecord.longitud}m
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-amber-700">
                        Nueva Longitud
                      </p>
                      <p className="text-2xl font-bold text-amber-900">
                        {formData.new_length_meters}m
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-amber-700">
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
        <div className="sticky bottom-0 px-6 pt-6 pb-6 -mx-6 -mb-6 bg-white border-t border-gray-200 rounded-t-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Los campos marcados con * son obligatorios</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/mantenimiento")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                icon={Save}
                loading={loading}
                className="min-w-[200px]"
              >
                {loading ? "Registrando..." : "Registrar Mantenimiento"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
