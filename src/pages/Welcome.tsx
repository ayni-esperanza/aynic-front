import React from "react";
import { Link } from "react-router-dom";

export const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo/Icono */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#18D043] to-[#16a34a] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-8">
            <span className="text-3xl text-white">⚡</span>
          </div>

          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Bienvenido a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18D043] to-[#16a34a]">
              AyniLine
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Sistema de gestión integral para el control y seguimiento de activos, 
            mantenimiento y operaciones empresariales.
          </p>

          {/* Características principales */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gestión de Activos
              </h3>
              <p className="text-gray-600">
                Control completo de inventarios y seguimiento de activos empresariales.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mantenimiento
              </h3>
              <p className="text-gray-600">
                Programación y seguimiento de actividades de mantenimiento preventivo y correctivo.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reportes
              </h3>
              <p className="text-gray-600">
                Análisis detallados y reportes en tiempo real para la toma de decisiones.
              </p>
            </div>
          </div>

          {/* Botón de acceso */}
          <div className="space-y-4">
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#18D043] to-[#16a34a] text-white font-semibold rounded-xl hover:from-[#16a34a] hover:to-[#15803d] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="mr-2">🚀</span>
              Acceder al Sistema
            </Link>
            
            <div className="text-sm text-gray-500">
              ¿Necesitas ayuda? Contacta al administrador del sistema
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
