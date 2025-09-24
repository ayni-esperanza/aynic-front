import { useAuthStore } from "../../store/authStore";

/**
 * Hook personalizado para acceder a la autenticación del usuario
 * @returns Información de autenticación y funciones relacionadas
 */
export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    updateUser,
    needsPasswordChange,
    setNeedsPasswordChange
  } = useAuthStore();

  // Verificar si el usuario es administrador
  const isAdmin = user?.rol === 'admin' || user?.rol === 'usuario';

  return {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
    needsPasswordChange,
    setNeedsPasswordChange,
    isAdmin
  };
};