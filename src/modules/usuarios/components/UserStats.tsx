import React from "react";
import { Users, Shield, UserCheck } from "lucide-react";
import { Card } from '../../../shared/components/ui/Card';
import type { User } from "../types";

interface UserStatsProps {
  users: User[];
  loading?: boolean;
  onFilterClick?: (filterType: 'all' | 'admin' | 'supervisor' | 'active') => void;
}

export const UserStats: React.FC<UserStatsProps> = ({ users, loading = false, onFilterClick }) => {
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
    },
    {
      title: "Administradores",
      value: stats.admins,
      icon: Shield,
      color: "red",
    },
    {
      title: "Supervisores",
      value: stats.supervisors,
      icon: Shield,
      color: "purple",
    },
    {
      title: "Usuarios Activos",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "green",
    },
  ];

  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      text: "text-blue-900 dark:text-blue-100",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-900/40",
      text: "text-red-900 dark:text-red-100",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-800",
      icon: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/40",
      text: "text-purple-900 dark:text-purple-100",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      icon: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-900/40",
      text: "text-green-900 dark:text-green-100",
    },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((_stat, index) => (
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
        const filterTypes: Array<'all' | 'admin' | 'supervisor' | 'active'> = ['all', 'admin', 'supervisor', 'active'];

        return (
          <div
            key={index}
            className="cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={() => onFilterClick?.(filterTypes[index])}
          >
            <Card
              className={`${colors.bg} ${colors.border} transition-all duration-200 hover:shadow-lg`}
            >
            <div className="flex items-center justify-between p-3">
              <div className="flex-1">
                <div className={`text-xs font-medium ${colors.icon}`}>
                  {stat.title}
                </div>
                <div className={`text-2xl font-bold ${colors.text} mt-1`}>
                  {stat.value.toLocaleString()}
                </div>
              </div>
              <div
                className={`w-10 h-10 ${colors.iconBg} rounded-xl flex items-center justify-center shadow-sm`}
              >
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
            </div>
          </Card>
          </div>
        );
      })}
    </div>
  );
};
