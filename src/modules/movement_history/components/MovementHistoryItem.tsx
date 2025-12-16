import React, { useState } from "react";
import { ChevronDown, ChevronRight, Eye, EyeOff, Users, Calendar } from "lucide-react";
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
    <div style={{ marginTop: '12px' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          fontWeight: '500',
          color: '#6b7280',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = '#374151';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = '#6b7280';
        }}
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>{title}</span>
      </button>

      {isExpanded && (
        <div style={{
          padding: '12px',
          marginTop: '8px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb'
        }}>
          <pre style={{
            overflow: 'auto',
            fontSize: '12px',
            color: '#374151',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            margin: '0'
          }}>
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
    <div style={{ 
      width: '100%', 
      padding: '16px', 
      backgroundColor: 'white', 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '16px',
      minHeight: 'auto'
    }}>
      {/* Badge */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 8px',
          backgroundColor: getActionColor(movement.action) === 'success' ? '#dcfce7' : 
                          getActionColor(movement.action) === 'primary' ? '#dbeafe' : 
                          getActionColor(movement.action) === 'danger' ? '#fee2e2' : 
                          getActionColor(movement.action) === 'warning' ? '#fef3c7' : '#f3f4f6',
          color: getActionColor(movement.action) === 'success' ? '#166534' : 
                 getActionColor(movement.action) === 'primary' ? '#1e40af' : 
                 getActionColor(movement.action) === 'danger' ? '#dc2626' : 
                 getActionColor(movement.action) === 'warning' ? '#d97706' : '#374151',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {movement.action_label}
        </div>
      </div>

      {/* Título/Descripción */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: '#111827', 
          margin: '0',
          lineHeight: '1.4'
        }}>
          {movement.description}
        </p>
      </div>

      {/* IP Address */}
      {movement.ip_address && (
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>
          <strong>IP:</strong> {movement.ip_address}
        </div>
      )}

      {/* Botón para ver detalles */}
      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#374151',
            cursor: 'pointer'
          }}
        >
          {showDetails ? "Ocultar" : "Ver"} datos
        </button>
      </div>

      {/* Usuario */}
      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>
        <strong>Usuario:</strong> {movement.user_display_name}
      </div>

      {/* Fecha */}
      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>
        <strong>Fecha:</strong> {movement.formatted_date}
      </div>

      {/* Detalles expandibles */}
      {showDetails && (
        <div style={{
          paddingTop: '12px',
          marginTop: '12px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <JsonDataView
            title="Ver datos eliminados"
            data={movement.previous_values}
          />
          <JsonDataView
            title="Ver datos completos"
            data={movement.new_values}
          />

          {movement.changed_fields && movement.changed_fields.length > 0 && (
            <div>
              <h4 style={{
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: '500',
                color: '#6b7280'
              }}>
                Campos modificados:
              </h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                {movement.changed_fields.map((field, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: '#1e40af',
                      backgroundColor: '#dbeafe',
                      borderRadius: '4px'
                    }}
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
            <div>
              <h4 style={{
                marginBottom: '4px',
                fontSize: '12px',
                fontWeight: '500',
                color: '#6b7280'
              }}>
                Navegador:
              </h4>
              <p style={{
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#6b7280',
                borderRadius: '4px',
                backgroundColor: '#f9fafb',
                wordBreak: 'break-all',
                margin: '0'
              }}>
                {movement.user_agent}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};