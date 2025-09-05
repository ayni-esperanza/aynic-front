import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Incluir lucide-react en la optimización para evitar problemas de carga
    include: ['lucide-react'],
  },
  // Configuración del base path - usar raíz ya que Dokploy maneja /portal
  base: '/',
  build: {
    // Configuración de build optimizada
    rollupOptions: {
      output: {
        // Configurar nombres de archivos para mejor cache
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    host: true,
  },
  // Configuración de preview para testing
  preview: {
    port: 4173,
    host: true,
  },
});