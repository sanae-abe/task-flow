import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MarkdownParser } from '../markdown-parser';
import type { MarkdownParseResult, ParsedTask } from '../../types';
import { Logger } from '../../utils/logger';

// Logger をモック化して実際のログ出力を抑制
vi.mock('../../utils/logger', () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    startTimer: vi.fn(() => ({
      done: vi.fn(),
    })),
  };

  return {
    Logger: {
      getInstance: vi.fn(() => mockLogger),
    },
  };
});

describe('MarkdownParser', () => {
  let parser: MarkdownParser;
  let mockLogger: any;

  beforeEach(() => {
    parser = new MarkdownParser();
    mockLogger = Logger.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('parse() - Front Matter Parsing', () => {
    it('should parse valid front matter with multiple fields', async () => {
      const content = `---
version: 1.2
title: "My TODO List"
author: Test User
enabled: true
count: 42
ratio: 3.14
---

# Tasks
- [ ] Sample task`;

      const result = await parser.parse(content);

      expect(result.frontMatter).toBeDefined();
      expect(result.frontMatter?.version).toBe(1.2);
      expect(result.frontMatter?.title).toBe('My TODO List');
      expect(result.frontMatter?.author).toBe('Test User');
      expect(result.frontMatter?.enabled).toBe(true);
      expect(result.frontMatter?.count).toBe(42);
      expect(result.frontMatter?.ratio).toBe(3.14);
    });

    it('should handle content without front matter', async () => {
      const content = `# Tasks
- [ ] Task without front matter`;

      const result = await parser.parse(content);

      expect(result.frontMatter).toBeUndefined();
      expect(result.sections.length).toBeGreaterThan(0);
    });

    it('should handle invalid front matter (unclosed delimiter)', async () => {
      const content = `---
version: 1.0
title: Unclosed

# Tasks
- [ ] Task`;

      const result = await parser.parse(content);

      expect(result.frontMatter).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Front matter delimiter not closed'
      );
    });

    it('should parse front matter with single quotes', async () => {
      const content = `---
title: 'Quoted Title'
description: 'Test description'
---

# Tasks`;

      const result = await parser.parse(content);

      expect(result.frontMatter?.title).toBe('Quoted Title');
      expect(result.frontMatter?.description).toBe('Test description');
    });

    it('should handle empty front matter', async () => {
      const content = `---
---

# Tasks
- [ ] Task`;

      const result = await parser.parse(content);

      expect(result.frontMatter).toBeDefined();
      expect(Object.keys(result.frontMatter!).length).toBe(0);
    });
  });

  describe('parse() - Section Parsing', () => {
    it('should parse single level sections', async () => {
      const content = `## 高優先度タスク
- [ ] Task 1

## 中優先度タスク
- [ ] Task 2`;

      const result = await parser.parse(content);

      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].name).toBe('高優先度タスク');
      expect(result.sections[0].level).toBe(2);
      expect(result.sections[1].name).toBe('中優先度タスク');
      expect(result.sections[1].level).toBe(2);
    });

    it('should parse nested sections with hierarchy', async () => {
      const content = `# Main Section

## Sub Section 1
- [ ] Task 1

### Deep Section
- [ ] Task 2

## Sub Section 2
- [ ] Task 3`;

      const result = await parser.parse(content);

      // Parser creates only root-level sections, children are nested in the first root
      expect(result.sections).toHaveLength(1); // Main Section
      expect(result.sections[0].name).toBe('Main Section');
      expect(result.sections[0].level).toBe(1);
      expect(result.sections[0].children).toHaveLength(2); // Sub Section 1 and Sub Section 2
      expect(result.sections[0].children![0].name).toBe('Sub Section 1');
      expect(result.sections[0].children![0].children).toHaveLength(1);
      expect(result.sections[0].children![0].children![0].name).toBe(
        'Deep Section'
      );
    });

    it('should handle sections with emoji and Japanese characters', async () => {
      const content = `## 🔥 緊急タスク
- [ ] 至急対応

## ✅ 完了済み
- [x] 完了タスク`;

      const result = await parser.parse(content);

      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].name).toContain('緊急タスク');
      expect(result.sections[1].name).toContain('完了済み');
    });

    it('should calculate correct section line ranges', async () => {
      const content = `## Section 1
Line 1
Line 2

## Section 2
Line 3`;

      const result = await parser.parse(content);

      expect(result.sections[0].startLine).toBe(0);
      expect(result.sections[0].endLine).toBe(3); // Includes empty line
      expect(result.sections[1].startLine).toBe(4);
    });
  });

  describe('parse() - Checkbox Parsing', () => {
    it('should parse checked and unchecked checkboxes', async () => {
      const content = `## Tasks
- [ ] Unchecked task
- [x] Checked task
- [X] Another checked task`;

      const result = await parser.parse(content);

      expect(result.checkboxes).toHaveLength(3);
      expect(result.checkboxes[0].checked).toBe(false);
      expect(result.checkboxes[0].text).toBe('Unchecked task');
      expect(result.checkboxes[1].checked).toBe(true);
      expect(result.checkboxes[2].checked).toBe(true);
    });

    it('should parse indented checkboxes (nested tasks)', async () => {
      const content = `## Tasks
- [ ] Parent task
  - [ ] Child task level 1
    - [ ] Child task level 2`;

      const result = await parser.parse(content);

      expect(result.checkboxes).toHaveLength(3);
      expect(result.checkboxes[0].indentLevel).toBe(0);
      expect(result.checkboxes[1].indentLevel).toBe(1);
      expect(result.checkboxes[2].indentLevel).toBe(2);
    });

    it('should associate checkboxes with their sections', async () => {
      const content = `## Work Tasks
- [ ] Work task 1

## Personal Tasks
- [ ] Personal task 1`;

      const result = await parser.parse(content);

      expect(result.checkboxes[0].section).toBe('Work Tasks');
      expect(result.checkboxes[1].section).toBe('Personal Tasks');
    });

    it('should track line numbers correctly', async () => {
      const content = `# Header

## Section
- [ ] Task on line 3
- [ ] Task on line 4`;

      const result = await parser.parse(content);

      expect(result.checkboxes[0].lineNumber).toBe(3);
      expect(result.checkboxes[1].lineNumber).toBe(4);
    });
  });

  describe('parse() - Metadata Extraction', () => {
    it('should extract due date in English format', async () => {
      const content = `## Tasks
- [ ] Task with due date due: 2025-12-31`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasks(result);

      expect(tasks[0].metadata?.dueDate).toBe('2025-12-31');
    });

    it('should extract due date in Japanese format', async () => {
      const content = `## タスク
- [ ] 期限付きタスク 期限: 2025-11-20`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasks(result);

      expect(tasks[0].metadata?.dueDate).toBe('2025-11-20');
    });

    it('should extract priority in English (low/medium/high)', async () => {
      const content = `## Tasks
- [ ] Low priority task priority: low
- [ ] Medium priority task priority: medium
- [ ] High priority task priority: high`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasks(result);

      expect(tasks[0].metadata?.priority).toBe('low');
      expect(tasks[1].metadata?.priority).toBe('medium');
      expect(tasks[2].metadata?.priority).toBe('high');
    });

    it('should extract priority in Japanese (低/中/高)', async () => {
      const content = `## タスク
- [ ] 低優先度 優先度: 低
- [ ] 中優先度 優先度: 中
- [ ] 高優先度 優先度: 高`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasks(result);

      expect(tasks[0].metadata?.priority).toBe('low');
      expect(tasks[1].metadata?.priority).toBe('medium');
      expect(tasks[2].metadata?.priority).toBe('high');
    });

    it('should extract tags with English characters', async () => {
      const content = `## Tasks
- [ ] Task with tags #backend #api #urgent`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasks(result);

      expect(tasks[0].metadata?.tags).toContain('backend');
      expect(tasks[0].metadata?.tags).toContain('api');
      expect(tasks[0].metadata?.tags).toContain('urgent');
    });

    it('should extract tags with Japanese characters', async () => {
      const content = `## タスク
- [ ] タグ付きタスク #開発 #バグ修正 #緊急`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasks(result);

      expect(tasks[0].metadata?.tags).toContain('開発');
      expect(tasks[0].metadata?.tags).toContain('バグ修正');
      expect(tasks[0].metadata?.tags).toContain('緊急');
    });

    it('should extract multiple metadata fields simultaneously', async () => {
      const content = `## Tasks
- [ ] Complex task due: 2025-12-15 priority: high #backend #api`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasks(result);

      expect(tasks[0].metadata?.dueDate).toBe('2025-12-15');
      expect(tasks[0].metadata?.priority).toBe('high');
      expect(tasks[0].metadata?.tags).toContain('backend');
      expect(tasks[0].metadata?.tags).toContain('api');
    });
  });

  describe('extractTasks() - Title Cleaning', () => {
    it('should remove metadata from title', async () => {
      const content = `## Tasks
- [ ] Clean task title due: 2025-12-31 priority: high #tag1`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasks(result);

      expect(tasks[0].title).toBe('Clean task title');
      expect(tasks[0].title).not.toContain('due:');
      expect(tasks[0].title).not.toContain('priority:');
      expect(tasks[0].title).not.toContain('#tag1');
    });

    it('should handle title with only text (no metadata)', async () => {
      const content = `## Tasks
- [ ] Simple task without metadata`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasks(result);

      expect(tasks[0].title).toBe('Simple task without metadata');
    });

    it('should clean multiple spaces from title', async () => {
      const content = `## Tasks
- [ ] Task   with    extra     spaces`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasks(result);

      expect(tasks[0].title).toBe('Task with extra spaces');
    });
  });

  describe('extractTasksBySection()', () => {
    it('should extract tasks only from specified section', async () => {
      const content = `## Work Tasks
- [ ] Work task 1
- [ ] Work task 2

## Personal Tasks
- [ ] Personal task 1`;

      const result = await parser.parse(content);
      const workTasks = parser.extractTasksBySection(result, 'Work Tasks');

      expect(workTasks).toHaveLength(2);
      expect(workTasks[0].section).toBe('Work Tasks');
      expect(workTasks[1].section).toBe('Work Tasks');
    });

    it('should return empty array for non-existent section', async () => {
      const content = `## Existing Section
- [ ] Task`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasksBySection(
        result,
        'Non-existent Section'
      );

      expect(tasks).toHaveLength(0);
    });
  });

  describe('validate() - Content Validation', () => {
    it('should validate valid content successfully', () => {
      const content = `# TODO List
## Tasks
- [ ] Valid task`;

      const validation = parser.validate(content);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject empty content', () => {
      const validation = parser.validate('');

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Content is empty');
    });

    it('should reject non-string content', () => {
      const validation = parser.validate(null as any);

      expect(validation.valid).toBe(false);
      // The parser treats null as empty content
      expect(validation.errors).toContain('Content is empty');
    });

    it('should warn about unclosed front matter', () => {
      const content = `---
title: Test
# Missing closing delimiter

## Tasks`;

      const validation = parser.validate(content);

      expect(validation.warnings).toContain(
        'Front matter delimiter not closed'
      );
    });

    it('should warn about heading level skips', () => {
      const content = `# Level 1
### Level 3 (skipped level 2)`;

      const validation = parser.validate(content);

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('Heading level skip detected');
    });

    it('should reject content exceeding file size limit', () => {
      const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
      process.env.TODO_MAX_FILE_SIZE_MB = '5';

      const validation = parser.validate(largeContent);

      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain('File size exceeds');

      delete process.env.TODO_MAX_FILE_SIZE_MB;
    });

    it('should reject content exceeding task count limit', () => {
      const tasks = Array.from(
        { length: 15000 },
        (_, i) => `- [ ] Task ${i}`
      ).join('\n');
      process.env.TODO_MAX_TASKS = '10000';

      const validation = parser.validate(tasks);

      expect(validation.valid).toBe(false);
      expect(validation.errors[0]).toContain('Task count');
      expect(validation.errors[0]).toContain('exceeds limit');

      delete process.env.TODO_MAX_TASKS;
    });
  });

  describe('parse() - Error Handling', () => {
    it('should handle empty content gracefully', async () => {
      const result = await parser.parse('');

      expect(result.sections).toHaveLength(0);
      expect(result.checkboxes).toHaveLength(0);
      expect(result.lineCount).toBe(0);
      expect(result.charCount).toBe(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid content provided to parser'
      );
    });

    it('should handle null content gracefully', async () => {
      const result = await parser.parse(null as any);

      expect(result.sections).toHaveLength(0);
      expect(result.checkboxes).toHaveLength(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid content provided to parser'
      );
    });

    it('should handle malformed markdown gracefully', async () => {
      const content = `## Section with no closing
- [ Malformed checkbox
- [] Another malformed
Normal text without formatting`;

      const result = await parser.parse(content);

      expect(result.sections).toHaveLength(1);
      expect(result.checkboxes).toHaveLength(0); // Malformed checkboxes should be ignored
    });
  });

  describe('parse() - Real-world Examples', () => {
    it('should parse comprehensive Japanese TODO.md', async () => {
      const content = `---
version: 1.2
title: "プロジェクトタスク管理"
author: "開発チーム"
---

# プロジェクトタスク

## 🔥 緊急対応
- [ ] 本番障害の修正 due: 2025-11-10 priority: high #緊急 #バグ
- [x] セキュリティパッチ適用 priority: high #セキュリティ

## 📋 開発タスク
- [ ] 新機能実装 due: 2025-11-30 priority: medium #開発
  - [ ] 設計レビュー priority: medium
  - [ ] コーディング
  - [ ] テスト作成

## ✅ 完了済み
- [x] リファクタリング priority: low #保守`;

      const result = await parser.parse(content);

      expect(result.frontMatter?.version).toBe(1.2);
      expect(result.frontMatter?.title).toBe('プロジェクトタスク管理');
      // Parser creates nested structure: プロジェクトタスク is root with 3 children
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].children).toHaveLength(3);
      expect(result.checkboxes.length).toBeGreaterThan(0);

      const tasks = parser.extractTasks(result);
      expect(tasks.length).toBeGreaterThan(5);
      expect(tasks[0].metadata?.priority).toBe('high');
      expect(tasks[0].metadata?.tags).toContain('緊急');
    });

    it('should parse comprehensive English TODO.md', async () => {
      const content = `---
version: 1.0
title: "Project Management"
---

# Project Tasks

## High Priority
- [ ] Fix critical bug due: 2025-11-15 priority: high #bug #urgent
- [ ] Deploy to production deadline: 2025-11-20 priority: high

## Development
- [ ] Implement new feature priority: medium #feature
  - [ ] Write unit tests
  - [ ] Update documentation

## Completed
- [x] Code review priority: low`;

      const result = await parser.parse(content);

      expect(result.frontMatter?.version).toBe(1.0);
      // Parser creates nested structure: Project Tasks is root with 3 children
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].children).toHaveLength(3);
      expect(result.checkboxes.length).toBeGreaterThan(0);

      const tasks = parser.extractTasks(result);
      const highPriorityTasks = parser.extractTasksBySection(
        result,
        'High Priority'
      );
      expect(highPriorityTasks).toHaveLength(2);
    });
  });

  describe('parse() - Performance and Statistics', () => {
    it('should track line count and character count', async () => {
      const content = `# Header
## Section
- [ ] Task 1
- [ ] Task 2`;

      const result = await parser.parse(content);

      expect(result.lineCount).toBe(4);
      expect(result.charCount).toBe(content.length);
    });

    it('should log performance metrics', async () => {
      const content = `## Tasks
- [ ] Task 1
- [ ] Task 2`;

      await parser.parse(content);

      expect(mockLogger.startTimer).toHaveBeenCalledWith('markdown-parse');
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          sections: expect.any(Number),
          checkboxes: expect.any(Number),
          frontMatter: expect.any(Boolean),
        }),
        'Markdown parsing completed'
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: parse -> extract -> filter by section', async () => {
      const content = `## Work
- [ ] Work task 1 priority: high
- [ ] Work task 2 priority: low

## Personal
- [ ] Personal task priority: medium`;

      const result = await parser.parse(content);
      const allTasks = parser.extractTasks(result);
      const workTasks = parser.extractTasksBySection(result, 'Work');

      expect(allTasks).toHaveLength(3);
      expect(workTasks).toHaveLength(2);
      expect(workTasks[0].metadata?.priority).toBe('high');
      expect(workTasks[1].metadata?.priority).toBe('low');
    });

    it('should handle mixed English and Japanese content', async () => {
      const content = `## Tasks タスク
- [ ] English task priority: high #english
- [ ] 日本語タスク 優先度: 高 #日本語`;

      const result = await parser.parse(content);
      const tasks = parser.extractTasks(result);

      expect(tasks).toHaveLength(2);
      expect(tasks[0].metadata?.priority).toBe('high');
      expect(tasks[1].metadata?.priority).toBe('high');
      expect(tasks[0].metadata?.tags).toContain('english');
      expect(tasks[1].metadata?.tags).toContain('日本語');
    });
  });
});
