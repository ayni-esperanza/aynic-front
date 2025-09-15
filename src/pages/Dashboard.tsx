import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  BellRing,
  Activity,
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
  Users,
  Database,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Card } from "../shared/components/ui/Card";
import { Badge } from "../shared/components/ui/Badge";
import { Button } from "../shared/components/ui/Button";
import { Select } from "../shared/components/ui/Select";
import { LoadingSpinner } from "../shared/components/ui/LoadingSpinner";
import { useToast } from "../shared/components/ui/Toast";
import { useApi } from "../shared/hooks/useApi";
import {
  alertService,
  type Alert,
  type AlertStats,
} from "../shared/services/alertService";
import { formatDateTime } from "../shared/utils/formatters";

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
    <div
      className={`${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <Card
        className={`${colors.bg} ${colors.border} ${
          onClick
            ? "hover:shadow-lg transform hover:scale-105"
            : ""
        } transition-all duration-200`}
      >
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex-1 min-w-0">
            <div className={`text-xs sm:text-sm font-medium ${colors.icon}`}>{title}</div>
            <div className="flex items-center mt-1 sm:mt-2">
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <div className={`text-2xl sm:text-3xl font-bold ${colors.text}`}>
                  {typeof value === "number" ? value.toLocaleString() : value}
                </div>
              )}
            </div>
            {description && (
              <div className="mt-1 text-xs text-gray-600 hidden sm:block">{description}</div>
            )}
            {trend && (
              <div className="flex items-center mt-1 sm:mt-2">
                <span
                  className={`text-xs sm:text-sm font-medium flex items-center ${trend.positive ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {trend.positive ? (
                    <TrendingUp size={12} className="mr-1 sm:w-3.5 sm:h-3.5" />
                  ) : (
                    <TrendingDown size={12} className="mr-1 sm:w-3.5 sm:h-3.5" />
                  )}
                  {trend.value}
                </span>
                <span className="ml-1 text-xs text-gray-500 hidden sm:inline">
                  vs periodo anterior
                </span>
              </div>
            )}
          </div>
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 ${colors.iconBg} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}
          >
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.icon}`} />
        </div>
      </div>
      </Card>
    </div>
  );
  };

// Componente para alertas individuales
const AlertItem: React.FC<{
  alert: Alert;
  onMarkAsRead: (id: string) => void;
  onViewRecord: (recordId: string) => void;
}> = ({ alert, onMarkAsRead, onViewRecord }) => {
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
      className={`border-l-4 ${priorityConfig.borderColor} ${priorityConfig.bgColor
        } rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-sm ${!alert.leida ? "ring-2 ring-opacity-20 ring-blue-500" : ""
        }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1 space-x-2 sm:space-x-3">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 ${priorityConfig.bgColor} rounded-lg flex items-center justify-center border ${priorityConfig.borderColor} flex-shrink-0`}
          >
            <TypeIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${priorityConfig.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center mb-1 gap-1 sm:gap-2">
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

            <div className={`text-xs sm:text-sm font-medium ${priorityConfig.color} mb-2`}>
              {alert.mensaje}
            </div>

            {alert.record && (
              <div className="p-2 mb-2 bg-white border border-gray-100 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <Database size={10} className="text-gray-400 sm:w-3 sm:h-3" />
                    <span className="text-gray-600">Código:</span>
                    <span className="font-medium text-gray-900 truncate">
                      {alert.record.codigo}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users size={10} className="text-gray-400 sm:w-3 sm:h-3" />
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium text-gray-900 truncate">
                      {alert.record.cliente}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <span className="text-xs text-gray-500">
                {formatDateTime(alert.fecha_creada)}
              </span>

              <div className="flex flex-wrap items-center gap-2">
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
                    <Check size={10} className="mr-1 sm:w-3 sm:h-3" />
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
                    <ExternalLink size={10} className="mr-1 sm:w-3 sm:h-3" />
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

  // Referencias para el ciclo de vida del componente
  const mountedRef = useRef(true);
  const isInitializedRef = useRef(false);

  // Estados
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [alertFilters, setAlertFilters] = useState({
    tipo: "" as Alert["tipo"] | "",
    prioridad: "" as Alert["prioridad"] | "",
    leida: "" as boolean | "",
  });
  const [refreshing, setRefreshing] = useState(false);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [alertsPagination, setAlertsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Hooks de API
  const { loading: loadingAlertStats, execute: loadAlertStats } = useApi(
    alertService.getDashboardSummary.bind(alertService),
    {
      onSuccess: (data) => {
        setAlertStats(data);
      },
      onError: (error) => {
        showError(
          "Error al cargar estadísticas de alertas",
          (typeof error === "object" && error !== null && "message" in error)
            ? (error as Error).message
            : String(error)
        );
      },
    }
  );

  // Hook para cargar alertas con paginación real
  const { loading: loadingAlerts, execute: loadAlerts } = useApi(
    (filters: any) => alertService.getAlerts(filters),
    {
      onSuccess: (data) => {
        setAllAlerts(data.data);
        setAlertsPagination(data.pagination);
      },
      onError: (error) => {
        showError("Error al cargar alertas", error);
      },
    }
  );

  const { execute: markAlertAsRead } = useApi(
    (id: any) => alertService.markAsRead(id),
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

  const loadAlertStatsStable = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const data = await alertService.getDashboardSummary();
      if (mountedRef.current) {
        setAlertStats(data);
      }
    } catch (error) {
      if (mountedRef.current) {
        showError(
          "Error al cargar estadísticas de alertas",
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }, []);

  const loadAlertsStable = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "fecha_creada",
        sortOrder: "DESC" as const,
        tipo: alertFilters.tipo || undefined,
        prioridad: alertFilters.prioridad || undefined,
        leida: alertFilters.leida === "" ? undefined : alertFilters.leida,
      };

      const data = await alertService.getAlerts(filters);
      if (mountedRef.current) {
        setAllAlerts(data.data);
        setAlertsPagination(data.pagination);
      }
    } catch (error) {
      if (mountedRef.current) {
        showError(
          "Error al cargar alertas",
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }, [currentPage, itemsPerPage, alertFilters]);

  useEffect(() => {
    mountedRef.current = true;

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      loadAlertStatsStable();
      loadAlertsStable();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [loadAlertStatsStable, loadAlertsStable]);

  // Cargar alertas cuando cambian los filtros o la página
  useEffect(() => {
    if (isInitializedRef.current) {
      loadAlertsStable();
    }
  }, [loadAlertsStable]);

  // Funciones
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadAlertStats(),
        loadAlerts()
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadAlertStats, loadAlerts]);

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

  // Usar las alertas cargadas con paginación real
  const paginatedAlerts = allAlerts;
  const totalPages = alertsPagination.totalPages;

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [alertFilters]);

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

  const loading = loadingAlertStats || loadingAlerts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl px-3 py-4 mx-auto sm:px-6 sm:py-6 lg:px-8">
        <div className="pb-8 space-y-6 sm:space-y-8">
          {/* Header del Dashboard de Alertas */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-xl flex items-center justify-center shadow-lg">
                <BellRing className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Dashboard de Control
                </h1>
                <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 text-gray-600">
                  <span className="text-sm sm:text-base">Monitoreo en tiempo real de alertas y registros</span>
                  {alertStats && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#18D043]/10 text-[#16a34a]">
                      <span className="inline-block w-2 h-2 mr-1 bg-[#18D043] rounded-full animate-pulse"></span>
                      {alertStats.noLeidas} alertas activas
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              <Button
                onClick={refreshData}
                variant="outline"
                icon={RefreshCw}
                loading={refreshing}
                className="w-full sm:w-auto"
              >
                Actualizar
              </Button>
              <Button
                onClick={handleGenerateAlerts}
                variant="outline"
                icon={Zap}
                className="w-full sm:w-auto border-[#18D043] text-[#18D043] hover:bg-[#18D043] hover:text-white"
              >
                Generar Alertas
              </Button>
            </div>
          </div>

          {/* Métricas Principales de Alertas */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Distribución de Alertas por Tipo */}
            <Card>
              <div className="p-4 sm:p-6">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                  <h3 className="flex items-center text-base sm:text-lg font-semibold text-gray-900">
                    <PieChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                    Distribución por Tipo
                  </h3>
                  {alertStats && (
                    <span className="text-xs sm:text-sm text-gray-500">
                      Total: {alertStats.total}
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-32 sm:h-48">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
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
                          className="flex items-center space-x-3 sm:space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-base sm:text-lg">{color.icon}</span>
                            <div
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${color.bg}`}
                            ></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize truncate">
                                {item.tipo.replace("_", " ")}
                              </span>
                              <span
                                className={`text-xs sm:text-sm font-semibold ${color.text} ml-2`}
                              >
                                {item.count} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-1.5 sm:h-2 rounded-full ${color.bg} transition-all duration-300`}
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
              <div className="p-4 sm:p-6">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                  <h3 className="flex items-center text-base sm:text-lg font-semibold text-gray-900">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                    Distribución por Prioridad
                  </h3>
                  {alertStats && (
                    <span className="text-xs sm:text-sm text-gray-500">
                      No leídas: {alertStats.noLeidas}
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-32 sm:h-48">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
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
                          className="flex items-center space-x-3 sm:space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-base sm:text-lg">{color.icon}</span>
                            <div
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${color.bg}`}
                            ></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize truncate">
                                {item.prioridad}
                              </span>
                              <span
                                className={`text-xs sm:text-sm font-semibold ${color.text} ml-2`}
                              >
                                {item.count} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-1.5 sm:h-2 rounded-full ${color.bg} transition-all duration-300`}
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
              <div className="p-4 sm:p-6">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                  <h3 className="flex items-center text-base sm:text-lg font-semibold text-red-900">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
                    Alertas Críticas Activas
                    <Badge variant="danger" className="ml-2">
                      {alertStats.criticas.length}
                    </Badge>
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMarkAllAsRead}
                    className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50"
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
            <div className="p-4 sm:p-6">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                <h3 className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#18D043]" />
                  Centro de Gestión de Alertas
                  {alertStats && (
                    <Badge variant="primary" className="ml-2">
                      {paginatedAlerts.length} de {alertStats.total}
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
                    <Check size={14} className="mr-1 sm:w-4 sm:h-4" />
                    Marcar todas leídas
                  </Button>
                </div>
              </div>

              {/* Filtros de Alertas */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:flex-wrap sm:items-center sm:space-y-0 gap-3 sm:gap-4 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Filter size={14} className="text-gray-500 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Filtros:
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full sm:w-auto">
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
                    className="w-full sm:min-w-40"
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
                    className="w-full sm:min-w-40"
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
                    className="w-full sm:min-w-32"
                  />
                </div>

                {(alertFilters.tipo ||
                  alertFilters.prioridad ||
                  alertFilters.leida !== "") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setAlertFilters({ tipo: "", prioridad: "", leida: "" })
                    }
                    className="text-gray-500 hover:text-gray-700 w-full sm:w-auto"
                  >
                    <X size={14} className="mr-1 sm:w-4 sm:h-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Estadísticas rápidas de filtros aplicados */}
              {(alertFilters.tipo ||
                alertFilters.prioridad ||
                alertFilters.leida !== "") && (
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-2">
                    <Activity size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium text-blue-800">
                      Filtros aplicados: {paginatedAlerts.length} alertas encontradas
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-blue-600">
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
              ) : paginatedAlerts.length === 0 ? (
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
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 sm:grid-cols-4">
                  <div className="p-2 sm:p-3 text-center border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-base sm:text-lg font-bold text-gray-900">
                      {paginatedAlerts.length}
                    </div>
                    <div className="text-xs text-gray-600">Total mostradas</div>
                  </div>
                  <div className="p-2 sm:p-3 text-center border border-red-200 rounded-lg bg-red-50">
                    <div className="text-base sm:text-lg font-bold text-red-900">
                      {
                        paginatedAlerts.filter((a) => a.prioridad === "critical")
                          .length
                      }
                    </div>
                    <div className="text-xs text-red-600">Críticas</div>
                  </div>
                  <div className="p-2 sm:p-3 text-center border border-orange-200 rounded-lg bg-orange-50">
                    <div className="text-base sm:text-lg font-bold text-orange-900">
                      {paginatedAlerts.filter((a) => !a.leida).length}
                    </div>
                    <div className="text-xs text-orange-600">No leídas</div>
                  </div>
                  <div className="p-2 sm:p-3 text-center border border-green-200 rounded-lg bg-green-50">
                    <div className="text-base sm:text-lg font-bold text-green-900">
                      {paginatedAlerts.filter((a) => a.leida).length}
                    </div>
                    <div className="text-xs text-green-600">Procesadas</div>
                  </div>
                </div>

                  {/* Lista de alertas paginada */}
                  <div className="space-y-4">
                    {paginatedAlerts.map((alert) => (
                      <AlertItem
                        key={alert.id}
                        alert={alert}
                        onMarkAsRead={handleMarkAsRead}
                        onViewRecord={handleViewRecord}
                      />
                    ))}
                  </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                      Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, alertsPagination.totalItems)} de {alertsPagination.totalItems} alertas
                    </div>
                    
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-2 sm:px-3 py-1"
                        >
                          <ChevronLeft size={14} className="mr-1 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Anterior</span>
                        </Button>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let page;
                            if (totalPages <= 5) {
                              page = i + 1;
                            } else if (currentPage <= 3) {
                              page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              page = totalPages - 4 + i;
                            } else {
                              page = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={page}
                                size="sm"
                                variant={page === currentPage ? "primary" : "outline"}
                                onClick={() => setCurrentPage(page)}
                                className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                              >
                                {page}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-2 sm:px-3 py-1"
                        >
                          <span className="hidden sm:inline">Siguiente</span>
                          <ChevronRightIcon size={14} className="ml-1 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Acciones masivas */}
                {paginatedAlerts.some((alert) => !alert.leida) && (
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pt-4 mt-4 sm:mt-6 border-t border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                      {paginatedAlerts.filter((a) => !a.leida).length} alertas sin
                      leer en la vista actual
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleMarkAllAsRead}
                        className="w-full sm:w-auto text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <Check size={14} className="mr-1 sm:w-4 sm:h-4" />
                        Marcar todas como leídas
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/registro")}
                        className="w-full sm:w-auto text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Database size={14} className="mr-1 sm:w-4 sm:h-4" />
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
      </div>
    </div>
  );
};