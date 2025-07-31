import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<"admin" | "supervisor" | "usuario">;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay roles requeridos, verificar que el usuario tenga uno de ellos
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.rol)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Acceso Denegado
          </h2>
          <p className="mb-4 text-gray-600">
            No tienes permisos para acceder a esta sección
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-[#18D043] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};