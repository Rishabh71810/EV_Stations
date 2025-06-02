import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    // Ensure proper environment variable defaults for production
    'import.meta.env.VITE_USE_LOCAL_BACKEND': JSON.stringify(false),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('')
  }
}) 