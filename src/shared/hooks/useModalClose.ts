import { useEffect, useRef } from 'react';

interface UseModalCloseOptions {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

export const useModalClose = ({
  isOpen,
  onClose,
  closeOnEscape = true,
  closeOnOutsideClick = true,
}: UseModalCloseOptions) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (closeOnOutsideClick && modalRef.current) {
        const target = event.target as Node;
        // Verificar si el click fue en el backdrop (fuera del contenido de la modal)
        if (modalRef.current === target) {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, closeOnEscape, closeOnOutsideClick]);

  return modalRef;
};
