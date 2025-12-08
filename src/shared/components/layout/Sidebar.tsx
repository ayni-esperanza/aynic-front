import React, { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logoAyni from "../../../assets/images/logo_ayni.png";
import {
  LayoutDashboard,
  Database,
  Users,
  History,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Bell,
  BellRing,
  User,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Check,
  ExternalLink,
  FileText,
  Clock,
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { useThemeStore } from "../../../store/themeStore";
import { useApi } from "../../../shared/hooks/useApi";
import { alertService, type Alert } from "../../../shared/services/alertService";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { formatDateTime } from "../../../shared/utils/formatters";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    path: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
    description: "Panel principal",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
    activeColor: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
  {
    path: "/registro",
    icon: Database,
    label: "Registros",
    description: "Gestión de registros",
    color: "text-[#16a34a]",
    bgColor: "bg-green-50",
    hoverColor: "hover:bg-green-100",
    activeColor: "bg-gradient-to-r from-[#18D043] to-[#16a34a]",
  },
  {
    path: "/mantenimiento",
    icon: Settings,
    label: "Mantenimiento",
    description: "Gestión de mantenimientos",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    hoverColor: "hover:bg-indigo-100",
    activeColor: "bg-gradient-to-r from-indigo-500 to-indigo-600",
  },
  {
    path: "/accidentes",
    icon: AlertTriangle,
    label: "Accidentes",
    description: "Gestión de incidentes",
    color: "text-red-600",
    bgColor: "bg-red-50",
    hoverColor: "hover:bg-red-100",
    activeColor: "bg-gradient-to-r from-red-500 to-red-600",
  },
  {
    path: "/ordenes-compra",
    icon: ShoppingCart,
    label: "Órdenes de Compra",
    description: "Gestión de compras",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    hoverColor: "hover:bg-teal-100",
    activeColor: "bg-gradient-to-r from-teal-500 to-teal-600",
  },
  {
    path: "/historial",
    icon: History,
    label: "Historial",
    description: "Registro de cambios",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverColor: "hover:bg-orange-100",
    activeColor: "bg-gradient-to-r from-orange-500 to-orange-600",
  },
  {
    path: "/usuarios",
    icon: Users,
    label: "Usuarios",
    description: "Administrar usuarios",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100",
    activeColor: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
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
    async (...args: unknown[]) => {
      const id = args[0] as string;
      return alertService.markAsRead(id);
    },
    {
      onSuccess: () => {
        loadAlerts();
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
    loadAlertsStable();

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
        return "border-l-red-500 bg-red-50 dark:bg-red-900/20";
      case "high":
        return "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      case "low":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20";
      default:
        return "border-l-gray-300 bg-gray-50 dark:bg-gray-800";
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

  const isAdmin = user?.rol === "admin";

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col shadow-lg ${
        isCollapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Header compacto */}
      <div className="flex items-center justify-between p-2.5 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed ? (
          <>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">
              AyniLine
            </h1>
            <button
              onClick={onToggle}
              className="p-1.5 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              title="Contraer sidebar"
            >
              <ChevronLeft
                size={18}
                className="text-gray-600 dark:text-gray-400 group-hover:text-[#16a34a] dark:group-hover:text-[#18D043] transition-colors duration-200"
              />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="p-1.5 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group mx-auto"
            title="Expandir sidebar"
          >
            <ChevronRight
              size={18}
              className="text-gray-600 dark:text-gray-400 group-hover:text-[#16a34a] dark:group-hover:text-[#18D043] transition-colors duration-200"
            />
          </button>
        )}
      </div>
      
      {/* Logo debajo del botón cuando está colapsado */}
      {isCollapsed && (
        <div className="flex items-center justify-center p-2 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden">
            <img
              src={logoAyni}
              alt="Ayni Logo"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Navigation principal */}
      <nav className="flex-1 p-1.5 space-y-1 overflow-y-auto">
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center px-2.5 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? `${item.activeColor} text-white shadow-md`
                      : `text-gray-700 dark:text-gray-300 ${item.hoverColor} dark:hover:bg-gray-700`
                  } ${isCollapsed ? "justify-center" : ""}`
                }
                title={isCollapsed ? item.label : ""}
              >
                {({ isActive }) => (
                  <>
                    <div className={`${isCollapsed ? "" : "mr-2.5"}`}>
                      <Icon
                        size={18}
                        className={`transition-all duration-200 ${
                          isActive ? "text-white" : `${item.color} dark:brightness-125`
                        }`}
                      />
                    </div>
                    {!isCollapsed && (
                      <span
                        className={`font-medium text-sm transition-colors duration-200 ${
                          isActive ? "text-white" : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Sección de controles en la parte inferior */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        {/* Botón de tema */}
        <button
          onClick={toggleTheme}
          className={`flex items-center w-full px-2.5 py-2 space-x-2.5 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        >
          {theme === 'light' ? (
            <Moon size={18} className="text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Sun size={18} className="text-yellow-600 dark:text-yellow-400" />
          )}
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            </span>
          )}
        </button>

        {/* Botón de notificaciones */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`flex items-center w-full px-2.5 py-2 space-x-2.5 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="Alertas del sistema"
          >
            <div className="relative">
              {unreadCount > 0 ? (
                <BellRing size={18} className="text-red-500" />
              ) : (
                <Bell size={18} className="text-orange-600 dark:text-orange-400" />
              )}
              {unreadCount > 0 && (
                <div className="absolute flex items-center justify-center w-4 h-4 bg-red-500 border border-white dark:border-gray-800 rounded-full -top-1 -right-1">
                  <span className="text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-sm font-medium">Alertas</span>
            )}
            {!isCollapsed && unreadCount > 0 && (
              <Badge variant="danger" size="sm">{unreadCount}</Badge>
            )}
          </button>

          {/* Dropdown de alertas */}
          {showNotifications && (
            <div className={`absolute ${isCollapsed ? 'left-full ml-2' : 'left-0'} bottom-0 z-50 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl`}>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#18D043]/5 to-green-50 dark:from-[#18D043]/10 dark:to-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                    <AlertTriangle className="w-5 h-5 mr-2 text-[#16a34a] dark:text-[#18D043]" />
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
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {unreadCount} alerta{unreadCount !== 1 ? "s" : ""} sin revisar
                  </p>
                )}
              </div>

              <div className="overflow-y-auto max-h-80">
                {loadingAlerts ? (
                  <div className="flex items-center justify-center p-6">
                    <LoadingSpinner size="sm" className="mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">Cargando alertas...</span>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="font-medium text-gray-500 dark:text-gray-400">
                      No hay alertas pendientes
                    </p>
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                      Todas las alertas han sido revisadas
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 border-l-4 transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${getNotificationColor(alert)}`}
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

                            <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                              {alert.mensaje}
                            </p>

                            {alert.record && (
                              <div className="flex items-center mb-2 space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                <span>📋 {alert.record.codigo}</span>
                                <span>👤 {alert.record.cliente}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDateTime(alert.fecha_creada)}
                              </span>

                              <div className="flex items-center space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => handleMarkAsRead(alert.id, e)}
                                  className="h-6 px-2 py-1 text-xs"
                                  title="Marcar como leída"
                                >
                                  <Check size={12} />
                                </Button>

                                {alert.record && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => handleViewRecord(alert.record!.id, e)}
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
                <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewDashboard}
                    className="w-full text-[#16a34a] dark:text-[#18D043] hover:text-[#15803d] dark:hover:text-[#16a34a] font-medium"
                  >
                    Ver todas las alertas
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menú de usuario */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center w-full px-2.5 py-2 space-x-2.5 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-7 h-7 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-full flex items-center justify-center shadow-md">
              <User size={14} className="text-white" />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.nombre || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.rol || "Usuario"}
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>

          {/* Dropdown de usuario */}
          {showUserMenu && (
            <div className={`absolute ${isCollapsed ? 'left-full ml-2' : 'left-0'} bottom-0 z-50 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl`}>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-[#18D043]/5 to-green-50 dark:from-[#18D043]/10 dark:to-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-full flex items-center justify-center shadow-md">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user?.nombre || "Usuario Sistema"}
                    </p>
                    <div className="flex items-center mt-1 space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        En línea
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <button className="flex items-center w-full px-4 py-3 space-x-3 text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <User size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Mi Perfil</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ver y editar información
                    </p>
                  </div>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      navigate("/solicitudes");
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-3 space-x-3 text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30">
                      <FileText size={16} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Solicitudes</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Gestionar autorizaciones
                      </p>
                    </div>
                  </button>
                )}

                {!isAdmin && (
                  <button className="flex items-center w-full px-4 py-3 space-x-3 text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                      <Settings size={16} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Configuración</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ajustes del sistema
                      </p>
                    </div>
                  </button>
                )}

                <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 space-x-3 text-red-600 dark:text-red-400 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30">
                      <LogOut size={16} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Cerrar Sesión</p>
                      <p className="text-xs text-red-400 dark:text-red-500">
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

      {/* Versión del sistema */}
      {!isCollapsed && (
        <div className="px-2.5 py-1.5 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
};