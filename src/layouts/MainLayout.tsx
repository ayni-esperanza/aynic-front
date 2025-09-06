import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../shared/components/layout/Sidebar';
import { Header } from '../shared/components/layout/Header';
import { useAppStore } from '../store';

export const MainLayout: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  }, [isMobile, sidebarOpen, sidebarCollapsed, setSidebarCollapsed]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay para móvil */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-150 ease-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'relative h-full'
        }
      `}>
        <Sidebar
          isCollapsed={isMobile ? false : sidebarCollapsed}
          onToggle={handleSidebarToggle}
          isMobile={isMobile}
        />
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header 
          onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined}
          isMobile={isMobile}
        />
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};