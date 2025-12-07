import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useToast } from '../../../shared/components/ui/Toast';
import { useApi } from '../../../shared/hooks/useApi';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import { userService, type CreateUserFrontendDto } from "../services/userService";

type UserRole = "admin" | "supervisor" | "usuario";

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const createDefaultForm = (): CreateUserFrontendDto & { confirmarContrasenia: string } => ({
  usuario: "",
  nombre: "",
  apellidos: "",
  email: "",
  telefono: "",
  cargo: "",
  empresa: "",
  rol: "usuario" as UserRole,
  contrasenia: "",
  confirmarContrasenia: "",
});

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState(createDefaultForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const modalRef = useModalClose({ isOpen, onClose });

  const { execute: createUser, loading } = useApi(
    async (...args: unknown[]) => {
      const payload = args[0] as CreateUserFrontendDto;
      return userService.createUser(payload);
    },
    {
      onSuccess: () => {
        success("Usuario creado exitosamente");
        setFormData(createDefaultForm());
        setErrors({});
        onCreated?.();
        onClose();
      },
      onError: (err) => {
        error("Error al crear usuario", err);
      },
    }
  );

  if (!isOpen) return null;

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.usuario.trim()) {
      newErrors.usuario = "El usuario es requerido";
    } else if (formData.usuario.length < 3) {
      newErrors.usuario = "Debe tener al menos 3 caracteres";
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.empresa.trim()) {
      newErrors.empresa = "La empresa es requerida";
    }

    if (formData.telefono && !/^\+?[\d\s-()]+$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono no es válido";
    }

    if (!formData.contrasenia) {
      newErrors.contrasenia = "La contraseña es requerida";
    } else {
      if (formData.contrasenia.length < 6) {
        newErrors.contrasenia = "Al menos 6 caracteres";
      } else if (!/(?=.*[a-z])/.test(formData.contrasenia)) {
        newErrors.contrasenia = "Incluye minúsculas";
      } else if (!/(?=.*[A-Z])/.test(formData.contrasenia)) {
        newErrors.contrasenia = "Incluye mayúsculas";
      } else if (!/(?=.*\d)/.test(formData.contrasenia)) {
        newErrors.contrasenia = "Incluye números";
      }
    }

    if (formData.contrasenia !== formData.confirmarContrasenia) {
      newErrors.confirmarContrasenia = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload: CreateUserFrontendDto = {
      usuario: formData.usuario.trim(),
      nombre: formData.nombre.trim(),
      apellidos: formData.apellidos?.trim() || undefined,
      email: formData.email.trim(),
      telefono: formData.telefono?.trim() || undefined,
      cargo: formData.cargo?.trim() || undefined,
      empresa: formData.empresa.trim(),
      rol: formData.rol as UserRole,
      contrasenia: formData.contrasenia,
    };

    await createUser(payload);
  };

  const closeModal = () => {
    if (loading) return;
    setFormData(createDefaultForm());
    setErrors({});
    onClose();
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[min(85vw,_780px)] max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#18D043] uppercase">Gestión de usuarios</p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo usuario</h2>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Usuario"
              value={formData.usuario}
              onChange={(e) => handleChange("usuario", e.target.value)}
              required
              error={errors.usuario}
              className="!py-2 text-[13px]"
            />
            <Input
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              required
              error={errors.nombre}
              className="!py-2 text-[13px]"
            />
            <Input
              label="Apellidos"
              value={formData.apellidos}
              onChange={(e) => handleChange("apellidos", e.target.value)}
              error={errors.apellidos}
              className="!py-2 text-[13px]"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              error={errors.email}
              className="!py-2 text-[13px]"
            />
            <Input
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              error={errors.telefono}
              placeholder="Opcional"
              className="!py-2 text-[13px]"
            />
            <Input
              label="Cargo"
              value={formData.cargo}
              onChange={(e) => handleChange("cargo", e.target.value)}
              error={errors.cargo}
              placeholder="Opcional"
              className="!py-2 text-[13px]"
            />
            <Input
              label="Empresa"
              value={formData.empresa}
              onChange={(e) => handleChange("empresa", e.target.value)}
              required
              error={errors.empresa}
              className="!py-2 text-[13px]"
            />
            <Select
              label="Rol"
              value={formData.rol}
              onChange={(e) => handleChange("rol", e.target.value as UserRole)}
              options={[
                { value: "usuario", label: "Usuario" },
                { value: "supervisor", label: "Supervisor" },
                { value: "admin", label: "Administrador" },
              ]}
              required
              className="!py-2 text-[13px]"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Contraseña"
              type="password"
              value={formData.contrasenia}
              onChange={(e) => handleChange("contrasenia", e.target.value)}
              required
              error={errors.contrasenia}
              className="!py-2 text-[13px]"
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              value={formData.confirmarContrasenia}
              onChange={(e) => handleChange("confirmarContrasenia", e.target.value)}
              required
              error={errors.confirmarContrasenia}
              className="!py-2 text-[13px]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1 text-sm">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Crear usuario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
