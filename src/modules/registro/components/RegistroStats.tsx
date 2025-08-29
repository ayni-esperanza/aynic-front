import React from "react";
import { Database, CheckCircle, AlertTriangle, XCircle, Clock, Wrench } from "lucide-react";
import { Card } from '../../../shared/components/ui/Card';
import type { RegistroStatsProps } from "../types";

export const RegistroStats: React.FC<RegistroStatsProps> = ({ statistics, loading = false }) => {
  const statCards = [
    {
      title: "Total Registros",
      value: statistics.total,
      icon: Database,
      color: "blue",
      description: "Registros en el sistema",
    },
    {
      title: "Activos",
      value: statistics.activos,
      icon: CheckCircle,
      color: "green",
      description: "Registros activos",
    },
    {
      title: "Por Vencer",
      value: statistics.por_vencer,
      icon: Clock,
      color: "orange",
      description: "Registros próximos a vencer",
    },
    {
      title: "Vencidos",
      value: statistics.vencidos,
      icon: XCircle,
      color: "red",
      description: "Registros vencidos",
    },
    {
      title: "Inactivos",
      value: statistics.inactivos,
      icon: AlertTriangle,
      color: "yellow",
      description: "Registros inactivos",
    },
    {
      title: "Mantenimiento",
      value: statistics.mantenimiento,
      icon: Wrench,
      color: "purple",
      description: "En mantenimiento",
    },
  ];

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      iconBg: "bg-blue-100",
      text: "text-blue-900",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      iconBg: "bg-green-100",
      text: "text-green-900",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      iconBg: "bg-orange-100",
      text: "text-orange-900",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      iconBg: "bg-red-100",
      text: "text-red-900",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "text-yellow-600",
      iconBg: "bg-yellow-100",
      text: "text-yellow-900",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "text-purple-600",
      iconBg: "bg-purple-100",
      text: "text-purple-900",
    },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
      {statCards.map((stat, index) => {
        const colors = colorClasses[stat.color as keyof typeof colorClasses];
        const Icon = stat.icon;

        return (
          <Card
            key={index}
            className={`${colors.bg} ${colors.border} transition-all duration-200 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between p-6">
              <div className="flex-1">
                <div className={`text-sm font-medium ${colors.icon}`}>
                  {stat.title}
                </div>
                <div className={`text-3xl font-bold ${colors.text} mt-2`}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {stat.description}
                </div>
              </div>
              <div
                className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center shadow-sm`}
              >
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
