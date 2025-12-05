import React from "react";
import { Routes, Route } from "react-router-dom";
import { AccidentsList } from "./pages/AccidentsList";

export const AccidentsModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AccidentsList />} />
    </Routes>
  );
};

// Exportar componentes
export { AccidentStats, AccidentFilters, AccidentDetails } from "./components";

// Exportar hooks
export { useAccidentData, useAccidentForm } from "./hooks";

// Exportar servicios
export { accidentService } from "./services";

// Exportar tipos
export type {
  Accident,
  AccidentStatistics,
  AccidentFilters as AccidentFiltersType,
  CreateAccidentDto,
  UpdateAccidentDto,
  EstadoAccidente,
  SeveridadAccidente,
  AccidentValidationErrors,
  AccidentListProps,
  AccidentFormProps,
  AccidentDetailProps,
  AccidentFiltersProps,
  AccidentStatsProps,
} from "./types";

// Default export para lazy loading
export default AccidentsModule;
