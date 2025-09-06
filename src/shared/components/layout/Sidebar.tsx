import React from "react";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
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
    path: "/usuarios",
    icon: Users,
    label: "Usuarios",
    description: "Administrar usuarios",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100",
    activeColor: "bg-gradient-to-r from-purple-500 to-purple-600",
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
    path: "/ordenes-compra",
    icon: ShoppingCart,
    label: "Órdenes de Compra",
    description: "Gestión de compras",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    hoverColor: "hover:bg-teal-100",
    activeColor: "bg-gradient-to-r from-teal-500 to-teal-600",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, isMobile = false }) => {
  return (
    <div
      className={`bg-white border-r border-gray-200 transition-[width] duration-200 ease-out flex flex-col shadow-lg h-full ${isMobile ? "w-72" : isCollapsed ? "w-16" : "w-64"
        }`}
    >
      {/* Header mejorado */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg rounded-xl">
              <img
                src={logoAyni}
                alt="Ayni Logo"
                className="object-contain w-6 h-6 sm:w-8 sm:h-8"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                AyniLine
              </h1>
              <p className="text-xs text-gray-500">AYNI</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="flex items-center justify-center w-12 h-12 mx-auto my-2 bg-white shadow-lg rounded-xl">
            <img
              src={logoAyni}
              alt="Ayni Logo"
              className="object-contain w-10 h-10"
              style={{ maxWidth: "90%", maxHeight: "90%" }}
            />
          </div>
        )}

        <button
          onClick={onToggle}
          className={`p-2 transition-colors duration-150 rounded-lg hover:bg-gray-100 group ${isCollapsed && !isMobile ? "mx-auto mt-2" : ""
            }`}
          title={isMobile ? "Cerrar menú" : isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          {isMobile ? (
            <ChevronLeft
              size={20}
              className="text-gray-600 group-hover:text-[#16a34a] transition-colors duration-200"
            />
          ) : isCollapsed ? (
            <ChevronRight
              size={20}
              className="text-gray-600 group-hover:text-[#16a34a] transition-colors duration-200"
            />
          ) : (
            <ChevronLeft
              size={20}
              className="text-gray-600 group-hover:text-[#16a34a] transition-colors duration-200"
            />
          )}
        </button>
      </div>

      {/* Navigation principal */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center px-2 sm:px-3 py-2 sm:py-3 rounded-xl transition-[background-color,color,transform,box-shadow] duration-150 ease-out relative overflow-hidden ${isActive
                    ? `${item.activeColor} text-white shadow-lg transform scale-105`
                    : `text-gray-700 ${item.hoverColor} hover:scale-105 hover:shadow-md`
                  } ${isCollapsed && !isMobile ? "justify-center" : ""}`
                }
                title={isCollapsed && !isMobile ? item.label : ""}
              >
                {({ isActive }) => (
                  <>
                    {/* Icono con animación */}
                    <div
                      className={`relative z-10 ${isCollapsed ? "" : "mr-2 sm:mr-3"}`}
                    >
                      <div
                        className={`p-1.5 sm:p-2 rounded-lg transition-[background-color,transform] duration-150 ease-out ${isActive
                            ? "bg-white/20"
                            : `${item.bgColor} group-hover:scale-110`
                          }`}
                      >
                        <Icon
                          size={18}
                          className={`transition-colors duration-150 ease-out ${isActive ? "text-white" : item.color
                            }`}
                        />
                      </div>
                    </div>

                    {/* Texto del menú */}
                    {!isCollapsed && (
                      <div className="relative z-10 flex-1">
                        <span
                          className={`text-sm sm:text-base font-medium transition-colors duration-150 ease-out ${isActive ? "text-white" : "text-gray-900"
                            }`}
                        >
                          {item.label}
                        </span>
                        <p
                          className={`text-xs transition-colors duration-150 ease-out ${isActive ? "text-white/80" : "text-gray-500"
                            }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Indicador activo */}
                    {isActive && (
                      <div className="absolute top-0 bottom-0 right-0 w-1 bg-white rounded-l-full" />
                    )}

                    {/* Efecto hover background */}
                    {!isActive && (
                      <div className="absolute inset-0 transition-opacity duration-200 opacity-0 bg-gradient-to-r from-transparent to-gray-50 group-hover:opacity-100" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Versión del sistema (solo expandido) */}
      {!isCollapsed && (
        <div className="px-4 pb-2">
          <div className="text-center">
            <p className="text-xs text-gray-400">Sistema v1.0.0</p>
            <div className="flex items-center justify-center mt-1 space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-600">Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};