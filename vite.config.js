import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // 核心框架
          'vendor-core': ['vue', 'vue-router', 'pinia'],
          // UI 相关
          'vendor-ui': ['chart.js', 'vue-chartjs'],
          // 数据处理
          'vendor-data': ['xlsx', 'mammoth'],
          // 网络请求
          'vendor-api': ['@supabase/supabase-js'],
          // 虚拟滚动
          'vendor-virtual': ['vue-virtual-scroller']
        },
        // 资源文件名哈希，长期缓存
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|ttf|otf|eot)$/i.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // 代码分割大小限制
    chunkSizeWarningLimit: 500,
    // CSS 代码分割
    cssCodeSplit: true,
    // 预加载关键资源
    modulePreload: {
      polyfill: true
    },
    // 资源内联限制
    assetsInlineLimit: 4096
  },
  server: {
    port: 5173,
    host: true
  },
  // 依赖预构建优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', '@supabase/supabase-js', 'chart.js', 'vue-chartjs'],
    exclude: ['xlsx', 'mammoth'] // 大依赖按需加载
  }
})
