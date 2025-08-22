import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Dashboard } from "../pages/Dashboard";
import { Login } from "../pages/Login";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

// Lazy loading de módulos con dynamic imports que transforman named exports a default
const UsuariosModule = React.lazy(() =>
  import("../modules/usuarios").then((module) => ({
    default: module.UsuariosModule,
  }))
);
const RegistroModule = React.lazy(() =>
  import("../modules/registro").then((module) => ({
    default: module.RegistroModule,
  }))
);
const MovementHistoryModule = React.lazy(() =>
  import("../modules/movement_history").then((module) => ({
    default: module.MovementHistoryModule,
  }))
);
const AccidentsModule = React.lazy(() =>
  import("../modules/accidents").then((module) => ({
    default: module.AccidentsModule,
  }))
);
const SolicitudesModule = React.lazy(() =>
  import("../modules/solicitudes").then((module) => ({
    default: module.SolicitudesModule,
  }))
);

// Componente de loading para Suspense
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#18D043] border-t-transparent"></div>
    <span className="ml-3 text-gray-600">Cargando módulo...</span>
  </div>
);

// Error boundary para módulos
class ModuleErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Module loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-600">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.73 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Error al cargar el módulo
            </h3>
            <p className="text-gray-600">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#18D043] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Ruta pública de login */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="usuarios/*"
          element={
            <ProtectedRoute requiredRoles={["admin", "supervisor"]}>
              <ModuleErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
                  <UsuariosModule />
                </Suspense>
              </ModuleErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="registro/*"
          element={
            <ModuleErrorBoundary>
              <Suspense fallback={<PageLoadingFallback />}>
                <RegistroModule />
              </Suspense>
            </ModuleErrorBoundary>
          }
        />

        <Route
          path="historial/*"
          element={
            <ModuleErrorBoundary>
              <Suspense fallback={<PageLoadingFallback />}>
                <MovementHistoryModule />
              </Suspense>
            </ModuleErrorBoundary>
          }
        />

        <Route
          path="accidentes/*"
          element={
            <ModuleErrorBoundary>
              <Suspense fallback={<PageLoadingFallback />}>
                <AccidentsModule />
              </Suspense>
            </ModuleErrorBoundary>
          }
        />

        {/* Módulo de Solicitudes - Solo para administradores */}
        <Route
          path="solicitudes/*"
          element={
            <ProtectedRoute requiredRoles={["admin"]}>
              <ModuleErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
                  <SolicitudesModule />
                </Suspense>
              </ModuleErrorBoundary>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};