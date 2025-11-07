/**
 * Lighthouse CI Configuration
 *
 * パフォーマンス監視基盤の核となる設定ファイル
 *
 * 使用方法:
 *   npm run perf:lighthouse         # Lighthouse実行（collect + assert）
 *   npm run perf:lighthouse:collect # データ収集のみ
 *   npm run perf:lighthouse:assert  # アサーション検証のみ
 */

module.exports = {
  ci: {
    collect: {
      // ビルド済みアプリケーションの静的サーバー起動設定
      staticDistDir: './build',

      // 各URLで3回測定して中央値を取得（信頼性向上）
      numberOfRuns: 3,

      // Lighthouse設定
      settings: {
        // モバイルとデスクトップの両方でテスト
        preset: 'desktop', // 'mobile' | 'desktop'

        // Chrome起動オプション
        chromeFlags: '--no-sandbox --disable-gpu',

        // タイムアウト設定（秒）
        maxWaitForFcp: 15 * 1000,
        maxWaitForLoad: 35 * 1000,

        // スロットリング設定（実際のネットワーク条件をシミュレート）
        throttling: {
          rttMs: 40,
          throughputKbps: 10 * 1024,
          cpuSlowdownMultiplier: 1,
        },
      },
    },

    assert: {
      // パフォーマンスバジェット（スコア基準）
      preset: 'lighthouse:recommended',

      assertions: {
        // カテゴリースコア（0-1の範囲、1が最高）
        'categories:performance': ['error', { minScore: 0.85 }], // 85%以上
        'categories:accessibility': ['error', { minScore: 0.95 }], // 95%以上
        'categories:best-practices': ['error', { minScore: 0.90 }], // 90%以上
        'categories:seo': ['error', { minScore: 0.90 }], // 90%以上

        // Core Web Vitals（Web標準メトリクス）
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }], // 1.8秒以下
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5秒以下
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // 0.1以下
        'total-blocking-time': ['warn', { maxNumericValue: 300 }], // 300ms以下
        'interactive': ['warn', { maxNumericValue: 3800 }], // 3.8秒以下
        'speed-index': ['warn', { maxNumericValue: 3400 }], // 3.4秒以下

        // リソース最適化
        'uses-text-compression': 'warn',
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'render-blocking-resources': 'warn',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'uses-optimized-images': 'warn',
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'warn',

        // アクセシビリティ
        'color-contrast': 'error',
        'image-alt': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-valid-attr-value': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'duplicate-id': 'error',
        'label': 'error',
        'link-name': 'error',

        // セキュリティ
        'is-on-https': 'off', // ローカル開発環境ではOFF
        'external-anchors-use-rel-noopener': 'warn',

        // PWA
        'installable-manifest': 'off', // PWA機能有効時に変更
        'viewport': 'error',
        'without-javascript': 'off',
      },

      // レポート保存先
      uploadDir: './performance-reports/lighthouse-reports',
    },

    upload: {
      // CI環境でのレポートアップロード設定（将来拡張用）
      target: 'temporary-public-storage',
      // GitHub Actions環境変数を使用する場合:
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,
    },
  },
};
