import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import pkg from './package.json';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // S3デプロイ用の相対パス設定
  plugins: [
    react(),
    // Bundle分析用プラグイン（ANALYZE=true時に有効化）
    process.env.ANALYZE === 'true'
      ? visualizer({
          open: true,
          filename: './performance-reports/bundle-analysis.html',
          gzipSize: true,
          brotliSize: true,
          template: 'treemap', // 'treemap', 'sunburst', 'network'
        })
      : undefined,
  ].filter(Boolean),
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
    chunkSizeWarningLimit: 300, // 300KBに厳格化してパフォーマンス最適化
    minify: 'esbuild', // esbuildの方が高速で安定
    target: 'es2020', // モダンブラウザ向けに最適化
    cssCodeSplit: true, // CSS Code Splitting有効化
    rollupOptions: {
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
      },
      output: {
        // Asset naming for better caching
        assetFileNames: assetInfo => {
          const info = assetInfo.name?.split('.');
          const extType = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(extType || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: id => {
          // Core React libraries - さらに細分化
          if (id.includes('react-dom/client') || id.includes('react-dom/server')) {
            return 'react-dom-runtime';
          }
          if (id.includes('react-dom')) {
            return 'react-dom';
          }
          if (id.includes('react/jsx-runtime') || id.includes('react/jsx-dev-runtime')) {
            return 'react-jsx';
          }
          if (id.includes('react')) {
            return 'react';
          }

          // Lexical editor (大型コンポーネント) - 動的ロード専用
          if (id.includes('@lexical/') || id.includes('lexical')) {
            return 'lexical-editor';
          }

          // Prism.js (動的ロード用に分離)
          if (id.includes('prismjs')) {
            return 'prism';
          }

          // i18n (国際化ライブラリ)
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }

          // Radix UI components - 使用頻度別に最適化
          // 高頻度: ダイアログ、ドロップダウン（常時ロード）
          if (
            id.includes('@radix-ui/react-dialog') ||
            id.includes('@radix-ui/react-dropdown-menu') ||
            id.includes('@radix-ui/react-alert-dialog')
          ) {
            return 'radix-overlay';
          }
          // 中頻度: フォーム関連（遅延ロード可）
          if (
            id.includes('@radix-ui/react-checkbox') ||
            id.includes('@radix-ui/react-label') ||
            id.includes('@radix-ui/react-popover') ||
            id.includes('@radix-ui/react-progress') ||
            id.includes('@radix-ui/react-slot')
          ) {
            return 'radix-form';
          }
          // 低頻度: タブ、トースト（遅延ロード推奨）
          if (
            id.includes('@radix-ui/react-tabs') ||
            id.includes('@radix-ui/react-toast')
          ) {
            return 'radix-ui-lazy';
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
          if (id.includes('TableView') || id.includes('TableColumnManager')) {
            return 'app-table';
          }

          // テンプレート管理
          if (
            id.includes('TemplateManagement') ||
            id.includes('TemplateForm') ||
            id.includes('TemplateCard')
          ) {
            return 'app-templates';
          }

          // ごみ箱機能
          if (id.includes('RecycleBin')) {
            return 'app-recycle-bin';
          }

          // リッチテキストエディタ
          if (
            id.includes('RichTextEditor') ||
            id.includes('LinkInsertDialog') ||
            id.includes('MarkdownEditor')
          ) {
            return 'app-editor';
          }

          // 設定・管理機能
          if (
            id.includes('SettingsDialog') ||
            id.includes('DataManagement') ||
            id.includes('LabelManagement') ||
            id.includes('BoardSettings')
          ) {
            return 'app-settings';
          }

          // カレンダー機能
          if (id.includes('CalendarView')) {
            return 'app-calendar';
          }

          // Utilities and small libraries
          if (
            id.includes('react-router-dom') ||
            id.includes('uuid') ||
            id.includes('dompurify') ||
            id.includes('sonner') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge') ||
            id.includes('class-variance-authority')
          ) {
            return 'utilities';
          }

          // アプリケーション共通コンポーネント
          if (
            id.includes('src/components') &&
            (id.includes('UnifiedDialog') ||
              id.includes('UnifiedForm') ||
              id.includes('ActionMenu') ||
              id.includes('ConfirmDialog') ||
              id.includes('LoadingButton'))
          ) {
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
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_NAME__: JSON.stringify(pkg.name),
    __APP_DESCRIPTION__: JSON.stringify(pkg.description),
    __APP_AUTHOR__: JSON.stringify(pkg.author),
    // React 19互換性: グローバルReactを確保
    'global.React': 'window.React',
  },
  // 依存関係の最適化
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    exclude: ['use-callback-ref', 'react-remove-scroll'],
    force: true,
  },
  css: {
    postcss: './postcss.config.js',
  },
  // PWA用のpublicディレクトリ設定
  publicDir: 'public',
});
