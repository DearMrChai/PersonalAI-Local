import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 路径别名
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // 开发服务器配置
  server: {
    port: 5173, // 前端端口（与脚本一致）
    open: true, // 自动打开浏览器
    // 开发环境跨域代理（对接后端 3000 端口）
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/ws': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true
      }
    }
  },
  // 打包配置
  build: {
    outDir: 'dist', // 输出目录
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  }
})