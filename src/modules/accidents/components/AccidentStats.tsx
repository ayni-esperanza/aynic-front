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
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-center h-20">
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
    <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-5">
      {/* Total Accidentes */}
      <Card hover className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Total Accidentes
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics.total}
            </p>
          </div>
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
            <span className="text-xl">📊</span>
          </div>
        </div>
      </Card>

      {/* Reportados */}
      <Card hover className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Reportados</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {getEstadoCount("REPORTADO")}
            </p>
          </div>
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-xl">
            <span className="text-xl">⚠️</span>
          </div>
        </div>
      </Card>

      {/* En Investigación */}
      <Card hover className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              En Investigación
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {getEstadoCount("EN_INVESTIGACION")}
            </p>
          </div>
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
            <span className="text-xl">🔍</span>
          </div>
        </div>
      </Card>

      {/* Resueltos */}
      <Card hover className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Resueltos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {getEstadoCount("RESUELTO")}
            </p>
          </div>
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl">
            <span className="text-xl">✅</span>
          </div>
        </div>
      </Card>

      {/* Críticos */}
      <Card hover className="p-4 border-red-200 dark:border-red-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Críticos</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {getCriticosCount()}
            </p>
          </div>
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl">
            <span className="text-xl">🚨</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
