#!/usr/bin/env node

/**
 * Core Web Vitals 測定スクリプト
 *
 * このスクリプトはビルド済みアプリケーションのCore Web Vitalsを測定します。
 * LCP (Largest Contentful Paint)、FID (First Input Delay)、CLS (Cumulative Layout Shift)、
 * FCP (First Contentful Paint)、TTFB (Time to First Byte) を測定します。
 *
 * 使用方法:
 * 1. アプリケーションをビルド: npm run build
 * 2. プレビューサーバー起動: npm run preview (別ターミナル)
 * 3. このスクリプト実行: node scripts/measure-web-vitals.js
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 設定
const CONFIG = {
  url: process.env.PREVIEW_URL || 'http://localhost:4173', // Vite preview デフォルトポート
  runs: 3, // 測定回数
  outputDir: join(__dirname, '..', 'performance-reports'),
  outputFile: 'web-vitals-report.json',
  htmlFile: 'web-vitals-report.html',
  thresholds: {
    // Google推奨基準
    lcp: { good: 2500, poor: 4000 }, // ms
    fid: { good: 100, poor: 300 }, // ms
    cls: { good: 0.1, poor: 0.25 }, // score
    fcp: { good: 1800, poor: 3000 }, // ms
    ttfb: { good: 800, poor: 1800 }, // ms
  },
};

/**
 * Core Web Vitals を測定
 */
