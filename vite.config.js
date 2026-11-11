import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // FastAPI 서버(localhost:8000)로 요청을 전달 → CORS 문제 회피
    proxy: {
      '/samsung': 'http://localhost:8000',
    },
  },
})
