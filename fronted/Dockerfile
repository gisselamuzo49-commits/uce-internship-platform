# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install

# Copy source code
COPY . .

# Expose Vite development server port
EXPOSE 5173

# Start development server accessible from network
CMD ["npm", "run", "dev", "--", "--host"]