async function measureWebVitals() {
  console.log('🚀 Core Web Vitals 測定を開始します...\n');
  console.log(`📊 URL: ${CONFIG.url}`);
  console.log(`🔄 測定回数: ${CONFIG.runs}回\n`);

  const browser = await chromium.launch({
    headless: true,
  });

  const results = [];

  try {
    for (let i = 0; i < CONFIG.runs; i++) {
      console.log(`\n📈 測定 ${i + 1}/${CONFIG.runs} を実行中...`);

      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
      });

      const page = await context.newPage();

      // web-vitals ライブラリを注入
      const webVitalsScript = `
        !function(){var e,t,n,i,r={passive:!0,capture:!0},a=new Date,o=function(){i=[],t=-1,e=null,f(addEventListener)},c=function(i,r){e||(e=r,t=i,n=new Date,f(removeEventListener),u())},u=function(){if(t>=0&&t<n-a){var r={entryType:"first-input",name:e.type,target:e.target,cancelable:e.cancelable,startTime:e.timeStamp,processingStart:e.timeStamp+t};i.forEach((function(e){e(r)})),i=[]}},s=function(e){if(e.cancelable){var t=(e.timeStamp>1e12?new Date:performance.now())-e.timeStamp;"pointerdown"==e.type?function(e,t){var n=function(){c(e,t),a()},i=function(){a()},a=function(){removeEventListener("pointerup",n,r),removeEventListener("pointercancel",i,r)};addEventListener("pointerup",n,r),addEventListener("pointercancel",i,r)}(t,e):c(t,e)}},f=function(e){["mousedown","keydown","touchstart","pointerdown"].forEach((function(t){return e(t,s,r)}))},p=function(n,r){r=r||{},o();var a,c=d("FCP"),u=function(e){"first-contentful-paint"===e.name&&(m&&m.disconnect(),e.startTime<f.firstHiddenTime&&(c.value=e.startTime-h(),c.entries.push(e),a(!0)))},f=d("LCP"),l=function(e){e.entries.forEach((function(e){e.startTime<f.firstHiddenTime&&(f.value=e.startTime-h(),f.entries=[e])})),a()},m=function(e,t){try{var n=new PerformanceObserver((function(e){e.getEntries().forEach(t)}));return n.observe({entryTypes:e,buffered:!0}),n}catch(e){}}(["paint"],u),v=function(e,t){try{var n=new PerformanceObserver((function(e){e.getEntries().forEach(t)}));return n.observe({entryTypes:e,buffered:!0}),n}catch(e){}}(["largest-contentful-paint"],l);a=function(e){(!f.value||e)&&(f.value=f.value||0,v&&v.disconnect(),n(f))},e=function(e){var t=d("CLS",0);return e.getEntries().forEach((function(e){e.hadRecentInput||(t.value+=e.value,t.entries.push(e))})),n(t),t}(t=function(e,t){try{var n=new PerformanceObserver((function(e){e.getEntries().forEach(t)}));return n.observe({entryTypes:e,buffered:!0}),n}catch(e){}}(["layout-shift"],function(e){e.hadRecentInput||t&&t(e)})),function(e,t){var n=d("TTFB");n.value=Date.now()-e.fetchStart,t(n)}(performance.timing,n),i.push((function(e){var t=d("FID");t.value=e.processingStart-e.startTime,t.entries=[e],n(t)}))};function d(e,t){return{name:e,value:void 0===t?-1:t,entries:[]}}function h(){return performance.timing.navigationStart}window.webVitals=p}();
      `;

      await page.addInitScript(webVitalsScript);

      // メトリクス収集
      const metrics = {
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null,
      };

      // ページロード
      await page.goto(CONFIG.url, {
        waitUntil: 'networkidle',
      });

      // Performance Observer でメトリクスを取得
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = {};
          let metricsCount = 0;
          const expectedMetrics = 4; // LCP, FCP, CLS, TTFB

          window.webVitals((metric) => {
            metrics[metric.name] = metric.value;
            metricsCount++;

            if (metricsCount >= expectedMetrics) {
              setTimeout(() => resolve(metrics), 100);
            }
          });

          // タイムアウト（5秒）
          setTimeout(() => resolve(metrics), 5000);
        });
      });

      // Navigation Timing API から TTFB を取得
      const navigationTiming = await page.evaluate(() => {
        const timing = performance.timing;
        return {
          ttfb: timing.responseStart - timing.fetchStart,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadComplete: timing.loadEventEnd - timing.navigationStart,
        };
      });

      // 結果をマージ
      Object.assign(metrics, {
        lcp: vitals.LCP || null,
        fcp: vitals.FCP || null,
        cls: vitals.CLS || null,
        ttfb: navigationTiming.ttfb || null,
        domContentLoaded: navigationTiming.domContentLoaded,
        loadComplete: navigationTiming.loadComplete,
      });

      results.push(metrics);

      console.log(`✅ 測定 ${i + 1} 完了`);
      console.log(`   LCP: ${metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A'}`);
      console.log(`   FCP: ${metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A'}`);
      console.log(`   CLS: ${metrics.cls ? metrics.cls.toFixed(4) : 'N/A'}`);
      console.log(`   TTFB: ${metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A'}`);

      await context.close();

      // 測定間隔（1秒待機）
      if (i < CONFIG.runs - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } finally {
    await browser.close();
  }

  return results;
}

/**
 * 結果を集計
 */
function aggregateResults(results) {
  const metrics = ['lcp', 'fcp', 'cls', 'ttfb', 'domContentLoaded', 'loadComplete'];
  const aggregated = {};

  metrics.forEach((metric) => {
    const values = results
      .map((r) => r[metric])
      .filter((v) => v !== null && !isNaN(v));

    if (values.length > 0) {
      aggregated[metric] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
        values: values,
      };
    } else {
      aggregated[metric] = null;
    }
  });

  return aggregated;
}

/**
 * 評価を判定
 */
