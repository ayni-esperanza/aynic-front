import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, User, Lock } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { useToast } from "../components/ui/Toast";
import { useAuthStore } from "../store/authStore";
import logoAyni from "../assets/images/logo_ayni.png";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    usuario: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.usuario.trim()) {
      newErrors.usuario = "El usuario es requerido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simular validación de credenciales
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Credenciales de demo
      const validCredentials = [
        {
          usuario: "admin",
          password: "admin123",
          nombre: "Administrador",
          rol: "admin",
        },
        {
          usuario: "supervisor",
          password: "super123",
          nombre: "Supervisor",
          rol: "supervisor",
        },
        {
          usuario: "usuario",
          password: "user123",
          nombre: "Usuario",
          rol: "usuario",
        },
      ];

      const user = validCredentials.find(
        (cred) =>
          cred.usuario === formData.usuario &&
          cred.password === formData.password
      );

      if (user) {
        login({
          id: "1",
          nombre: user.nombre,
          email: `${user.usuario}@sistema.com`,
          rol: user.rol as "admin" | "supervisor" | "usuario",
          fecha_creacion: new Date(),
          activo: true,
        });

        success("Inicio de sesión exitoso", `Bienvenido ${user.nombre}`);
        navigate("/");
      } else {
        error("Credenciales inválidas", "Usuario o contraseña incorrectos");
      }
    } catch (err) {
      error("Error de conexión", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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
            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="Usuario"
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => handleChange("usuario", e.target.value)}
                  error={errors.usuario}
                  placeholder="Ingresa tu usuario"
                  icon={User}
                  iconPosition="left"
                  className="pl-11"
                  required
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transition-colors duration-200 right-3 top-9 hover:text-gray-600"
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
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            {/* Credenciales de demo */}
            <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <h4 className="flex items-center mb-2 text-sm font-semibold text-blue-900">
                <span className="mr-2">🔑</span>
                Credenciales de Demo
              </h4>
              <div className="space-y-2 text-xs text-blue-700">
                <div className="flex justify-between">
                  <span className="font-medium">Admin:</span>
                  <span className="font-mono">admin / admin123</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Supervisor:</span>
                  <span className="font-mono">supervisor / super123</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Usuario:</span>
                  <span className="font-mono">usuario / user123</span>
                </div>
              </div>
            </div>
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
              Sistema en línea
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};