import React from "react";
import { Users, Shield, UserCheck, UserX } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import type { User } from "../types";

interface UserStatsProps {
  users: User[];
  loading?: boolean;
}

export const UserStats: React.FC<UserStatsProps> = ({ users, loading = false }) => {
  const stats = React.useMemo(() => {
    const total = users.length;
    const admins = users.filter((user) => user.rol === "admin").length;
    const supervisors = users.filter((user) => user.rol === "supervisor").length;
    const regularUsers = users.filter((user) => user.rol === "usuario").length;
    const activeUsers = users.filter((user) => user.activo).length;
    const inactiveUsers = users.filter((user) => !user.activo).length;

    return {
      total,
      admins,
      supervisors,
      regularUsers,
      activeUsers,
      inactiveUsers,
    };
  }, [users]);

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.total,
      icon: Users,
      color: "blue",
      description: "Usuarios registrados",
    },
    {
      title: "Administradores",
      value: stats.admins,
      icon: Shield,
      color: "red",
      description: "Usuarios con rol admin",
    },
    {
      title: "Supervisores",
      value: stats.supervisors,
      icon: Shield,
      color: "purple",
      description: "Usuarios con rol supervisor",
    },
    {
      title: "Usuarios Activos",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "green",
      description: "Usuarios activos en el sistema",
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
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      iconBg: "bg-red-100",
      text: "text-red-900",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "text-purple-600",
      iconBg: "bg-purple-100",
      text: "text-purple-900",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      iconBg: "bg-green-100",
      text: "text-green-900",
    },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
