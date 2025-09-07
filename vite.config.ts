import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Incluir lucide-react en la optimización para evitar problemas de carga
    include: ['lucide-react'],
  },
  // Configuración del base path - manejado por React Router
  // base: '/portal/',
  build: {
    // Configuración de build optimizada
    rollupOptions: {
      output: {
        // Configurar nombres de archivos para mejor cache
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Optimización de chunks para reducir tamaño
        manualChunks: (id) => {
          // Vendor chunks separados
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
            return 'vendor';
          }
          
          // Chunks por funcionalidad
          if (id.includes('src/store/authStore') || id.includes('src/shared/services/apiClient')) {
            return 'auth';
          }
          if (id.includes('src/shared/components')) {
            return 'ui-components';
          }
          if (id.includes('src/modules')) {
            return 'modules';
          }
        },
      },
    },
    // límite de warning para chunks grandes
    chunkSizeWarningLimit: 1000,
    // Optimizaciones adicionales
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.log en producción
        drop_debugger: true,
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