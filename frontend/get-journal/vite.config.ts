import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Убедись, что порт совпадает с тем, что в браузере
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        // 🔥 ВАЖНО: Пересылка cookies через proxy
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Пересылаем cookies от клиента к бэкенду
            const cookie = req.headers.cookie;
            if (cookie) {
              proxyReq.setHeader('cookie', cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Пересылаем Set-Cookie от бэкенда к клиенту
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              res.setHeader('set-cookie', cookies);
            }
          });
        }
      },
      '/static': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})