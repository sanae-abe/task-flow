import type {
  MarkdownSection,
  MarkdownCheckbox,
  MarkdownParseResult,
  ParsedTask,
} from '../types';
import { Logger } from '../utils/logger';
import { MarkdownSanitizer } from '../security/sanitizer';

const logger = Logger.getInstance();
const sanitizer = new MarkdownSanitizer();

/**
 * MarkdownParser - TODO.mdパーサー
 *
 * TODO.mdファイルをパースして、タスク情報を抽出します。
 * Front matter、セクション、チェックボックスを解析します。
 *
 * @example
 * ```typescript
 * const parser = new MarkdownParser();
 * const result = await parser.parse(markdownContent);
 *
 * console.log(result.frontMatter);  // { version: 1.2, title: "TODO" }
 * console.log(result.sections);     // [{ name: "高優先", level: 2, ... }]
 * console.log(result.checkboxes);   // [{ checked: false, text: "タスク1", ... }]
 * ```
 */
export class MarkdownParser {
  private readonly FRONT_MATTER_DELIMITER = '---';
  private readonly HEADING_PATTERN = /^(#{1,6})\s+(.+)$/;
  private readonly CHECKBOX_PATTERN = /^(\s*)-\s+\[([x\s])\]\s+(.+)$/i;
  private readonly DUE_DATE_PATTERN =
    /(?:due:|期限:|deadline:)\s*(\d{4}-\d{2}-\d{2})/i;
  private readonly PRIORITY_PATTERN =
    /(?:priority:|優先度:)\s*(low|medium|high|低|中|高)/i;
  private readonly TAG_PATTERN =
    /#([a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+)/g;

  /**
   * Markdownコンテンツをパースします
   *
   * @param content Markdownコンテンツ
   * @returns パース結果
   */
  async parse(content: string): Promise<MarkdownParseResult> {
    const timer = logger.startTimer('markdown-parse');

    try {
      if (!content || typeof content !== 'string') {
        logger.warn('Invalid content provided to parser');
        return this.emptyResult();
      }

      const lines = content.split('\n');
      const lineCount = lines.length;
      const charCount = content.length;

      logger.debug({ lineCount, charCount }, 'Parsing markdown content');

      // Front matter抽出
      const { frontMatter, contentStartLine } = this.parseFrontMatter(lines);

      // セクションとチェックボックスを抽出
      const sections = this.parseSections(lines, contentStartLine);
      const checkboxes = this.parseCheckboxes(lines, contentStartLine);

      const result: MarkdownParseResult = {
        frontMatter,
        sections,
        checkboxes,
        rawContent: content,
        lineCount,
        charCount,
      };

      timer.done({
        itemsProcessed: checkboxes.length,
        operation: 'markdown-parse',
      });

      logger.info(
        {
          sections: sections.length,
          checkboxes: checkboxes.length,
          frontMatter: !!frontMatter,
        },
        'Markdown parsing completed'
      );

      return result;
    } catch (error) {
      logger.error({ err: error }, 'Failed to parse markdown');
      throw error;
    }
  }

  /**
   * Front matterをパースします
   *
   * @param lines 行の配列
   * @returns Front matterとコンテンツ開始行
   */
  private parseFrontMatter(lines: string[]): {
    frontMatter?: Record<string, any>;
    contentStartLine: number;
  } {
    if (lines.length < 3) {
      return { contentStartLine: 0 };
    }

    // 最初の行が---で始まるかチェック
    if (lines[0].trim() !== this.FRONT_MATTER_DELIMITER) {
      return { contentStartLine: 0 };
    }

    // 2番目の---を探す
    let endLine = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === this.FRONT_MATTER_DELIMITER) {
        endLine = i;
        break;
      }
    }

    if (endLine === -1) {
      logger.warn('Front matter delimiter not closed');
      return { contentStartLine: 0 };
    }

