import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Necesario para Docker
    port: 5173,
    watch: {
      usePolling: true, // <--- ¡ESTA ES LA CLAVE! Obliga a ver cambios en Windows
    }
  }
})