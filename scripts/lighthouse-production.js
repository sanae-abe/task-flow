#!/usr/bin/env node

/**
 * Production Lighthouse Score Measurement
 *
 * 本番環境（Vercel）のLighthouseスコアを測定し、詳細レポートを生成
 */

import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

const PRODUCTION_URL = 'https://tflow-app.vercel.app';
const REPORT_DIR = './performance-reports';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

const config = {
  extends: 'lighthouse:default',
  settings: {
    // デスクトップ設定
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
    // 複数回実行
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
  },
};

async function runLighthouse() {
  console.log(`🚀 Starting Lighthouse analysis for: ${PRODUCTION_URL}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const port = browser.wsEndpoint().match(/:(\d+)\//)?.[1];

    if (!port) {
      throw new Error('Failed to extract browser port');
    }

    // Lighthouse実行
    const runnerResult = await lighthouse(PRODUCTION_URL, {
      port: parseInt(port, 10),
      output: ['html', 'json'],
      logLevel: 'info',
    }, config);

    if (!runnerResult) {
      throw new Error('Lighthouse run failed');
    }

    const { lhr, report } = runnerResult;

    // スコア表示
    console.log('\n📊 Lighthouse Scores:\n');
    console.log(`  Performance:      ${(lhr.categories.performance.score * 100).toFixed(0)}%`);
    console.log(`  Accessibility:    ${(lhr.categories.accessibility.score * 100).toFixed(0)}%`);
    console.log(`  Best Practices:   ${(lhr.categories['best-practices'].score * 100).toFixed(0)}%`);
    console.log(`  SEO:              ${(lhr.categories.seo.score * 100).toFixed(0)}%`);
    console.log(`  PWA:              ${(lhr.categories.pwa.score * 100).toFixed(0)}%\n`);

    // Core Web Vitals
    console.log('🎯 Core Web Vitals:\n');
    const metrics = lhr.audits;
    console.log(`  LCP:  ${(metrics['largest-contentful-paint'].numericValue / 1000).toFixed(2)}s`);
    console.log(`  FID:  ${(metrics['max-potential-fid']?.numericValue ?? 0).toFixed(0)}ms`);
    console.log(`  CLS:  ${metrics['cumulative-layout-shift'].numericValue.toFixed(3)}\n`);

    // その他の重要メトリクス
    console.log('⚡ Performance Metrics:\n');
    console.log(`  FCP:  ${(metrics['first-contentful-paint'].numericValue / 1000).toFixed(2)}s`);
    console.log(`  SI:   ${(metrics['speed-index'].numericValue / 1000).toFixed(2)}s`);
    console.log(`  TBT:  ${metrics['total-blocking-time'].numericValue.toFixed(0)}ms`);
    console.log(`  TTI:  ${(metrics['interactive'].numericValue / 1000).toFixed(2)}s\n`);

    // レポート保存
    await fs.mkdir(REPORT_DIR, { recursive: true });

    const htmlReportPath = path.join(REPORT_DIR, `lighthouse-${TIMESTAMP}.html`);
    const jsonReportPath = path.join(REPORT_DIR, `lighthouse-${TIMESTAMP}.json`);

    await fs.writeFile(htmlReportPath, report[0]);
    await fs.writeFile(jsonReportPath, report[1]);

    console.log(`\n✅ Reports saved:`);
    console.log(`   HTML: ${htmlReportPath}`);
    console.log(`   JSON: ${jsonReportPath}\n`);

    // 目標達成状況
    const goals = {
      performance: 90,
      accessibility: 100,
      bestPractices: 100,
      seo: 90,
      lcp: 2.5,
      fid: 100,
      cls: 0.1,
    };

    const actual = {
      performance: lhr.categories.performance.score * 100,
      accessibility: lhr.categories.accessibility.score * 100,
      bestPractices: lhr.categories['best-practices'].score * 100,
      seo: lhr.categories.seo.score * 100,
      lcp: metrics['largest-contentful-paint'].numericValue / 1000,
      fid: metrics['max-potential-fid']?.numericValue ?? 0,
      cls: metrics['cumulative-layout-shift'].numericValue,
    };

    console.log('🎯 Goal Achievement:\n');
    console.log(`  Performance:      ${actual.performance.toFixed(0)}% / ${goals.performance}% ${actual.performance >= goals.performance ? '✅' : '❌'}`);
    console.log(`  Accessibility:    ${actual.accessibility.toFixed(0)}% / ${goals.accessibility}% ${actual.accessibility >= goals.accessibility ? '✅' : '❌'}`);
    console.log(`  Best Practices:   ${actual.bestPractices.toFixed(0)}% / ${goals.bestPractices}% ${actual.bestPractices >= goals.bestPractices ? '✅' : '❌'}`);
    console.log(`  SEO:              ${actual.seo.toFixed(0)}% / ${goals.seo}% ${actual.seo >= goals.seo ? '✅' : '❌'}`);
    console.log(`  LCP:              ${actual.lcp.toFixed(2)}s / ${goals.lcp}s ${actual.lcp <= goals.lcp ? '✅' : '❌'}`);
    console.log(`  FID:              ${actual.fid.toFixed(0)}ms / ${goals.fid}ms ${actual.fid <= goals.fid ? '✅' : '❌'}`);
    console.log(`  CLS:              ${actual.cls.toFixed(3)} / ${goals.cls} ${actual.cls <= goals.cls ? '✅' : '❌'}\n`);

    return lhr;
  } catch (error) {
    console.error('❌ Error running Lighthouse:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

runLighthouse().catch(err => {
  console.error(err);
  process.exit(1);
});
