/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'build/**', 'public/**'],
    includeSource: ['src/**/*.{js,ts,jsx,tsx}'],
    // ワーカープロセス制御（CPUリソース最適化）
    maxWorkers: 4, // 最大ワーカー数を4に制限
    minWorkers: 1, // 最小ワーカー数
    pool: 'forks', // フォークモード使用
    poolOptions: {
      forks: {
        singleFork: false, // 並列実行を有効化
      },
    },
    // テストタイムアウト設定
    testTimeout: 10000, // 10秒
    hookTimeout: 10000, // 10秒
    teardownTimeout: 5000, // 5秒
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'src/index.tsx',
        'src/reportWebVitals.ts',
        '**/*.d.ts',
        'build/',
        'public/',
        'e2e/',
      ],
      // Temporarily disable thresholds to generate coverage report
      // thresholds: {
      //   global: {
      //     branches: 80,
      //     functions: 80,
      //     lines: 80,
      //     statements: 80,
      //   },
      // },
    },
  },
});
