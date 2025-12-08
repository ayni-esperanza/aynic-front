import React from "react";
import {
  X,
  Calendar,
  User,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Badge } from '../../../shared/components/ui/Badge';
import { formatDate } from '../../../shared/utils/formatters';
import { useModalClose } from '../../../shared/hooks/useModalClose';
import type {
  Accident,
  EstadoAccidente,
  SeveridadAccidente,
} from "../types/accident";

interface AccidentDetailsProps {
  accident: Accident;
  isOpen: boolean;
  onClose: () => void;
}

export const AccidentDetails: React.FC<AccidentDetailsProps> = ({
  accident,
  isOpen,
  onClose,
}) => {
  const modalRef = useModalClose({ isOpen, onClose });
  if (!isOpen) return null;

  // Función para renderizar badge de estado
  const renderEstadoBadge = (estado: EstadoAccidente) => {
    const variants = {
      REPORTADO: "warning" as const,
      EN_INVESTIGACION: "secondary" as const,
      RESUELTO: "success" as const,
    };

    const labels = {
      REPORTADO: "Reportado",
      EN_INVESTIGACION: "En Investigación",
      RESUELTO: "Resuelto",
    };

    return (
      <Badge variant={variants[estado]} size="md">
        {labels[estado]}
      </Badge>
    );
  };

  // Función para renderizar badge de severidad
  const renderSeveridadBadge = (severidad: SeveridadAccidente) => {
    const variants = {
      LEVE: "secondary" as const,
      MODERADO: "warning" as const,
      GRAVE: "danger" as const,
      CRITICO: "danger" as const,
    };

    const labels = {
      LEVE: "Leve",
      MODERADO: "Moderado",
      GRAVE: "Grave",
      CRITICO: "Crítico",
    };

    return (
      <Badge variant={variants[severidad]} size="md">
        {labels[severidad]}
      </Badge>
    );
  };

  return (
    <div ref={modalRef} className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" style={{ margin: 0 }}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg bg-opacity-20">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Detalles del Accidente #{accident.id}
              </h2>
              <p className="text-red-100">
                Información completa del incidente reportado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white transition-colors hover:text-red-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado y Severidad */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Estado:
                </span>
                <div className="mt-1">{renderEstadoBadge(accident.estado)}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Severidad:
                </span>
                <div className="mt-1">
                  {renderSeveridadBadge(accident.severidad)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Fecha del Accidente</div>
              <div className="font-semibold text-gray-900">
                {formatDate(accident.fecha_accidente)}
              </div>
            </div>
          </div>

          {/* Información de la Línea de Vida */}
          <div className="p-4 rounded-lg bg-blue-50">
            <h3 className="flex items-center mb-3 text-lg font-semibold text-blue-900">
              <FileText className="w-5 h-5 mr-2" />
              Línea de Vida Asociada
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-blue-700">
                  Código:
                </span>
                <div className="font-semibold text-blue-900">
                  {accident.linea_vida_codigo || `ID: ${accident.linea_vida_id}`}
                </div>
              </div>
              {accident.linea_vida_cliente && (
                <div>
                  <span className="text-sm font-medium text-blue-700">
                    Cliente:
                  </span>
                  <div className="font-semibold text-blue-900">
                    {accident.linea_vida_cliente}
                  </div>
                </div>
              )}
              {accident.linea_vida_ubicacion && (
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-blue-700">
                    Ubicación:
                  </span>
                  <div className="font-semibold text-blue-900">
                    {accident.linea_vida_ubicacion}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Descripción del Incidente */}
          <div>
            <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-900">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Descripción del Incidente
            </h3>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="leading-relaxed text-gray-800 whitespace-pre-wrap">
                {accident.descripcion}
              </p>
            </div>
          </div>

          {/* Investigador */}
          {accident.investigador && (
            <div>
              <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-900">
                <User className="w-5 h-5 mr-2 text-purple-500" />
                Investigador
              </h3>
              <div className="p-4 rounded-lg bg-purple-50">
                <p className="font-semibold text-purple-900">
                  {accident.investigador}
                </p>
              </div>
            </div>
          )}

          {/* Medidas Correctivas */}
          {accident.medidas_correctivas && (
            <div>
              <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-900">
                <FileText className="w-5 h-5 mr-2 text-green-500" />
                Medidas Correctivas
              </h3>
              <div className="p-4 rounded-lg bg-green-50">
                <p className="leading-relaxed text-green-800 whitespace-pre-wrap">
                  {accident.medidas_correctivas}
                </p>
              </div>
            </div>
          )}

          {/* Lesiones o Daños */}
          {accident.lesiones && (
            <div>
              <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-900">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Lesiones o Daños
              </h3>
              <div className="p-4 rounded-lg bg-orange-50">
                <p className="leading-relaxed text-orange-800 whitespace-pre-wrap">
                  {accident.lesiones}
                </p>
              </div>
            </div>
          )}

          {/* Testigos */}
          {accident.testigos && (
            <div>
              <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-900">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Testigos
              </h3>
              <div className="p-4 rounded-lg bg-blue-50">
                <p className="leading-relaxed text-blue-800 whitespace-pre-wrap">
                  {accident.testigos}
                </p>
              </div>
            </div>
          )}

          {/* Conclusiones */}
          {accident.conclusiones && (
            <div>
              <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-900">
                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                Conclusiones de la Investigación
              </h3>
              <div className="p-4 rounded-lg bg-indigo-50">
                <p className="leading-relaxed text-indigo-800 whitespace-pre-wrap">
                  {accident.conclusiones}
                </p>
              </div>
            </div>
          )}

          {/* Información de Reporte */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-900">
              <Calendar className="w-5 h-5 mr-2 text-gray-500" />
              Información del Reporte
            </h3>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div>
                <span className="font-medium text-gray-600">
                  Fecha de Creación:
                </span>
                <div className="text-gray-900">
                  {formatDate(accident.created_at)}
                </div>
              </div>
              {accident.fecha_investigacion && (
                <div>
                  <span className="font-medium text-gray-600">
                    Fecha de Investigación:
                  </span>
                  <div className="text-gray-900">
                    {formatDate(accident.fecha_investigacion)}
                  </div>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">
                  Última Actualización:
                </span>
                <div className="text-gray-900">
                  {formatDate(accident.updated_at)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
