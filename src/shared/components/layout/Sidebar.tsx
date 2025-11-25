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

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header compacto */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden">
                <img
                  src={logoAyni}
                  alt="Ayni Logo"
                  className="object-contain w-full h-full"
                />
              </div>
              <h1 className="text-lg font-bold text-gray-900">
                AyniLine
              </h1>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 transition-all duration-200 rounded-lg hover:bg-gray-100 group"
              title="Contraer sidebar"
            >
              <ChevronLeft
                size={18}
                className="text-gray-600 group-hover:text-[#16a34a] transition-colors duration-200"
              />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center w-full space-y-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden">
              <img
                src={logoAyni}
                alt="Ayni Logo"
                className="object-contain w-full h-full"
              />
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 transition-all duration-200 rounded-lg hover:bg-gray-100 group"
              title="Expandir sidebar"
            >
              <ChevronRight
                size={18}
                className="text-gray-600 group-hover:text-[#16a34a] transition-colors duration-200"
              />
            </button>
          </div>
        )}
      </div>

      {/* Navigation principal */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <div className="space-y-0.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? `${item.activeColor} text-white shadow-md`
                      : `text-gray-700 ${item.hoverColor}`
                  } ${isCollapsed ? "justify-center" : ""}`
                }
                title={isCollapsed ? item.label : ""}
              >
                {({ isActive }) => (
                  <>
                    {/* Icono */}
                    <div className={`${isCollapsed ? "" : "mr-3"}`}>
                      <Icon
                        size={20}
                        className={`transition-all duration-200 ${
                          isActive ? "text-white" : item.color
                        }`}
                      />
                    </div>

                    {/* Solo el título del menú */}
                    {!isCollapsed && (
                      <span
                        className={`font-medium text-sm transition-colors duration-200 ${
                          isActive ? "text-white" : "text-gray-900"
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

      {/* Versión del sistema (solo expandido) */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
};