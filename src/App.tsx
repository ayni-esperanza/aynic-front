import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./routes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ui/Toast";
import { useToast } from "./components/ui/Toast";
import { useAuthStore } from "./store/authStore";
import { setupTokenExpiredHandler } from "./services/apiClient";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

// Global error handler setup
const GlobalErrorHandler: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { error: showError } = useToast();

  React.useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      showError(
        "Error de aplicación",
        "Ha ocurrido un error inesperado. Por favor, recarga la página."
      );
      event.preventDefault();
    };

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);
      showError(
        "Error de aplicación",
        "Ha ocurrido un error inesperado. Por favor, recarga la página."
      );
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);

  return <>{children}</>;
};

// Componente de inicialización de autenticación
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { initializeAuth, handleTokenExpired, isInitialized, loading } =
    useAuthStore();
  const { error: showError } = useToast();

  useEffect(() => {
    // Configurar el manejo de tokens expirados sin mostrar error automático
    setupTokenExpiredHandler(() => {
      console.warn("Token caducado, manejo silencioso");
      handleTokenExpired();
    });

    // Inicializar autenticación
    const init = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error(
          "Error durante la inicialización de autenticación:",
          error
        );
      }
    };

    init();
  }, [initializeAuth, handleTokenExpired, showError]);

  // Mostrar loading mientras se inicializa
  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <span className="text-2xl text-white">⚡</span>
          </div>
          {/* Spinner */}
          <LoadingSpinner size="lg" className="mb-4" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Iniciando AyniLine
          </h2>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Main App component with better error handling
function App() {
  console.log("App component rendering...");

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to external service in production
        console.error("App Error Boundary:", error, errorInfo);
        if (import.meta.env.PROD) {
          // para futuro: enviar a un servicio de logging
        }
      }}
    >
      <ToastProvider>
        <Router>
          <GlobalErrorHandler>
            <AuthInitializer>
              <div id="app-container">
                <AppRoutes />
              </div>
            </AuthInitializer>
          </GlobalErrorHandler>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;