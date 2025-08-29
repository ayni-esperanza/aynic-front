import { apiClient, ApiResponse, ApiClientError } from "../../../shared/services/apiClient";

// ===== INTERFACES PARA EL BACKEND =====
export interface BackendUser {
  id: number;
  usuario: string;
  apellidos?: string;
  cargo?: string;
  celular?: string;
  contrasenia?: string; // No se incluye en las respuestas
  email: string;
  empresa: string;
  nombre: string;
  rol: string;
}

export interface CreateUserBackendDto {
  usuario: string;
  apellidos?: string;
  cargo?: string;
  celular?: string;
  contrasenia: string;
  email: string;
  empresa: string;
  nombre: string;
  rol: string;
}

export interface UpdateUserBackendDto {
  usuario?: string;
  apellidos?: string;
  cargo?: string;
  celular?: string;
  contrasenia?: string;
  email?: string;
  empresa?: string;
  nombre?: string;
  rol?: string;
}

// ===== INTERFACES PARA EL FRONTEND =====
export interface FrontendUser {
  id: string; // Convertir number a string
  usuario: string;
  nombre: string;
  apellidos?: string;
  email: string;
  telefono?: string; // Mapear celular -> telefono
  cargo?: string;
  empresa: string;
  rol: "admin" | "supervisor" | "usuario"; // Mapear roles
  fecha_creacion: Date; // Valor calculado
  activo: boolean; // Valor calculado
  [key: string]: unknown;
}

export interface CreateUserFrontendDto {
  usuario: string;
  nombre: string;
  apellidos?: string;
  email: string;
  telefono?: string;
  cargo?: string;
  empresa: string;
  rol: "admin" | "supervisor" | "usuario";
  contrasenia: string;
}

export interface UpdateUserFrontendDto {
  usuario?: string;
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  empresa?: string;
  rol?: "admin" | "supervisor" | "usuario";
  contrasenia?: string;
}

class UserService {
  private readonly basePath = "/users";

  /**
   * Mapear usuario del backend al formato del frontend
   */
  private mapBackendToFrontend(backendUser: BackendUser): FrontendUser {
    return {
      id: backendUser.id.toString(),
      usuario: backendUser.usuario,
      nombre: backendUser.nombre,
      apellidos: backendUser.apellidos,
      email: backendUser.email,
      telefono: backendUser.celular, // celular -> telefono
      cargo: backendUser.cargo,
      empresa: backendUser.empresa,
      rol: this.mapBackendRoleToFrontend(backendUser.rol),
      fecha_creacion: new Date(), // Por ahora valor por defecto
      activo: true, // Por ahora valor por defecto
    };
  }

  /**
   * Mapear usuario del frontend al formato del backend
   */
  private mapFrontendToBackend(
    frontendUser: CreateUserFrontendDto
  ): CreateUserBackendDto;
  private mapFrontendToBackend(
    frontendUser: UpdateUserFrontendDto
  ): UpdateUserBackendDto;
  private mapFrontendToBackend(
    frontendUser: CreateUserFrontendDto | UpdateUserFrontendDto
  ): CreateUserBackendDto | UpdateUserBackendDto {
    const result: any = {};

    if (frontendUser.usuario !== undefined)
      result.usuario = frontendUser.usuario;
    if (frontendUser.nombre !== undefined) result.nombre = frontendUser.nombre;
    if (frontendUser.apellidos !== undefined)
      result.apellidos = frontendUser.apellidos;
    if (frontendUser.email !== undefined) result.email = frontendUser.email;
    if (frontendUser.telefono !== undefined)
      result.celular = frontendUser.telefono; // telefono -> celular
    if (frontendUser.cargo !== undefined) result.cargo = frontendUser.cargo;
    if (frontendUser.empresa !== undefined)
      result.empresa = frontendUser.empresa;
    if (frontendUser.rol !== undefined)
      result.rol = this.mapFrontendRoleToBackend(frontendUser.rol);
    if (
      "contrasenia" in frontendUser &&
      frontendUser.contrasenia !== undefined
    ) {
      result.contrasenia = frontendUser.contrasenia;
    }

    return result;
  }

  /**
   * Mapear roles del backend al frontend
   */
  private mapBackendRoleToFrontend(
    backendRole: string
  ): "admin" | "supervisor" | "usuario" {
    const roleMap: Record<string, "admin" | "supervisor" | "usuario"> = {
      ADMINISTRADOR: "admin",
      SUPERVISOR: "supervisor",
      USUARIO: "usuario",
    };
    return roleMap[backendRole] || "usuario";
  }

