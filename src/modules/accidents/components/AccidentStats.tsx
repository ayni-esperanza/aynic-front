import React from "react";
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import type { AccidentStatistics } from "../types/accident";

interface AccidentStatsProps {
  statistics: AccidentStatistics | null;
  loading: boolean;
}

export const AccidentStats: React.FC<AccidentStatsProps> = ({
  statistics,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4 sm:p-6">
            <div className="flex items-center justify-center h-16 sm:h-20">
              <LoadingSpinner />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const getEstadoCount = (estado: string) => {
    return statistics.por_estado?.find((s) => s.estado === estado)?.count || 0;
  };

  const getCriticosCount = () => {
    return (
      statistics.por_severidad?.find((s) => s.severidad === "CRITICO")?.count || 0
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {/* Total Accidentes */}
      <Card hover className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              Total Accidentes
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {statistics.total}
            </p>
            {statistics.por_mes && statistics.por_mes.length > 0 && (
              <div className="flex items-center mt-2">
                <Badge variant="primary" size="sm">
                  {statistics.por_mes[statistics.por_mes.length - 1]?.count || 0} este mes
                </Badge>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl">
            <span className="text-lg sm:text-2xl">📊</span>
          </div>
        </div>
      </Card>

      {/* Reportados */}
      <Card hover className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Reportados</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {getEstadoCount("REPORTADO")}
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="warning" size="sm">
                Pendientes
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl">
            <span className="text-lg sm:text-2xl">⚠️</span>
          </div>
        </div>
      </Card>

      {/* En Investigación */}
      <Card hover className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              En Investigación
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {getEstadoCount("EN_INVESTIGACION")}
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" size="sm">
                En proceso
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl">
            <span className="text-lg sm:text-2xl">🔍</span>
          </div>
        </div>
      </Card>

      {/* Resueltos */}
      <Card hover className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Resueltos</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {getEstadoCount("RESUELTO")}
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="success" size="sm">
                Completados
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl">
            <span className="text-lg sm:text-2xl">✅</span>
          </div>
        </div>
      </Card>

      {/* Críticos */}
      <Card hover className="p-4 sm:p-6 border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Críticos</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {getCriticosCount()}
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="danger" size="sm">
                Alta prioridad
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl">
            <span className="text-lg sm:text-2xl">🚨</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
