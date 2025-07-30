import type { DataRecord, User } from '../types';

// Mock data for demonstration
export const mockDataRecords: DataRecord[] = Array.from({ length: 47 }, (_, i) => ({
  id: `record-${i + 1}`,
  codigo: `COD-${String(i + 1).padStart(4, '0')}`,
  cliente: `Cliente ${i + 1}`,
  equipo: `Equipo-${['A', 'B', 'C', 'D'][i % 4]}${i + 1}`,
  fv_anios: Math.floor(Math.random() * 10) + 1,
  fv_meses: Math.floor(Math.random() * 12),
  fecha_instalacion: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
  longitud: Math.floor(Math.random() * 1000) + 100,
  observaciones: Math.random() > 0.5 ? `Observación para registro ${i + 1}` : undefined,
  seec: `SEEC-${String(i + 1).padStart(3, '0')}`,
  tipo_linea: ['Fibra Óptica', 'Cobre', 'Inalámbrica', 'Satelital'][Math.floor(Math.random() * 4)],
  ubicacion: `Ubicación ${i + 1}`,
  fecha_vencimiento: new Date(2025 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
  estado_actual: (['activo', 'inactivo', 'mantenimiento', 'vencido'] as const)[Math.floor(Math.random() * 4)],
}));

export const mockUsers: User[] = Array.from({ length: 15 }, (_, i) => ({
  id: `user-${i + 1}`,
  nombre: `Usuario ${i + 1}`,
  email: `usuario${i + 1}@ejemplo.com`,
  telefono: Math.random() > 0.3 ? `+1234567890${i}` : undefined,
  rol: (['admin', 'usuario', 'supervisor'] as const)[Math.floor(Math.random() * 3)],
  fecha_creacion: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
  activo: Math.random() > 0.2,
}));