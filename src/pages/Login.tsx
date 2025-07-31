import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, User, Lock, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/Toast";
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
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-white shadow-lg rounded-2xl">
              <img
                src={logoAyni}
                alt="Logo Ayni"
                className="object-contain w-16 h-16"
                style={{ maxWidth: "90%", maxHeight: "90%" }}
              />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Bienvenido a AyniLine
          </h1>
          <p className="text-gray-600">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {/* Formulario de Login */}
        <Card className="bg-white border-0 shadow-xl">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error general de la API */}
            {error && (
              <div className="flex items-center p-4 space-x-3 text-red-700 border border-red-200 rounded-lg bg-red-50">
                <AlertCircle size={20} className="text-red-500" />
                <div>
                  <p className="text-sm font-medium">Error de autenticación</p>
                  <p className="text-sm">{error}</p>
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
                  className="pl-11"
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
                  className="pl-11 pr-11"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transition-colors duration-200 right-3 top-9 hover:text-gray-600 disabled:opacity-50"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              icon={LogIn}
              className="w-full bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              size="lg"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Sistema de Gestión de Líneas de Vida © 2025
          </p>
          <div className="flex items-center justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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