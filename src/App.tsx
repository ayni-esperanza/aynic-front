import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./routes";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { ToastProvider } from "./shared/components/ui/Toast";
import { useToast } from "./shared/components/ui/Toast";
import { useAuthStore } from "./store/authStore";
import { setupTokenExpiredHandler } from "./shared/services/apiClient";
import { LoadingSpinner } from "./shared/components/ui/LoadingSpinner";
import { PasswordChangeHandler } from "./shared/components/PasswordChangeHandler";
import { logger, logGlobalError, logUnhandledRejection } from "./shared/services/logger";

// Global error handler setup
const GlobalErrorHandler: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { error: showError } = useToast();

  React.useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logUnhandledRejection(event.reason, event.promise);
      showError(
        "Error de aplicación",
        "Ha ocurrido un error inesperado. Por favor, recarga la página."
      );
      event.preventDefault();
    };

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      logGlobalError(event.error);
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
      logger.warn("Token caducado, manejo silencioso", "Auth");
      handleTokenExpired();
    });

    // Inicializar autenticación
    const init = async () => {
      try {
        logger.info("Inicializando autenticación", "Auth");
        await initializeAuth();
        logger.info("Autenticación inicializada correctamente", "Auth");
      } catch (error) {
        logger.error(
          "Error durante la inicialización de autenticación",
          "Auth",
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
  logger.debug("App component rendering...", "App");

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to external service in production
        logGlobalError(error, errorInfo);
      }}
    >
      <ToastProvider>
        <Router basename="/portal">
          <GlobalErrorHandler>
            <AuthInitializer>
              <div id="app-container">
                <AppRoutes />
                <PasswordChangeHandler />
              </div>
            </AuthInitializer>
          </GlobalErrorHandler>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;