# Usar Node.js como base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Exponer el puerto por defecto de Vite preview (4173)
EXPOSE 4173

# Comando para ejecutar el servidor de preview de Vite (producción)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]