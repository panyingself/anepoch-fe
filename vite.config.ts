import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5180,
    strictPort: true,
    // 后端 keeay-user 服务：http://localhost:8089/keeay-user（context-path 已含在 target 中，不做 rewrite）
    proxy: {
      '/keeay-user': {
        target: 'http://localhost:8089',
        changeOrigin: true,
      },
    },
  },
})
