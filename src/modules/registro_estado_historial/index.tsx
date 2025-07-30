import React from "react";
import { Routes, Route } from "react-router-dom";
import { HistorialList } from "./pages/HistorialList";

export const RegistroEstadoHistorialModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<HistorialList />} />
    </Routes>
  );
};

// Default export para lazy loading
export default RegistroEstadoHistorialModule;