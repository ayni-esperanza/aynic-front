import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Building,
  UserCheck,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useToast } from "../../../components/ui/Toast";
import { useApi } from "../../../hooks/useApi";
import {
  userService,
  type User,
  type CreateUserDto,
  type UpdateUserDto,
} from "../../../services/userService";

export const UsuariosForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { success, error: showError } = useToast();

  const isEditing = Boolean(id);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    usuario: "",
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    cargo: "",
    empresa: "",
    rol: "usuario" as User["rol"],
    contrasenia: "",
    confirmarContrasenia: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hook para cargar usuario (si se esta editando)
  const { loading: loadingUser, execute: loadUser } = useApi(
    userService.getUserById.bind(userService),
    {
      onSuccess: (user) => {
        setFormData({
          usuario: user.usuario,
          nombre: user.nombre,
          apellidos: user.apellidos || "",
          email: user.email,
          telefono: user.telefono || "",
          cargo: user.cargo || "",
          empresa: user.empresa,
          rol: user.rol,
          contrasenia: "",
          confirmarContrasenia: "",
        });
      },
      onError: (error) => {
        showError("Error al cargar usuario", error);
        navigate("/usuarios");
      },
    }
  );

  // Hook para crear usuario
  const { execute: createUser, loading: creating } = useApi(
    userService.createUser.bind(userService),
    {
      onSuccess: () => {
        success("Usuario creado exitosamente");
        navigate("/usuarios");
      },
      onError: (error) => showError("Error al crear usuario", error),
    }
  );

  // Hook para actualizar usuario
  const { execute: updateUser, loading: updating } = useApi(
    userService.updateUser.bind(userService),
    {
      onSuccess: () => {
        success("Usuario actualizado exitosamente");
        navigate("/usuarios");
      },
      onError: (error) => showError("Error al actualizar usuario", error),
    }
  );

  // Cargar usuario si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadUser(id);
    }
  }, [isEditing, id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones básicas
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

    // Validaciones de contraseña (solo para usuarios nuevos o si se está cambiando)
    if (!isEditing || formData.contrasenia) {
      if (!formData.contrasenia) {
        newErrors.contrasenia = "La contraseña es requerida";
      } else {
        const passwordErrors = userService.validatePassword(
          formData.contrasenia
        );
        if (passwordErrors.length > 0) {
          newErrors.contrasenia = passwordErrors[0];
        }
      }

      if (formData.contrasenia !== formData.confirmarContrasenia) {
        newErrors.confirmarContrasenia = "Las contraseñas no coinciden";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isEditing && id) {
      // Actualizar usuario
      const updateData: UpdateUserDto = {
        usuario: formData.usuario,
        nombre: formData.nombre,
        apellidos: formData.apellidos || undefined,
        email: formData.email,
        telefono: formData.telefono || undefined,
        cargo: formData.cargo || undefined,
        empresa: formData.empresa,
        rol: formData.rol,
      };

      // Solo incluir contraseña si se está cambiando
      if (formData.contrasenia) {
        updateData.contrasenia = formData.contrasenia;
      }

      await updateUser(id, updateData);
    } else {
      // Crear usuario
      const createData: CreateUserDto = {
        usuario: formData.usuario,
        nombre: formData.nombre,
        apellidos: formData.apellidos || undefined,
        email: formData.email,
        telefono: formData.telefono || undefined,
        cargo: formData.cargo || undefined,
        empresa: formData.empresa,
        rol: formData.rol,
        contrasenia: formData.contrasenia,
      };

      await createUser(createData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isSubmitting = creating || updating;

  if (isEditing && loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6 space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/usuarios")}
              icon={ArrowLeft}
              disabled={isSubmitting}
              className="border-gray-300 hover:bg-gray-50"
            >
              Volver
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl text-white">
                  {isEditing ? "✏️" : "➕"}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
                </h1>
                <p className="text-gray-600">
                  {isEditing
                    ? "Modifica los datos del usuario"
                    : "Completa el formulario para crear un nuevo usuario"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-white border-0 shadow-xl">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Información básica */}
            <div>
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Información Básica
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Usuario"
                  value={formData.usuario}
                  onChange={(e) => handleChange("usuario", e.target.value)}
                  error={errors.usuario}
                  placeholder="usuario123"
                  icon={User}
                  required
                  disabled={isSubmitting}
                />

                <Input
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  error={errors.nombre}
                  placeholder="Juan"
                  required
                  disabled={isSubmitting}
                />

                <Input
                  label="Apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleChange("apellidos", e.target.value)}
                  error={errors.apellidos}
                  placeholder="Pérez García"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Información de contacto y empresa */}
            <div>
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Información de Contacto y Empresa
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  error={errors.telefono}
                  placeholder="+1 234 567 890"
                  icon={Phone}
                  disabled={isSubmitting}
                />

                <Input
                  label="Cargo"
                  value={formData.cargo}
                  onChange={(e) => handleChange("cargo", e.target.value)}
                  error={errors.cargo}
                  placeholder="Desarrollador Senior"
                  disabled={isSubmitting}
                />

                <Input
                  label="Empresa"
                  value={formData.empresa}
                  onChange={(e) => handleChange("empresa", e.target.value)}
                  error={errors.empresa}
                  placeholder="Mi Empresa S.A."
                  icon={Building}
                  required
                  disabled={isSubmitting}
                />

                <Select
                  label="Rol"
                  value={formData.rol}
                  onChange={(e) => handleChange("rol", e.target.value)}
                  error={errors.rol}
                  options={[
                    { value: "usuario", label: "👤 Usuario" },
                    { value: "supervisor", label: "👨‍💼 Supervisor" },
                    { value: "admin", label: "👑 Administrador" },
                  ]}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Seguridad */}
            <div>
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                {isEditing ? "Cambiar Contraseña (Opcional)" : "Seguridad"}
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="relative">
                  <Input
                    label={isEditing ? "Nueva Contraseña" : "Contraseña"}
                    type={showPassword ? "text" : "password"}
                    value={formData.contrasenia}
                    onChange={(e) =>
                      handleChange("contrasenia", e.target.value)
                    }
                    error={errors.contrasenia}
                    placeholder="••••••••"
                    required={!isEditing}
                    disabled={isSubmitting}
                    helperText={
                      !isEditing
                        ? "Mínimo 6 caracteres, incluir mayúsculas, minúsculas y números"
                        : "Déjalo vacío si no quieres cambiarla"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 transition-colors duration-200 right-3 top-9 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirmar Contraseña"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmarContrasenia}
                    onChange={(e) =>
                      handleChange("confirmarContrasenia", e.target.value)
                    }
                    error={errors.confirmarContrasenia}
                    placeholder="••••••••"
                    required={!isEditing || Boolean(formData.contrasenia)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute text-gray-400 transition-colors duration-200 right-3 top-9 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end pt-8 space-x-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/usuarios")}
                disabled={isSubmitting}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                icon={Save}
                loading={isSubmitting}
                className="bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {isSubmitting
                  ? isEditing
                    ? "Actualizando..."
                    : "Creando..."
                  : isEditing
                  ? "Actualizar Usuario"
                  : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};