function evaluateMetric(metricName, value) {
  const threshold = CONFIG.thresholds[metricName];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * レポート生成
 */
function generateReport(results, aggregated) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Core Web Vitals 測定結果レポート');
  console.log('='.repeat(60) + '\n');

  const metrics = [
    { key: 'lcp', name: 'Largest Contentful Paint (LCP)', unit: 'ms' },
    { key: 'fcp', name: 'First Contentful Paint (FCP)', unit: 'ms' },
    { key: 'cls', name: 'Cumulative Layout Shift (CLS)', unit: '' },
    { key: 'ttfb', name: 'Time to First Byte (TTFB)', unit: 'ms' },
    { key: 'domContentLoaded', name: 'DOM Content Loaded', unit: 'ms' },
    { key: 'loadComplete', name: 'Load Complete', unit: 'ms' },
  ];

  metrics.forEach(({ key, name, unit }) => {
    const data = aggregated[key];
    if (!data) {
      console.log(`${name}: データなし\n`);
      return;
    }

    const avgValue = data.avg;
    const evaluation = evaluateMetric(key, avgValue);
    const statusEmoji = {
      good: '✅',
      'needs-improvement': '⚠️',
      poor: '❌',
      unknown: '❓',
    }[evaluation];

    console.log(`${name}:`);
    console.log(`  ${statusEmoji} 平均: ${avgValue.toFixed(2)}${unit}`);
    console.log(`  📊 最小: ${data.min.toFixed(2)}${unit}`);
    console.log(`  📊 最大: ${data.max.toFixed(2)}${unit}`);
    console.log(`  📊 中央値: ${data.median.toFixed(2)}${unit}`);

    if (CONFIG.thresholds[key]) {
      const { good, poor } = CONFIG.thresholds[key];
      console.log(`  🎯 推奨基準: ${good}${unit}以下 (良好) / ${poor}${unit}以下 (改善必要)`);
    }

    console.log();
  });

  // 総合評価
  console.log('='.repeat(60));
  console.log('📈 総合評価');
  console.log('='.repeat(60) + '\n');

  const coreMetrics = ['lcp', 'cls', 'ttfb'];
  const evaluations = coreMetrics
    .map((key) => {
      const data = aggregated[key];
      if (!data) return null;
      return evaluateMetric(key, data.avg);
    })
    .filter((e) => e !== null);

  const goodCount = evaluations.filter((e) => e === 'good').length;
  const needsImprovementCount = evaluations.filter((e) => e === 'needs-improvement').length;
  const poorCount = evaluations.filter((e) => e === 'poor').length;

  console.log(`✅ 良好: ${goodCount}/${coreMetrics.length}`);
  console.log(`⚠️ 改善必要: ${needsImprovementCount}/${coreMetrics.length}`);
  console.log(`❌ 不良: ${poorCount}/${coreMetrics.length}\n`);

  if (poorCount === 0 && needsImprovementCount === 0) {
    console.log('🎉 すべてのCore Web Vitalsが良好です！\n');
  } else if (poorCount > 0) {
    console.log('⚠️ パフォーマンス改善が必要です。\n');
  } else {
    console.log('💡 さらなるパフォーマンス向上の余地があります。\n');
  }

  console.log('='.repeat(60) + '\n');
}

/**
 * JSON/HTMLレポート保存
 */
function saveReport(results, aggregated) {
  // 出力ディレクトリ作成
  if (!existsSync(CONFIG.outputDir)) {
    mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // JSON保存
  const jsonPath = join(CONFIG.outputDir, CONFIG.outputFile);
  const reportData = {
    timestamp: new Date().toISOString(),
    url: CONFIG.url,
    runs: CONFIG.runs,
    results: results,
    aggregated: aggregated,
    thresholds: CONFIG.thresholds,
  };

  writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));
  console.log(`💾 JSONレポート保存: ${jsonPath}`);

  // HTML保存
  const htmlPath = join(CONFIG.outputDir, CONFIG.htmlFile);
  const htmlContent = generateHTMLReport(reportData);
  writeFileSync(htmlPath, htmlContent);
  console.log(`💾 HTMLレポート保存: ${htmlPath}\n`);
}

/**
 * HTMLレポート生成
 */
