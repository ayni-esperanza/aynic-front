import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;

  // Actions
  login: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        token: null,

        // Actions
        login: (user, token = "demo-token") => {
          set({
            user,
            isAuthenticated: true,
            token,
          });
        },

        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            token: null,
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
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          token: state.token,
        }),
      }
    )
  )
);