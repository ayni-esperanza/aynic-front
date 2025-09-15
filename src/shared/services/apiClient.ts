export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

import { logger } from './logger';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
  retries: 3,
};

export class ApiClientError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestInterceptor = (
  config: RequestInit & { url: string }
) => RequestInit & { url: string };
type ResponseInterceptor = (response: Response) => Promise<Response>;
type ErrorInterceptor = (error: ApiClientError) => Promise<never>;

// Callback para manejar tokens expirados desde el store
type TokenExpiredCallback = () => void;

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private tokenExpiredCallback: TokenExpiredCallback | null = null;
  private tokenExpiredHandler: (() => void) | null = null;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
    this.retries = API_CONFIG.retries;

    this.addRequestInterceptor((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    });

    // Interceptor mejorado para manejar tokens expirados
    this.addResponseInterceptor(async (response) => {
      if (!response.ok) {
        let errorData: any = {};

        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            errorData = { message: response.statusText };
          }
        } catch {
          errorData = { message: `HTTP ${response.status}` };
        }

        // Manejar token expirado (401 Unauthorized)
        if (response.status === 401) {

          // Llamar al callback si está configurado
          if (this.tokenExpiredCallback) {
            this.tokenExpiredCallback();
          }

          // Limpiar token automáticamente
          this.logout();
        }

        let errorMessage = "Error desconocido";

        if (errorData.message) {
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(", ");
          } else {
            errorMessage = errorData.message;
          }
        }

        // Personalizar mensaje para errores de autenticación
        if (response.status === 401) {
          errorMessage =
            "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
        }

        throw new ApiClientError(
          errorMessage,
          response.status,
          errorData.error || errorData.code,
          errorData
        );
      }
      return response;
    });
  }

  // configurar callback para tokens expirados
  setTokenExpiredCallback(callback: TokenExpiredCallback) {
    this.tokenExpiredCallback = callback;
  }

  setTokenExpiredHandler(handler: () => void) {
    this.tokenExpiredHandler = handler;
  }

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
  }

  private async executeRequest(
    url: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<Response> {
    try {
      // Aplicar interceptores de request
      let config = { url: `${this.baseURL}${url}`, ...options };
      for (const interceptor of this.requestInterceptors) {
        config = interceptor(config);
      }

      // Crear controlador de timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(config.url, {
        ...config,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
      });

      clearTimeout(timeoutId);

      // Si la respuesta es 401 (Unauthorized), manejar token expirado
      if (response.status === 401) {
        logger.warn("Token expirado detectado", "API", { url: config.url });
        if (this.tokenExpiredHandler) {
          this.tokenExpiredHandler();
        }
        throw new Error("Sesión expirada o inválida");
      }

      // Aplicar interceptores de respuesta
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse);
      }

      return processedResponse;
    } catch (error) {
      if (
        retryCount < this.retries &&
        this.shouldRetry(error) &&
        !(error instanceof ApiClientError && error.status === 401)
      ) {
        logger.warn(`Retry ${retryCount + 1}/${this.retries} para ${url}`, "API");
        await this.delay(Math.pow(2, retryCount) * 1000);
        return this.executeRequest(url, options, retryCount + 1);
      }

      // Convertir a ApiClientError
      const apiError =
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error instanceof Error ? error.message : "Error de red",
              0,
              "NETWORK_ERROR"
            );

      // Log del error
      logger.apiError(url, apiError.status, apiError);

      // Para errores de red, sugerir verificar conexión
      if (apiError.status === 0) {
        apiError.message =
          "No se puede conectar al servidor. Verifica tu conexión a internet.";
      }

      // Aplicar interceptores de error
      for (const interceptor of this.errorInterceptors) {
        await interceptor(apiError);
      }

      throw apiError;
    }
  }

  private shouldRetry(error: unknown): boolean {
    return (
      (error as Error)?.name === "AbortError" ||
      (error instanceof ApiClientError && error.status >= 500)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.executeRequest(url, { method: "GET" });
    return response.json();
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.executeRequest(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return { success: true } as T;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.executeRequest(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.executeRequest(url, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.executeRequest(url, { method: "DELETE" });

    if (response.status === 204) {
      return { success: true } as T;
    }

    return response.json();
  }

  async login(credentials: { username: string; password: string }) {
    const response = await this.executeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    // Guardar token automáticamente
    if (data.access_token) {
      localStorage.setItem("authToken", data.access_token);
    }

    return data;
  }

  async logout() {
    try {
      // Intentar hacer logout en el servidor
      await this.executeRequest("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      // Si falla, continuar con el logout local
    } finally {
      // Siempre limpiar el token local
      localStorage.removeItem("authToken");
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  // verificar si el token es válido haciendo una petición al backend
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      // Hacer una petición simple para verificar el token
      await this.get("/auth/profile");
      return true;
    } catch (error) {
      return false;
    }
  }

  async verifySession(): Promise<boolean> {
    try {
      const response = await this.executeRequest("/auth/verify-session", {
        method: "GET",
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// INSTANCIA SINGLETON
export const apiClient = new ApiClient();

// Configurar el callback de token expirado
export const setupTokenExpiredHandler = (callback: TokenExpiredCallback) => {
  apiClient.setTokenExpiredCallback(callback);
};

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ha ocurrido un error inesperado";
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    PROFILE: "/auth/profile",
    VERIFY: "/auth/verify",
  },
  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
    BY_ID: (id: number) => `/users/${id}`,
  },
  RECORDS: {
    BASE: "/records",
    BY_ID: (id: number) => `/records/${id}`,
    STATISTICS: "/records/statistics",
  },
  HISTORY: {
    BASE: "/record-status-history",
  },
  ALERTS: {
    BASE: "/alerts",
    BY_ID: (id: number) => `/alerts/${id}`,
    UNREAD_COUNT: "/alerts/unread-count",
    DASHBOARD: "/alerts/dashboard",
    MARK_AS_READ: (id: number) => `/alerts/${id}/read`,
    MARK_ALL_READ: "/alerts/mark-all-read",
    CRITICAL: "/alerts/critical",
    BY_RECORD: (recordId: number) => `/alerts/by-record/${recordId}`,
    GENERATE: "/alerts/generate",
    CLEANUP: (days: number) => `/alerts/cleanup/${days}`,
    STATS_BY_PERIOD: "/alerts/stats-by-period",
  },
  MAINTENANCE: {
    BASE: "/maintenance",
    BY_ID: (id: number) => `/maintenance/${id}`,
    BY_RECORD: (recordId: number) => `/maintenance/by-record/${recordId}`,
  },
} as const;