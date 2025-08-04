import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { apiClient, handleApiError } from "../services/apiClient";
import { userService } from "../services/userService";
import type { User, LoginCredentials, LoginResponse } from "../types/auth";
import { AuthMappers } from "../types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  handleTokenExpired: () => void;
  loadCurrentUser: () => Promise<void>; // Nueva función para cargar datos del usuario actual
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        token: null,
        loading: false,
        error: null,
        isInitialized: false,

        // Actions
        login: async (credentials: LoginCredentials) => {
          set({ loading: true, error: null });

          try {
            // Validar credenciales antes de enviarlas
            const validation = AuthMappers.validateCredentials(
              credentials.username,
              credentials.password
            );

            if (!validation.valid) {
              throw new Error(validation.errors.join(", "));
            }

            // Llamar a la API real
            const response: LoginResponse = await apiClient.login(credentials);

            // Mapear usuario del backend al formato del frontend
            const frontendUser = AuthMappers.backendUserToFrontend(
              response.user
            );

            set({
              user: frontendUser,
              isAuthenticated: true,
              token: response.access_token,
              loading: false,
              error: null,
              isInitialized: true,
            });

            // Después del login exitoso, cargar datos completos del usuario
            try {
              await get().loadCurrentUser();
            } catch (userError) {
              // Si falla cargar el perfil, no es crítico
              console.warn(
                "Error loading user profile after login:",
                userError
              );
            }
          } catch (error) {
            const errorMessage = handleApiError(error);
            set({
              user: null,
              isAuthenticated: false,
              token: null,
              loading: false,
              error: errorMessage,
              isInitialized: true,
            });
            throw error;
          }
        },

        logout: () => {
          // Limpiar token del localStorage
          apiClient.logout();

          set({
            user: null,
            isAuthenticated: false,
            token: null,
            loading: false,
            error: null,
            isInitialized: true,
          });
        },

        updateUser: (userData) => {
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, ...userData },
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        // manejo de token expirado
        handleTokenExpired: () => {
          console.warn("Token expirado o inválido, cerrando sesión...");

          // Limpiar token del localStorage
          apiClient.logout();

          set({
            user: null,
            isAuthenticated: false,
            token: null,
            loading: false,
            error:
              "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            isInitialized: true,
          });
        },

        // Cargar datos completos del usuario actual desde la API
        loadCurrentUser: async () => {
          try {
            const userProfile = await userService.getCurrentUserProfile();
            set({ user: userProfile });
          } catch (error) {
            console.error("Error loading current user profile:", error);
            // Si no se carga el perfil, mantener los datos básicos del login
            throw error;
          }
        },

        // verificación asíncrona del estado
        checkAuthStatus: async () => {
          const token = apiClient.getToken();

          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              token: null,
              isInitialized: true,
            });
            return;
          }

          // Si hay token, verificar con el backend si es válido
          try {
            set({ loading: true });

            // Hacer una petición simple para verificar si el token es válido
            // y cargar datos actualizados del usuario
            const userProfile = await userService.getCurrentUserProfile();

            // Si la petición es exitosa, el token es válido
            set({
              user: userProfile,
              isAuthenticated: true,
              token,
              loading: false,
              isInitialized: true,
              error: null,
            });
          } catch (error) {
            // Si falla, el token es inválido o el backend no está disponible
            console.warn("Token inválido o backend no disponible:", error);

            // Limpiar estado de autenticación
            apiClient.logout();
            set({
              user: null,
              isAuthenticated: false,
              token: null,
              loading: false,
              error: "Tu sesión ha expirado o el servidor no está disponible.",
              isInitialized: true,
            });
          }
        },

        // inicialización completa de la autenticación
        initializeAuth: async () => {
          const { isInitialized } = get();

          if (isInitialized) {
            return;
          }

          await get().checkAuthStatus();
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          token: state.token,
          // NO persistir user ni isAuthenticated - siempre verificar al cargar
        }),
        // Verificar estado al cargar desde localStorage
        onRehydrateStorage: () => (state) => {
          if (state) {
            // No marcar como autenticado automáticamente
            state.isAuthenticated = false;
            state.user = null;
            state.isInitialized = false;
            // La verificación se hará en initializeAuth
          }
        },
      }
    ),
    {
      name: "auth-store",
    }
  )
);