import {
  apiClient,
  ApiResponse,
  PaginatedResponse,
  ApiClientError,
} from "./apiClient";
import type { User, UserFormData } from "../types";

export interface UserFilters {
  search?: string;
  rol?: User["rol"];
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface UserCreateData extends UserFormData {
  password: string;
}

export interface UserUpdateData extends Partial<UserFormData> {
  activo?: boolean;
}

class UserService {
  private readonly basePath = "/users";

  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.rol) params.append("rol", filters.rol);
    if (filters?.activo !== undefined)
      params.append("activo", filters.activo.toString());
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = `${this.basePath}${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<PaginatedResponse<User>>(url);
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(
        `${this.basePath}/${id}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Usuario no encontrado");
      }
      throw error;
    }
  }

  async createUser(userData: UserCreateData): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        this.basePath,
        userData
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        throw new Error("El email ya está en uso");
      }
      throw error;
    }
  }

  async updateUser(id: string, userData: UserUpdateData): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        `${this.basePath}/${id}`,
        userData
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Usuario no encontrado");
      }
      if (error instanceof ApiClientError && error.status === 409) {
        throw new Error("El email ya está en uso");
      }
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(`${this.basePath}/${id}`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Usuario no encontrado");
      }
      if (error instanceof ApiClientError && error.status === 409) {
        throw new Error(
          "No se puede eliminar el usuario porque tiene datos asociados"
        );
      }
      throw error;
    }
  }

  async toggleUserStatus(id: string): Promise<User> {
    try {
      const response = await apiClient.patch<ApiResponse<User>>(
        `${this.basePath}/${id}/toggle-status`
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Usuario no encontrado");
      }
      throw error;
    }
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await apiClient.patch<ApiResponse<void>>(
        `${this.basePath}/${id}/password`,
        {
          currentPassword,
          newPassword,
        }
      );
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 400) {
        throw new Error("La contraseña actual es incorrecta");
      }
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Usuario no encontrado");
      }
      throw error;
    }
  }

  async uploadAvatar(
    id: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const response = await apiClient.upload<
        ApiResponse<{ avatarUrl: string }>
      >(`${this.basePath}/${id}/avatar`, file, onProgress);
      return response.data.avatarUrl;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 413) {
        throw new Error("El archivo es demasiado grande");
      }
      if (error instanceof ApiClientError && error.status === 415) {
        throw new Error("Formato de archivo no válido");
      }
      throw error;
    }
  }

  // Validation helpers
  validateUserData(userData: UserFormData): string[] {
    const errors: string[] = [];

    if (!userData.nombre.trim()) {
      errors.push("El nombre es requerido");
    }

    if (!userData.email.trim()) {
      errors.push("El email es requerido");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push("El email no es válido");
    }

    if (userData.telefono && !/^\+?[\d\s-()]+$/.test(userData.telefono)) {
      errors.push("El teléfono no es válido");
    }

    if (!["admin", "supervisor", "usuario"].includes(userData.rol)) {
      errors.push("El rol no es válido");
    }

    return errors;
  }

  validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("La contraseña debe contener al menos una letra minúscula");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("La contraseña debe contener al menos una letra mayúscula");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("La contraseña debe contener al menos un número");
    }

    return errors;
  }
}

// Create singleton instance
export const userService = new UserService();

// Mock service for development/testing
export class MockUserService extends UserService {
  private mockUsers: User[] = [];
  private nextId = 1;

  constructor() {
    super();
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    this.mockUsers = Array.from({ length: 15 }, (_, i) => ({
      id: `user-${i + 1}`,
      nombre: `Usuario ${i + 1}`,
      email: `usuario${i + 1}@ejemplo.com`,
      telefono: Math.random() > 0.3 ? `+1234567890${i}` : undefined,
      rol: (["admin", "usuario", "supervisor"] as const)[
        Math.floor(Math.random() * 3)
      ],
      fecha_creacion: new Date(
        2024,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ),
      activo: Math.random() > 0.2,
    }));
    this.nextId = this.mockUsers.length + 1;
  }

  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    let filteredUsers = [...this.mockUsers];

    // Apply filters
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.nombre.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    if (filters?.rol) {
      filteredUsers = filteredUsers.filter((user) => user.rol === filters.rol);
    }

    if (filters?.activo !== undefined) {
      filteredUsers = filteredUsers.filter(
        (user) => user.activo === filters.activo
      );
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = this.mockUsers.find((u) => u.id === id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return user;
  }

  async createUser(userData: UserCreateData): Promise<User> {
    // Check for duplicate email
    if (this.mockUsers.some((u) => u.email === userData.email)) {
      throw new Error("El email ya está en uso");
    }

    const newUser: User = {
      id: `user-${this.nextId++}`,
      nombre: userData.nombre,
      email: userData.email,
      telefono: userData.telefono,
      rol: userData.rol,
      fecha_creacion: new Date(),
      activo: true,
    };

    this.mockUsers.push(newUser);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return newUser;
  }

  async updateUser(id: string, userData: UserUpdateData): Promise<User> {
    const userIndex = this.mockUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }

    // Check for duplicate email
    if (
      userData.email &&
      this.mockUsers.some((u) => u.id !== id && u.email === userData.email)
    ) {
      throw new Error("El email ya está en uso");
    }

    this.mockUsers[userIndex] = {
      ...this.mockUsers[userIndex],
      ...userData,
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return this.mockUsers[userIndex];
  }

  async deleteUser(id: string): Promise<void> {
    const userIndex = this.mockUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }

    this.mockUsers.splice(userIndex, 1);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

// Export the service instance (use mock in development, real service in production)
export const activeUserService =
  process.env.NODE_ENV === "development" ? new MockUserService() : userService;
