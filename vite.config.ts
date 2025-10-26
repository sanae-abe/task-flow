import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/contexts': path.resolve(__dirname, 'src/contexts'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    chunkSizeWarningLimit: 600, // 現実的なサイズに調整
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],

          // Radix UI components (分割)
          'radix-core': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-slot',
            '@radix-ui/react-alert-dialog'
          ],
          'radix-form': [
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress'
          ],
          'radix-nav': [
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],


          // Date and utility libraries
          'date-utils': [
            'date-fns',
            'react-day-picker'
          ],

          // Icons libraries (統一)
          'icons-lucide': ['lucide-react'],

          // UI components (分割)
          'emoji-picker': ['emoji-picker-react'],

          // Drag & Drop
          'dnd-kit': [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities'
          ],

          // Routing and utilities
          utilities: [
            'react-router-dom',
            'uuid',
            'dompurify',
            'sonner',
            'clsx',
            'tailwind-merge',
            'class-variance-authority'
          ],

          // Table library
          table: [
            '@tanstack/react-table'
          ]
        },
      },
    },
  },
  define: {
    // 必要な環境変数のみを定義
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  // 依存関係の最適化
  optimizeDeps: {
    include: [],
  },
  css: {
    postcss: './postcss.config.js',
  },
})