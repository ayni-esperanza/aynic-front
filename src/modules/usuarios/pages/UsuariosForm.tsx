import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { UserForm } from '../../../components/forms/UserForm';
import { useAppStore } from '../../../store';
import type { UserFormData, User } from '../../../types';

export const UsuariosForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { users, addUser, updateUser } = useAppStore();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      const user = users.find(u => u.id === id);
      if (user) {
        setEditingUser(user);
      }
    }
  }, [id, isEditing, users]);

  const handleSubmit = (userData: UserFormData) => {
    if (isEditing && editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...userData,
        fecha_creacion: new Date(),
        activo: true,
      };
      addUser(newUser);
    }
    navigate('/usuarios');
  };

  const handleCancel = () => {
    navigate('/usuarios');
  };

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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modifica los datos del usuario' : 'Completa el formulario para crear un nuevo usuario'}
          </p>
        </div>
      </div>

      <Card padding="lg">
        <UserForm
          initialData={editingUser ? {
            nombre: editingUser.nombre,
            email: editingUser.email,
            telefono: editingUser.telefono,
            rol: editingUser.rol,
          } : undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
};