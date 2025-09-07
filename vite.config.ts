import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Incluir lucide-react en la optimización para evitar problemas de carga
    include: ['lucide-react'],
  },
  // Configuración del base path para /portal
  base: '/portal/',
  build: {
    // Configuración de build optimizada
    rollupOptions: {
      output: {
        // Configurar nombres de archivos para mejor cache
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Configuración simplificada de chunks
        manualChunks: (id) => {
          // Solo separar node_modules del código de la aplicación
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // límite de warning para chunks grandes
    chunkSizeWarningLimit: 1000,
    // Optimizaciones adicionales
    minify: 'esbuild', // Usar esbuild en lugar de terser 
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