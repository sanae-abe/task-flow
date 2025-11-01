import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // S3デプロイ用の相対パス設定
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
    chunkSizeWarningLimit: 800, // React + 依存ライブラリを考慮した現実的なサイズに調整
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor';
          }

          // Lexical editor (大型コンポーネント)
          if (id.includes('@lexical/') || id.includes('lexical')) {
            return 'lexical-editor';
          }

          // Radix UI components (細分化)
          if (id.includes('@radix-ui/react-dialog') ||
              id.includes('@radix-ui/react-dropdown-menu') ||
              id.includes('@radix-ui/react-slot') ||
              id.includes('@radix-ui/react-alert-dialog')) {
            return 'radix-core';
          }
          if (id.includes('@radix-ui/react-checkbox') ||
              id.includes('@radix-ui/react-label') ||
              id.includes('@radix-ui/react-popover') ||
              id.includes('@radix-ui/react-progress')) {
            return 'radix-form';
          }
          if (id.includes('@radix-ui/react-tabs') ||
              id.includes('@radix-ui/react-toast')) {
            return 'radix-nav';
          }

          // Date and calendar libraries
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date-utils';
          }

          // Icons
          if (id.includes('lucide-react')) {
            return 'icons-lucide';
          }

          // Large UI components
          if (id.includes('emoji-picker-react')) {
            return 'emoji-picker';
          }

          // Drag & Drop
          if (id.includes('@dnd-kit/')) {
            return 'dnd-kit';
          }

          // Table components
          if (id.includes('@tanstack/react-table')) {
            return 'table';
          }

          // テーブル関連コンポーネント（アプリケーション）
          if (id.includes('TableView') ||
              id.includes('TableColumnManager')) {
            return 'app-table';
          }

          // テンプレート管理
          if (id.includes('TemplateManagement') ||
              id.includes('TemplateForm') ||
              id.includes('TemplateCard')) {
            return 'app-templates';
          }

          // ごみ箱機能
          if (id.includes('RecycleBin')) {
            return 'app-recycle-bin';
          }

          // リッチテキストエディタ
          if (id.includes('RichTextEditor') ||
              id.includes('LinkInsertDialog') ||
              id.includes('MarkdownEditor')) {
            return 'app-editor';
          }

          // 設定・管理機能
          if (id.includes('SettingsDialog') ||
              id.includes('DataManagement') ||
              id.includes('LabelManagement') ||
              id.includes('BoardSettings')) {
            return 'app-settings';
          }

          // カレンダー機能
          if (id.includes('CalendarView')) {
            return 'app-calendar';
          }

          // Utilities and small libraries
          if (id.includes('react-router-dom') ||
              id.includes('uuid') ||
              id.includes('dompurify') ||
              id.includes('sonner') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('class-variance-authority')) {
            return 'utilities';
          }

          // アプリケーション共通コンポーネント
          if (id.includes('src/components') &&
              (id.includes('UnifiedDialog') ||
               id.includes('UnifiedForm') ||
               id.includes('ActionMenu') ||
               id.includes('ConfirmDialog') ||
               id.includes('LoadingButton'))) {
            return 'app-shared';
          }

          // Node modules that don't match above
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
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