import { DiffDetector } from '../../performance/diff-detector';
import { performance } from 'perf_hooks';
/**
 * Generate markdown content of specified size
 */
function generateMarkdownContent(lineCount) {
    const lines = [];
    lines.push('---');
    lines.push('title: Diff Test');
    lines.push('version: 1.2');
    lines.push('---');
    lines.push('');
    let taskId = 0;
    for (let i = 0; i < lineCount - 5; i++) {
        if (i % 15 === 0) {
            lines.push(`## Section ${Math.floor(i / 15)}`);
            lines.push('');
        }
        else if (i % 15 === 1) {
            // Empty line
            lines.push('');
        }
        else {
            const checked = taskId % 3 === 0 ? 'x' : ' ';
            lines.push(`- [${checked}] Task ${taskId + 1}: This is a sample task #tag${taskId % 5}`);
            taskId++;
        }
    }
    return lines.join('\n');
}
/**
 * Modify content to simulate changes
 */
function modifyContent(content, changePercentage = 10) {
    const lines = content.split('\n');
    const changeCount = Math.floor((lines.length * changePercentage) / 100);
    for (let i = 0; i < changeCount; i++) {
        const lineIdx = Math.floor(Math.random() * lines.length);
        const line = lines[lineIdx];
        if (line.includes('- [')) {
            // Toggle checkbox
            lines[lineIdx] = line.includes('- [x]')
                ? line.replace('- [x]', '- [ ]')
                : line.replace('- [ ]', '- [x]');
        }
        else if (line.includes('##')) {
            // Modify section title
            lines[lineIdx] = line + ' (Modified)';
        }
    }
    return lines.join('\n');
}
/**
 * Benchmark character-level diff
 */
async function benchmarkCharacterLevelDiff(lineCount, threshold) {
    const detector = new DiffDetector();
    const oldContent = generateMarkdownContent(lineCount);
    const newContent = modifyContent(oldContent, 10);
    const charCount = oldContent.length;
    // Warm up
    detector.detectDiff(oldContent, newContent);
    // Measure
    const startTime = performance.now();
    const diffs = detector.detectDiff(oldContent, newContent);
    const endTime = performance.now();
    const diffTimeMs = endTime - startTime;
    const summary = detector.getSummary(diffs);
    const throughputCharsPerSec = (charCount / diffTimeMs) * 1000;
    return {
        testName: `Character-level diff (${lineCount} lines)`,
        contentSize: `${lineCount} lines`,
        charCount,
        lineCount,
        diffTimeMs: Math.round(diffTimeMs * 100) / 100,
        changesDetected: summary.addedChars + summary.deletedChars,
        throughputCharsPerSec: Math.round(throughputCharsPerSec),
        passed: diffTimeMs < threshold,
        threshold,
    };
}
/**
 * Benchmark line-level diff
 */
async function benchmarkLineLevelDiff(lineCount, threshold) {
    const detector = new DiffDetector();
    const oldContent = generateMarkdownContent(lineCount);
    const newContent = modifyContent(oldContent, 10);
    // Warm up
    detector.getLineChanges(oldContent, newContent);
    // Measure
    const startTime = performance.now();
    const lineChanges = detector.getLineChanges(oldContent, newContent);
    const endTime = performance.now();
    const diffTimeMs = endTime - startTime;
    const throughputCharsPerSec = (oldContent.length / diffTimeMs) * 1000;
    return {
        testName: `Line-level diff (${lineCount} lines)`,
        contentSize: `${lineCount} lines`,
        charCount: oldContent.length,
        lineCount,
        diffTimeMs: Math.round(diffTimeMs * 100) / 100,
        changesDetected: lineChanges.length,
        throughputCharsPerSec: Math.round(throughputCharsPerSec),
        passed: diffTimeMs < threshold,
        threshold,
    };
}
/**
 * Benchmark identical content detection (fast path)
 */
async function benchmarkIdenticalDetection() {
    const detector = new DiffDetector();
    const content = generateMarkdownContent(1000);
    // Measure
    const iterations = 10000;
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
        detector.isIdentical(content, content);
    }
    const endTime = performance.now();
    const totalTimeMs = endTime - startTime;
    const avgTimeMs = totalTimeMs / iterations;
    return {
        testName: 'Identical content detection',
        contentSize: '1000 lines',
        charCount: content.length,
        lineCount: 1000,
        diffTimeMs: Math.round(avgTimeMs * 1000) / 1000,
        changesDetected: 0,
        throughputCharsPerSec: Math.round((content.length / avgTimeMs) * 1000),
        passed: avgTimeMs < 0.1, // Should be extremely fast
        threshold: 0.1,
    };
}
/**
 * Benchmark change detection accuracy
 */
