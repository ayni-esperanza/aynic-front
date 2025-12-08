import React, { useState, useEffect } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { useToast } from '../../../shared/components/ui/Toast';
import { formatDateTime } from "../../../shared/utils/formatters";
import { useSolicitudData, useSolicitudActions } from "../hooks";
import { CodeGeneratedModal } from "../components";
import type { PendingRequest, GeneratedCode } from "../types";

export const SolicitudesList: React.FC = () => {
  const { success, error: showError } = useToast();
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCodeInfo, setGeneratedCodeInfo] = useState<{
    code: string;
    expiresIn: number;
    requestInfo: { username: string; recordCode: string };
  } | null>(null);

  // Usar el hook personalizado para datos de solicitudes
  const {
    requests: pendingRequests,
    loading,
    apiError,
    refreshData,
  } = useSolicitudData();

  // Usar el hook personalizado para acciones
  const { generatingCode, handleGenerateCode } = useSolicitudActions(() => {
    // Recargar datos después de una acción exitosa
    refreshData();
  });

  // Mostrar errores si los hay
  useEffect(() => {
    if (apiError) {
      showError("Error al cargar solicitudes", apiError);
    }
  }, [apiError, showError]);

  const handleGenerateCodeClick = async (requestId: number) => {
    const result = await handleGenerateCode(requestId);
    
    if (result) {
      const request = pendingRequests.find((r) => parseInt(r.id) === requestId);
      
      if (request) {
        setGeneratedCodeInfo({
          code: result.code,
          expiresIn: result.expiresInMinutes,
          requestInfo: {
            username: request.requestedBy.username,
            recordCode: request.recordCode,
          },
        });
        setShowCodeModal(true);
        success("Código generado exitosamente");
      }
    } else {
      showError("Error al generar código");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Solicitudes de Autorización
          </h1>
          <p className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <span>Gestiona las solicitudes de eliminación de registros</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
              {pendingRequests.length} pendientes
            </span>
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <Card className="bg-white border-0 shadow-lg">
        <div className="p-6">
          {loading && pendingRequests.length === 0 ? (
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
                            <span className="font-medium text-gray-900">
                              {request.requestedBy.username}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({request.requestedBy.name})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">
                              Registro: <strong>{request.recordCode}</strong>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">
                              {formatDateTime(request.createdAt)}
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
                          onClick={() => handleGenerateCodeClick(parseInt(request.id))}
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
