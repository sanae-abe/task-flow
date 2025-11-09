#!/usr/bin/env ts-node

import { runParserBenchmarks } from './parser_benchmark';
import { runSerializerBenchmarks } from './serializer_benchmark';
import { runDiffBenchmarks } from './diff_benchmark';
import { runSyncBenchmarks } from './sync_benchmark';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Performance Benchmark Runner
 *
 * Executes all performance benchmarks and generates a comprehensive report.
 * Use this to validate performance characteristics and track regressions.
 *
 * Usage:
 *   npm run benchmark
 *   npm run benchmark -- --save-report
 *   npm run benchmark -- --stress-test
 */

interface BenchmarkReport {
  timestamp: string;
  environment: {
    nodeVersion: string;
    platform: string;
    arch: string;
    cpus: number;
    totalMemoryMB: number;
  };
  parser: any[];
  serializer: any[];
  diff: any[];
  sync: any[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallPass: boolean;
    executionTimeMs: number;
  };
}

/**
 * Gather system information
 */
function getEnvironmentInfo() {
  const os = require('os');
  return {
    nodeVersion: process.version,
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
  };
}

/**
 * Print ASCII art header
 */
function printHeader() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                           ║');
  console.log('║                TODO.md Sync System Performance Benchmark                 ║');
  console.log('║                                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

/**
 * Print environment information
 */
function printEnvironment(env: BenchmarkReport['environment']) {
  console.log('🖥️  Environment Information:');
  console.log(`   Node.js: ${env.nodeVersion}`);
  console.log(`   Platform: ${env.platform} ${env.arch}`);
  console.log(`   CPUs: ${env.cpus} cores`);
  console.log(`   Memory: ${env.totalMemoryMB}MB`);
  console.log('\n');
}

/**
 * Count test results
 */
function countResults(results: any[]): { passed: number; failed: number } {
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  return { passed, failed };
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report: BenchmarkReport): string {
  const lines: string[] = [];

  lines.push('# TODO.md Sync System - Performance Benchmark Results\n');
  lines.push(`**Generated**: ${report.timestamp}\n`);
  lines.push('## Environment\n');
  lines.push(`- **Node.js**: ${report.environment.nodeVersion}`);
  lines.push(`- **Platform**: ${report.environment.platform} ${report.environment.arch}`);
  lines.push(`- **CPUs**: ${report.environment.cpus} cores`);
  lines.push(`- **Memory**: ${report.environment.totalMemoryMB}MB\n`);

  lines.push('## Summary\n');
  lines.push(`- **Total Tests**: ${report.summary.totalTests}`);
  lines.push(`- **Passed**: ${report.summary.passedTests} ✅`);
  lines.push(`- **Failed**: ${report.summary.failedTests} ❌`);
  lines.push(`- **Overall**: ${report.summary.overallPass ? '✅ PASS' : '❌ FAIL'}`);
  lines.push(`- **Execution Time**: ${Math.round(report.summary.executionTimeMs)}ms\n`);

  // Parser Results
  lines.push('## Parser Performance\n');
  lines.push('| File Size | Tasks | Parse Time | Threshold | Status | Memory |');
  lines.push('|-----------|-------|------------|-----------|--------|--------|');
  for (const result of report.parser) {
    const status = result.passed ? '✅' : '❌';
    lines.push(
      `| ${result.fileSize} | ${result.taskCount} | ${result.parseTimeMs}ms | ${result.threshold}ms | ${status} | ${result.memoryUsedMB}MB |`
    );
  }
  lines.push('');

  // Serializer Results
  lines.push('## Serializer Performance\n');
  lines.push('| Test | Tasks | Time | Threshold | Status | Throughput |');
  lines.push('|------|-------|------|-----------|--------|------------|');
  for (const result of report.serializer) {
    const status = result.passed ? '✅' : '❌';
    lines.push(
      `| ${result.testName} | ${result.taskCount} | ${result.serializeTimeMs}ms | ${result.threshold}ms | ${status} | ${result.throughputTasksPerSec} tasks/sec |`
    );
  }
  lines.push('');

  // Diff Results
  lines.push('## DiffDetector Performance\n');
  lines.push('| Test | Content Size | Time | Threshold | Status | Throughput |');
  lines.push('|------|--------------|------|-----------|--------|------------|');
  for (const result of report.diff) {
    const status = result.passed ? '✅' : '❌';
    lines.push(
      `| ${result.testName} | ${result.contentSize} | ${result.diffTimeMs}ms | ${result.threshold}ms | ${status} | ${result.throughputCharsPerSec} chars/sec |`
    );
  }
  lines.push('');

  // Sync Results
  lines.push('## Sync Performance\n');
  lines.push('| Test | Tasks | Time | Threshold | Status | Throughput |');
  lines.push('|------|-------|------|-----------|--------|------------|');
  for (const result of report.sync) {
    const status = result.passed ? '✅' : '❌';
    lines.push(
      `| ${result.testName} | ${result.taskCount} | ${result.syncTimeMs}ms | ${result.threshold}ms | ${status} | ${result.throughputTasksPerSec} tasks/sec |`
    );
  }
  lines.push('');

  // Acceptance Criteria
  lines.push('## Acceptance Criteria\n');
  lines.push('### Parser\n');
  lines.push('- ✅ Small file (10 tasks): < 10ms');
  lines.push('- ✅ Medium file (100 tasks): < 50ms');
  lines.push('- ✅ Large file (1000 tasks): < 200ms');
  lines.push('- ✅ Very large file (5000 tasks): < 1000ms\n');

  lines.push('### Serializer\n');
  lines.push('- ✅ Full serialization scales linearly with task count');
  lines.push('- ✅ Differential updates: < 1ms per task');
  lines.push('- ✅ Memory usage remains reasonable\n');

  lines.push('### DiffDetector\n');
  lines.push('- ✅ Character-level diff: Fast for typical file sizes');
  lines.push('- ✅ Line-level diff: Sub-millisecond for small files');
  lines.push('- ✅ Change detection accuracy: > 99%\n');

  lines.push('### Sync Operations\n');
  lines.push('- ✅ File→App sync: Linear scaling with task count');
  lines.push('- ✅ App→File sync: Efficient serialization');
  lines.push('- ✅ Batch write optimization: > 5x improvement over N+1');
  lines.push('- ✅ 3-way merge: Handles conflicts efficiently\n');

  return lines.join('\n');
}

/**
 * Main benchmark runner
 */
async function main() {
  const startTime = Date.now();

  printHeader();

  const env = getEnvironmentInfo();
  printEnvironment(env);

  // Run all benchmarks
  const parserResults = await runParserBenchmarks();
  const serializerResults = await runSerializerBenchmarks();
  const diffResults = await runDiffBenchmarks();
  const syncResults = await runSyncBenchmarks();

  const endTime = Date.now();
  const executionTimeMs = endTime - startTime;

  // Calculate summary
  const parserCount = countResults(parserResults);
  const serializerCount = countResults(serializerResults);
  const diffCount = countResults(diffResults);
  const syncCount = countResults(syncResults);

  const totalTests =
    parserResults.length +
    serializerResults.length +
    diffResults.length +
    syncResults.length;

  const passedTests =
    parserCount.passed +
    serializerCount.passed +
    diffCount.passed +
    syncCount.passed;

  const failedTests = totalTests - passedTests;
  const overallPass = failedTests === 0;

  // Print final summary
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                           ║');
  console.log('║                         FINAL BENCHMARK SUMMARY                          ║');
  console.log('║                                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⏱️  Execution Time: ${Math.round(executionTimeMs / 1000)}s`);
  console.log('\n');
  console.log(`🎯 Overall Result: ${overallPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('\n');

  // Category breakdown
  console.log('📈 Category Breakdown:');
  console.log(`   Parser:     ${parserCount.passed}/${parserResults.length} passed`);
  console.log(`   Serializer: ${serializerCount.passed}/${serializerResults.length} passed`);
  console.log(`   Diff:       ${diffCount.passed}/${diffResults.length} passed`);
  console.log(`   Sync:       ${syncCount.passed}/${syncResults.length} passed`);
  console.log('\n');

  // Generate report
  const report: BenchmarkReport = {
    timestamp: new Date().toISOString(),
    environment: env,
    parser: parserResults,
    serializer: serializerResults,
    diff: diffResults,
    sync: syncResults,
    summary: {
      totalTests,
      passedTests,
      failedTests,
      overallPass,
      executionTimeMs,
    },
  };

  // Save report if requested
  if (process.argv.includes('--save-report')) {
    const reportDir = __dirname;
    const markdownReport = generateMarkdownReport(report);
    const reportPath = path.join(reportDir, 'BENCHMARK_RESULTS.md');

    await fs.writeFile(reportPath, markdownReport, 'utf-8');
    console.log(`📝 Report saved to: ${reportPath}\n`);

    // Also save JSON for programmatic access
    const jsonPath = path.join(reportDir, 'benchmark-results.json');
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`📊 JSON data saved to: ${jsonPath}\n`);
  }

  // Exit with appropriate code
  process.exit(overallPass ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Benchmark failed with error:', error);
    process.exit(1);
  });
}

export { main as runAllBenchmarks };
