import React from 'react';
import { Card } from '../components/ui/Card';
import { TrendingUp, Users, Database, Activity } from 'lucide-react';

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  changeType: 'positive' | 'negative';
}> = ({ title, value, change, icon: Icon, changeType }) => (
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className={`text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      </div>
      <div className="p-3 bg-[#18D043]/10 rounded-full">
        <Icon size={24} className="text-[#18D043]" />
      </div>
    </div>
  </Card>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Registros"
          value="1,247"
          change="+12.5%"
          icon={Database}
          changeType="positive"
        />
        <StatCard
          title="Usuarios Activos"
          value="85"
          change="+8.2%"
          icon={Users}
          changeType="positive"
        />
        <StatCard
          title="Equipos Activos"
          value="923"
          change="-2.4%"
          icon={Activity}
          changeType="negative"
        />
        <StatCard
          title="Crecimiento"
          value="23.1%"
          change="+5.7%"
          icon={TrendingUp}
          changeType="positive"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
          <div className="space-y-3">
            {[
              { label: 'Activo', value: 65, color: 'bg-[#18D043]' },
              { label: 'Mantenimiento', value: 20, color: 'bg-yellow-500' },
              { label: 'Inactivo', value: 10, color: 'bg-gray-400' },
              { label: 'Vencido', value: 5, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {[
              { action: 'Nuevo registro creado', time: 'Hace 2 horas', user: 'Juan Pérez' },
              { action: 'Usuario actualizado', time: 'Hace 4 horas', user: 'María García' },
              { action: 'Equipo en mantenimiento', time: 'Hace 6 horas', user: 'Carlos López' },
              { action: 'Instalación completada', time: 'Hace 8 horas', user: 'Ana Martínez' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#18D043] rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time} • {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};