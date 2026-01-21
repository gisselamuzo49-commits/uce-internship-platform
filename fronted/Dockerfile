# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copiar dependencias e instalar
COPY package.json .
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Ejecutar en modo desarrollo visible para la red
CMD ["npm", "run", "dev", "--", "--host"]