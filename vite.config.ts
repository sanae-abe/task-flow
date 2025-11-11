import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import pkg from './package.json';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
    // Sentryソースマップアップロード（本番ビルド時のみ）
    mode === 'production' && process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          sourcemaps: {
            assets: './build/**',
          },
          telemetry: false, // テレメトリーを無効化
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
    // React重複排除（Apollo Clientとの競合を防ぐ）
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3000,
    open: true,
    // host設定を削除してデフォルトのlocalhostを使用
    // これによりWebSocketの接続問題を解消
    // host: true, // ← 削除（0.0.0.0でリッスンするとWebSocketエラーの原因）
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
        // Manual chunks for GraphQL and heavy dependencies
        manualChunks: id => {
          // React core libraries - MUST be first to ensure single instance
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // Apollo Client chunk (GraphQL client) - should NOT include react
          if (id.includes('@apollo/client') || id.includes('@apollo')) {
            return 'apollo-client';
          }
          // GraphQL core chunk
          if (id.includes('graphql') && !id.includes('@apollo')) {
            return 'graphql-core';
          }
          // Lexical editor chunk (heavy rich text editor)
          if (id.includes('lexical') || id.includes('@lexical')) {
            return 'lexical-editor';
          }
          // DnD Kit chunk (drag and drop)
          if (id.includes('@dnd-kit')) {
            return 'dnd-kit';
          }
          // Radix UI chunk (component library)
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          // i18next chunk (internationalization) - split from vendor
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          // date-fns chunk (date utilities) - split from vendor
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          // react-day-picker chunk (calendar component)
          if (id.includes('react-day-picker')) {
            return 'calendar';
          }
          // Other React libraries (not core react/react-dom)
          if (
            id.includes('react') &&
            !id.includes('node_modules/react/') &&
            !id.includes('node_modules/react-dom/') &&
            !id.includes('react-day-picker') &&
            !id.includes('react-router')
          ) {
            return 'react-vendor';
          }
          // Node modules (other vendors)
          if (id.includes('node_modules')) {
            return 'vendor';
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
  },
  // 依存関係の最適化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-i18next',
      'i18next',
      'i18next-browser-languagedetector',
      'i18next-http-backend',
      '@apollo/client',
    ],
    // Apollo Clientでのreact-dom重複を防ぐ
    exclude: [],
  },
  css: {
    postcss: './postcss.config.js',
  },
  // PWA用のpublicディレクトリ設定
  publicDir: 'public',
}));
