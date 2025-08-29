import React from "react";
import { Routes, Route } from "react-router-dom";
import { UsuariosList } from "./pages/UsuariosList";
import { UsuariosForm } from "./pages/UsuariosForm";
import { UsuariosDetail } from "./pages/UsuariosDetail";

export const UsuariosModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<UsuariosList />} />
      <Route path="nuevo" element={<UsuariosForm />} />
      <Route path="editar/:id" element={<UsuariosForm />} />
      <Route path="detalle/:id" element={<UsuariosDetail />} />
    </Routes>
  );
};

// Exportar componentes
export { UserFilters, UserStats } from "./components";

// Exportar hooks
export { useUserData, useUserForm } from "./hooks";

// Exportar servicios
export { userService } from "./services";

// Exportar tipos
export type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserFilters,
  UserFormData,
  UserValidationErrors,
  UserRole,
  UserStatus,
} from "./types";

// Default export para lazy loading
export default UsuariosModule;
