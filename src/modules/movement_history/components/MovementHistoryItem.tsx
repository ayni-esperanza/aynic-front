import React, { useState } from "react";
import { ChevronDown, ChevronRight, Eye, EyeOff, Users, Calendar } from "lucide-react";
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import type { MovementHistoryItemProps, MovementAction } from "../types";

// Componente para mostrar datos JSON expandibles
const JsonDataView: React.FC<{
  title: string;
  data: Record<string, unknown> | null;
  expanded?: boolean;
}> = ({ title, data, expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  if (!data) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-800"
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>{title}</span>
      </button>

      {isExpanded && (
        <div className="p-3 mt-2 border rounded-lg bg-gray-50">
          <pre className="overflow-x-auto text-xs text-gray-800 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export const MovementHistoryItem: React.FC<MovementHistoryItemProps> = ({ movement }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getActionIcon = (action: MovementAction) => {
    const icons: Record<MovementAction, string> = {
      create: "➕",
      update: "✏️",
      delete: "🗑️",
      restore: "🔄",
      status_change: "🔄",
      image_upload: "📤",
      image_replace: "🔄",
      image_delete: "🗑️",
      location_change: "📍",
      company_change: "🏢",
      maintenance: "🔧",
    };
    return icons[action] || "📝";
  };

  const getActionColor = (
    action: MovementAction
  ): "success" | "primary" | "danger" | "warning" | "secondary" => {
    const colors: Record<
      MovementAction,
      "success" | "primary" | "danger" | "warning" | "secondary"
    > = {
      create: "success",
      update: "primary",
      delete: "danger",
      restore: "warning",
      status_change: "primary",
      image_upload: "success",
      image_replace: "warning",
      image_delete: "danger",
      location_change: "primary",
      company_change: "primary",
      maintenance: "warning",
    };
    return colors[action] || "secondary";
  };

  return (
    <div className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {/* Icono de acción */}
          <div
            className={`p-2 rounded-lg bg-${getActionColor(
              movement.action
            )}-100`}
          >
            <span className="text-lg">{getActionIcon(movement.action)}</span>
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center space-x-2">
              <Badge variant={getActionColor(movement.action)}>
                {movement.action_label}
              </Badge>
              {movement.record_code && (
                <span className="text-sm text-gray-500">
                  {movement.record_code}
                </span>
              )}
            </div>

            {/* Descripción */}
            <p className="mt-1 font-medium text-gray-900">
              {movement.description}
            </p>

            {/* Metadatos */}
            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Users size={14} />
                <span>{movement.user_display_name}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{movement.formatted_date}</span>
              </span>
              {movement.ip_address && (
                <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                  IP: {movement.ip_address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botón para ver detalles */}
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            icon={showDetails ? EyeOff : Eye}
          >
            {showDetails ? "Ocultar" : "Ver"} datos
          </Button>
        </div>
      </div>

      {/* Detalles expandibles */}
      {showDetails && (
        <div className="pt-4 mt-4 border-t border-gray-200">
          <JsonDataView
            title="Ver datos eliminados"
            data={movement.previous_values}
          />
          <JsonDataView
            title="Ver datos completos"
            data={movement.new_values}
          />

          {movement.changed_fields && movement.changed_fields.length > 0 && (
            <div className="mt-3">
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                Campos modificados:
              </h4>
              <div className="flex flex-wrap gap-1">
                {movement.changed_fields.map((field, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {movement.additional_metadata && (
            <JsonDataView
              title="Metadatos adicionales"
              data={movement.additional_metadata}
            />
          )}

          {movement.user_agent && (
            <div className="mt-3">
              <h4 className="mb-1 text-sm font-medium text-gray-600">
                Navegador:
              </h4>
              <p className="p-2 font-mono text-xs text-gray-500 rounded bg-gray-50">
                {movement.user_agent}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