async function benchmarkChangeDetectionAccuracy() {
    const detector = new DiffDetector();
    let correctDetections = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    const totalTests = 100;
    for (let i = 0; i < totalTests; i++) {
        const content = generateMarkdownContent(50);
        // Test 1: Identical content (should detect no changes)
        const identical = detector.isIdentical(content, content);
        if (identical) {
            correctDetections++;
        }
        else {
            falsePositives++;
        }
        // Test 2: Modified content (should detect changes)
        const modifiedContent = modifyContent(content, 5);
        const diffs = detector.detectDiff(content, modifiedContent);
        const summary = detector.getSummary(diffs);
        if (summary.hasChanges) {
            correctDetections++;
        }
        else {
            falseNegatives++;
        }
    }
    const accuracy = (correctDetections / (totalTests * 2)) * 100;
    return {
        testName: 'Change detection accuracy',
        accuracy: Math.round(accuracy * 100) / 100,
        falsePositives,
        falseNegatives,
        passed: accuracy >= 99, // Should be highly accurate
    };
}
/**
 * Run all diff benchmarks
 */
export async function runDiffBenchmarks() {
    console.log('\n📊 DiffDetector Performance Benchmark\n');
    console.log('='.repeat(80));
    const results = [];
    // Character-level diff tests
    console.log('\n🔤 Character-level Diff Tests:');
    const charLevelTests = [
        { lineCount: 50, threshold: 10 },
        { lineCount: 500, threshold: 50 },
        { lineCount: 5000, threshold: 300 },
    ];
    for (const test of charLevelTests) {
        const result = await benchmarkCharacterLevelDiff(test.lineCount, test.threshold);
        results.push(result);
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        const percentage = Math.round((result.diffTimeMs / result.threshold) * 100);
        console.log(`   ${status} ${test.lineCount} lines: ${result.diffTimeMs}ms / ${result.threshold}ms (${percentage}%)`);
        console.log(`        Changes: ${result.changesDetected} chars, Throughput: ${result.throughputCharsPerSec} chars/sec`);
    }
    // Line-level diff tests
    console.log('\n📄 Line-level Diff Tests:');
    const lineLevelTests = [
        { lineCount: 50, threshold: 5 },
        { lineCount: 500, threshold: 30 },
        { lineCount: 5000, threshold: 200 },
    ];
    for (const test of lineLevelTests) {
        const result = await benchmarkLineLevelDiff(test.lineCount, test.threshold);
        results.push(result);
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        const percentage = Math.round((result.diffTimeMs / result.threshold) * 100);
        console.log(`   ${status} ${test.lineCount} lines: ${result.diffTimeMs}ms / ${result.threshold}ms (${percentage}%)`);
        console.log(`        Changes: ${result.changesDetected} lines, Throughput: ${result.throughputCharsPerSec} chars/sec`);
    }
    // Identical detection test
    console.log('\n⚡ Fast Path Tests:');
    const identicalResult = await benchmarkIdenticalDetection();
    results.push(identicalResult);
    const identicalStatus = identicalResult.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${identicalStatus} ${identicalResult.testName}: ${identicalResult.diffTimeMs}ms / ${identicalResult.threshold}ms`);
    console.log(`        Throughput: ${identicalResult.throughputCharsPerSec} chars/sec`);
    // Accuracy test
    console.log('\n🎯 Accuracy Tests:');
    const accuracyResult = await benchmarkChangeDetectionAccuracy();
    const accuracyStatus = accuracyResult.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${accuracyStatus} ${accuracyResult.testName}: ${accuracyResult.accuracy}%`);
    console.log(`        False positives: ${accuracyResult.falsePositives}, False negatives: ${accuracyResult.falseNegatives}`);
    console.log('\n' + '='.repeat(80));
    // Summary
    const allPassed = results.every(r => r.passed) && accuracyResult.passed;
    const avgCharLevelTime = charLevelTests.reduce((sum, _, idx) => sum + results[idx].diffTimeMs, 0) / charLevelTests.length;
    const avgLineLevelTime = lineLevelTests.reduce((sum, _, idx) => sum + results[charLevelTests.length + idx].diffTimeMs, 0) / lineLevelTests.length;
    console.log('\n📈 Summary:');
    console.log(`   Overall: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
    console.log(`   Avg char-level diff time: ${Math.round(avgCharLevelTime * 100) / 100}ms`);
    console.log(`   Avg line-level diff time: ${Math.round(avgLineLevelTime * 100) / 100}ms`);
    console.log(`   Change detection accuracy: ${accuracyResult.accuracy}%`);
    return results;
}
// Run benchmarks if executed directly
if (require.main === module) {
    (async () => {
        await runDiffBenchmarks();
    })();
}
//# sourceMappingURL=diff_benchmark.js.map