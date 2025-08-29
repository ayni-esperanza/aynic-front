import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../shared/components/layout/Sidebar';
import { Header } from '../shared/components/layout/Header';
import { useAppStore } from '../store';

export const MainLayout: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};