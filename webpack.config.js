const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  // Create React Appの設定を継承
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
    },
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // ベンダーライブラリの分離
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
        // React関連ライブラリの分離
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
          reuseExistingChunk: true,
        },
        // Primer UIライブラリの分離
        primer: {
          test: /[\\/]node_modules[\\/]@primer[\\/]/,
          name: 'primer',
          priority: 15,
          reuseExistingChunk: true,
        },
        // Lexicalエディターの分離
        lexical: {
          test: /[\\/]node_modules[\\/](@lexical|lexical)[\\/]/,
          name: 'lexical',
          priority: 15,
          reuseExistingChunk: true,
        },
        // 共通コンポーネント
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    // RuntimeChunkの分離
    runtimeChunk: {
      name: 'runtime',
    },
  },

  plugins: [
    // バンドル分析（分析時のみ有効）
    process.env.ANALYZE && new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html',
    }),

    // Gzip圧縮
    process.env.NODE_ENV === 'production' && new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),

    // Brotli圧縮
    process.env.NODE_ENV === 'production' && new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        level: 11,
      },
      threshold: 8192,
      minRatio: 0.8,
    }),
  ].filter(Boolean),

  // 本番環境での最適化
  ...(process.env.NODE_ENV === 'production' && {
    performance: {
      maxAssetSize: 500000,
      maxEntrypointSize: 500000,
      hints: 'warning',
    },
  }),
};