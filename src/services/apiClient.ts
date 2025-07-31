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

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

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

        let errorMessage = "Error desconocido";

        if (errorData.message) {
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(", ");
          } else {
            errorMessage = errorData.message;
          }
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

      // Aplicar interceptores de respuesta
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse);
      }

      return processedResponse;
    } catch (error) {
      // Reintentar en caso de errores de red
      if (retryCount < this.retries && this.shouldRetry(error)) {
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

    // Si no hay contenido JSON, retornar respuesta básica
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

    // Para DELETE que retorna 204 No Content
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

  logout() {
    localStorage.removeItem("authToken");
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  // MÉTODO PARA OBTENER TOKEN 
  getToken(): string | null {
    return localStorage.getItem("authToken");
  }
}

// INSTANCIA SINGLETON 
export const apiClient = new ApiClient();

// UTILIDAD PARA MANEJO DE ERRORES 
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
    UNREAD_COUNT: "/alerts/unread-count",
  },
} as const;