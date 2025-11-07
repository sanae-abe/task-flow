module.exports = {
  ci: {
    collect: {
      // ビルド済みファイルを静的サーバーで起動してテスト
      staticDistDir: './build',
      // または開発サーバーを使用する場合
      // url: ['http://localhost:3000/'],
      numberOfRuns: 3, // 3回実行して平均値を取得
      settings: {
        // Chrome起動オプション
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      // パフォーマンスバジェット設定
      assertions: {
        // カテゴリースコア（0-1）
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 1.0 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }], // 2秒以下
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5秒以下
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // 0.1以下
        'total-blocking-time': ['warn', { maxNumericValue: 300 }], // 300ms以下
        'speed-index': ['warn', { maxNumericValue: 3000 }], // 3秒以下

        // リソースサイズ
        'resource-summary:script:size': ['warn', { maxNumericValue: 512000 }], // 500KB以下
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 51200 }], // 50KB以下
        'resource-summary:document:size': ['warn', { maxNumericValue: 51200 }], // 50KB以下
        'resource-summary:image:size': ['warn', { maxNumericValue: 512000 }], // 500KB以下
        'resource-summary:total:size': ['warn', { maxNumericValue: 1536000 }], // 1.5MB以下

        // パフォーマンスメトリクス
        'interactive': ['warn', { maxNumericValue: 3500 }], // 3.5秒以下
        'max-potential-fid': ['warn', { maxNumericValue: 130 }], // 130ms以下

        // ベストプラクティス
        'uses-long-cache-ttl': 'off', // ローカルストレージ使用のため無効化
        'uses-http2': 'off', // 静的ホスティング時の制約
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',

        // アクセシビリティ
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'button-name': 'error',
        'color-contrast': 'error',
        'duplicate-id-aria': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'tabindex': 'error',

        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'meta-viewport': 'error',
        'font-size': 'error',
        'crawlable-anchors': 'error',
      },
    },
    upload: {
      // Lighthouse CI Server へのアップロード設定（オプション）
      // target: 'temporary-public-storage',
      target: 'filesystem',
      outputDir: './lighthouse-reports',
    },
    server: {
      // Lighthouse CI Server 設定（オプション）
      // port: 9001,
      // storage: {
      //   storageMethod: 'sql',
      //   sqlDatabasePath: './lhci.db',
      // },
    },
  },
};
