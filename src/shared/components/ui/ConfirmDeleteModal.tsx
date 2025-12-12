import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from './Button';
import { useModalClose } from '../../hooks/useModalClose';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
  itemName?: string | null;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = "Confirmar Eliminación",
  message = "¿Estás seguro de que deseas eliminar este elemento?",
  itemName,
}) => {
  const modalRef = useModalClose({ isOpen, onClose });

  const handleConfirm = () => {
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef} 
      className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm" 
      style={{ margin: 0 }}
    >
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
        <div className="text-center">
          {/* Icono de advertencia */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
          </div>

          {/* Título */}
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>

          {/* Mensaje */}
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {message}
            {itemName && (
              <>
                {" "}
                <strong className="text-gray-900 dark:text-white">{itemName}</strong>
              </>
            )}
            ?
          </p>

          {/* Advertencia adicional */}
          <div className="mb-6 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="flex items-start space-x-2">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-red-800 dark:text-red-400">
                  Esta acción no se puede deshacer
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-500">
                  El elemento será eliminado permanentemente del sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              disabled={loading}
              icon={loading ? undefined : Trash2}
              className="flex-1"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
