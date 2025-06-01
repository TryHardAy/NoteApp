import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [process.env.VITE_PUBLIC_HOST || "http://localhost:5173"],
    hmr: {
      protocol: 'wss',
      host: process.env.VITE_PUBLIC_HOST || "http://localhost:5173", // bez https://
      port: 5173
    }
  }
})