import React from "react";
import { Routes, Route } from "react-router-dom";
import { SolicitudesList } from "./pages/SolicitudesList";

export const SolicitudesModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<SolicitudesList />} />
    </Routes>
  );
};

// Exportar componentes
export { DeleteModal, SolicitudStats, CodeGeneratedModal } from "./components";

// Exportar hooks
export { useSolicitudData, useSolicitudActions } from "./hooks";

// Exportar servicios
export { solicitudService } from "./services";

// Exportar tipos
export type {
  PendingRequest,
  GeneratedCode,
  SolicitudFilters,
  SolicitudFormData,
  SolicitudValidationErrors,
  SolicitudStatus,
  SolicitudPriority,
  SolicitudStats,
} from "./types";

// Default export para lazy loading
export default SolicitudesModule;
