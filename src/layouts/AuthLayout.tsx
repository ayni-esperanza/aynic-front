import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sistema Web</h2>
          <p className="mt-2 text-gray-600">Accede a tu cuenta</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};