import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./routes";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { ToastProvider } from "./shared/components/ui/Toast";
import { useToast } from "./shared/components/ui/Toast";
import { useAuthStore } from "./store/authStore";
import { setupTokenExpiredHandler } from "./shared/services/apiClient";
import { LoadingSpinner } from "./shared/components/ui/LoadingSpinner";

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

  // No mostrar pantalla de carga, cargar directamente
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