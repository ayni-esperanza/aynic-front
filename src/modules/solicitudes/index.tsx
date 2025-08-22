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

// Default export para lazy loading
export default SolicitudesModule;
