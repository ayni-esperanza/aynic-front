import React from "react";
import { useModalClose } from '../../../shared/hooks/useModalClose';
import type { DataRecord } from "../types/registro";
import { EditarRegistroForm } from "../pages/EditarRegistroForm";

interface RegistroDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registroId: string;
  onDelete: (registro: DataRecord) => void;
  onCreateDerivadas: (registro: DataRecord) => void;
}

export const RegistroDetailModal: React.FC<RegistroDetailModalProps> = ({
  isOpen,
  onClose,
  registroId,
}) => {
  const modalRef = useModalClose({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-[min(90vw,_950px)] max-h-[88vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-white/10 dark:border-gray-700/60 flex">
        <EditarRegistroForm registroId={registroId} onClose={onClose} />
      </div>
    </div>
  );
};
