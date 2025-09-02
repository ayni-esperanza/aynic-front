# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
COPY . .

# Instalar dependencias DESPUÉS de copiar todo
RUN npm ci --only=production=false

# Construir la aplicación 
RUN npm run build

# Etapa de producción
FROM nginx:alpine AS production

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]