    // YAMLパース（簡易実装）
    const frontMatter: Record<string, any> = {};
    for (let i = 1; i < endLine; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      // 型推論（数値、真偽値、文字列）
      if (value === 'true') {
        frontMatter[key] = true;
      } else if (value === 'false') {
        frontMatter[key] = false;
      } else if (/^\d+$/.test(value)) {
        frontMatter[key] = parseInt(value, 10);
      } else if (/^\d+\.\d+$/.test(value)) {
        frontMatter[key] = parseFloat(value);
      } else {
        // クォートを除去
        frontMatter[key] = value.replace(/^["']|["']$/g, '');
      }
    }

    return {
      frontMatter,
      contentStartLine: endLine + 1,
    };
  }

  /**
   * セクション（見出し）をパースします
   *
   * @param lines 行の配列
   * @param startLine 開始行
   * @returns セクションの配列
   */
  private parseSections(lines: string[], startLine: number): MarkdownSection[] {
    const sections: MarkdownSection[] = [];
    const sectionStack: Array<{ section: MarkdownSection; level: number }> = [];

    // ワンパス最適化: 見出し位置を事前収集（O(n)）
    const headingIndices: Array<{ index: number; level: number }> = [];
    for (let i = startLine; i < lines.length; i++) {
      const match = lines[i].match(this.HEADING_PATTERN);
      if (match) {
        headingIndices.push({ index: i, level: match[1].length });
      }
    }

    // 各セクションを処理（O(n)）
    for (let hi = 0; hi < headingIndices.length; hi++) {
      const i = headingIndices[hi].index;
      const line = lines[i];
      const match = line.match(this.HEADING_PATTERN)!;

      const level = match[1].length;
      const name = sanitizer.sanitizeSection(match[2]);

      // 終了行を計算（次の同レベル以上の見出しまで）
      let endLine = lines.length - 1;
      if (hi + 1 < headingIndices.length) {
        const nextHeading = headingIndices[hi + 1];
        if (nextHeading.level <= level) {
          endLine = nextHeading.index - 1;
        } else {
          // 次が子セクション: 次の同レベル以上を探す
          for (let hj = hi + 2; hj < headingIndices.length; hj++) {
            if (headingIndices[hj].level <= level) {
              endLine = headingIndices[hj].index - 1;
              break;
            }
          }
        }
      }

      // セクションの内容を抽出
      const content = lines.slice(i, endLine + 1).join('\n');

      const section: MarkdownSection = {
        name,
        level,
        startLine: i,
        endLine,
        content,
        children: [],
      };

      // 階層構造を構築
      while (sectionStack.length > 0) {
        const parent = sectionStack[sectionStack.length - 1];
        if (parent.level < level) {
          // 子セクションとして追加
          parent.section.children!.push(section);
          break;
        } else {
          // 同じレベルまたは上位レベルなのでスタックから削除
          sectionStack.pop();
        }
      }

      if (sectionStack.length === 0) {
        // ルートレベルのセクション
        sections.push(section);
      }

      sectionStack.push({ section, level });
    }

    logger.debug({ sections: sections.length }, 'Parsed sections');
    return sections;
  }

  /**
   * チェックボックスをパースします
   *
   * @param lines 行の配列
   * @param startLine 開始行
   * @returns チェックボックスの配列
   */
  private parseCheckboxes(
    lines: string[],
    startLine: number
  ): MarkdownCheckbox[] {
    const checkboxes: MarkdownCheckbox[] = [];
    let currentSection = '';

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];

      // 現在のセクションを追跡
      const headingMatch = line.match(this.HEADING_PATTERN);
      if (headingMatch) {
        currentSection = sanitizer.sanitizeSection(headingMatch[2]);
        continue;
      }

      // チェックボックスをマッチ
      const checkboxMatch = line.match(this.CHECKBOX_PATTERN);
      if (!checkboxMatch) continue;

      const indent = checkboxMatch[1];
      const checked = checkboxMatch[2].toLowerCase() === 'x';
      const text = sanitizer.sanitizeTitle(checkboxMatch[3]);

      const checkbox: MarkdownCheckbox = {
        checked,
        text,
        lineNumber: i,
        indentLevel: Math.floor(indent.length / 2), // 2スペース = 1レベル
        section: currentSection || undefined,
      };

      checkboxes.push(checkbox);
    }

