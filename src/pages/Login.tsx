import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, User, Lock, AlertCircle } from "lucide-react";
import { Button } from "../shared/components/ui/Button";
import { Input } from "../shared/components/ui/Input";
import { Card } from "../shared/components/ui/Card";
import { useToast } from "../shared/components/ui/Toast";
import { useAuthStore } from "../store/authStore";
import logoAyni from "../assets/images/logo_ayni.png";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated, clearError } = useAuthStore();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Limpiar error cuando el componente se monta
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "El usuario es requerido";
    } else if (formData.username.length < 3) {
      newErrors.username = "El usuario debe tener al menos 3 caracteres";
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 3) {
      newErrors.password = "La contraseña debe tener al menos 3 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await login(formData);
      success("Inicio de sesión exitoso", "Bienvenido al sistema");
      navigate("/");
    } catch (err) {
      // El error ya está manejado en el store
      console.error("Error en login:", err);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (error) clearError();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 shadow-lg rounded-2xl">
              <img
                src={logoAyni}
                alt="Logo Ayni"
                className="object-contain w-12 h-12"
                style={{ maxWidth: "90%", maxHeight: "90%" }}
              />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Bienvenido a AyniLine
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {/* Formulario de Login */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Error general de la API */}
            {error && (
              <div className="flex items-center p-3 space-x-2 text-red-700 border border-red-200 rounded-lg bg-red-50">
                <AlertCircle size={18} className="text-red-500" />
                <div>
                  <p className="text-xs font-medium">Error de autenticación</p>
                  <p className="text-xs">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="Usuario"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  error={errors.username}
                  placeholder="Ingresa tu usuario"
                  icon={User}
                  iconPosition="left"
                  className="pl-11 text-sm"
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={errors.password}
                  placeholder="Ingresa tu contraseña"
                  icon={Lock}
                  iconPosition="left"
                  className="pl-11 pr-11 text-sm"
                  required
                  disabled={loading}
                  style={
                    {
                      // Deshabilitar el icono nativo de Edge/IE para mostrar contraseña
                      msReveal: "none",
                    } as React.CSSProperties & { msReveal?: string }
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transition-colors duration-200 transform -translate-y-1/2 right-3 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 disabled:opacity-50"
                  disabled={loading}
                  style={{ top: "calc(50% + 0.75rem)" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              icon={LogIn}
              className="w-full bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              size="md"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Sistema de Gestión de Líneas de Vida © 2025
          </p>
          <div className="flex items-center justify-center mt-1 space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-600">
              {loading ? "Conectando..." : "Sistema en línea"}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            API: {import.meta.env.VITE_API_URL || "http://localhost:3000"}
          </p>
        </div>
      </div>
    </div>
  );
};