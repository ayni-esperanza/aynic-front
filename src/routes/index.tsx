import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Dashboard } from '../pages/Dashboard';
import { UsuariosModule } from '../modules/usuarios';
import { RegistroModule } from '../modules/registro';
import { RegistroEstadoHistorialModule } from '../modules/registro_estado_historial';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="usuarios/*" element={<UsuariosModule />} />
        <Route path="registro/*" element={<RegistroModule />} />
        <Route path="historial/*" element={<RegistroEstadoHistorialModule />} />
      </Route>
    </Routes>
  );
};