    logger.debug({ checkboxes: checkboxes.length }, 'Parsed checkboxes');
    return checkboxes;
  }

  /**
   * チェックボックスをParsedTaskに変換します
   *
   * @param checkbox チェックボックス
   * @returns ParsedTask
   */
  private checkboxToTask(checkbox: MarkdownCheckbox): ParsedTask {
    const metadata = this.extractMetadata(checkbox.text);

    return {
      title: this.cleanTitle(checkbox.text),
      checked: checkbox.checked,
      lineNumber: checkbox.lineNumber,
      section: checkbox.section || '',
      indentLevel: checkbox.indentLevel,
      rawText: checkbox.text,
      metadata,
    };
  }

  /**
   * タイトルからメタデータを抽出します
   *
   * @param text タイトルテキスト
   * @returns メタデータ
   */
  private extractMetadata(text: string): ParsedTask['metadata'] {
    const metadata: ParsedTask['metadata'] = {};

    // 期限日を抽出
    const dueDateMatch = text.match(this.DUE_DATE_PATTERN);
    if (dueDateMatch) {
      metadata.dueDate = dueDateMatch[1];
    }

    // 優先度を抽出
    const priorityMatch = text.match(this.PRIORITY_PATTERN);
    if (priorityMatch) {
      const priority = priorityMatch[1].toLowerCase();
      if (priority === 'low' || priority === '低') {
        metadata.priority = 'low';
      } else if (priority === 'medium' || priority === '中') {
        metadata.priority = 'medium';
      } else if (priority === 'high' || priority === '高') {
        metadata.priority = 'high';
      }
    }

    // タグを抽出
    const tags: string[] = [];
    let match;
    while ((match = this.TAG_PATTERN.exec(text)) !== null) {
      tags.push(match[1]);
    }
    if (tags.length > 0) {
      metadata.tags = tags;
    }

    return metadata;
  }

  /**
   * タイトルからメタデータ情報を除去します
   *
   * @param text タイトルテキスト
   * @returns クリーンなタイトル
   */
  private cleanTitle(text: string): string {
    let cleaned = text;

    // 期限日を除去
    cleaned = cleaned.replace(this.DUE_DATE_PATTERN, '');

    // 優先度を除去
    cleaned = cleaned.replace(this.PRIORITY_PATTERN, '');

    // タグを除去
    cleaned = cleaned.replace(this.TAG_PATTERN, '');

    // 余分な空白を除去
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  /**
   * パース結果からタスクを抽出します
   *
   * @param result パース結果
   * @returns ParsedTaskの配列
   */
  extractTasks(result: MarkdownParseResult): ParsedTask[] {
    return result.checkboxes.map(checkbox => this.checkboxToTask(checkbox));
  }

  /**
   * 特定のセクションのタスクのみを抽出します
   *
   * @param result パース結果
   * @param sectionName セクション名
   * @returns ParsedTaskの配列
   */
  extractTasksBySection(
    result: MarkdownParseResult,
    sectionName: string
  ): ParsedTask[] {
    const checkboxes = result.checkboxes.filter(
      cb => cb.section === sectionName
    );
    return checkboxes.map(checkbox => this.checkboxToTask(checkbox));
  }

  /**
   * 空のパース結果を返します
   *
   * @returns 空のMarkdownParseResult
   */
  private emptyResult(): MarkdownParseResult {
    return {
      sections: [],
      checkboxes: [],
      rawContent: '',
      lineCount: 0,
      charCount: 0,
    };
  }

  /**
   * Markdownコンテンツを検証します
   *
   * @param content Markdownコンテンツ
   * @returns 検証結果
   */
  validate(content: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content) {
      errors.push('Content is empty');
      return { valid: false, errors, warnings };
    }

    if (typeof content !== 'string') {
      errors.push('Content must be a string');
      return { valid: false, errors, warnings };
    }

    const lines = content.split('\n');

    // サイズチェック
    const maxSize =
      parseInt(process.env.TODO_MAX_FILE_SIZE_MB || '5', 10) * 1024 * 1024;
    if (content.length > maxSize) {
      errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    // タスク数チェック
    const checkboxCount = lines.filter(line =>
      this.CHECKBOX_PATTERN.test(line)
    ).length;

    const maxTasks = parseInt(process.env.TODO_MAX_TASKS || '10000', 10);
    if (checkboxCount > maxTasks) {
      errors.push(`Task count (${checkboxCount}) exceeds limit (${maxTasks})`);
    }

    // Front matter検証
    if (lines[0].trim() === this.FRONT_MATTER_DELIMITER) {
      const endLine = lines
        .slice(1)
        .findIndex(line => line.trim() === this.FRONT_MATTER_DELIMITER);
      if (endLine === -1) {
        warnings.push('Front matter delimiter not closed');
      }
    }

    // セクション構造検証
    const headingLevels: number[] = [];
    for (const line of lines) {
      const match = line.match(this.HEADING_PATTERN);
      if (match) {
        const level = match[1].length;
        headingLevels.push(level);

        // レベルスキップの検出
        if (headingLevels.length > 1) {
          const prevLevel = headingLevels[headingLevels.length - 2];
          if (level > prevLevel + 1) {
            warnings.push(
              `Heading level skip detected: ${prevLevel} to ${level}`
            );
          }
        }
      }
    }

    const valid = errors.length === 0;
    return { valid, errors, warnings };
  }
}
