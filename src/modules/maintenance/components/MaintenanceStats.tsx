import React from "react";
import { Card } from "../../../components/ui/Card";
import { Settings, Calendar, TrendingUp, Database } from "lucide-react";
import { formatNumber } from "../../../utils/formatters";
import type { MaintenanceStats as MaintenanceStatsType } from "../types/maintenance";

interface MaintenanceStatsProps {
  stats: MaintenanceStatsType;
  loading?: boolean;
}

export const MaintenanceStatsComponent: React.FC<MaintenanceStatsProps> = ({
  stats,
  loading = false,
}) => {
  const statsCards = [
    {
      title: "Total Mantenimientos",
      value: stats.total_maintenances,
      icon: Settings,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: null,
    },
    {
      title: "Este Mes",
      value: stats.this_month,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: null,
    },
    {
      title: "Con Cambio de Longitud",
      value: stats.with_length_changes,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: null,
    },
    {
      title: "Registros Mantenidos",
      value: stats.records_maintained,
      icon: Database,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: `${formatNumber(stats.average_per_record)} promedio por registro`,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 p-3 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 ml-4">
                <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="transition-all duration-200 hover:shadow-lg hover:scale-105"
            hover
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex-1 ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stat.value)}
                </p>
                {stat.change && (
                  <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
