// API Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  retries: 3,
};

// Custom API Error Class
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

// Request/Response Interceptors
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

    // Add default request interceptor for auth
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

    // Add default response interceptor for error handling
    this.addResponseInterceptor(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiClientError(
          errorData.message || "Request failed",
          response.status,
          errorData.code,
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
      // Apply request interceptors
      let config = { url: `${this.baseURL}${url}`, ...options };
      for (const interceptor of this.requestInterceptors) {
        config = interceptor(config);
      }

      // Create timeout controller
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

      // Apply response interceptors
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse);
      }

      return processedResponse;
    } catch (error) {
      // Handle network errors and retries
      if (retryCount < this.retries && this.shouldRetry(error)) {
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return this.executeRequest(url, options, retryCount + 1);
      }

      // Convert to ApiClientError if needed
      const apiError =
        error instanceof ApiClientError
          ? error
          : new ApiClientError(
              error instanceof Error ? error.message : "Network error",
              0,
              "NETWORK_ERROR"
            );

      // Apply error interceptors
      for (const interceptor of this.errorInterceptors) {
        await interceptor(apiError);
      }

      throw apiError;
    }
  }

  private shouldRetry(error: unknown): boolean {
    // Retry on network errors or 5xx server errors
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
    return response.json();
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
    return response.json();
  }

  // Upload file method
  async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText) as T;
            resolve(result);
          } catch {
            resolve(xhr.responseText as T);
          }
        } else {
          reject(new ApiClientError("Upload failed", xhr.status));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new ApiClientError("Upload failed", 0, "NETWORK_ERROR"));
      });

      const token = localStorage.getItem("authToken");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.open("POST", `${this.baseURL}${url}`);
      xhr.send(formData);
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Utility function for handling API errors in components
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ha ocurrido un error inesperado";
};