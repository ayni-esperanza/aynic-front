import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<"admin" | "supervisor" | "usuario">;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const { isAuthenticated, user, loading, isInitialized, checkAuthStatus } =
    useAuthStore();
  const location = useLocation();

  // Verificar autenticación periódicamente (cada 5 minutos)
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      const interval = setInterval(() => {
        checkAuthStatus();
      }, 5 * 60 * 1000); // 5 minutos

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isInitialized, checkAuthStatus]);

  // Si aún no se ha inicializado, mostrar loading
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si está cargando (verificando token), mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

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
          <p className="mb-6 text-gray-600">
            No tienes permisos para acceder a esta sección
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Tu rol actual:{" "}
              <span className="font-medium capitalize">{user.rol}</span>
            </p>
            <p className="text-sm text-gray-500">
              Roles requeridos:{" "}
              {requiredRoles
                .map((role) => (
                  <span key={role} className="font-medium capitalize">
                    {role}
                  </span>
                ))
                .join(", ")}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-[#18D043] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};