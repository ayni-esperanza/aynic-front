import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  FileText,
  User,
  Building,
  CheckCircle,
  Copy,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { useToast } from "../../../components/ui/Toast";
import { useApi } from "../../../hooks/useApi";
import { apiClient } from "../../../services/apiClient";
import { formatDateTime } from "../../../utils/formatters";

interface PendingRequest {
  id: number;
  record_id: number;
  record_code: string;
  requested_by: {
    id: number;
    username: string;
    name: string;
  };
  justification: string;
  created_at: string;
  status: string;
}

interface GeneratedCode {
  code: string;
  expires_in_minutes: number;
}

// Modal para mostrar código generado
const CodeGeneratedModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  code: string;
  expiresIn: number;
  requestInfo: {
    username: string;
    recordCode: string;
  };
}> = ({ isOpen, onClose, code, expiresIn, requestInfo }) => {
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

export const SolicitudesList: React.FC = () => {
  const { success, error: showError } = useToast();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCodeInfo, setGeneratedCodeInfo] = useState<{
    code: string;
    expiresIn: number;
    requestInfo: { username: string; recordCode: string };
  } | null>(null);

  // Hook para cargar solicitudes pendientes
  const loadPendingFunction = useCallback(
    () => apiClient.get<PendingRequest[]>("/authorization-codes/pending"),
    []
  );

  const { loading: loadingRequests, execute: loadPendingRequests } = useApi(
    loadPendingFunction,
    {
      onSuccess: (data) => {
        setPendingRequests(data);
      },
      onError: (error) => {
        showError("Error al cargar solicitudes", error);
      },
    }
  );

  // Hook para generar código
  const generateCodeFunction = useCallback(
    (requestId: number) =>
      apiClient.post<GeneratedCode>("/authorization-codes/generate", {
        request_id: requestId,
      }),
    []
  );

  const { loading: generatingCode, execute: generateCode } = useApi(
    generateCodeFunction,
    {
      onSuccess: (data, args) => {
        const requestId = args[0] as number;
        const request = pendingRequests.find((r) => r.id === requestId);

        if (request) {
          setGeneratedCodeInfo({
            code: data.code,
            expiresIn: data.expires_in_minutes,
            requestInfo: {
              username: request.requested_by.username,
              recordCode: request.record_code,
            },
          });
          setShowCodeModal(true);

          // Recargar solicitudes para actualizar la lista
          loadPendingRequests();
        }
      },
      onError: (error) => {
        showError("Error al generar código", error);
      },
    }
  );

  // Cargar datos inicial
  useEffect(() => {
    loadPendingRequests();
  }, []);

  const handleGenerateCode = (requestId: number) => {
    generateCode(requestId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
            <FileText className="text-xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Solicitudes de Autorización
            </h1>
            <p className="flex items-center space-x-2 text-gray-600">
              <span>Gestiona las solicitudes de eliminación de registros</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {pendingRequests.length} pendientes
              </span>
            </p>
          </div>
        </div>
        <Button
          onClick={loadPendingRequests}
          variant="outline"
          loading={loadingRequests}
          className="border-gray-300 hover:bg-gray-50"
        >
          Actualizar
        </Button>
      </div>

      {/* Contenido principal */}
      <Card className="bg-white border-0 shadow-lg">
        <div className="p-6">
          {loadingRequests && pendingRequests.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-gray-600">Cargando solicitudes...</p>
              </div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex items-center justify-center w-20 h-20 mb-6 bg-gray-100 rounded-full">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-center">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  No hay solicitudes pendientes
                </h3>
                <p className="text-gray-600">
                  Todas las solicitudes de autorización han sido procesadas.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Solicitudes Pendientes ({pendingRequests.length})
              </h2>

              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 transition-colors duration-200 border border-gray-200 rounded-lg hover:border-orange-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {request.requested_by.username}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({request.requested_by.name})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              Registro: <strong>{request.record_code}</strong>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              {formatDateTime(request.created_at)}
                            </span>
                          </div>
                        </div>

                        {request.justification && (
                          <div className="p-3 rounded-lg bg-gray-50">
                            <p className="text-sm text-gray-700">
                              <strong>Motivo:</strong> {request.justification}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <Button
                          onClick={() => handleGenerateCode(request.id)}
                          loading={generatingCode}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                        >
                          Generar Código
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modal para mostrar código generado */}
      {generatedCodeInfo && (
        <CodeGeneratedModal
          isOpen={showCodeModal}
          onClose={() => {
            setShowCodeModal(false);
            setGeneratedCodeInfo(null);
          }}
          code={generatedCodeInfo.code}
          expiresIn={generatedCodeInfo.expiresIn}
          requestInfo={generatedCodeInfo.requestInfo}
        />
      )}
    </div>
  );
};
