import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { User, Building, Mail, Phone, Shield } from "lucide-react";

interface UserFormData {
  usuario: string;
  nombre: string;
  apellidos?: string;
  email: string;
  telefono?: string;
  cargo?: string;
  empresa: string;
  rol: "admin" | "supervisor" | "usuario";
}

interface UserFormProps {
  initialData?: UserFormData;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    usuario: initialData?.usuario || "",
    nombre: initialData?.nombre || "",
    apellidos: initialData?.apellidos || "",
    email: initialData?.email || "",
    telefono: initialData?.telefono || "",
    cargo: initialData?.cargo || "",
    empresa: initialData?.empresa || "",
    rol: initialData?.rol || "usuario",
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.usuario.trim()) {
      newErrors.usuario = "El usuario es requerido";
    } else if (formData.usuario.length < 3) {
      newErrors.usuario = "El usuario debe tener al menos 3 caracteres";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Información Básica
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Usuario"
            value={formData.usuario}
            onChange={(e) => handleChange("usuario", e.target.value)}
            error={errors.usuario}
            placeholder="usuario123"
            icon={User}
            required
          />

          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            error={errors.nombre}
            placeholder="Juan"
            required
          />

          <Input
            label="Apellidos"
            value={formData.apellidos || ""}
            onChange={(e) => handleChange("apellidos", e.target.value)}
            error={errors.apellidos}
            placeholder="Pérez García"
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
            placeholder="usuario@empresa.com"
            icon={Mail}
            required
          />
        </div>
      </div>

      {/* Información de contacto y empresa */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Información de Contacto y Empresa
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Teléfono"
            value={formData.telefono || ""}
            onChange={(e) => handleChange("telefono", e.target.value)}
            error={errors.telefono}
            placeholder="+1 234 567 890"
            icon={Phone}
          />

          <Input
            label="Cargo"
            value={formData.cargo || ""}
            onChange={(e) => handleChange("cargo", e.target.value)}
            error={errors.cargo}
            placeholder="Electricidad"
          />

          <Input
            label="Empresa"
            value={formData.empresa}
            onChange={(e) => handleChange("empresa", e.target.value)}
            error={errors.empresa}
            placeholder="Mi Empresa S.A."
            icon={Building}
            required
          />

          <Select
            label="Rol"
            value={formData.rol}
            onChange={(e) =>
              handleChange("rol", e.target.value as UserFormData["rol"])
            }
            options={[
              { value: "usuario", label: "👤 Usuario" },
              { value: "supervisor", label: "👨‍💼 Supervisor" },
              { value: "admin", label: "👑 Administrador" },
            ]}
            required
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end pt-6 space-x-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? "Actualizar" : "Crear"} Usuario
        </Button>
      </div>
    </form>
  );
};