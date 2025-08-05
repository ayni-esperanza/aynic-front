import React, { useState, useRef ,useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  BellRing,
  Activity,
  Eye,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Users,
  Database,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useToast } from "../components/ui/Toast";
import { useApi } from "../hooks/useApi";
import {
  alertService,
  type Alert,
  type AlertStats,
} from "../services/alertService";
import { formatDateTime } from "../utils/formatters";

// Componente para métricas de alertas
const AlertMetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: "blue" | "green" | "yellow" | "red" | "purple" | "indigo" | "orange";
  trend?: { value: string; positive: boolean };
  onClick?: () => void;
  loading?: boolean;
  description?: string;
}> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  onClick,
  loading = false,
  description,
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      border: "border-blue-200",
      icon: "text-blue-600",
      iconBg: "bg-blue-100",
      text: "text-blue-900",
      trend: "text-blue-600",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-100",
      border: "border-green-200",
      icon: "text-green-600",
      iconBg: "bg-green-100",
      text: "text-green-900",
      trend: "text-green-600",
    },
    yellow: {
      bg: "bg-gradient-to-br from-yellow-50 to-amber-100",
      border: "border-yellow-200",
      icon: "text-yellow-600",
      iconBg: "bg-yellow-100",
      text: "text-yellow-900",
      trend: "text-yellow-600",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-pink-100",
      border: "border-red-200",
      icon: "text-red-600",
      iconBg: "bg-red-100",
      text: "text-red-900",
      trend: "text-red-600",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-violet-100",
      border: "border-purple-200",
      icon: "text-purple-600",
      iconBg: "bg-purple-100",
      text: "text-purple-900",
      trend: "text-purple-600",
    },
    indigo: {
      bg: "bg-gradient-to-br from-indigo-50 to-blue-100",
      border: "border-indigo-200",
      icon: "text-indigo-600",
      iconBg: "bg-indigo-100",
      text: "text-indigo-900",
      trend: "text-indigo-600",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-amber-100",
      border: "border-orange-200",
      icon: "text-orange-600",
      iconBg: "bg-orange-100",
      text: "text-orange-900",
      trend: "text-orange-600",
    },
  };

  const colors = colorClasses[color];

  return (
    <Card
      className={`${colors.bg} ${colors.border} ${
        onClick
          ? "cursor-pointer hover:shadow-lg transform hover:scale-105"
          : ""
      } transition-all duration-200`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between p-6">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.icon}`}>{title}</p>
          <div className="flex items-center mt-2">
            {loading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <p className={`text-3xl font-bold ${colors.text}`}>
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-gray-600">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium flex items-center ${
                  trend.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.positive ? (
                  <TrendingUp size={14} className="mr-1" />
                ) : (
                  <TrendingDown size={14} className="mr-1" />
                )}
                {trend.value}
              </span>
              <span className="ml-1 text-xs text-gray-500">
                vs periodo anterior
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center shadow-sm`}
        >
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </Card>
  );
};

// Componente para alertas individuales
const AlertItem: React.FC<{
  alert: Alert;
  onMarkAsRead: (id: string) => void;
  onViewRecord: (recordId: string) => void;
  compact?: boolean;
}> = ({ alert, onMarkAsRead, onViewRecord, compact = false }) => {
  const getPriorityConfig = (priority: Alert["prioridad"]) => {
    const configs = {
      low: {
        variant: "secondary" as const,
        icon: CheckCircle,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
      },
      medium: {
        variant: "primary" as const,
        icon: Clock,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      },
      high: {
        variant: "warning" as const,
        icon: AlertTriangle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      },
      critical: {
        variant: "danger" as const,
        icon: AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      },
    };
    return configs[priority];
  };

  const getTypeIcon = (type: Alert["tipo"]) => {
    const icons = {
      por_vencer: Clock,
      vencido: XCircle,
      critico: AlertTriangle,
    };
    return icons[type];
  };

  const priorityConfig = getPriorityConfig(alert.prioridad);
  const TypeIcon = getTypeIcon(alert.tipo);

  return (
    <div
      className={`border-l-4 ${priorityConfig.borderColor} ${
        priorityConfig.bgColor
      } rounded-lg p-4 transition-all duration-200 hover:shadow-sm ${
        !alert.leida ? "ring-2 ring-opacity-20 ring-blue-500" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1 space-x-3">
          <div
            className={`w-8 h-8 ${priorityConfig.bgColor} rounded-lg flex items-center justify-center border ${priorityConfig.borderColor}`}
          >
            <TypeIcon className={`w-4 h-4 ${priorityConfig.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1 space-x-2">
              <Badge variant={priorityConfig.variant} size="sm">
                {alert.tipo.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge variant={priorityConfig.variant} size="sm">
                {alert.prioridad.toUpperCase()}
              </Badge>
              {!alert.leida && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>

            <p className={`text-sm font-medium ${priorityConfig.color} mb-2`}>
              {alert.mensaje}
            </p>

            {alert.record && (
              <div className="p-2 mb-2 bg-white border border-gray-100 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <Database size={12} className="text-gray-400" />
                    <span className="text-gray-600">Código:</span>
                    <span className="font-medium text-gray-900">
                      {alert.record.codigo}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium text-gray-900">
                      {alert.record.cliente}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {formatDateTime(alert.fecha_creada)}
              </span>

              <div className="flex items-center space-x-2">
                {!alert.leida && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(alert.id);
                    }}
                    className="text-xs hover:bg-green-50 hover:text-green-700"
                  >
                    <Check size={12} className="mr-1" />
                    Marcar leída
                  </Button>
                )}

                {alert.record && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewRecord(alert.record!.id);
                    }}
                    className="text-xs hover:bg-blue-50 hover:text-blue-700"
                  >
                    <ExternalLink size={12} className="mr-1" />
                    Ver registro
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  // Estados
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [alertFilters, setAlertFilters] = useState({
    tipo: "" as Alert["tipo"] | "",
    prioridad: "" as Alert["prioridad"] | "",
    leida: "" as boolean | "",
  });
  const [refreshing, setRefreshing] = useState(false);

  // Hooks de API
  const { loading: loadingAlertStats, execute: loadAlertStats } = useApi(
    alertService.getDashboardSummary.bind(alertService),
    {
      onSuccess: (data) => {
        setAlertStats(data);
      },
      onError: (error) => {
        showError("Error al cargar estadísticas de alertas", error);
      },
    }
  );

  const { execute: markAlertAsRead } = useApi(
    alertService.markAsRead.bind(alertService),
    {
      onSuccess: () => {
        success("Alerta marcada como leída");
        refreshData();
      },
      onError: (error) => {
        showError("Error al marcar alerta como leída", error);
      },
    }
  );

  const { execute: markAllAlertsAsRead } = useApi(
    alertService.markAllAsRead.bind(alertService),
    {
      onSuccess: (result) => {
        success(`${result.updated} alertas marcadas como leídas`);
        refreshData();
      },
      onError: (error) => {
        showError("Error al marcar todas las alertas como leídas", error);
      },
    }
  );

  const { execute: generateAlerts } = useApi(
    alertService.generateAlerts.bind(alertService),
    {
      onSuccess: (result) => {
        success(
          `Se generaron ${result.generated} nuevas alertas de ${result.evaluated} registros evaluados`
        );
        refreshData();
      },
      onError: (error) => {
        showError("Error al generar alertas", error);
      },
    }
  );

  // Referencias para controlar carga inicial
  const isInitialLoadRef = useRef(true);

  // CORREGIDO: Cargar datos inicial solo una vez
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      loadAlertStats();
    }
  }, []);

  // Funciones
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAlertStats();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadAlertStats]);

  const handleMarkAsRead = useCallback(
    async (alertId: string) => {
      await markAlertAsRead(alertId);
    },
    [markAlertAsRead]
  );

  const handleViewRecord = useCallback(
    (recordId: string) => {
      navigate(`/registro/detalle/${recordId}`);
    },
    [navigate]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (
      confirm(
        "¿Estás seguro de que quieres marcar todas las alertas como leídas?"
      )
    ) {
      await markAllAlertsAsRead();
    }
  }, [markAllAlertsAsRead]);

  const handleGenerateAlerts = useCallback(async () => {
    if (
      confirm(
        "¿Estás seguro de que quieres generar nuevas alertas? Esto evaluará todos los registros."
      )
    ) {
      await generateAlerts();
    }
  }, [generateAlerts]);

  // Filtrar alertas
  const filteredAlerts = useMemo(() => {
    if (!alertStats) return [];

    let alerts = [...alertStats.recientes];

    if (alertFilters.tipo) {
      alerts = alerts.filter((alert) => alert.tipo === alertFilters.tipo);
    }
    if (alertFilters.prioridad) {
      alerts = alerts.filter(
        (alert) => alert.prioridad === alertFilters.prioridad
      );
    }
    if (alertFilters.leida !== "") {
      alerts = alerts.filter((alert) => alert.leida === alertFilters.leida);
    }

    return alerts;
  }, [alertStats, alertFilters]);

  // Calcular métricas de tendencia (simuladas por ahora)
  const alertTrends = useMemo(() => {
    if (!alertStats) return null;

    return {
      totalTrend: { value: "+12%", positive: false },
      criticalTrend: { value: "-5%", positive: true },
      unreadTrend: { value: "+8%", positive: false },
      resolvedTrend: { value: "+15%", positive: true },
    };
  }, [alertStats]);

  const loading = loadingAlertStats;

  return (
    <div className="pb-8 space-y-8">
      {/* Header del Dashboard de Alertas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-xl flex items-center justify-center shadow-lg">
            <BellRing className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard de Control
            </h1>
            <p className="flex items-center space-x-2 text-gray-600">
              <span>Monitoreo en tiempo real de alertas y registros</span>
              {alertStats && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#18D043]/10 text-[#16a34a]">
                  <div className="w-2 h-2 mr-1 bg-[#18D043] rounded-full animate-pulse"></div>
                  {alertStats.noLeidas} alertas activas
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={refreshData}
            variant="outline"
            icon={RefreshCw}
            loading={refreshing}
            className="border-gray-300 hover:bg-gray-50"
          >
            Actualizar
          </Button>
          <Button
            onClick={handleGenerateAlerts}
            variant="outline"
            icon={Zap}
            className="border-[#18D043] text-[#18D043] hover:bg-[#18D043] hover:text-white"
          >
            Generar Alertas
          </Button>
        </div>
      </div>

      {/* Métricas Principales de Alertas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AlertMetricCard
          title="Total Alertas"
          value={alertStats?.total || 0}
          icon={Bell}
          color="blue"
          loading={loading}
          description="Todas las alertas del sistema"
          trend={alertTrends?.totalTrend}
        />

        <AlertMetricCard
          title="Alertas Críticas"
          value={alertStats?.criticas.length || 0}
          icon={AlertTriangle}
          color="red"
          loading={loading}
          description="Requieren atención inmediata"
          trend={alertTrends?.criticalTrend}
        />

        <AlertMetricCard
          title="No Leídas"
          value={alertStats?.noLeidas || 0}
          icon={BellRing}
          color="orange"
          loading={loading}
          description="Alertas pendientes de revisar"
          trend={alertTrends?.unreadTrend}
        />

        <AlertMetricCard
          title="Resueltas Hoy"
          value={alertStats ? alertStats.total - alertStats.noLeidas : 0}
          icon={CheckCircle}
          color="green"
          loading={loading}
          description="Alertas procesadas"
          trend={alertTrends?.resolvedTrend}
        />
      </div>

      {/* Gráficos y Estadísticas de Alertas */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Distribución de Alertas por Tipo */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center text-lg font-semibold text-gray-900">
                <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                Distribución por Tipo
              </h3>
              {alertStats && (
                <span className="text-sm text-gray-500">
                  Total: {alertStats.total}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {alertStats?.porTipo.map((item) => {
                  const percentage =
                    alertStats.total > 0
                      ? Math.round((item.count / alertStats.total) * 100)
                      : 0;

                  const colors = {
                    por_vencer: {
                      bg: "bg-yellow-500",
                      text: "text-yellow-600",
                      icon: "🟡",
                    },
                    vencido: {
                      bg: "bg-red-500",
                      text: "text-red-600",
                      icon: "🔴",
                    },
                    critico: {
                      bg: "bg-purple-500",
                      text: "text-purple-600",
                      icon: "🚨",
                    },
                  };

                  const color = colors[item.tipo] || colors.por_vencer;

                  return (
                    <div
                      key={item.tipo}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{color.icon}</span>
                        <div
                          className={`w-3 h-3 rounded-full ${color.bg}`}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {item.tipo.replace("_", " ")}
                          </span>
                          <span
                            className={`text-sm font-semibold ${color.text}`}
                          >
                            {item.count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${color.bg} transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(!alertStats?.porTipo || alertStats.porTipo.length === 0) && (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Bell className="w-8 h-8 mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      No hay alertas por tipo
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Distribución de Alertas por Prioridad */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center text-lg font-semibold text-gray-900">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Distribución por Prioridad
              </h3>
              {alertStats && (
                <span className="text-sm text-gray-500">
                  No leídas: {alertStats.noLeidas}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {alertStats?.porPrioridad.map((item) => {
                  const percentage =
                    alertStats.total > 0
                      ? Math.round((item.count / alertStats.total) * 100)
                      : 0;

                  const colors = {
                    low: {
                      bg: "bg-gray-500",
                      text: "text-gray-600",
                      icon: "⚪",
                    },
                    medium: {
                      bg: "bg-blue-500",
                      text: "text-blue-600",
                      icon: "🔵",
                    },
                    high: {
                      bg: "bg-orange-500",
                      text: "text-orange-600",
                      icon: "🟠",
                    },
                    critical: {
                      bg: "bg-red-500",
                      text: "text-red-600",
                      icon: "🔴",
                    },
                  };

                  const color = colors[item.prioridad] || colors.medium;

                  return (
                    <div
                      key={item.prioridad}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{color.icon}</span>
                        <div
                          className={`w-3 h-3 rounded-full ${color.bg}`}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {item.prioridad}
                          </span>
                          <span
                            className={`text-sm font-semibold ${color.text}`}
                          >
                            {item.count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${color.bg} transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(!alertStats?.porPrioridad ||
                  alertStats.porPrioridad.length === 0) && (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <BarChart3 className="w-8 h-8 mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      No hay alertas por prioridad
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Alertas Críticas */}
      {alertStats?.criticas && alertStats.criticas.length > 0 && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center text-lg font-semibold text-red-900">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Alertas Críticas Activas
                <Badge variant="danger" className="ml-2">
                  {alertStats.criticas.length}
                </Badge>
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAllAsRead}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Marcar todas como leídas
              </Button>
            </div>

            <div className="space-y-3">
              {alertStats.criticas.slice(0, 5).map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onMarkAsRead={handleMarkAsRead}
                  onViewRecord={handleViewRecord}
                  compact
                />
              ))}

              {alertStats.criticas.length > 5 && (
                <div className="pt-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Ver todas las alertas críticas ({alertStats.criticas.length}
                    )
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Centro de Alertas */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="flex items-center text-xl font-semibold text-gray-900">
              <Bell className="w-6 h-6 mr-2 text-[#18D043]" />
              Centro de Gestión de Alertas
              {alertStats && (
                <Badge variant="primary" className="ml-2">
                  {filteredAlerts.length} de {alertStats.total}
                </Badge>
              )}
            </h3>

            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMarkAllAsRead}
                disabled={!alertStats?.noLeidas}
                className="text-gray-600 hover:text-gray-800"
              >
                <Check size={16} className="mr-1" />
                Marcar todas leídas
              </Button>
            </div>
          </div>

          {/* Filtros de Alertas */}
          <div className="flex flex-wrap items-center gap-4 p-4 mb-6 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filtros:
              </span>
            </div>

            <Select
              value={alertFilters.tipo}
              onChange={(e) =>
                setAlertFilters((prev) => ({
                  ...prev,
                  tipo: e.target.value as Alert["tipo"] | "",
                }))
              }
              options={[
                { value: "", label: "Todos los tipos" },
                { value: "por_vencer", label: "🟡 Por Vencer" },
                { value: "vencido", label: "🔴 Vencido" },
                { value: "critico", label: "🚨 Crítico" },
              ]}
              className="min-w-40"
            />

            <Select
              value={alertFilters.prioridad}
              onChange={(e) =>
                setAlertFilters((prev) => ({
                  ...prev,
                  prioridad: e.target.value as Alert["prioridad"] | "",
                }))
              }
              options={[
                { value: "", label: "Todas las prioridades" },
                { value: "low", label: "⚪ Baja" },
                { value: "medium", label: "🔵 Media" },
                { value: "high", label: "🟠 Alta" },
                { value: "critical", label: "🔴 Crítica" },
              ]}
              className="min-w-40"
            />

            <Select
              value={alertFilters.leida.toString()}
              onChange={(e) =>
                setAlertFilters((prev) => ({
                  ...prev,
                  leida: e.target.value === "" ? "" : e.target.value === "true",
                }))
              }
              options={[
                { value: "", label: "Todas" },
                { value: "false", label: "📬 No leídas" },
                { value: "true", label: "📭 Leídas" },
              ]}
              className="min-w-32"
            />

            {(alertFilters.tipo ||
              alertFilters.prioridad ||
              alertFilters.leida !== "") && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setAlertFilters({ tipo: "", prioridad: "", leida: "" })
                }
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={16} className="mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Estadísticas rápidas de filtros aplicados */}
          {(alertFilters.tipo ||
            alertFilters.prioridad ||
            alertFilters.leida !== "") && (
            <div className="flex items-center justify-between p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center space-x-2">
                <Activity size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Filtros aplicados: {filteredAlerts.length} alertas encontradas
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-blue-600">
                {alertFilters.tipo && (
                  <span className="px-2 py-1 bg-white rounded-md">
                    Tipo: {alertFilters.tipo.replace("_", " ")}
                  </span>
                )}
                {alertFilters.prioridad && (
                  <span className="px-2 py-1 bg-white rounded-md">
                    Prioridad: {alertFilters.prioridad}
                  </span>
                )}
                {alertFilters.leida !== "" && (
                  <span className="px-2 py-1 bg-white rounded-md">
                    Estado: {alertFilters.leida ? "Leídas" : "No leídas"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Lista de Alertas */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Cargando alertas...</span>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="mb-2 text-lg font-medium text-gray-900">
                {alertStats?.total === 0 ? "No hay alertas" : "Sin resultados"}
              </h4>
              <p className="max-w-sm text-gray-600">
                {alertStats?.total === 0
                  ? 'No se han generado alertas todavía. Haz clic en "Generar Alertas" para crear nuevas alertas.'
                  : "No hay alertas que coincidan con los filtros seleccionados. Prueba ajustando los criterios de búsqueda."}
              </p>
              {alertStats?.total === 0 && (
                <div className="mt-4">
                  <Button
                    onClick={handleGenerateAlerts}
                    icon={Zap}
                    className="bg-[#18D043] hover:bg-[#16a34a]"
                  >
                    Generar Alertas
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Resumen de alertas filtradas */}
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
                <div className="p-3 text-center border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-lg font-bold text-gray-900">
                    {filteredAlerts.length}
                  </div>
                  <div className="text-xs text-gray-600">Total mostradas</div>
                </div>
                <div className="p-3 text-center border border-red-200 rounded-lg bg-red-50">
                  <div className="text-lg font-bold text-red-900">
                    {
                      filteredAlerts.filter((a) => a.prioridad === "critical")
                        .length
                    }
                  </div>
                  <div className="text-xs text-red-600">Críticas</div>
                </div>
                <div className="p-3 text-center border border-orange-200 rounded-lg bg-orange-50">
                  <div className="text-lg font-bold text-orange-900">
                    {filteredAlerts.filter((a) => !a.leida).length}
                  </div>
                  <div className="text-xs text-orange-600">No leídas</div>
                </div>
                <div className="p-3 text-center border border-green-200 rounded-lg bg-green-50">
                  <div className="text-lg font-bold text-green-900">
                    {filteredAlerts.filter((a) => a.leida).length}
                  </div>
                  <div className="text-xs text-green-600">Procesadas</div>
                </div>
              </div>

              {/* Lista de alertas con scroll */}
              <div className="space-y-4 overflow-y-auto max-h-96">
                {filteredAlerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onMarkAsRead={handleMarkAsRead}
                    onViewRecord={handleViewRecord}
                  />
                ))}
              </div>

              {/* Acciones masivas */}
              {filteredAlerts.some((alert) => !alert.leida) && (
                <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {filteredAlerts.filter((a) => !a.leida).length} alertas sin
                    leer en la vista actual
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleMarkAllAsRead}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <Check size={16} className="mr-1" />
                      Marcar todas como leídas
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/registro")}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Database size={16} className="mr-1" />
                      Ver registros
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};