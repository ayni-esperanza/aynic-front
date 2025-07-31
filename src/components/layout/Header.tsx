import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  User,
  ChevronDown,
  Settings,
  LogOut,
  AlertTriangle,
  Clock,
  Calendar,
} from "lucide-react";

// Simulación de notificaciones de registros vencidos
const mockNotifications = [
  {
    id: 1,
    type: "warning",
    title: "Registro COD-0001 vencido",
    message: "El registro del Cliente 1 venció hace 3 días",
    time: "2 horas",
    isRead: false,
  },
  {
    id: 2,
    type: "urgent",
    title: "Múltiples registros por vencer",
    message: "5 registros vencen en los próximos 7 días",
    time: "4 horas",
    isRead: false,
  },
  {
    id: 3,
    type: "info",
    title: "Registro COD-0045 próximo a vencer",
    message: "Vence en 15 días - Cliente Importante",
    time: "1 día",
    isRead: true,
  },
  {
    id: 4,
    type: "warning",
    title: "Sistema de mantenimiento",
    message: "Equipo-B2 requiere mantenimiento programado",
    time: "2 días",
    isRead: true,
  },
];

export const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-l-red-500 bg-red-50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "info":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-300 bg-gray-50";
    }
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  return (
    <header className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Logo/Título del sistema (izquierda) */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Sistema Informatico
              </h2>
              <p className="text-xs text-gray-500">Panel de Control</p>
            </div>
          </div>
        </div>

        {/* Área derecha con notificaciones y usuario */}
        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 transition-all duration-200 rounded-lg hover:text-gray-600 hover:bg-gray-100 group"
              title="Notificaciones"
            >
              <Bell
                size={20}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              {unreadCount > 0 && (
                <div className="absolute flex items-center justify-center w-5 h-5 bg-red-500 border-2 border-white rounded-full -top-1 -right-1">
                  <span className="text-xs font-bold text-white">
                    {unreadCount}
                  </span>
                </div>
              )}
            </button>

            {/* Dropdown de notificaciones */}
            {showNotifications && (
              <div className="absolute right-0 z-50 mt-2 duration-200 transform bg-white border border-gray-200 shadow-xl w-96 rounded-xl animate-in slide-in-from-top-2">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notificaciones
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-sm text-[#16a34a] hover:text-[#15803d] font-medium transition-colors duration-200"
                      >
                        Limpiar todo
                      </button>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      Tienes {unreadCount} notificación
                      {unreadCount !== 1 ? "es" : ""} sin leer
                    </p>
                  )}
                </div>

                <div className="overflow-y-auto max-h-80">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">No hay notificaciones</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-l-4 transition-all duration-200 cursor-pointer hover:bg-gray-50 ${getNotificationColor(
                            notification.type
                          )} ${
                            !notification.isRead
                              ? "bg-opacity-100"
                              : "bg-opacity-50"
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p
                                  className={`text-sm font-medium ${
                                    !notification.isRead
                                      ? "text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-[#18D043] rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                {notification.message}
                              </p>
                              <p className="mt-2 text-xs text-gray-400">
                                Hace {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <button className="w-full text-sm text-[#16a34a] hover:text-[#15803d] font-medium transition-colors duration-200">
                      Ver todas las notificaciones
                    </button>
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
                  Usuario Sistema
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
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
                        Usuario Sistema
                      </p>
                      <p className="text-sm text-gray-500">
                        usuario@sistema.com
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
                      <p className="text-sm font-medium">Preferencias</p>
                      <p className="text-xs text-gray-500">
                        Configurar la aplicación
                      </p>
                    </div>
                  </button>

                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <button className="flex items-center w-full px-4 py-3 space-x-3 text-red-600 transition-colors duration-200 hover:bg-red-50">
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