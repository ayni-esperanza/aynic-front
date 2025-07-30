import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useAppStore } from '../../../store';
import type { DataRecord } from '../../../types';

export const RegistroForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { registros, addRegistro, updateRegistro } = useAppStore();
  
  const isEditing = Boolean(id);
  const [formData, setFormData] = useState({
    codigo: '',
    cliente: '',
    equipo: '',
    fv_anios: 0,
    fv_meses: 0,
    fecha_instalacion: '',
    longitud: 0,
    observaciones: '',
    seec: '',
    tipo_linea: '',
    ubicacion: '',
    fecha_vencimiento: '',
    estado_actual: 'activo' as DataRecord['estado_actual'],
  });

  useEffect(() => {
    if (isEditing && id) {
      const registro = registros.find(r => r.id === id);
      if (registro) {
        setFormData({
          codigo: registro.codigo,
          cliente: registro.cliente,
          equipo: registro.equipo,
          fv_anios: registro.fv_anios,
          fv_meses: registro.fv_meses,
          fecha_instalacion: registro.fecha_instalacion.toISOString().split('T')[0],
          longitud: registro.longitud,
          observaciones: registro.observaciones || '',
          seec: registro.seec,
          tipo_linea: registro.tipo_linea,
          ubicacion: registro.ubicacion,
          fecha_vencimiento: registro.fecha_vencimiento.toISOString().split('T')[0],
          estado_actual: registro.estado_actual,
        });
      }
    }
  }, [id, isEditing, registros]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const registroData: Omit<DataRecord, 'id'> = {
      ...formData,
      fecha_instalacion: new Date(formData.fecha_instalacion),
      fecha_vencimiento: new Date(formData.fecha_vencimiento),
    };

    if (isEditing && id) {
      updateRegistro(id, registroData);
    } else {
      const newRegistro: DataRecord = {
        id: `record-${Date.now()}`,
        ...registroData,
      };
      addRegistro(newRegistro);
    }
    
    navigate('/registro');
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Registro' : 'Nuevo Registro'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modifica los datos del registro' : 'Completa el formulario para crear un nuevo registro'}
          </p>
        </div>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Código"
              value={formData.codigo}
              onChange={(e) => handleChange('codigo', e.target.value)}
              required
            />
            
            <Input
              label="Cliente"
              value={formData.cliente}
              onChange={(e) => handleChange('cliente', e.target.value)}
              required
            />
            
            <Input
              label="Equipo"
              value={formData.equipo}
              onChange={(e) => handleChange('equipo', e.target.value)}
              required
            />
            
            <Input
              label="FV Años"
              type="number"
              value={formData.fv_anios}
              onChange={(e) => handleChange('fv_anios', parseInt(e.target.value))}
              required
            />
            
            <Input
              label="FV Meses"
              type="number"
              value={formData.fv_meses}
              onChange={(e) => handleChange('fv_meses', parseInt(e.target.value))}
              required
            />
            
            <Input
              label="Fecha Instalación"
              type="date"
              value={formData.fecha_instalacion}
              onChange={(e) => handleChange('fecha_instalacion', e.target.value)}
              required
            />
            
            <Input
              label="Longitud (m)"
              type="number"
              value={formData.longitud}
              onChange={(e) => handleChange('longitud', parseInt(e.target.value))}
              required
            />
            
            <Input
              label="SEEC"
              value={formData.seec}
              onChange={(e) => handleChange('seec', e.target.value)}
              required
            />
            
            <Select
              label="Tipo de Línea"
              value={formData.tipo_linea}
              onChange={(e) => handleChange('tipo_linea', e.target.value)}
              options={[
                { value: 'Fibra Óptica', label: 'Fibra Óptica' },
                { value: 'Cobre', label: 'Cobre' },
                { value: 'Inalámbrica', label: 'Inalámbrica' },
                { value: 'Satelital', label: 'Satelital' },
              ]}
              required
            />
            
            <Input
              label="Ubicación"
              value={formData.ubicacion}
              onChange={(e) => handleChange('ubicacion', e.target.value)}
              required
            />
            
            <Input
              label="Fecha Vencimiento"
              type="date"
              value={formData.fecha_vencimiento}
              onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
              required
            />
            
            <Select
              label="Estado Actual"
              value={formData.estado_actual}
              onChange={(e) => handleChange('estado_actual', e.target.value)}
              options={[
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
                { value: 'mantenimiento', label: 'Mantenimiento' },
                { value: 'vencido', label: 'Vencido' },
              ]}
              required
            />
          </div>
          
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18D043]/20 focus:border-[#18D043]"
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/registro')}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Actualizar' : 'Crear'} Registro
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};