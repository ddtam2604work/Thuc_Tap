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
      },
      // Chuyển hướng WebSocket /socket.io sang BE_URL
      '/socket.io': {
        target: 'https://113.161.204.185:4000',
        ws: true,
        changeOrigin: true,
        secure: false,
        // 🔥 BỔ SUNG: Kháng lỗi sập kết nối khi reload hoặc hết hạn timeout
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Chặn đứng và bỏ qua các lỗi ngắt kết nối tầng mạng thường gặp khi dev
            if (err.code === 'ECONNRESET' || err.code === 'ECONNABORTED') {
              return; 
            }
            console.error('Vite Proxy Error (Mã lỗi khác):', err.message);
          });
        }
      }
    }
  }
})