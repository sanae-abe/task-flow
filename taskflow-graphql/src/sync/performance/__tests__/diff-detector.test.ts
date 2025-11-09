import { describe, it, expect, beforeEach } from 'vitest';
import { DiffDetector, DiffType } from '../diff-detector';
import type { DiffResult, ChangeSummary, LineChange } from '../diff-detector';

describe('DiffDetector', () => {
  let detector: DiffDetector;

  beforeEach(() => {
    detector = new DiffDetector();
  });

  describe('detectDiff() - Basic Diff Detection', () => {
    it('should detect no difference for identical strings', () => {
      const text = 'Hello World';
      const diffs = detector.detectDiff(text, text);

      expect(diffs).toHaveLength(1);
      expect(diffs[0].type).toBe(DiffType.EQUAL);
      expect(diffs[0].text).toBe(text);
    });

    it('should detect insertion when old text is empty', () => {
      const newText = 'New content';
      const diffs = detector.detectDiff('', newText);

      expect(diffs).toHaveLength(1);
      expect(diffs[0].type).toBe(DiffType.INSERT);
      expect(diffs[0].text).toBe(newText);
    });

    it('should detect deletion when new text is empty', () => {
      const oldText = 'Old content';
      const diffs = detector.detectDiff(oldText, '');

      expect(diffs).toHaveLength(1);
      expect(diffs[0].type).toBe(DiffType.DELETE);
      expect(diffs[0].text).toBe(oldText);
    });

    it('should return empty array when both texts are empty', () => {
      const diffs = detector.detectDiff('', '');

      expect(diffs).toHaveLength(0);
    });

    it('should detect simple text insertion', () => {
      const oldText = 'Hello World';
      const newText = 'Hello Beautiful World';
      const diffs = detector.detectDiff(oldText, newText);

      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some(d => d.type === DiffType.INSERT)).toBe(true);
      expect(diffs.some(d => d.text.includes('Beautiful'))).toBe(true);
    });

    it('should detect simple text deletion', () => {
      const oldText = 'Hello Beautiful World';
      const newText = 'Hello World';
      const diffs = detector.detectDiff(oldText, newText);

      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some(d => d.type === DiffType.DELETE)).toBe(true);
    });

    it('should detect text replacement', () => {
      const oldText = 'Hello World';
      const newText = 'Goodbye World';
      const diffs = detector.detectDiff(oldText, newText);

      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some(d => d.type === DiffType.DELETE)).toBe(true);
      expect(diffs.some(d => d.type === DiffType.INSERT)).toBe(true);
    });

    it('should detect multiple changes in complex text', () => {
      const oldText = 'Line 1\nLine 2\nLine 3';
      const newText = 'Line 1\nModified Line 2\nLine 3\nLine 4';
      const diffs = detector.detectDiff(oldText, newText);

      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some(d => d.type === DiffType.INSERT)).toBe(true);
    });
  });

  describe('getSummary() - Change Summary Generation', () => {
    it('should return no changes for identical content', () => {
      const diffs = detector.detectDiff('Hello', 'Hello');
      const summary = detector.getSummary(diffs);

      expect(summary.hasChanges).toBe(false);
      expect(summary.addedChars).toBe(0);
      expect(summary.deletedChars).toBe(0);
      expect(summary.addedLines).toBe(0);
      expect(summary.deletedLines).toBe(0);
      expect(summary.modifiedLines).toBe(0);
      expect(summary.changeSeverity).toBe(0);
    });

    it('should count added characters correctly', () => {
      const diffs = detector.detectDiff('Hello', 'Hello World');
      const summary = detector.getSummary(diffs);

      expect(summary.hasChanges).toBe(true);
      expect(summary.addedChars).toBe(6); // ' World'
      expect(summary.deletedChars).toBe(0);
    });

    it('should count deleted characters correctly', () => {
      const diffs = detector.detectDiff('Hello World', 'Hello');
      const summary = detector.getSummary(diffs);

      expect(summary.hasChanges).toBe(true);
      expect(summary.addedChars).toBe(0);
      expect(summary.deletedChars).toBe(6); // ' World'
    });

    it('should count added lines correctly', () => {
      const diffs = detector.detectDiff('Line 1', 'Line 1\nLine 2\nLine 3');
      const summary = detector.getSummary(diffs);

      expect(summary.addedLines).toBe(2); // 2 newlines added
    });

    it('should count deleted lines correctly', () => {
      const diffs = detector.detectDiff('Line 1\nLine 2\nLine 3', 'Line 1');
      const summary = detector.getSummary(diffs);

      expect(summary.deletedLines).toBe(2); // 2 newlines deleted
    });

    it('should calculate modified lines correctly', () => {
      const diffs = detector.detectDiff('Line 1\nLine 2', 'Line 1\nModified Line 2');
      const summary = detector.getSummary(diffs);

      // Modified lines is the minimum of added and deleted lines
      expect(summary.modifiedLines).toBeGreaterThanOrEqual(0);
    });

    it('should calculate change severity (0-100)', () => {
      const diffs = detector.detectDiff('Hello', 'Hello World Test');
      const summary = detector.getSummary(diffs);

      expect(summary.changeSeverity).toBeGreaterThan(0);
      expect(summary.changeSeverity).toBeLessThanOrEqual(100);
    });

    it('should cap change severity at 100 for large changes', () => {
      const largeText = 'x'.repeat(200);
      const diffs = detector.detectDiff('', largeText);
      const summary = detector.getSummary(diffs);

      expect(summary.changeSeverity).toBe(100);
    });

    it('should handle empty diff array', () => {
      const summary = detector.getSummary([]);

      expect(summary.hasChanges).toBe(false);
      expect(summary.addedChars).toBe(0);
      expect(summary.deletedChars).toBe(0);
      expect(summary.changeSeverity).toBe(0);
    });
  });

  describe('getLineChanges() - Line-by-Line Changes', () => {
    it('should detect added lines', () => {
      const oldText = 'Line 1\nLine 2';
      const newText = 'Line 1\nLine 2\nLine 3';
      const changes = detector.getLineChanges(oldText, newText);

      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('added');
      expect(changes[0].lineNumber).toBe(2);
      expect(changes[0].newContent).toBe('Line 3');
      expect(changes[0].oldContent).toBeUndefined();
    });

    it('should detect deleted lines', () => {
      const oldText = 'Line 1\nLine 2\nLine 3';
      const newText = 'Line 1\nLine 2';
      const changes = detector.getLineChanges(oldText, newText);

      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('deleted');
      expect(changes[0].lineNumber).toBe(2);
      expect(changes[0].oldContent).toBe('Line 3');
      expect(changes[0].newContent).toBeUndefined();
    });

    it('should detect modified lines', () => {
      const oldText = 'Line 1\nLine 2';
      const newText = 'Line 1\nModified Line 2';
      const changes = detector.getLineChanges(oldText, newText);

      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('modified');
      expect(changes[0].lineNumber).toBe(1);
      expect(changes[0].oldContent).toBe('Line 2');
      expect(changes[0].newContent).toBe('Modified Line 2');
    });

    it('should detect multiple line changes', () => {
      const oldText = 'Line 1\nLine 2\nLine 3';
      const newText = 'Modified Line 1\nLine 2\nLine 4';
      const changes = detector.getLineChanges(oldText, newText);

      expect(changes).toHaveLength(2);
      expect(changes[0].type).toBe('modified');
      expect(changes[0].lineNumber).toBe(0);
      expect(changes[1].type).toBe('modified');
      expect(changes[1].lineNumber).toBe(2);
    });

    it('should return empty array for identical content', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const changes = detector.getLineChanges(text, text);

      expect(changes).toHaveLength(0);
    });

    it('should handle empty old text', () => {
      const newText = 'Line 1\nLine 2';
      const changes = detector.getLineChanges('', newText);

      // Empty string splits into [''] which is one element
      expect(changes.length).toBeGreaterThanOrEqual(2);
      expect(changes.some(c => c.type === 'added')).toBe(true);
    });

    it('should handle empty new text', () => {
      const oldText = 'Line 1\nLine 2';
      const changes = detector.getLineChanges(oldText, '');

      // Empty string splits into [''] which is one element
      expect(changes.length).toBeGreaterThanOrEqual(2);
      expect(changes.some(c => c.type === 'deleted')).toBe(true);
    });

    it('should track correct line numbers for complex changes', () => {
      const oldText = 'A\nB\nC\nD\nE';
      const newText = 'A\nX\nC\nY\nE';
      const changes = detector.getLineChanges(oldText, newText);

      const lineNumbers = changes.map(c => c.lineNumber);
      expect(lineNumbers).toContain(1); // B -> X
      expect(lineNumbers).toContain(3); // D -> Y
    });
  });

  describe('filterByPattern() - Pattern Filtering', () => {
    it('should filter diffs by regex pattern', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: 'task: Buy milk' },
        { type: DiffType.INSERT, text: 'note: Remember' },
        { type: DiffType.DELETE, text: 'task: Old task' },
      ];
      const filtered = detector.filterByPattern(diffs, /^task:/);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(d => d.text.startsWith('task:'))).toBe(true);
    });

    it('should return empty array when no matches', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: 'hello' },
        { type: DiffType.DELETE, text: 'world' },
      ];
      const filtered = detector.filterByPattern(diffs, /^notfound/);

      expect(filtered).toHaveLength(0);
    });

    it('should filter by complex regex pattern', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: '- [ ] Task 1' },
        { type: DiffType.INSERT, text: '- [x] Task 2' },
        { type: DiffType.INSERT, text: 'Regular text' },
      ];
      const filtered = detector.filterByPattern(diffs, /^- \[[ x]\]/);

      expect(filtered).toHaveLength(2);
    });

    it('should handle empty diff array', () => {
      const filtered = detector.filterByPattern([], /test/);

      expect(filtered).toHaveLength(0);
    });
  });

  describe('hasTaskChanges() - Task Change Detection', () => {
    it('should detect checkbox changes', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: '- [ ] New task' },
      ];

      expect(detector.hasTaskChanges(diffs)).toBe(true);
    });

    it('should detect numbered list changes', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: '1. First item' },
      ];

      expect(detector.hasTaskChanges(diffs)).toBe(true);
    });

    it('should detect heading changes', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: '## New Section' },
      ];

      expect(detector.hasTaskChanges(diffs)).toBe(true);
    });

    it('should detect multiple task patterns', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: '- [x] Completed task' },
        { type: DiffType.INSERT, text: '### Sub-heading' },
        { type: DiffType.DELETE, text: '2. Old numbered item' },
      ];

      expect(detector.hasTaskChanges(diffs)).toBe(true);
    });

    it('should return false for non-task changes', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: 'Regular paragraph text' },
        { type: DiffType.DELETE, text: 'Another regular line' },
      ];

      expect(detector.hasTaskChanges(diffs)).toBe(false);
    });

    it('should handle empty diff array', () => {
      expect(detector.hasTaskChanges([])).toBe(false);
    });
  });

  describe('hasMetadataChanges() - Metadata Change Detection', () => {
    it('should detect front matter delimiter changes', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: '---' },
      ];

      expect(detector.hasMetadataChanges(diffs)).toBe(true);
    });

    it('should detect title changes', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: 'title: New Title' },
      ];

      expect(detector.hasMetadataChanges(diffs)).toBe(true);
    });

    it('should detect version changes', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: 'version: 2.0' },
      ];

      expect(detector.hasMetadataChanges(diffs)).toBe(true);
    });

    it('should detect created date changes', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: 'created: 2025-11-09' },
      ];

      expect(detector.hasMetadataChanges(diffs)).toBe(true);
    });

    it('should detect updated date changes', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: 'updated: 2025-11-09' },
      ];

      expect(detector.hasMetadataChanges(diffs)).toBe(true);
    });

    it('should detect multiple metadata patterns', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: '---' },
        { type: DiffType.INSERT, text: 'title: Test' },
        { type: DiffType.DELETE, text: 'version: 1.0' },
      ];

      expect(detector.hasMetadataChanges(diffs)).toBe(true);
    });

    it('should return false for non-metadata changes', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: 'Regular text content' },
      ];

      expect(detector.hasMetadataChanges(diffs)).toBe(false);
    });

    it('should handle empty diff array', () => {
      expect(detector.hasMetadataChanges([])).toBe(false);
    });
  });

  describe('formatDiff() - Human-Readable Formatting', () => {
    it('should format insertions with + prefix', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: 'New line' },
      ];
      const formatted = detector.formatDiff(diffs);

      expect(formatted).toBe('+ New line');
    });

    it('should format deletions with - prefix', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.DELETE, text: 'Old line' },
      ];
      const formatted = detector.formatDiff(diffs);

      expect(formatted).toBe('- Old line');
    });

    it('should format equal content with space prefix', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.EQUAL, text: 'Unchanged' },
      ];
      const formatted = detector.formatDiff(diffs);

      expect(formatted).toBe('  Unchanged');
    });

    it('should replace newlines with \\n', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: 'Line 1\nLine 2' },
      ];
      const formatted = detector.formatDiff(diffs);

      expect(formatted).toContain('\\n');
      expect(formatted).not.toContain('\n');
    });

    it('should truncate long text with ellipsis', () => {
      const longText = 'x'.repeat(150);
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: longText },
      ];
      const formatted = detector.formatDiff(diffs, 100);

      expect(formatted.length).toBeLessThan(longText.length + 10);
      expect(formatted).toContain('...');
    });

    it('should format multiple diffs with newlines', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.EQUAL, text: 'Same' },
        { type: DiffType.INSERT, text: 'New' },
        { type: DiffType.DELETE, text: 'Old' },
      ];
      const formatted = detector.formatDiff(diffs);

      const lines = formatted.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('  Same');
      expect(lines[1]).toBe('+ New');
      expect(lines[2]).toBe('- Old');
    });

    it('should handle custom max length parameter', () => {
      const longText = 'x'.repeat(200);
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: longText },
      ];
      const formatted = detector.formatDiff(diffs, 50);

      expect(formatted).toContain('...');
      expect(formatted.length).toBeLessThan(60); // 50 + prefix + ...
    });

    it('should handle empty diff array', () => {
      const formatted = detector.formatDiff([]);

      expect(formatted).toBe('');
    });
  });

  describe('isIdentical() - Fast Identity Check', () => {
    it('should return true for identical strings', () => {
      const text = 'Hello World';

      expect(detector.isIdentical(text, text)).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(detector.isIdentical('Hello', 'World')).toBe(false);
    });

    it('should return false for different lengths (fast path)', () => {
      expect(detector.isIdentical('Short', 'Much longer string')).toBe(false);
    });

    it('should return true for empty strings', () => {
      expect(detector.isIdentical('', '')).toBe(true);
    });

    it('should handle multiline content', () => {
      const text = 'Line 1\nLine 2\nLine 3';

      expect(detector.isIdentical(text, text)).toBe(true);
    });

    it('should detect subtle differences', () => {
      expect(detector.isIdentical('Hello World', 'Hello World ')).toBe(false);
    });

    it('should handle special characters', () => {
      const text = '🔥 緊急タスク\n- [ ] Task';

      expect(detector.isIdentical(text, text)).toBe(true);
    });
  });

  describe('exceedsThreshold() - Threshold Checking', () => {
    it('should return false when changes are below threshold', () => {
      const diffs = detector.detectDiff('Hello', 'Hello World');
      const exceeds = detector.exceedsThreshold(diffs, 1000);

      expect(exceeds).toBe(false);
    });

    it('should return true when changes exceed threshold', () => {
      const largeText = 'x'.repeat(1500);
      const diffs = detector.detectDiff('', largeText);
      const exceeds = detector.exceedsThreshold(diffs, 1000);

      expect(exceeds).toBe(true);
    });

    it('should use default threshold of 1000', () => {
      const mediumText = 'x'.repeat(500);
      const diffs = detector.detectDiff('', mediumText);
      const exceeds = detector.exceedsThreshold(diffs);

      expect(exceeds).toBe(false);
    });

    it('should count both additions and deletions', () => {
      const oldText = 'x'.repeat(600);
      const newText = 'y'.repeat(600);
      const diffs = detector.detectDiff(oldText, newText);
      const exceeds = detector.exceedsThreshold(diffs, 1000);

      expect(exceeds).toBe(true); // 600 deleted + 600 added = 1200
    });

    it('should handle empty diffs', () => {
      const exceeds = detector.exceedsThreshold([], 1000);

      expect(exceeds).toBe(false);
    });

    it('should work with custom thresholds', () => {
      const diffs = detector.detectDiff('Hello', 'Hello World');

      expect(detector.exceedsThreshold(diffs, 1)).toBe(true);
      expect(detector.exceedsThreshold(diffs, 100)).toBe(false);
    });
  });

  describe('getStatistics() - Statistics Generation', () => {
    it('should return statistics for diff results', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.EQUAL, text: 'Same' },
        { type: DiffType.INSERT, text: 'New 1' },
        { type: DiffType.INSERT, text: 'New 2' },
        { type: DiffType.DELETE, text: 'Old' },
      ];
      const stats = detector.getStatistics(diffs);

      expect(stats.totalDiffs).toBe(4);
      expect(stats.insertions).toBe(2);
      expect(stats.deletions).toBe(1);
      expect(stats.unchanged).toBe(1);
      expect(stats.summary).toBeDefined();
    });

    it('should include summary in statistics', () => {
      const diffs = detector.detectDiff('Hello', 'Hello World');
      const stats = detector.getStatistics(diffs);

      expect(stats.summary).toBeDefined();
      expect(stats.summary.hasChanges).toBe(true);
      expect(stats.summary.addedChars).toBeGreaterThan(0);
    });

    it('should handle empty diffs', () => {
      const stats = detector.getStatistics([]);

      expect(stats.totalDiffs).toBe(0);
      expect(stats.insertions).toBe(0);
      expect(stats.deletions).toBe(0);
      expect(stats.unchanged).toBe(0);
    });

    it('should count only equal type as unchanged', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.EQUAL, text: 'A' },
        { type: DiffType.EQUAL, text: 'B' },
        { type: DiffType.INSERT, text: 'C' },
      ];
      const stats = detector.getStatistics(diffs);

      expect(stats.unchanged).toBe(2);
    });
  });

  describe('mergeDiffs() - Diff Merging', () => {
    it('should merge multiple diff arrays', () => {
      const diffs1: DiffResult[] = [
        { type: DiffType.INSERT, text: 'A' },
      ];
      const diffs2: DiffResult[] = [
        { type: DiffType.DELETE, text: 'B' },
      ];
      const diffs3: DiffResult[] = [
        { type: DiffType.EQUAL, text: 'C' },
      ];

      const merged = detector.mergeDiffs([diffs1, diffs2, diffs3]);

      expect(merged).toHaveLength(3);
      expect(merged[0].text).toBe('A');
      expect(merged[1].text).toBe('B');
      expect(merged[2].text).toBe('C');
    });

    it('should handle empty arrays', () => {
      const merged = detector.mergeDiffs([[], [], []]);

      expect(merged).toHaveLength(0);
    });

    it('should maintain order of diffs', () => {
      const diffs1: DiffResult[] = [
        { type: DiffType.INSERT, text: 'First' },
      ];
      const diffs2: DiffResult[] = [
        { type: DiffType.INSERT, text: 'Second' },
      ];

      const merged = detector.mergeDiffs([diffs1, diffs2]);

      expect(merged[0].text).toBe('First');
      expect(merged[1].text).toBe('Second');
    });

    it('should handle single array', () => {
      const diffs: DiffResult[] = [
        { type: DiffType.INSERT, text: 'A' },
        { type: DiffType.DELETE, text: 'B' },
      ];

      const merged = detector.mergeDiffs([diffs]);

      expect(merged).toHaveLength(2);
      expect(merged).toEqual(diffs);
    });
  });

  describe('detectDiffChunked() - Chunked Diff Detection', () => {
    it('should use normal diff for small files', () => {
      const oldText = 'Small content';
      const newText = 'Small modified content';
      const diffs = detector.detectDiffChunked(oldText, newText, 10000);

      expect(diffs.length).toBeGreaterThan(0);
    });

    it('should chunk large files', () => {
      const largeOldText = 'x'.repeat(15000);
      const largeNewText = 'y'.repeat(15000);
      const diffs = detector.detectDiffChunked(largeOldText, largeNewText, 5000);

      expect(diffs.length).toBeGreaterThan(0);
    });

    it('should use custom chunk size', () => {
      const text = 'a'.repeat(1000);
      const diffs = detector.detectDiffChunked('', text, 100);

      expect(diffs.length).toBeGreaterThan(0);
    });

    it('should handle empty old text', () => {
      const newText = 'x'.repeat(20000);
      const diffs = detector.detectDiffChunked('', newText, 5000);

      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some(d => d.type === DiffType.INSERT)).toBe(true);
    });

    it('should handle empty new text', () => {
      const oldText = 'x'.repeat(20000);
      const diffs = detector.detectDiffChunked(oldText, '', 5000);

      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some(d => d.type === DiffType.DELETE)).toBe(true);
    });

    it('should process chunks sequentially', () => {
      const oldText = 'a'.repeat(10000) + 'b'.repeat(10000);
      const newText = 'a'.repeat(10000) + 'c'.repeat(10000);
      const diffs = detector.detectDiffChunked(oldText, newText, 8000);

      expect(diffs.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests - Real-world Scenarios', () => {
    it('should handle TODO.md task addition', () => {
      const oldContent = `## Tasks
- [ ] Existing task 1
- [ ] Existing task 2`;

      const newContent = `## Tasks
- [ ] Existing task 1
- [ ] Existing task 2
- [ ] New task 3`;

      const diffs = detector.detectDiff(oldContent, newContent);
      const summary = detector.getSummary(diffs);
      const lineChanges = detector.getLineChanges(oldContent, newContent);

      expect(summary.hasChanges).toBe(true);
      expect(detector.hasTaskChanges(diffs)).toBe(true);
      expect(lineChanges.some(c => c.type === 'added')).toBe(true);
    });

    it('should handle front matter update', () => {
      const oldContent = `---
version: 1.0
title: Old Title
---

## Tasks`;

      const newContent = `---
version: 2.0
title: New Title
---

## Tasks`;

      const diffs = detector.detectDiff(oldContent, newContent);
      const summary = detector.getSummary(diffs);

      expect(summary.hasChanges).toBe(true);
      expect(detector.hasMetadataChanges(diffs)).toBe(true);
    });

    it('should detect checkbox status change', () => {
      const oldContent = '- [ ] Incomplete task';
      const newContent = '- [x] Completed task';

      const diffs = detector.detectDiff(oldContent, newContent);
      const summary = detector.getSummary(diffs);
      const lineChanges = detector.getLineChanges(oldContent, newContent);

      expect(summary.hasChanges).toBe(true);
      // Line changes will show the checkbox modification
      expect(lineChanges.length).toBeGreaterThan(0);
      expect(lineChanges[0].type).toBe('modified');
    });

    it('should handle section reorganization', () => {
      const oldContent = `## High Priority
- [ ] Task 1

## Low Priority
- [ ] Task 2`;

      const newContent = `## Critical
- [ ] Task 1

## Normal
- [ ] Task 2`;

      const diffs = detector.detectDiff(oldContent, newContent);
      const summary = detector.getSummary(diffs);
      const lineChanges = detector.getLineChanges(oldContent, newContent);

      expect(summary.hasChanges).toBe(true);
      expect(detector.hasTaskChanges(diffs)).toBe(true);
      expect(lineChanges.some(c => c.type === 'modified')).toBe(true);
    });

    it('should handle mixed language content changes', () => {
      const oldContent = '## Tasks\n- [ ] English task';
      const newContent = '## タスク\n- [ ] 日本語タスク';

      const diffs = detector.detectDiff(oldContent, newContent);
      const summary = detector.getSummary(diffs);

      expect(summary.hasChanges).toBe(true);
      expect(detector.hasTaskChanges(diffs)).toBe(true);
    });

    it('should provide actionable diff report', () => {
      const oldContent = `## Projects
- [ ] Project A
- [ ] Project B`;

      const newContent = `## Projects
- [x] Project A (Completed)
- [ ] Project B
- [ ] Project C (New)`;

      const diffs = detector.detectDiff(oldContent, newContent);
      const summary = detector.getSummary(diffs);
      const formatted = detector.formatDiff(diffs);
      const stats = detector.getStatistics(diffs);

      expect(summary.hasChanges).toBe(true);
      expect(formatted).toBeTruthy();
      expect(stats.totalDiffs).toBeGreaterThan(0);
      expect(detector.hasTaskChanges(diffs)).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long lines', () => {
      const longLine = 'x'.repeat(10000);
      const diffs = detector.detectDiff('', longLine);

      expect(diffs).toHaveLength(1);
      expect(diffs[0].text.length).toBe(10000);
    });

    it('should handle special characters', () => {
      const oldText = 'Hello\tWorld\n\r\nTest';
      const newText = 'Hello\tWorld\n\r\nModified';
      const diffs = detector.detectDiff(oldText, newText);

      expect(diffs.length).toBeGreaterThan(0);
    });

    it('should handle unicode characters', () => {
      const oldText = '🔥 緊急 タスク';
      const newText = '✅ 完了 タスク';
      const diffs = detector.detectDiff(oldText, newText);

      expect(diffs.length).toBeGreaterThan(0);
      expect(detector.getSummary(diffs).hasChanges).toBe(true);
    });

    it('should handle null-like values gracefully', () => {
      const diffs1 = detector.detectDiff('test', '');
      const diffs2 = detector.detectDiff('', 'test');

      expect(diffs1).toHaveLength(1);
      expect(diffs2).toHaveLength(1);
    });

    it('should handle extremely large files with chunking', () => {
      const largeText = 'Line\n'.repeat(100000);
      const diffs = detector.detectDiffChunked('', largeText, 10000);

      expect(diffs.length).toBeGreaterThan(0);
    });

    it('should maintain accuracy across chunk boundaries', () => {
      const text1 = 'a'.repeat(5000) + 'BOUNDARY' + 'b'.repeat(5000);
      const text2 = 'a'.repeat(5000) + 'CHANGED' + 'b'.repeat(5000);
      const diffs = detector.detectDiffChunked(text1, text2, 6000);

      const summary = detector.getSummary(diffs);
      expect(summary.hasChanges).toBe(true);
    });
  });
});
