import React, { } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<"admin" | "supervisor" | "usuario">;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const { isAuthenticated, user, loading, isInitialized } =
    useAuthStore();
  const location = useLocation();

  // Si aún no se ha inicializado, mostrar loading
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/20 animate-pulse">
              <span className="text-3xl">🔒</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <LoadingSpinner size="sm" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Verificando acceso
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Validando credenciales...</p>
        </div>
      </div>
    );
  }

  // Si está cargando (verificando token), mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 animate-pulse">
              <span className="text-3xl">⚡</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <LoadingSpinner size="sm" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Verificando permisos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando información del usuario...</p>
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