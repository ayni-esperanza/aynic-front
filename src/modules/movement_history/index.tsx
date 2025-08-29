import React from "react";
import { Routes, Route } from "react-router-dom";
import { HistorialList } from "./pages/HistorialList";

export const MovementHistoryModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<HistorialList />} />
    </Routes>
  );
};

// Exportar componentes
export { MovementStats, MovementHistoryItem } from "./components";

// Exportar hooks
export { useMovementData, useMovementOptions } from "./hooks";

// Exportar servicios
export { movementHistoryService } from "./services";

// Exportar tipos
export type {
  MovementHistory,
  MovementStatistics,
  MovementFilters,
  MovementAction,
  ActionOption,
  PaginatedMovements,
  MovementHistoryItemProps,
  MovementFiltersProps,
  MovementStatsProps,
  MovementValidationErrors,
} from "./types";

// Default export para lazy loading
export default MovementHistoryModule;
