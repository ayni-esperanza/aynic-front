import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, MapPin, Settings } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useAppStore } from '../../../store';
import { formatDate } from '../../../utils/formatters';
import type { DataRecord } from '../../../types';

export const RegistroDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { registros } = useAppStore();
  const [registro, setRegistro] = useState<DataRecord | null>(null);

  useEffect(() => {
    if (id) {
      const foundRegistro = registros.find(r => r.id === id);
      setRegistro(foundRegistro || null);
    }
  }, [id, registros]);

  if (!registro) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/registro')}
            icon={ArrowLeft}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registro no encontrado</h1>
          </div>
        </div>
      </div>
    );
  }

  const getEstadoVariant = (estado: DataRecord['estado_actual']) => {
    const variants = {
      activo: 'success' as const,
      inactivo: 'secondary' as const,
      mantenimiento: 'warning' as const,
      vencido: 'danger' as const,
    };
    return variants[estado];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/registro')}
            icon={ArrowLeft}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalle del Registro</h1>
            <p className="text-gray-600">Información completa del registro</p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/registro/editar/${registro.id}`)}
          icon={Edit}
        >
          Editar Registro
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{registro.codigo}</h2>
                  <p className="text-gray-600">{registro.cliente}</p>
                </div>
                <Badge variant={getEstadoVariant(registro.estado_actual)}>
                  {registro.estado_actual}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Equipo</p>
                    <p className="text-gray-900">{registro.equipo}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">SEEC</p>
                    <p className="text-gray-900">{registro.seec}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo de Línea</p>
                    <p className="text-gray-900">{registro.tipo_linea}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Longitud</p>
                    <p className="text-gray-900">{registro.longitud}m</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ubicación</p>
                      <p className="text-gray-900">{registro.ubicacion}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Instalación</p>
                      <p className="text-gray-900">{formatDate(registro.fecha_instalacion)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Vencimiento</p>
                      <p className="text-gray-900">{formatDate(registro.fecha_vencimiento)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vida Útil</p>
                    <p className="text-gray-900">{registro.fv_anios} años, {registro.fv_meses} meses</p>
                  </div>
                </div>
              </div>

              {registro.observaciones && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Observaciones</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{registro.observaciones}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Registro</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estado Actual</span>
                <Badge variant={getEstadoVariant(registro.estado_actual)}>
                  {registro.estado_actual}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tipo de Línea</span>
                <span className="text-sm font-medium text-gray-900">{registro.tipo_linea}</span>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate(`/registro/editar/${registro.id}`)}
                icon={Edit}
              >
                Editar Registro
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate(`/historial?registro=${registro.id}`)}
                icon={Settings}
              >
                Ver Historial
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};