# AYNI - Frontend

Sistema de gestión y control de lineas de vida desarrollado con React, TypeScript y Vite.

## 🚀 Tecnologías

- **React 18.3** - Biblioteca de UI
- **TypeScript 5.5** - Tipado estático
- **Vite 5.4** - Build tool y dev server
- **React Router Dom 7.7** - Enrutamiento
- **Zustand 5.0** - State management
- **Tailwind CSS 3.4** - Framework CSS
- **Flowbite & Flowbite React** - Componentes UI
- **Lucide React** - Iconos
- **Docker** - Containerización

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Docker (opcional, para deployment)

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone <repository-url>

# Instalar dependencias
npm install
```

## 🏃 Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 🐳 Docker

### Build de la imagen

```bash
docker build -t ayni-front .
```

### Ejecutar el contenedor

```bash
docker run -p 80:80 ayni-front
```

### Docker Compose

```bash
docker-compose up -d
```

## 📁 Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos (imágenes, iconos)
├── constants/       # Constantes globales (colores, etc.)
├── layouts/         # Layouts principales (AuthLayout, MainLayout)
├── modules/         # Módulos funcionales de la aplicación
│   ├── accidents/           # Gestión de accidentes
│   ├── maintenance/         # Mantenimiento de equipos
│   ├── movement_history/    # Historial de movimientos
│   ├── purchase-orders/     # Órdenes de compra
│   ├── registro/            # Registro de activos
│   ├── solicitudes/         # Solicitudes
│   └── usuarios/            # Gestión de usuarios
├── pages/           # Páginas principales
├── routes/          # Configuración de rutas
├── shared/          # Componentes y utilidades compartidas
├── store/           # Estado global (Zustand)
└── types/           # Definiciones de tipos TypeScript
```

## 🎨 Características

- **Sistema de Autenticación** - Login y manejo de sesiones
- **Dashboard** - Panel de control principal
- **Gestión de Activos** - Registro y seguimiento de equipos
- **Órdenes de Compra** - Administración de compras
- **Historial de Movimientos** - Tracking de cambios
- **Mantenimiento** - Programación y registro de mantenimientos
- **Gestión de Accidentes** - Reporte y seguimiento
- **Administración de Usuarios** - Control de accesos
- **Modo Oscuro** - Tema claro/oscuro
- **Responsive Design** - Compatible con dispositivos móviles

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm run preview` - Preview del build de producción
- `npm run lint` - Ejecuta ESLint para análisis de código

## 🌐 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000
```

## 📦 Dependencias Principales

### Producción
- `react` & `react-dom` - Framework UI
- `react-router-dom` - Enrutamiento SPA
- `zustand` - State management ligero
- `flowbite` & `flowbite-react` - Componentes UI
- `lucide-react` - Iconos modernos

### Desarrollo
- `@vitejs/plugin-react` - Plugin de Vite para React
- `typescript` - Soporte de TypeScript
- `eslint` - Linter de código
- `tailwindcss` - Framework CSS utility-first
- `autoprefixer` & `postcss` - Procesamiento CSS

## 🔐 Autenticación

El sistema utiliza tokens JWT para la autenticación. El estado de autenticación se maneja con Zustand (`authStore.ts`).

## 🎨 Temas

El sistema soporta modo claro y oscuro, manejado a través de `themeStore.ts`.

## 📱 Responsive

La aplicación está completamente optimizada para:
- Desktop (1920px+)
- Tablet (768px - 1919px)
- Mobile (320px - 767px)

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado por el equipo de AYNI.

## 📞 Soporte

Para soporte y consultas, contactar al equipo de desarrollo.