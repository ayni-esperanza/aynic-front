import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User, DataRecord } from "../types";

interface AppState {
  // Users module state
  users: User[];
  selectedUser: User | null;

  // Registro module state 
  selectedRegistro: DataRecord | null;

  // UI state
  sidebarCollapsed: boolean;
  loading: boolean;

  // Actions
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setSelectedUser: (user: User | null) => void;

  // Registro actions
  setSelectedRegistro: (registro: DataRecord | null) => void;

  setSidebarCollapsed: (collapsed: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        users: [],
        selectedUser: null,
        selectedRegistro: null,
        sidebarCollapsed: false,
        loading: false,

        // User actions
        setUsers: (users) => set({ users }),
        addUser: (user) => set((state) => ({ users: [...state.users, user] })),
        updateUser: (id, updatedUser) =>
          set((state) => ({
            users: state.users.map((user) =>
              user.id === id ? { ...user, ...updatedUser } : user
            ),
          })),
        deleteUser: (id) =>
          set((state) => ({
            users: state.users.filter((user) => user.id !== id),
          })),
        setSelectedUser: (user) => set({ selectedUser: user }),

        setSelectedRegistro: (registro) => set({ selectedRegistro: registro }),

        // UI actions
        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }),
        setLoading: (loading) => set({ loading }),
      }),
      {
        name: "app-storage",
        partialize: (state) => ({
          users: state.users,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    {
      name: "app-store",
    }
  )
);