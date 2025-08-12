import React from "react";
import { Routes, Route } from "react-router-dom";
import { RegistroList } from "./pages/RegistroList";
import { RegistroForm } from "./pages/RegistroForm";
import { EditarRegistroForm } from "./pages/EditarRegistroForm";
import { RegistroDetail } from "./pages/RegistroDetail";

export const RegistroModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<RegistroList />} />
      <Route path="nuevo" element={<RegistroForm />} />
      <Route path="editar/:id" element={<EditarRegistroForm />} />
      <Route path="detalle/:id" element={<RegistroDetail />} />
    </Routes>
  );
};

// Default export para lazy loading
export default RegistroModule;