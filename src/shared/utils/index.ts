// Exportaciones de utilidades compartidas
export * from './formatters';

/**
 * Verifica si la empresa del usuario es Ayni (case-insensitive)
 * @param empresa - La empresa del usuario
 * @returns true si la empresa es Ayni en cualquier variante de mayúsculas/minúsculas
 */
export const isAyniUser = (empresa?: string): boolean => {
  if (!empresa) return false;
  return empresa.toLowerCase() === 'ayni';
};