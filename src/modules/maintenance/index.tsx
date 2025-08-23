import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MaintenancesList } from "./pages/MaintenancesList";
import { MaintenanceForm } from "./pages/MaintenanceForm";
import { MaintenanceDetail } from "./pages/MaintenanceDetail";
import { MaintenanceRecordView } from "./pages/MaintenanceRecordView";

export const MaintenanceModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<MaintenancesList />} />
      <Route path="nuevo" element={<MaintenanceForm />} />
      <Route path=":id" element={<MaintenanceDetail />} />
      <Route path="record/:recordId" element={<MaintenanceRecordView />} />
      <Route path="*" element={<Navigate to="/mantenimiento" replace />} />
    </Routes>
  );
};

// Exportar componentes individuales
export { MaintenancesList } from "./pages/MaintenancesList";
export { MaintenanceForm } from "./pages/MaintenanceForm";
export { MaintenanceDetail } from "./pages/MaintenanceDetail";
export { MaintenanceRecordView } from "./pages/MaintenanceRecordView";
export { MaintenanceStatsComponent } from "./components/MaintenanceStats";
export { MaintenanceFiltersComponent } from "./components/MaintenanceFilters";

// Exportar hooks
export { useMaintenanceForm } from "./hooks/useMaintenanceForm";

// Exportar tipos
export type * from "./types/maintenance";

// Exportar servicio
export { maintenanceService } from "./services/maintenanceService";
