/**
 * Markdownセクション
 */
export interface MarkdownSection {
    /** セクション名（見出しテキスト） */
    name: string;
    /** 見出しレベル（1-6） */
    level: number;
    /** セクションの開始行（0-indexed） */
    startLine: number;
    /** セクションの終了行（0-indexed） */
    endLine: number;
    /** セクションの内容（生のMarkdown） */
    content: string;
    /** 子セクション */
    children?: MarkdownSection[];
}
/**
 * Markdownチェックボックスアイテム
 */
export interface MarkdownCheckbox {
    /** チェック状態 */
    checked: boolean;
    /** テキスト内容 */
    text: string;
    /** 行番号（0-indexed） */
    lineNumber: number;
    /** インデントレベル */
    indentLevel: number;
    /** 親セクション */
    section?: string;
}
/**
 * Markdownパース結果
 */
export interface MarkdownParseResult {
    /** Front matter（YAML形式のメタデータ） */
    frontMatter?: Record<string, any>;
    /** セクション配列 */
    sections: MarkdownSection[];
    /** チェックボックスアイテム配列 */
    checkboxes: MarkdownCheckbox[];
    /** 生のMarkdownテキスト */
    rawContent: string;
    /** 行数 */
    lineCount: number;
    /** 文字数 */
    charCount: number;
}
/**
 * Markdownシリアライズオプション
 */
export interface MarkdownSerializeOptions {
    /** Front matterを含めるか */
    includeFrontMatter?: boolean;
    /** インデント文字（デフォルト: '  '） */
    indent?: string;
    /** セクション間の空行数（デフォルト: 1） */
    sectionSpacing?: number;
    /** チェックボックスのフォーマット */
    checkboxFormat?: {
        checked: string;
        unchecked: string;
    };
    /** 日付フォーマット（ISO 8601 | custom） */
    dateFormat?: 'iso' | 'custom';
    /** カスタム日付フォーマット文字列 */
    customDateFormat?: string;
}
/**
 * Markdown変換コンテキスト
 */
export interface MarkdownConversionContext {
    /** 現在のセクション名 */
    currentSection?: string;
    /** 現在のインデントレベル */
    currentIndentLevel: number;
    /** 変換統計 */
    stats: {
        totalTasks: number;
        convertedTasks: number;
        skippedTasks: number;
        errors: number;
    };
    /** エラーメッセージ */
    errors: Array<{
        line: number;
        message: string;
    }>;
}
/**
 * Markdownバリデーション結果
 */
export interface MarkdownValidationResult {
    /** バリデーション成功フラグ */
    valid: boolean;
    /** エラー */
    errors: Array<{
        line: number;
        column?: number;
        message: string;
        severity: 'error' | 'warning';
    }>;
    /** 構造の問題 */
    structureIssues?: {
        /** 閉じられていない見出し */
        unclosedSections?: string[];
        /** 不正なインデント */
        invalidIndents?: number[];
        /** 重複セクション */
        duplicateSections?: string[];
    };
}
//# sourceMappingURL=markdown.d.ts.map