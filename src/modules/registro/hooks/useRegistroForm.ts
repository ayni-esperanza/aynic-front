import { useState, useCallback } from "react";
import { useApi } from '../../../shared/hooks/useApi';
import { registroService } from "../services/registroService";
import type { CreateRecordData, UpdateRecordData, DataRecord, RecordValidationErrors } from "../types";

export const useRegistroForm = (initialData?: Partial<CreateRecordData>) => {
  const [formData, setFormData] = useState<CreateRecordData>({
    codigo: "",
    codigo_placa: "",
    cliente: "",
    equipo: "",
    fv_anios: undefined,
    fv_meses: undefined,
    fecha_instalacion: "",
    longitud: undefined,
    observaciones: "",
    seec: "",
    tipo_linea: "",
    ubicacion: "",
    anclaje_equipos: "",
    fecha_caducidad: "",
    estado_actual: "",
    ...initialData,
  });

  const [errors, setErrors] = useState<RecordValidationErrors>({});

  // Hook para crear registro
  const {
    loading: creating,
    error: createError,
    execute: createRecord,
  } = useApi(registroService.createRecord.bind(registroService));

  // Hook para actualizar registro
  const {
    loading: updating,
    error: updateError,
    execute: updateRecord,
  } = useApi(registroService.updateRecord.bind(registroService));

  const updateField = useCallback((field: keyof CreateRecordData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo si existe
    if (errors[field as keyof RecordValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: RecordValidationErrors = {};
    
    // Validar código
    if (!formData.codigo?.trim()) {
      newErrors.codigo = "El código es requerido";
    }

    // Validar longitud
    if (formData.longitud && formData.longitud <= 0) {
      newErrors.longitud = "La longitud debe ser mayor a 0";
    }

    // Validar años de vida útil
    if (formData.fv_anios && formData.fv_anios <= 0) {
      newErrors.fv_anios = "Los años de vida útil deben ser mayor a 0";
    }

    // Validar meses de vida útil
    if (formData.fv_meses && (formData.fv_meses < 0 || formData.fv_meses > 11)) {
      newErrors.fv_meses = "Los meses de vida útil deben estar entre 0 y 11";
    }

    // Validar fechas
    if (formData.fecha_instalacion && formData.fecha_caducidad) {
      const installDate = new Date(formData.fecha_instalacion);
      const expiryDate = new Date(formData.fecha_caducidad);
      
      if (installDate > expiryDate) {
        newErrors.fecha_caducidad = "La fecha de caducidad no puede ser anterior a la fecha de instalación";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleCreate = useCallback(async (): Promise<DataRecord | null> => {
    if (!validateForm()) {
      return null;
    }

    try {
      const result = await createRecord(formData);
      return result;
    } catch (error) {
      console.error("Error creating record:", error);
      return null;
    }
  }, [formData, validateForm, createRecord]);

  const handleUpdate = useCallback(async (id: string): Promise<DataRecord | null> => {
    if (!validateForm()) {
      return null;
    }

    try {
      const updateData: UpdateRecordData = { id, ...formData };
      const result = await updateRecord(id, formData);
      return result;
    } catch (error) {
      console.error("Error updating record:", error);
      return null;
    }
  }, [formData, validateForm, updateRecord]);

  const resetForm = useCallback(() => {
    setFormData({
      codigo: "",
      codigo_placa: "",
      cliente: "",
      equipo: "",
      fv_anios: undefined,
      fv_meses: undefined,
      fecha_instalacion: "",
      longitud: undefined,
      observaciones: "",
      seec: "",
      tipo_linea: "",
      ubicacion: "",
      anclaje_equipos: "",
      fecha_caducidad: "",
      estado_actual: "",
      ...initialData,
    });
    setErrors({});
  }, [initialData]);

  const setFormDataFromRecord = useCallback((record: DataRecord) => {
    setFormData({
      codigo: record.codigo,
      codigo_placa: record.codigo_placa || "",
      cliente: record.cliente || "",
      equipo: record.equipo || "",
      fv_anios: record.fv_anios,
      fv_meses: record.fv_meses,
      fecha_instalacion: record.fecha_instalacion || "",
      longitud: record.longitud,
      observaciones: record.observaciones || "",
      seec: record.seec || "",
      tipo_linea: record.tipo_linea || "",
      ubicacion: record.ubicacion || "",
      anclaje_equipos: record.anclaje_equipos || "",
      fecha_caducidad: record.fecha_caducidad || "",
      estado_actual: record.estado_actual || "",
    });
    setErrors({});
  }, []);

  return {
    // Datos del formulario
    formData,
    errors,
    
    // Estados de carga
    creating,
    updating,
    createError,
    updateError,
    
    // Acciones
    updateField,
    validateForm,
    handleCreate,
    handleUpdate,
    resetForm,
    setFormDataFromRecord,
  };
};