function generateHTMLReport(reportData) {
  const { timestamp, url, runs, aggregated, thresholds } = reportData;

  const metrics = [
    { key: 'lcp', name: 'Largest Contentful Paint (LCP)', unit: 'ms' },
    { key: 'fcp', name: 'First Contentful Paint (FCP)', unit: 'ms' },
    { key: 'cls', name: 'Cumulative Layout Shift (CLS)', unit: '' },
    { key: 'ttfb', name: 'Time to First Byte (TTFB)', unit: 'ms' },
    { key: 'domContentLoaded', name: 'DOM Content Loaded', unit: 'ms' },
    { key: 'loadComplete', name: 'Load Complete', unit: 'ms' },
  ];

  const metricsHTML = metrics
    .map(({ key, name, unit }) => {
      const data = aggregated[key];
      if (!data) return '';

      const avgValue = data.avg;
      const evaluation = evaluateMetric(key, avgValue);
      const statusClass = {
        good: 'status-good',
        'needs-improvement': 'status-warning',
        poor: 'status-poor',
        unknown: 'status-unknown',
      }[evaluation];

      const statusText = {
        good: '✅ 良好',
        'needs-improvement': '⚠️ 改善必要',
        poor: '❌ 不良',
        unknown: '❓ 不明',
      }[evaluation];

      let thresholdHTML = '';
      if (thresholds[key]) {
        const { good, poor } = thresholds[key];
        thresholdHTML = `
          <div class="threshold">
            <strong>推奨基準:</strong> ${good}${unit}以下 (良好) / ${poor}${unit}以下 (改善必要)
          </div>
        `;
      }

      return `
        <div class="metric ${statusClass}">
          <h3>${name}</h3>
          <div class="metric-value">
            <span class="value">${avgValue.toFixed(2)}</span><span class="unit">${unit}</span>
          </div>
          <div class="status">${statusText}</div>
          <div class="details">
            <div>最小: ${data.min.toFixed(2)}${unit}</div>
            <div>最大: ${data.max.toFixed(2)}${unit}</div>
            <div>中央値: ${data.median.toFixed(2)}${unit}</div>
          </div>
          ${thresholdHTML}
        </div>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Core Web Vitals Report - TaskFlow</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      color: #333;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }

    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .header .subtitle {
      opacity: 0.9;
      font-size: 1rem;
    }

    .info {
      background: #f7f9fc;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e1e8ed;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .info-label {
      font-weight: 600;
      color: #667eea;
    }

    .metrics {
      padding: 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .metric {
      background: #f7f9fc;
      border-radius: 8px;
      padding: 1.5rem;
      border-left: 4px solid #e1e8ed;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .metric:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .metric.status-good {
      border-left-color: #10b981;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }

    .metric.status-warning {
      border-left-color: #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    }

    .metric.status-poor {
      border-left-color: #ef4444;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    }

    .metric h3 {
      font-size: 1rem;
      margin-bottom: 1rem;
      color: #334155;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #1e293b;
    }

    .metric-value .unit {
      font-size: 1rem;
      font-weight: 400;
      color: #64748b;
      margin-left: 0.25rem;
    }

    .status {
      font-weight: 600;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      font-size: 0.875rem;
      color: #64748b;
    }

    .threshold {
      margin-top: 1rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 4px;
      font-size: 0.875rem;
      color: #475569;
    }

    .threshold strong {
      color: #334155;
    }

    .footer {
      background: #f7f9fc;
      padding: 1.5rem 2rem;
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
      border-top: 1px solid #e1e8ed;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Core Web Vitals Report</h1>
      <div class="subtitle">TaskFlow Performance Metrics</div>
    </div>

    <div class="info">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">🌐 URL:</span>
          <span>${url}</span>
        </div>
        <div class="info-item">
          <span class="info-label">🔄 測定回数:</span>
          <span>${runs}回</span>
        </div>
        <div class="info-item">
          <span class="info-label">📅 測定日時:</span>
          <span>${new Date(timestamp).toLocaleString('ja-JP')}</span>
        </div>
      </div>
    </div>

    <div class="metrics">
      ${metricsHTML}
    </div>

    <div class="footer">
      Generated by TaskFlow Performance Monitoring System
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * メイン実行
 */
async function main() {
  try {
    const results = await measureWebVitals();
    const aggregated = aggregateResults(results);
    generateReport(results, aggregated);
    saveReport(results, aggregated);

    console.log('✅ Core Web Vitals 測定完了！\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
