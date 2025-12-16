/**
 * Servicio de logging para producción y desarrollo
 * Maneja diferentes niveles de log y puede enviar a servicios externos
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
}

class Logger {
  private currentLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = import.meta.env.NODE_ENV === 'production';
    this.currentLevel = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  private getUserId(): string | undefined {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Decodificar JWT para obtener user ID (sin verificar firma)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.userId;
      }
    } catch (error) {
      // Ignorar errores de decodificación
    }
    return undefined;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    return `${entry.timestamp} ${levelName}${context}: ${entry.message}`;
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    if (!this.isProduction) return;

    try {
      if (entry.level >= LogLevel.ERROR) {
        // Para errores críticos, podríamos enviar a un endpoint
      }
    } catch (error) {
      // No fallar si el logging externo falla
    }
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, data);
    const formattedMessage = this.formatMessage(entry);

    if (!this.isProduction) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, data);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, data);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, data);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, data);
          break;
      }
    }

    // Enviar a servicio externo en producción
    this.sendToExternalService(entry);
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  // Método para logging de errores de API
  apiError(endpoint: string, status: number, error: unknown): void {
    this.error(
      `API Error: ${endpoint} returned ${status}`,
      'API',
      { endpoint, status, error }
    );
  }

  // Método para logging de acciones de usuario
  userAction(action: string, context?: string, data?: unknown): void {
    this.info(`User Action: ${action}`, context, data);
  }

  // Método para logging de performance
  performance(operation: string, duration: number, context?: string): void {
    this.info(
      `Performance: ${operation} took ${duration}ms`,
      context || 'Performance',
      { operation, duration }
    );
  }
}

// Instancia singleton del logger
export const logger = new Logger();

// Función helper para logging de errores globales
export const logGlobalError = (error: Error, errorInfo?: React.ErrorInfo): void => {
  logger.error(
    'Global Error',
    'ErrorBoundary',
    {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
    }
  );
};

// Función helper para logging de promesas rechazadas
export const logUnhandledRejection = (reason: unknown, promise: Promise<unknown>): void => {
  logger.error(
    'Unhandled Promise Rejection',
    'Global',
    {
      reason,
      promise: promise.toString(),
    }
  );
};

// Función helper para reemplazar console.log en producción
export const safeLog = {
  error: (message: string, ...args: unknown[]) => {
    if (import.meta.env.NODE_ENV !== 'production') {
      console.error(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (import.meta.env.NODE_ENV !== 'production') {
      console.warn(message, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (import.meta.env.NODE_ENV !== 'production') {
      console.info(message, ...args);
    }
  },
  log: (message: string, ...args: unknown[]) => {
    if (import.meta.env.NODE_ENV !== 'production') {
      console.log(message, ...args);
    }
  }
};
