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
  Calendar,
  Check,
  ExternalLink,
  BellRing,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useApi } from "../../hooks/useApi";
import { alertService, type Alert } from "../../services/alertService";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { formatDateTime } from "../../utils/formatters";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Hook para cargar alertas recientes
  const { loading: loadingAlerts, execute: loadAlerts } = useApi(
    () =>
      alertService.getAlerts({
        leida: false,
        limit: 10,
        sortBy: "fecha_creada",
        sortOrder: "DESC",
      }),
    {
      onSuccess: (data) => {
        setAlerts(data.data);
        setUnreadCount(data.pagination.totalItems);
      },
      onError: (error) => {
        console.error("Error loading alerts:", error);
      },
    }
  );

  // Hook para marcar alerta como leída
  const { execute: markAsRead } = useApi(
    alertService.markAsRead.bind(alertService),
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

  // Cargar alertas al montar el componente
  const loadAlertsStable = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const data = await alertService.getAlerts({
        leida: false,
        limit: 10,
        sortBy: "fecha_creada",
        sortOrder: "DESC",
      });

      if (mountedRef.current) {
        setAlerts(data.data);
        setUnreadCount(data.pagination.totalItems);
      }
    } catch (error) {
      if (mountedRef.current) {
        console.error("Error loading alerts:", error);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Cargar alertas inicial
    loadAlertsStable();

    // Configurar intervalo con cleanup
    intervalRef.current = setInterval(() => {
      if (mountedRef.current && document.visibilityState === "visible") {
        loadAlertsStable();
      }
    }, 10 * 60 * 1000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadAlertsStable]);

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

  return (
    <header className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Logo/Título del sistema (izquierda) */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">⚡</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">AyniLine</h2>
              <p className="text-xs text-gray-500">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        {/* Área derecha con notificaciones y usuario */}
        <div className="flex items-center space-x-4">
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
              <div className="absolute right-0 z-50 mt-2 duration-200 transform bg-white border border-gray-200 shadow-xl w-96 rounded-xl animate-in slide-in-from-top-2">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#18D043]/5 to-green-50">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center text-lg font-semibold text-gray-900">
                      <AlertTriangle className="w-5 h-5 mr-2 text-[#16a34a]" />
                      Alertas Activas
                    </h3>
                    {alerts.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleViewDashboard}
                        className="text-[#16a34a] hover:text-[#15803d] text-xs"
                      >
                        Ver dashboard
                      </Button>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <p className="mt-1 text-sm text-gray-600">
                      {unreadCount} alerta{unreadCount !== 1 ? "s" : ""} sin
                      revisar
                    </p>
                  )}
                </div>

                <div className="overflow-y-auto max-h-80">
                  {loadingAlerts ? (
                    <div className="flex items-center justify-center p-6">
                      <LoadingSpinner size="sm" className="mr-3" />
                      <span className="text-gray-600">Cargando alertas...</span>
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium text-gray-500">
                        No hay alertas pendientes
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        Todas las alertas han sido revisadas
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 border-l-4 transition-all duration-200 cursor-pointer hover:bg-gray-50 ${getNotificationColor(
                            alert
                          )}`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(alert)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
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
                                    {alert.tipo.replace("_", " ").toUpperCase()}
                                  </Badge>
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                </div>
                              </div>

                              <p className="mb-1 text-sm font-medium text-gray-900 line-clamp-2">
                                {alert.mensaje}
                              </p>

                              {alert.record && (
                                <div className="flex items-center mb-2 space-x-3 text-xs text-gray-500">
                                  <span>📋 {alert.record.codigo}</span>
                                  <span>👤 {alert.record.cliente}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
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
                                    className="h-6 px-2 py-1 text-xs"
                                    title="Marcar como leída"
                                  >
                                    <Check size={12} />
                                  </Button>

                                  {alert.record && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) =>
                                        handleViewRecord(alert.record!.id, e)
                                      }
                                      className="h-6 px-2 py-1 text-xs"
                                      title="Ver registro"
                                    >
                                      <ExternalLink size={12} />
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
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleViewDashboard}
                      className="w-full text-[#16a34a] hover:text-[#15803d] font-medium"
                    >
                      Ver todas las alertas en el dashboard
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
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.nombre || "Usuario Sistema"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.rol || "Usuario"}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown de usuario */}
            {showUserMenu && (
              <div className="absolute right-0 z-50 w-64 mt-2 duration-200 transform bg-white border border-gray-200 shadow-xl rounded-xl animate-in slide-in-from-top-2">
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