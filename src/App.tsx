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

// API interceptor setup - TEMPORARILY DISABLED
const ApiInterceptorSetup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Temporarily disable API interceptors to prevent loops
  console.log("API interceptors disabled to prevent infinite loops");
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
            <ApiInterceptorSetup>
              <div id="app-container">
                <AppRoutes />
              </div>
            </ApiInterceptorSetup>
          </GlobalErrorHandler>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;