import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  ChevronDown,
  Settings,
  LogOut,
  AlertTriangle,
  Clock,
  Check,
  ExternalLink,
  BellRing,
  FileText,
  Menu,
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { useApi } from "../../../shared/hooks/useApi";
import { alertService, type Alert } from "../../../shared/services/alertService";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { formatDateTime } from "../../../shared/utils/formatters";

interface HeaderProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, isMobile = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const mountedRef = useRef(true);

  // Hook para cargar alertas recientes
  const { loading: loadingAlerts, execute: loadAlerts } = useApi(
    () =>
      alertService.getAlerts({
        leida: false, // Volver al filtro original
        limit: 10, // Reducir límite
        sortBy: "fecha_creada",
        sortOrder: "DESC",
      }),
    {
      onSuccess: (data) => {
        setAlerts(data.data);
        setUnreadCount(data.pagination.totalItems);
      },
      onError: (error) => {
        setAlerts([]);
        setUnreadCount(0);
      },
    }
  );

  // Hook para marcar alerta como leída
  const { execute: markAsRead } = useApi(
    async (...args: unknown[]) => {
      const id = args[0] as string;
      return alertService.markAsRead(id);
    },
    {
      onSuccess: () => {
        loadAlerts(); // Recargar alertas después de marcar como leída
      },
    }
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  useEffect(() => {
    mountedRef.current = true;
    loadAlerts();

    return () => {
      mountedRef.current = false;
    };
  }, []); // Solo cargar una vez al montar

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (alert: Alert) => {
    switch (alert.tipo) {
      case "critico":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "vencido":
        return <Clock className="w-4 h-4 text-red-500" />;
      case "por_vencer":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (alert: Alert) => {
    switch (alert.prioridad) {
      case "critical":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-300 bg-gray-50";
    }
  };

  const handleMarkAsRead = async (alertId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    await markAsRead(alertId);
  };

  const handleViewRecord = (recordId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/registro/detalle/${recordId}`);
    setShowNotifications(false);
  };

  const handleViewDashboard = () => {
    navigate("/");
    setShowNotifications(false);
  };

  // Determinar si mostrar opción de solicitudes (solo para administradores)
  const isAdmin = user?.rol === "admin";

  return (
    <header className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Logo/Título del sistema (izquierda) */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Botón de menú para móvil */}
          {isMobile && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Abrir menú"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-xs sm:text-sm font-bold text-white">⚡</span>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">AyniLine</h2>
              <p className="text-xs sm:text-sm text-gray-500">Sistema de Gestión</p>
            </div>
            <div className="block sm:hidden">
              <h2 className="text-base font-bold text-gray-900">AyniLine</h2>
            </div>
          </div>
        </div>

        {/* Área derecha con notificaciones y usuario */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notificaciones de Alertas */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 transition-all duration-200 rounded-lg hover:text-gray-600 hover:bg-gray-100 group"
              title="Alertas del sistema"
            >
              {unreadCount > 0 ? (
                <BellRing
                  size={20}
                  className="text-red-500 transition-transform duration-200 group-hover:scale-110"
                />
              ) : (
                <Bell
                  size={20}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
              )}

              {unreadCount > 0 && (
                <div className="absolute flex items-center justify-center w-5 h-5 bg-red-500 border-2 border-white rounded-full -top-1 -right-1 animate-pulse">
                  <span className="text-xs font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </div>
              )}
            </button>

            {/* Dropdown de alertas */}
            {showNotifications && (
              <div className="absolute right-0 z-50 mt-2 duration-200 transform bg-white border border-gray-200 shadow-xl w-72 sm:w-80 lg:w-96 rounded-xl animate-in slide-in-from-top-2 sm:right-0 -right-2 sm:-right-0">
                <div className="p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-[#18D043]/5 to-green-50">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center text-base sm:text-lg font-semibold text-gray-900">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#16a34a]" />
                      <span className="hidden sm:inline">Alertas Activas</span>
                      <span className="sm:hidden">Alertas</span>
                    </h3>
                    {alerts.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleViewDashboard}
                        className="text-[#16a34a] hover:text-[#15803d] text-xs hidden sm:inline-flex"
                      >
                        Ver dashboard
                      </Button>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <p className="mt-1 text-xs sm:text-sm text-gray-600">
                      {unreadCount} alerta{unreadCount !== 1 ? "s" : ""} sin
                      revisar
                    </p>
                  )}
                </div>

                <div className="overflow-y-auto max-h-64 sm:max-h-80">
                  {loadingAlerts ? (
                    <div className="flex items-center justify-center p-4 sm:p-6">
                      <LoadingSpinner size="sm" className="mr-2 sm:mr-3" />
                      <span className="text-sm sm:text-base text-gray-600">Cargando alertas...</span>
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="p-4 sm:p-6 text-center">
                      <Bell className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                      <p className="text-sm sm:text-base font-medium text-gray-500">
                        No hay alertas pendientes
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-gray-400">
                        Todas las alertas han sido revisadas
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 sm:p-4 border-l-4 transition-all duration-200 cursor-pointer hover:bg-gray-50 ${getNotificationColor(
                            alert
                          )}`}
                        >
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(alert)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                  <Badge
                                    variant={
                                      alert.prioridad === "critical"
                                        ? "danger"
                                        : alert.prioridad === "high"
                                          ? "warning"
                                          : "secondary"
                                    }
                                    size="sm"
                                  >
                                    <span className="text-xs">
                                      {alert.tipo.replace("_", " ").toUpperCase()}
                                    </span>
                                  </Badge>
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                                </div>
                              </div>

                              <p className="mb-1 text-xs sm:text-sm font-medium text-gray-900 line-clamp-2">
                                {alert.mensaje}
                              </p>

                              {alert.record && (
                                <div className="flex flex-col sm:flex-row sm:items-center mb-2 space-y-1 sm:space-y-0 sm:space-x-3 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <span className="mr-1">📋</span>
                                    <span className="truncate">{alert.record.codigo}</span>
                                  </span>
                                  <span className="flex items-center">
                                    <span className="mr-1">👤</span>
                                    <span className="truncate">{alert.record.cliente}</span>
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(alert.fecha_creada)}
                                </span>

                                <div className="flex items-center space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) =>
                                      handleMarkAsRead(alert.id, e)
                                    }
                                    className="h-5 sm:h-6 px-1.5 sm:px-2 py-1 text-xs"
                                    title="Marcar como leída"
                                  >
                                    <Check size={10} className="sm:w-3 sm:h-3" />
                                  </Button>

                                  {alert.record && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) =>
                                        handleViewRecord(alert.record!.id, e)
                                      }
                                      className="h-5 sm:h-6 px-1.5 sm:px-2 py-1 text-xs"
                                      title="Ver registro"
                                    >
                                      <ExternalLink size={10} className="sm:w-3 sm:h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {alerts.length > 0 && (
                  <div className="p-2 sm:p-3 border-t border-gray-100 bg-gray-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleViewDashboard}
                      className="w-full text-[#16a34a] hover:text-[#15803d] font-medium text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Ver todas las alertas en el dashboard</span>
                      <span className="sm:hidden">Ver dashboard</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Menú de usuario */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center p-2 space-x-3 transition-all duration-200 rounded-lg hover:bg-gray-100 group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                <User size={18} className="text-white" />
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.nombre || "Usuario Sistema"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.rol || "Usuario"}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Dropdown de usuario */}
            {showUserMenu && (
              <div className="absolute right-0 z-50 w-56 sm:w-64 mt-2 duration-200 transform bg-white border border-gray-200 shadow-xl rounded-xl animate-in slide-in-from-top-2">
                {/* Header del perfil */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#18D043]/5 to-green-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-full flex items-center justify-center shadow-md">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user?.nombre || "Usuario Sistema"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.email || "usuario@sistema.com"}
                      </p>
                      <div className="flex items-center mt-1 space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-green-600">
                          En línea
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opciones del menú */}
                <div className="py-2">
                  <button className="flex items-center w-full px-4 py-3 space-x-3 text-gray-700 transition-colors duration-200 hover:bg-gray-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Mi Perfil</p>
                      <p className="text-xs text-gray-500">
                        Ver y editar información
                      </p>
                    </div>
                  </button>

                  {/* Mostrar "Solicitudes" solo para administradores */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        navigate("/solicitudes");
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-3 space-x-3 text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50">
                        <FileText size={16} className="text-orange-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Solicitudes</p>
                        <p className="text-xs text-gray-500">
                          Gestionar autorizaciones
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Mostrar "Configuración" solo para usuarios no-admin */}
                  {!isAdmin && (
                    <button className="flex items-center w-full px-4 py-3 space-x-3 text-gray-700 transition-colors duration-200 hover:bg-gray-50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50">
                        <Settings size={16} className="text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Configuración</p>
                        <p className="text-xs text-gray-500">
                          Ajustes del sistema
                        </p>
                      </div>
                    </button>
                  )}

                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 space-x-3 text-red-600 transition-colors duration-200 hover:bg-red-50"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50">
                        <LogOut size={16} className="text-red-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">Cerrar Sesión</p>
                        <p className="text-xs text-red-400">
                          Salir del sistema
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
