import React, { useState, useEffect } from "react";
import { Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from '../../../shared/components/ui/Button';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from '../../../shared/services/apiClient';
import type { DataRecord } from "../../registro/types/registro";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DataRecord | null;
  onConfirm: (authCode?: string) => void;
  loading: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  record,
  onConfirm,
  loading,
}) => {
  const [authorizationCode, setAuthorizationCode] = useState("");
  const [needsAuthorization, setNeedsAuthorization] = useState<boolean | null>(
    null
  );
  const [checkingAuth, setCheckingAuth] = useState(false);
  const { user } = useAuthStore();
  
  const modalRef = useModalClose({ isOpen, onClose });

  // Verificar si necesita autorización cuando se abre el modal
  useEffect(() => {
    if (isOpen && record && user?.rol !== "admin") {
      setCheckingAuth(true);
      apiClient
        .get(`/authorization-codes/check-needed/${record.id}`)
        .then((response: any) => {
          setNeedsAuthorization(response.needs_authorization);
        })
        .catch((error) => {
          console.error("Error checking authorization:", error);
          setNeedsAuthorization(true); // Asumir que necesita autorización en caso de error
        })
        .finally(() => {
          setCheckingAuth(false);
        });
    } else {
      setNeedsAuthorization(false); // Admins no necesitan autorización
    }
  }, [isOpen, record, user]);

  const handleClose = () => {
    setAuthorizationCode("");
    setNeedsAuthorization(null);
    onClose();
  };

  const handleConfirm = () => {
    if (needsAuthorization && authorizationCode.trim()) {
      onConfirm(authorizationCode.trim());
    } else if (!needsAuthorization) {
      onConfirm();
    }
  };

  const canConfirm =
    !checkingAuth &&
    (needsAuthorization === false ||
      (needsAuthorization === true && authorizationCode.trim().length > 0));

  if (!isOpen || !record) return null;

  return (
    <div ref={modalRef} className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50" style={{ margin: 0 }}>
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            Eliminar Registro
          </h3>

          <p className="mb-4 text-gray-600">
            ¿Estás seguro de que quieres eliminar el registro{" "}
            <strong>{record.codigo}</strong>?
          </p>

          {checkingAuth ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" className="mr-2" />
              <span className="text-gray-600">Verificando permisos...</span>
            </div>
          ) : needsAuthorization === true ? (
            <div className="mb-6 space-y-4">
              <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-orange-800">
                      Autorización Requerida
                    </p>
                    <p className="mt-1 text-sm text-orange-700">
                      Este registro requiere un código de autorización del
                      administrador para ser eliminado.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Código de Autorización
                </label>
                <input
                  type="text"
                  value={authorizationCode}
                  onChange={(e) =>
                    setAuthorizationCode(e.target.value.toUpperCase())
                  }
                  placeholder="Ingresa el código (ej: ABC12345)"
                  className="w-full px-3 py-2 font-mono tracking-wider text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  maxLength={8}
                />
                <p className="text-xs text-center text-gray-500">
                  Solicita el código al administrador del sistema
                </p>
              </div>
            </div>
          ) : needsAuthorization === false ? (
            <div className="mb-6">
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-medium text-green-800">
                    Puedes eliminar este registro directamente
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              loading={loading}
              disabled={!canConfirm}
              className="flex-1"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
