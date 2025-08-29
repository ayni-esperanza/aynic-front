import { useState, useCallback } from "react";
import { useApi } from '../../../shared/hooks/useApi';
import { userService } from "../services/userService";
import type { UserFormData, UserValidationErrors, CreateUserDto, UpdateUserDto } from "../types";

export const useUserForm = (initialData?: Partial<UserFormData> & { id?: string }) => {
  const [formData, setFormData] = useState<UserFormData>({
    usuario: "",
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    cargo: "",
    empresa: "",
    rol: "usuario",
    contrasenia: "",
    confirmarContrasenia: "",
    ...initialData,
  });

  const [errors, setErrors] = useState<UserValidationErrors>({});

  // Hook para crear usuario
  const {
    loading: creating,
    error: createError,
    execute: createUser,
  } = useApi(async (...args: unknown[]) => {
    const userData = args[0] as CreateUserDto;
    return userService.createUser(userData);
  });

  // Hook para actualizar usuario
  const {
    loading: updating,
    error: updateError,
    execute: updateUser,
  } = useApi(async (...args: unknown[]) => {
    const id = args[0] as string;
    const userData = args[1] as UpdateUserDto;
    return userService.updateUser(id, userData);
  });

  // Hook para obtener usuario por ID
  const {
    loading: loadingUser,
    error: loadError,
    execute: loadUser,
  } = useApi(async (...args: unknown[]) => {
    const id = args[0] as string;
    return userService.getUserById(id);
  });

  const updateField = useCallback((field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: UserValidationErrors = {};

    // Validar campos requeridos
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.usuario.trim()) {
      newErrors.usuario = "El usuario es requerido";
    } else if (formData.usuario.length < 3) {
      newErrors.usuario = "El usuario debe tener al menos 3 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.empresa.trim()) {
      newErrors.empresa = "La empresa es requerida";
    }

    // Validar teléfono si se proporciona
    if (formData.telefono?.trim()) {
      if (!/^\+?[\d\s-()]+$/.test(formData.telefono)) {
        newErrors.telefono = "El teléfono no es válido";
      }
    }

    // Validar contraseña si se está creando un usuario nuevo
    if (!initialData?.id && !formData.contrasenia) {
      newErrors.contrasenia = "La contraseña es requerida";
    } else if (formData.contrasenia && formData.contrasenia.length < 6) {
      newErrors.contrasenia = "La contraseña debe tener al menos 6 caracteres";
    }

    // Validar confirmación de contraseña
    if (formData.contrasenia && formData.contrasenia !== formData.confirmarContrasenia) {
      newErrors.confirmarContrasenia = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, initialData?.id]);

  const handleSubmit = useCallback(async (userId?: string) => {
    if (!validateForm()) {
      return false;
    }

    try {
      const userData: CreateUserDto | UpdateUserDto = {
        usuario: formData.usuario,
        nombre: formData.nombre,
        apellidos: formData.apellidos || undefined,
        email: formData.email,
        telefono: formData.telefono || undefined,
        cargo: formData.cargo || undefined,
        empresa: formData.empresa,
        rol: formData.rol,
        ...(formData.contrasenia && { contrasenia: formData.contrasenia }),
      };

      if (userId) {
        // Actualizar usuario existente
        await updateUser(userId, userData as UpdateUserDto);
      } else {
        // Crear nuevo usuario
        await createUser(userData as CreateUserDto);
      }

      return true;
    } catch (error) {
      console.error("Error submitting form:", error);
      return false;
    }
  }, [formData, validateForm, createUser, updateUser]);

  const loadUserData = useCallback(async (userId: string) => {
    try {
      await loadUser(userId);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [loadUser]);

  const resetForm = useCallback(() => {
    setFormData({
      usuario: "",
      nombre: "",
      apellidos: "",
      email: "",
      telefono: "",
      cargo: "",
      empresa: "",
      rol: "usuario",
      contrasenia: "",
      confirmarContrasenia: "",
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
    loadingUser,
    createError,
    updateError,
    loadError,
    
    // Acciones
    updateField,
    validateForm,
    handleSubmit,
    loadUserData,
    resetForm,
  };
};
