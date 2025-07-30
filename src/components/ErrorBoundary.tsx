import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "../components/ui/Button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.group("Error Boundary Caught an Error");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }

    // Log error to external service in production
    if (process.env.NODE_ENV === "production") {
      this.logErrorToService(error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  logErrorToService = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // Here you would send to your error tracking service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // For now, just log to console
      console.error("Error Report:", errorReport);

      // Uncomment and configure for real error service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });
    } catch (loggingError) {
      console.error("Failed to log error:", loggingError);
    }
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: "",
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
          />
        );
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="p-6 text-center bg-white rounded-lg shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h1 className="mb-2 text-xl font-semibold text-gray-900">
                ¡Ups! Algo salió mal
              </h1>

              <p className="mb-6 text-gray-600">
                Ha ocurrido un error inesperado en la aplicación. Nuestro equipo
                ha sido notificado.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    Detalles del error (solo en desarrollo)
                  </summary>
                  <div className="p-3 mt-2 overflow-auto font-mono text-xs text-gray-800 bg-gray-100 rounded max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              <p className="mb-6 text-xs text-gray-400">
                ID del error: {this.state.errorId}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={this.resetError}
                  className="w-full"
                  icon={RefreshCw}
                >
                  Intentar de nuevo
                </Button>

                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="w-full"
                  icon={Home}
                >
                  Ir al inicio
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para reportar errores manualmente
export const useErrorHandler = () => {
  const reportError = React.useCallback((error: Error, context?: string) => {
    console.error(
      `Manual error report${context ? ` in ${context}` : ""}:`,
      error
    );

    // Report to error service in production
    if (process.env.NODE_ENV === "production") {
      // Implementation would go here
    }
  }, []);

  return { reportError };
};
