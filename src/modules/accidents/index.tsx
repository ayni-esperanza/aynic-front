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

// Exportar tipos para uso en otros módulos
export type {
  Accident,
  CreateAccidentDto,
  UpdateAccidentDto,
  AccidentFilters,
  EstadoAccidente,
  SeveridadAccidente,
} from "./types/accident";

// Exportar servicio para uso en otros módulos
export { accidentService } from "./services/accidentService";
