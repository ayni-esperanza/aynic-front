# Etapa de construcción
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Definimos los ARG para recibir los valores desde el docker-compose
ARG VITE_API_URL
ARG VITE_APP_NAME
ARG VITE_APP_VERSION

# Las convertimos en variables de entorno disponibles para el comando build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# Construir la aplicación para producción 
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine AS production

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx optimizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx escucha en el 80 internamente 
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]