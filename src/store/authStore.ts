import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { apiClient, handleApiError } from "../services/apiClient";
import type { User, LoginCredentials, LoginResponse } from "../types/auth";
import { AuthMappers } from "../types/auth"; 

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  checkAuthStatus: () => void;
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
            });
          } catch (error) {
            const errorMessage = handleApiError(error);
            set({
              user: null,
              isAuthenticated: false,
              token: null,
              loading: false,
              error: errorMessage,
            });
            throw error; // Re-throw para que el componente pueda manejarlo
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

        checkAuthStatus: () => {
          const token = apiClient.getToken();
          const currentState = get();

          if (token && !currentState.isAuthenticated) {
            // Si hay token pero no está autenticado, restaurar estado
            set({ isAuthenticated: true, token });
          } else if (!token && currentState.isAuthenticated) {
            // Si no hay token pero está autenticado, limpiar estado
            set({
              user: null,
              isAuthenticated: false,
              token: null,
            });
          }
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          token: state.token,
        }),
        // Verificar estado al cargar desde localStorage
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.checkAuthStatus();
          }
        },
      }
    ),
    {
      name: "auth-store",
    }
  )
);