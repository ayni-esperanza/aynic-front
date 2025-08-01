import type { DataRecord, User } from "../types";

// Función helper para crear fechas válidas
const createValidDate = (
  year: number,
  month: number,
  day: number = 1
): Date => {
  // Asegurar que los valores estén en rangos válidos
  const validYear = Math.max(2020, Math.min(2030, year));
  const validMonth = Math.max(0, Math.min(11, month)); // 0-11 en JavaScript
  const validDay = Math.max(1, Math.min(28, day)); // Usar máximo 28 para evitar problemas con febrero

  return new Date(validYear, validMonth, validDay);
};

export const mockDataRecords: DataRecord[] = Array.from(
  { length: 47 },
  (_, i) => {
    const baseYear = 2020;
    const installYear = baseYear + Math.floor(i / 12); // Distribuir a lo largo de varios años
    const installMonth = i % 12;
    const expirationYear = installYear + 3 + Math.floor(Math.random() * 3); // 3-5 años después

    return {
      id: `record-${i + 1}`,
      codigo: `COD-${String(i + 1).padStart(4, "0")}`,
      cliente: `Cliente ${i + 1}`,
      equipo: `Equipo-${["A", "B", "C", "D"][i % 4]}${i + 1}`,
      fv_anios: Math.floor(Math.random() * 10) + 1,
      fv_meses: Math.floor(Math.random() * 12),
      fecha_instalacion: createValidDate(
        installYear,
        installMonth,
        Math.floor(Math.random() * 28) + 1
      ),
      longitud: Math.floor(Math.random() * 1000) + 100,
      observaciones:
        Math.random() > 0.5 ? `Observación para registro ${i + 1}` : undefined,
      seec: `SEEC-${String(i + 1).padStart(3, "0")}`,
      tipo_linea: ["Fibra Óptica", "Cobre", "Inalámbrica", "Satelital"][
        Math.floor(Math.random() * 4)
      ],
      ubicacion: `Ubicación ${i + 1}`,
      fecha_vencimiento: createValidDate(
        expirationYear,
        installMonth,
        Math.floor(Math.random() * 28) + 1
      ),
      estado_actual: (
        [
          "activo",
          "inactivo",
          "mantenimiento",
          "por_vencer",
          "vencido",
        ] as const
      )[Math.floor(Math.random() * 5)],
    };
  }
);

export const mockUsers: User[] = Array.from({ length: 15 }, (_, i) => {
  const creationYear = 2023 + Math.floor(i / 12); // Distribuir entre 2023-2024
  const creationMonth = i % 12;

  return {
    id: `user-${i + 1}`,
    nombre: `Usuario ${i + 1}`,
    email: `usuario${i + 1}@ejemplo.com`,
    telefono: Math.random() > 0.3 ? `+1234567890${i}` : undefined,
    rol: (["admin", "usuario", "supervisor"] as const)[
      Math.floor(Math.random() * 3)
    ],
    fecha_creacion: createValidDate(
      creationYear,
      creationMonth,
      Math.floor(Math.random() * 28) + 1
    ),
    activo: Math.random() > 0.2,
  };
});