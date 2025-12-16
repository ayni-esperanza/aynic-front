import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { ChangePasswordModal } from "./modals/ChangePasswordModal";

export const PasswordChangeHandler: React.FC = () => {
  const { needsPasswordChange, setNeedsPasswordChange, isAuthenticated, user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Solo mostrar modal si está autenticado, tiene user ID, y necesita cambiar contraseña
    if (needsPasswordChange && isAuthenticated && user?.id) {
      // Pequeño delay para asegurar que la autenticación esté completa
      const timer = setTimeout(() => {
        // Verificar si han pasado 24 horas desde el último login
        const lastModalShown = localStorage.getItem(`passwordModal_${user.id}`);
        const now = new Date().getTime();
        
        if (!lastModalShown) {
          // Primera vez, mostrar modal
          setShowModal(true);
          localStorage.setItem(`passwordModal_${user.id}`, now.toString());
        } else {
          const lastShown = parseInt(lastModalShown);
          const hoursSinceLastShown = (now - lastShown) / (1000 * 60 * 60);
          
          if (hoursSinceLastShown >= 24) {
            setShowModal(true);
            localStorage.setItem(`passwordModal_${user.id}`, now.toString());
          }
        }
      }, 500); // 500ms de delay

      return () => clearTimeout(timer);
    } else {
      // Si no cumple las condiciones, asegurar que el modal esté cerrado
      setShowModal(false);
    }
  }, [needsPasswordChange, isAuthenticated, user?.id]);

  const handlePasswordChangeSuccess = () => {
    setNeedsPasswordChange(false);
    setShowModal(false);
  };

  const handleModalClose = () => {
    // Permitir cerrar el modal - aparecerá nuevamente en 24 horas
    setShowModal(false);
  };

  return (
    <ChangePasswordModal
      isOpen={showModal}
      onClose={handleModalClose}
      onSuccess={handlePasswordChangeSuccess}
    />
  );
};