  /**
   * Mapear roles del frontend al backend
   */
  private mapFrontendRoleToBackend(
    frontendRole: "admin" | "supervisor" | "usuario"
  ): string {
    const roleMap: Record<string, string> = {
      admin: "ADMINISTRADOR",
      supervisor: "SUPERVISOR",
      usuario: "USUARIO",
    };
    return roleMap[frontendRole] || "USUARIO";
  }

  /**
   * Obtener todos los usuarios (solo para administradores)
   */
  async getUsers(): Promise<FrontendUser[]> {
    try {
      const response = await apiClient.get<BackendUser[]>(this.basePath);
      return response.map((user) => this.mapBackendToFrontend(user));
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para ver la lista de usuarios");
      }
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id: string): Promise<FrontendUser> {
    try {
      const response = await apiClient.get<BackendUser>(
        `${this.basePath}/${id}`
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Usuario no encontrado");
      }
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para ver este usuario");
      }
      throw error;
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getCurrentUserProfile(): Promise<FrontendUser> {
    try {
      const response = await apiClient.get<BackendUser>(
        `${this.basePath}/profile`
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  /**
   * Crear nuevo usuario (solo administradores)
   */
  async createUser(userData: CreateUserFrontendDto): Promise<FrontendUser> {
    try {
      const backendData = this.mapFrontendToBackend(
        userData
      ) as CreateUserBackendDto;
      const response = await apiClient.post<BackendUser>(
        this.basePath,
        backendData
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        throw new Error("El usuario o email ya existe");
      }
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para crear usuarios");
      }
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  async updateUser(
    id: string,
    userData: UpdateUserFrontendDto
  ): Promise<FrontendUser> {
    try {
      const backendData = this.mapFrontendToBackend(
        userData
      ) as UpdateUserBackendDto;
      const response = await apiClient.patch<BackendUser>(
        `${this.basePath}/${id}`,
        backendData
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Usuario no encontrado");
      }
      if (error instanceof ApiClientError && error.status === 409) {
        throw new Error("El usuario o email ya existe");
      }
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para actualizar este usuario");
      }
      throw error;
    }
  }

  /**
   * Actualizar perfil propio
   */
  async updateProfile(userData: UpdateUserFrontendDto): Promise<FrontendUser> {
    try {
      const backendData = this.mapFrontendToBackend(
        userData
      ) as UpdateUserBackendDto;
      const response = await apiClient.patch<BackendUser>(
        `${this.basePath}/profile`,
        backendData
      );
      return this.mapBackendToFrontend(response);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        throw new Error("El usuario o email ya existe");
      }
      throw error;
    }
  }

  /**
   * Eliminar usuario (solo administradores)
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/${id}`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error("Usuario no encontrado");
      }
      if (error instanceof ApiClientError && error.status === 403) {
        throw new Error("No tienes permisos para eliminar usuarios");
      }
      throw error;
    }
  }

  /**
   * Validar datos de usuario
   */
  validateUserData(
    userData: CreateUserFrontendDto | UpdateUserFrontendDto
  ): string[] {
    const errors: string[] = [];

    if ("nombre" in userData && userData.nombre !== undefined) {
      if (!userData.nombre.trim()) {
        errors.push("El nombre es requerido");
      }
    }

    if ("usuario" in userData && userData.usuario !== undefined) {
      if (!userData.usuario.trim()) {
        errors.push("El usuario es requerido");
      } else if (userData.usuario.length < 3) {
        errors.push("El usuario debe tener al menos 3 caracteres");
      }
    }

    if ("email" in userData && userData.email !== undefined) {
      if (!userData.email.trim()) {
        errors.push("El email es requerido");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push("El email no es válido");
      }
    }

    if (
      "telefono" in userData &&
      userData.telefono !== undefined &&
      userData.telefono.trim()
    ) {
      if (!/^\+?[\d\s-()]+$/.test(userData.telefono)) {
        errors.push("El teléfono no es válido");
      }
    }

    if ("empresa" in userData && userData.empresa !== undefined) {
      if (!userData.empresa.trim()) {
        errors.push("La empresa es requerida");
      }
    }

    if ("rol" in userData && userData.rol !== undefined) {
      if (!["admin", "supervisor", "usuario"].includes(userData.rol)) {
        errors.push("El rol no es válido");
      }
    }

    if ("contrasenia" in userData && userData.contrasenia !== undefined) {
      const passwordErrors = this.validatePassword(userData.contrasenia);
      errors.push(...passwordErrors);
    }

    return errors;
  }

  /**
   * Validar contraseña
   */
  validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push("La contraseña debe tener al menos 6 caracteres");
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

// Exportar instancia singleton
export const userService = new UserService();
