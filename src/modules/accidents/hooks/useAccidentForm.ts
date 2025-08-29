import { useState, useCallback } from "react";
import { useApi } from "../../../hooks/useApi";
import { accidentService } from "../services/accidentService";
import type { CreateAccidentDto, UpdateAccidentDto, Accident, AccidentValidationErrors } from "../types/accident";

export const useAccidentForm = (initialData?: Partial<CreateAccidentDto>) => {
  const [formData, setFormData] = useState<CreateAccidentDto>({
    linea_vida_id: "",
    fecha_accidente: "",
    descripcion: "",
    estado: "REPORTADO" as any,
    severidad: "LEVE" as any,
    lesiones: "",
    testigos: "",
    medidas_correctivas: "",
    fecha_investigacion: "",
    investigador: "",
    conclusiones: "",
    ...initialData,
  });

  const [errors, setErrors] = useState<AccidentValidationErrors>({});

  // Hook para crear accidente
  const {
    loading: creating,
    error: createError,
    execute: createAccident,
  } = useApi(accidentService.createAccident.bind(accidentService));

  // Hook para actualizar accidente
  const {
    loading: updating,
    error: updateError,
    execute: updateAccident,
  } = useApi(accidentService.updateAccident.bind(accidentService));

  const updateField = useCallback((field: keyof CreateAccidentDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo si existe
    if (errors[field as keyof AccidentValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: AccidentValidationErrors = {};
    
    // Validar descripción
    if (!formData.descripcion?.trim()) {
      newErrors.descripcion = "La descripción es requerida";
    }

    // Validar fecha del accidente
    if (!formData.fecha_accidente) {
      newErrors.fecha_accidente = "La fecha del accidente es requerida";
    }

    // Validar estado
    if (!formData.estado) {
      newErrors.estado = "El estado es requerido";
    }

    // Validar severidad
    if (!formData.severidad) {
      newErrors.severidad = "La severidad es requerida";
    }

    // Validar fechas
    if (formData.fecha_accidente && formData.fecha_investigacion) {
      const accidentDate = new Date(formData.fecha_accidente);
      const investigationDate = new Date(formData.fecha_investigacion);
      
      if (investigationDate < accidentDate) {
        newErrors.fecha_investigacion = "La fecha de investigación no puede ser anterior a la fecha del accidente";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleCreate = useCallback(async (): Promise<Accident | null> => {
    if (!validateForm()) {
      return null;
    }

    try {
      const result = await createAccident(formData);
      return result;
    } catch (error) {
      console.error("Error creating accident:", error);
      return null;
    }
  }, [formData, validateForm, createAccident]);

  const handleUpdate = useCallback(async (id: string): Promise<Accident | null> => {
    if (!validateForm()) {
      return null;
    }

    try {
      const result = await updateAccident(id, formData);
      return result;
    } catch (error) {
      console.error("Error updating accident:", error);
      return null;
    }
  }, [formData, validateForm, updateAccident]);

  const resetForm = useCallback(() => {
    setFormData({
      linea_vida_id: "",
      fecha_accidente: "",
      descripcion: "",
      estado: "REPORTADO" as any,
      severidad: "LEVE" as any,
      lesiones: "",
      testigos: "",
      medidas_correctivas: "",
      fecha_investigacion: "",
      investigador: "",
      conclusiones: "",
      ...initialData,
    });
    setErrors({});
  }, [initialData]);

  const setFormDataFromAccident = useCallback((accident: Accident) => {
    setFormData({
      linea_vida_id: accident.linea_vida_id || "",
      fecha_accidente: accident.fecha_accidente,
      descripcion: accident.descripcion,
      estado: accident.estado,
      severidad: accident.severidad,
      lesiones: accident.lesiones || "",
      testigos: accident.testigos || "",
      medidas_correctivas: accident.medidas_correctivas || "",
      fecha_investigacion: accident.fecha_investigacion || "",
      investigador: accident.investigador || "",
      conclusiones: accident.conclusiones || "",
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
    setFormDataFromAccident,
  };
};
