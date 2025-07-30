import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useAppStore } from '../../../store';
import { formatDateTime } from '../../../utils/formatters';
import type { User } from '../../../types';

export const UsuariosDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { users } = useAppStore();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (id) {
      const foundUser = users.find(u => u.id === id);
      setUser(foundUser || null);
    }
  }, [id, users]);

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/usuarios')}
            icon={ArrowLeft}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuario no encontrado</h1>
          </div>
        </div>
      </div>
    );
  }

  const getRolVariant = (rol: User['rol']) => {
    const variants = {
      admin: 'danger' as const,
      supervisor: 'warning' as const,
      usuario: 'secondary' as const,
    };
    return variants[rol];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/usuarios')}
            icon={ArrowLeft}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalle del Usuario</h1>
            <p className="text-gray-600">Información completa del usuario</p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/usuarios/editar/${user.id}`)}
          icon={Edit}
        >
          Editar Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#18D043] rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user.nombre}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={getRolVariant(user.rol)}>{user.rol}</Badge>
                    <Badge variant={user.activo ? 'success' : 'secondary'}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  {user.telefono && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Teléfono</p>
                        <p className="text-gray-900">{user.telefono}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rol</p>
                      <p className="text-gray-900 capitalize">{user.rol}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                      <p className="text-gray-900">{formatDateTime(user.fecha_creacion)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estado</span>
                <Badge variant={user.activo ? 'success' : 'secondary'}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nivel de Acceso</span>
                <Badge variant={getRolVariant(user.rol)}>{user.rol}</Badge>
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
                onClick={() => navigate(`/usuarios/editar/${user.id}`)}
                icon={Edit}
              >
                Editar Usuario
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};