import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useToast } from '../../../shared/components/ui/Toast';
import { ConfirmDeleteModal } from '../../../shared/components/ui/ConfirmDeleteModal';
import { useApi } from '../../../shared/hooks/useApi';
import { useModalClose } from '../../../shared/hooks/useModalClose';
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const modalRef = useModalClose({ isOpen, onClose });

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
    setShowConfirmDelete(false);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <>
      <div ref={modalRef} className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style={{ margin: 0 }}>
        <div className="w-full max-w-[min(85vw,_780px)] max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex items-start justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#18D043] to-[#16a34a] text-white text-2xl font-bold">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gestión de usuarios</p>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.nombre} {user.apellidos || ""}
                </h2>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-sm">
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="Usuario"
                  value={formData.usuario || ""}
                  onChange={(e) => handleChange("usuario", e.target.value)}
                  required
                  className="!py-2 text-[13px]"
                />
                <Input
                  label="Nombre"
                  value={formData.nombre || ""}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  required
                  className="!py-2 text-[13px]"
                />
                <Input
                  label="Apellidos"
                  value={formData.apellidos || ""}
                  onChange={(e) => handleChange("apellidos", e.target.value)}
                  className="!py-2 text-[13px]"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="!py-2 text-[13px]"
                />
                <Input
                  label="Teléfono"
                  value={formData.telefono || ""}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  className="!py-2 text-[13px]"
                />
                <Input
                  label="Cargo"
                  value={formData.cargo || ""}
                  onChange={(e) => handleChange("cargo", e.target.value)}
                  className="!py-2 text-[13px]"
                />
                <Input
                  label="Empresa"
                  value={formData.empresa || ""}
                  onChange={(e) => handleChange("empresa", e.target.value)}
                  required
                  className="!py-2 text-[13px]"
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
                  className="!py-2 text-[13px]"
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-sm">
                <Button
                  type="button"
                  variant="danger"
                  icon={Trash2}
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={deleting || updating}
                >
                  Eliminar usuario
                </Button>
                <div className="flex gap-2">
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
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar a este usuario?"
        itemName={user.nombre}
      />
    </>
  );
};
