import React from "react";
import { CheckCircle, Copy } from "lucide-react";
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/Toast';

interface CodeGeneratedModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  expiresIn: number;
  requestInfo: {
    username: string;
    recordCode: string;
  };
}

export const CodeGeneratedModal: React.FC<CodeGeneratedModalProps> = ({
  isOpen,
  onClose,
  code,
  expiresIn,
  requestInfo,
}) => {
  const { success } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    success("Código copiado al portapapeles");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            Código Generado
          </h3>

          <p className="mb-4 text-gray-600">
            Comparte este código con <strong>{requestInfo.username}</strong>{" "}
            para el registro <strong>{requestInfo.recordCode}</strong>
          </p>

          <div className="p-4 mb-4 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold tracking-wider text-gray-900">
                {code}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                icon={Copy}
                className="ml-2"
              >
                Copiar
              </Button>
            </div>
          </div>

          <p className="mb-6 text-sm text-gray-500">
            Válido por {expiresIn} minutos
          </p>

          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
