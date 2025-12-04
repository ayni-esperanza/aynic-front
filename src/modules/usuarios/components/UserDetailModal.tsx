import React, { useEffect, useMemo, useState } from "react";
import { X, Trash2, UserCircle } from "lucide-react";
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { Badge } from '../../../shared/components/ui/Badge';
import { useToast } from '../../../shared/components/ui/Toast';
import { useApi } from '../../../shared/hooks/useApi';
import { userService, type FrontendUser, type UpdateUserFrontendDto } from "../services/userService";

interface UserDetailModalProps {
  user: FrontendUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  onDelete: (userId: string, userName: string) => Promise<void> | void;
  deleting?: boolean;
}

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "supervisor", label: "Supervisor" },
  { value: "usuario", label: "Usuario" },
] as const;

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdated,
  onDelete,
  deleting = false,
}) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState<UpdateUserFrontendDto>({});

  const {
    execute: updateUser,
    loading: updating,
  } = useApi(
    async (...args: unknown[]) => {
      const id = args[0] as string;
      const payload = args[1] as UpdateUserFrontendDto;
      return userService.updateUser(id, payload);
    },
    {
      onSuccess: () => {
        success("Usuario actualizado exitosamente");
        onUpdated?.();
      },
      onError: (err) => {
        error("Error al actualizar usuario", err);
      },
    }
  );

  useEffect(() => {
    if (user) {
      setFormData({
        usuario: user.usuario,
        nombre: user.nombre,
        apellidos: user.apellidos || "",
        email: user.email,
        telefono: user.telefono || "",
        cargo: user.cargo || "",
        empresa: user.empresa,
        rol: user.rol,
      });
    }
  }, [user]);

  const handleChange = (field: keyof UpdateUserFrontendDto, value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload: UpdateUserFrontendDto = {
      usuario: formData.usuario?.trim() || undefined,
      nombre: formData.nombre?.trim() || undefined,
      apellidos: formData.apellidos?.trim() || undefined,
      email: formData.email?.trim() || undefined,
      telefono: formData.telefono?.trim() || undefined,
      cargo: formData.cargo?.trim() || undefined,
      empresa: formData.empresa?.trim() || undefined,
      rol: formData.rol,
    };

    await updateUser(user.id, payload);
  };

  const handleDelete = async () => {
    if (!user) return;
    await onDelete(user.id, user.nombre);
    onClose();
  };

  const rolBadge = useMemo(() => {
    if (!user) return null;
    const variants: Record<FrontendUser["rol"], "danger" | "warning" | "secondary"> = {
      admin: "danger",
      supervisor: "warning",
      usuario: "secondary",
    };
    const labels: Record<FrontendUser["rol"], string> = {
      admin: "Administrador",
      supervisor: "Supervisor",
      usuario: "Usuario",
    };
    return <Badge variant={variants[user.rol]}>{labels[user.rol]}</Badge>;
  }, [user]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#18D043] to-[#16a34a] text-white text-2xl font-bold">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gestión de usuarios</p>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.nombre} {user.apellidos || ""}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user.usuario}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <UserCircle size={18} className="text-[#18D043]" />
              {rolBadge}
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800">
                {user.email}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Usuario"
                value={formData.usuario || ""}
                onChange={(e) => handleChange("usuario", e.target.value)}
                required
              />
              <Input
                label="Nombre"
                value={formData.nombre || ""}
                onChange={(e) => handleChange("nombre", e.target.value)}
                required
              />
              <Input
                label="Apellidos"
                value={formData.apellidos || ""}
                onChange={(e) => handleChange("apellidos", e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
              <Input
                label="Teléfono"
                value={formData.telefono || ""}
                onChange={(e) => handleChange("telefono", e.target.value)}
              />
              <Input
                label="Cargo"
                value={formData.cargo || ""}
                onChange={(e) => handleChange("cargo", e.target.value)}
              />
              <Input
                label="Empresa"
                value={formData.empresa || ""}
                onChange={(e) => handleChange("empresa", e.target.value)}
                required
              />
              <Select
                label="Rol"
                value={formData.rol || "usuario"}
                onChange={(e) => handleChange("rol", e.target.value as UpdateUserFrontendDto["rol"])}
                options={roleOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (!user) return;
                  setFormData({
                    usuario: user.usuario,
                    nombre: user.nombre,
                    apellidos: user.apellidos || "",
                    email: user.email,
                    telefono: user.telefono || "",
                    cargo: user.cargo || "",
                    empresa: user.empresa,
                    rol: user.rol,
                  });
                }}
                className="text-sm"
              >
                Restablecer
              </Button>
              <Button type="submit" loading={updating} className="text-sm">
                Guardar cambios
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              variant="danger"
              icon={Trash2}
              onClick={handleDelete}
              disabled={deleting || updating}
            >
              Eliminar usuario
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
