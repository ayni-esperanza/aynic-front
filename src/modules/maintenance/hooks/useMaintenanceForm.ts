import { useState, useCallback } from "react";
import type { CreateMaintenanceDto } from "../types/maintenance";

interface UseMaintenanceFormOptions {
  initialData?: Partial<CreateMaintenanceDto>;
}

export const useMaintenanceForm = (options: UseMaintenanceFormOptions = {}) => {
  const { initialData = {} } = options;

  const [formData, setFormData] = useState<CreateMaintenanceDto>({
    record_id: initialData.record_id || 0,
    maintenance_date:
      initialData.maintenance_date || new Date().toISOString().split("T")[0],
    description: initialData.description || "",
    new_length_meters: initialData.new_length_meters,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(
    (field: keyof CreateMaintenanceDto, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Limpiar error del campo al modificarlo
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      record_id: 0,
      maintenance_date: new Date().toISOString().split("T")[0],
      description: "",
      new_length_meters: undefined,
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateField,
    setError,
    clearError,
    clearAllErrors,
    resetForm,
  };
};
