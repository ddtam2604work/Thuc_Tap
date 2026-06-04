import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      // Chuyển hướng tất cả các request bắt đầu bằng /api sang BE_URL
      '/api': {
        target: 'https://113.161.204.185:4000',
        changeOrigin: true,
        secure: false,
        
      }
    }
  }
})