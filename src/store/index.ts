import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, DataRecord } from '../types';

interface AppState {
  // Users module state
  users: User[];
  selectedUser: User | null;
  
  // Registro module state
  registros: DataRecord[];
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
  
  setRegistros: (registros: DataRecord[]) => void;
  addRegistro: (registro: DataRecord) => void;
  updateRegistro: (id: string, registro: Partial<DataRecord>) => void;
  deleteRegistro: (id: string) => void;
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
        registros: [],
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

        // Registro actions
        setRegistros: (registros) => set({ registros }),
        addRegistro: (registro) =>
          set((state) => ({ registros: [...state.registros, registro] })),
        updateRegistro: (id, updatedRegistro) =>
          set((state) => ({
            registros: state.registros.map((registro) =>
              registro.id === id ? { ...registro, ...updatedRegistro } : registro
            ),
          })),
        deleteRegistro: (id) =>
          set((state) => ({
            registros: state.registros.filter((registro) => registro.id !== id),
          })),
        setSelectedRegistro: (registro) => set({ selectedRegistro: registro }),

        // UI actions
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        setLoading: (loading) => set({ loading }),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          users: state.users,
          registros: state.registros,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    )
  )
);