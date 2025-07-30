import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./routes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ui/Toast";
import { apiClient } from "./services/apiClient";
import { useToast } from "./components/ui/Toast";

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
  }, [showError]);

  return <>{children}</>;
};

// API interceptor setup
const ApiInterceptorSetup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { error: showError, warning: showWarning } = useToast();

  React.useEffect(() => {
    // Add global error interceptor
    apiClient.addErrorInterceptor(async (error) => {
      console.error("API Error:", error);

      // Handle specific error types
      switch (error.status) {
        case 401:
          showError("Sesión expirada", "Por favor, inicia sesión nuevamente.");
          // Redirect to login or clear auth token
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          break;

        case 403:
          showError(
            "Acceso denegado",
            "No tienes permisos para realizar esta acción."
          );
          break;

        case 404:
          showWarning(
            "Recurso no encontrado",
            "El elemento solicitado no existe."
          );
          break;

        case 429:
          showWarning(
            "Demasiadas solicitudes",
            "Por favor, espera un momento antes de continuar."
          );
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          showError(
            "Error del servidor",
            "Estamos experimentando problemas técnicos. Inténtalo más tarde."
          );
          break;

        default:
          if (error.status >= 400) {
            showError(
              "Error",
              error.message || "Ha ocurrido un error inesperado."
            );
          }
      }

      // Re-throw to maintain error chain
      throw error;
    });

    // Add request interceptor for loading states (optional)
    apiClient.addRequestInterceptor((config) => {
      // You could add global loading logic here
      return config;
    });

    // Add response interceptor for success notifications (optional)
    apiClient.addResponseInterceptor(async (response) => {
      // You could add global success logic here
      return response;
    });
  }, [showError, showWarning]);

  return <>{children}</>;
};

// Main App component
function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to external service in production
        if (process.env.NODE_ENV === "production") {
          console.error("App Error Boundary:", error, errorInfo);
          // Send to error tracking service (Sentry, LogRocket, etc.)
        }
      }}
    >
      <ToastProvider>
        <Router>
          <GlobalErrorHandler>
            <ApiInterceptorSetup>
              <AppRoutes />
            </ApiInterceptorSetup>
          </GlobalErrorHandler>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;