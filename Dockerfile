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

# Exponer el puerto por defecto de Vite (5173)
EXPOSE 5173

# Comando para ejecutar el servidor de desarrollo de Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]