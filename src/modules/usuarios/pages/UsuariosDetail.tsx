import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Shield,
  Building,
  User as UserIcon,
  Crown,
  Users,
  UserCheck,
} from "lucide-react";
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../shared/components/ui/Toast';
import { useApi } from '../../../shared/hooks/useApi';
import { userService } from "../services/userService";
import type { FrontendUser } from "../services/userService";
import { formatDateTime } from '../../../shared/utils/formatters';

export const UsuariosDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { error: showError } = useToast();
  const [user, setUser] = useState<FrontendUser | null>(null);

  // Hook para cargar usuario
  const {
    loading,
    error,
    execute: loadUser,
  } = useApi(
    async (...args: unknown[]) => {
      const id = args[0] as string;
      return userService.getUserById(id);
    },
    {
      onSuccess: (userData) => {
        setUser(userData);
      },
      onError: (error) => {
        showError("Error al cargar usuario", error);
      },
    }
  );

  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]);

  const getRolConfig = (rol: FrontendUser["rol"]) => {
    const configs = {
      admin: {
        variant: "danger" as const,
        icon: Crown,
        color: "text-red-600",
        bgColor: "bg-red-100",
        label: "Administrador",
        description: "Acceso completo al sistema",
      },
      supervisor: {
        variant: "warning" as const,
        icon: UserCheck,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        label: "Supervisor",
        description: "Gestión de equipos y proyectos",
      },
      usuario: {
        variant: "secondary" as const,
        icon: Users,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        label: "Usuario",
        description: "Acceso básico al sistema",
      },
    };
    return configs[rol];
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md text-center shadow-xl">
          <div className="p-8">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <UserIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Usuario no encontrado
            </h3>
            <p className="mb-6 text-gray-600">
              {error || "El usuario que buscas no existe o ha sido eliminado."}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/usuarios")}
              icon={ArrowLeft}
              className="w-full"
            >
              Volver a Usuarios
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const rolConfig = getRolConfig(user.rol);
  const RolIcon = rolConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl px-3 py-4 mx-auto sm:px-6 sm:py-6 lg:px-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/usuarios")}
                icon={ArrowLeft}
                className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
              >
                Volver
              </Button>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-lg sm:text-2xl font-bold text-white">
                    {user.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Detalle del Usuario
                  </h1>
                  <p className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 text-sm sm:text-base text-gray-600">
                    <span>Información completa del usuario</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#18D043]/10 text-[#16a34a]">
                      @{user.usuario}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate(`/usuarios/editar/${user.id}`)}
              icon={Edit}
              className="w-full sm:w-auto bg-gradient-to-r from-[#18D043] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Editar Usuario
            </Button>
          </div>

          {/* Card principal con información destacada */}
          <Card className="mb-6 sm:mb-8 overflow-hidden bg-white border-0 shadow-xl">
            <div className="bg-gradient-to-r from-[#18D043] to-[#16a34a] p-4 sm:p-6 text-white">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl">
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      {user.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="mb-1 text-xl sm:text-2xl font-bold">
                      {user.nombre} {user.apellidos}
                    </h2>
                    <p className="text-base sm:text-lg text-green-100">@{user.usuario}</p>
                    <p className="text-xs sm:text-sm text-green-200">{user.email}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="flex items-center mb-2 space-x-3">
                    <RolIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <Badge
                      variant={rolConfig.variant}
                      size="md"
                      className="text-white bg-white/20 border-white/30"
                    >
                      {rolConfig.label}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-green-100">
                    Estado: {user.activo ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
            {/* Información Principal */}
            <div className="lg:col-span-2">
              <Card className="h-fit">
                <div className="p-4 sm:p-6">
                  <h3 className="mb-4 sm:mb-6 text-lg sm:text-xl font-semibold text-gray-900">
                    Información Personal
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                      {/* Información básica */}
                      <div className="space-y-4">
                        <div className="flex items-center p-3 sm:p-4 space-x-3 border border-blue-200 bg-blue-50 rounded-xl">
                          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg">
                            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-blue-600">
                              Usuario
                            </p>
                            <p className="font-mono text-base sm:text-lg font-bold text-blue-900">
                              {user.usuario}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center p-4 space-x-3 border border-green-200 bg-green-50 rounded-xl">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                            <UserIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-600">
                              Nombre
                            </p>
                            <p className="text-lg font-bold text-green-900">
                              {user.nombre}
                            </p>
                          </div>
                        </div>

                        {user.apellidos && (
                          <div className="flex items-center p-4 space-x-3 border border-purple-200 bg-purple-50 rounded-xl">
                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                              <UserIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-purple-600">
                                Apellidos
                              </p>
                              <p className="text-lg font-bold text-purple-900">
                                {user.apellidos}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Información de contacto */}
                      <div className="space-y-4">
                        <div className="flex items-center p-4 space-x-3 border border-indigo-200 bg-indigo-50 rounded-xl">
                          <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                            <Mail className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-600">
                              Email
                            </p>
                            <p className="text-lg font-bold text-indigo-900">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {user.telefono && (
                          <div className="flex items-center p-4 space-x-3 border border-orange-200 bg-orange-50 rounded-xl">
                            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                              <Phone className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-orange-600">
                                Teléfono
                              </p>
                              <p className="text-lg font-bold text-orange-900">
                                {user.telefono}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center p-4 space-x-3 border border-gray-200 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                            <Building className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Empresa
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {user.empresa}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información profesional */}
                    {user.cargo && (
                      <div className="pt-6 border-t border-gray-200">
                        <h4 className="mb-4 text-lg font-semibold text-gray-900">
                          Información Profesional
                        </h4>
                        <div className="flex items-center p-4 space-x-3 border border-yellow-200 bg-yellow-50 rounded-xl">
                          <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                            <Shield className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-yellow-600">
                              Cargo
                            </p>
                            <p className="text-lg font-bold text-yellow-900">
                              {user.cargo}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Panel Lateral */}
            <div className="space-y-4 sm:space-y-6">
              {/* Información del rol */}
              <Card>
                <div className="p-4 sm:p-6">
                  <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900">
                    Rol y Permisos
                  </h3>
                  <div
                    className={`p-4 rounded-xl border ${rolConfig.bgColor
                      .replace("bg-", "border-")
                      .replace("100", "200")}`}
                  >
                    <div className="flex items-center mb-3 space-x-3">
                      <div
                        className={`w-12 h-12 ${rolConfig.bgColor} rounded-full flex items-center justify-center`}
                      >
                        <RolIcon className={`w-6 h-6 ${rolConfig.color}`} />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${rolConfig.color}`}>
                          {rolConfig.label}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {rolConfig.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={rolConfig.variant}
                      className="justify-center w-full"
                    >
                      {rolConfig.label}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Estado del usuario */}
              <Card>
                <div className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Estado de la Cuenta
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estado</span>
                      <Badge variant={user.activo ? "success" : "secondary"}>
                        {user.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Nivel de Acceso
                      </span>
                      <Badge variant={rolConfig.variant}>{rolConfig.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Fecha de Creación
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDateTime(user.fecha_creacion)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Estadísticas */}
              <Card>
                <div className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Estadísticas
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                      <span className="font-medium text-blue-600">
                        Tiempo en el sistema
                      </span>
                      <span className="font-semibold text-blue-900">
                        {(() => {
                          const days = Math.floor(
                            (new Date().getTime() -
                              user.fecha_creacion.getTime()) /
                            (1000 * 60 * 60 * 24)
                          );
                          return `${days} días`;
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <span className="font-medium text-green-600">
                        Estado actual
                      </span>
                      <Badge variant={user.activo ? "success" : "secondary"}>
                        {user.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                      <span className="font-medium text-purple-600">
                        Última actualización
                      </span>
                      <span className="font-semibold text-purple-900">Hoy</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Acciones rápidas */}
              <Card>
                <div className="p-4 sm:p-6">
                  <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900">
                    Acciones Rápidas
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start w-full"
                      onClick={() => navigate(`/usuarios/editar/${user.id}`)}
                      icon={Edit}
                    >
                      Editar Usuario
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start w-full"
                      onClick={() => window.open(`mailto:${user.email}`)}
                      icon={Mail}
                    >
                      Enviar Email
                    </Button>
                    {user.telefono && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start w-full"
                        onClick={() => window.open(`tel:${user.telefono}`)}
                        icon={Phone}
                      >
                        Llamar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
