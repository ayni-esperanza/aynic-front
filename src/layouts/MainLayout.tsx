import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../shared/components/layout/Sidebar';
import { useAppStore } from '../store';

export const MainLayout: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};