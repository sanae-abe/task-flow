import diff from 'fast-diff';

/**
 * 差分の種類
 */
export enum DiffType {
  /** 変更なし */
  EQUAL = 0,
  /** 削除 */
  DELETE = -1,
  /** 追加 */
  INSERT = 1,
}

/**
 * 差分結果
 */
export interface DiffResult {
  /** 差分の種類 */
  type: DiffType;
  /** 変更されたテキスト */
  text: string;
}

/**
 * 変更サマリー
 */
export interface ChangeSummary {
  /** 変更があったか */
  hasChanges: boolean;
  /** 追加された行数 */
  addedLines: number;
  /** 削除された行数 */
  deletedLines: number;
  /** 変更された行数 */
  modifiedLines: number;
  /** 追加された文字数 */
  addedChars: number;
  /** 削除された文字数 */
  deletedChars: number;
  /** 変更の重大度（0-100） */
  changeSeverity: number;
}

/**
 * 行単位の変更情報
 */
export interface LineChange {
  /** 行番号（0-indexed） */
  lineNumber: number;
  /** 変更の種類 */
  type: 'added' | 'deleted' | 'modified';
  /** 古い内容（削除・変更の場合） */
  oldContent?: string;
  /** 新しい内容（追加・変更の場合） */
  newContent?: string;
}

/**
 * DiffDetector - TODO.md差分検出
 *
 * fast-diffを使用して効率的に差分を検出します。
 * 全体パースの代わりに増分更新を可能にし、パフォーマンスを大幅に向上させます。
 *
 * @example
 * ```typescript
 * const detector = new DiffDetector();
 * const diffs = detector.detectDiff(oldContent, newContent);
 * const summary = detector.getSummary(diffs);
 *
 * if (summary.hasChanges) {
 *   const changes = detector.getLineChanges(oldContent, newContent);
 *   // 変更された行のみを処理
 * }
 * ```
 */
export class DiffDetector {
  /**
   * 2つのテキスト間の差分を検出します
   *
   * @param oldText 古いテキスト
   * @param newText 新しいテキスト
   * @returns 差分結果の配列
   */
  detectDiff(oldText: string, newText: string): DiffResult[] {
    if (!oldText && !newText) {
      return [];
    }

    if (!oldText) {
      return [{ type: DiffType.INSERT, text: newText }];
    }

    if (!newText) {
      return [{ type: DiffType.DELETE, text: oldText }];
    }

    const diffs = diff(oldText, newText);

    return diffs.map(([type, text]) => ({
      type: type as DiffType,
      text,
    }));
  }

  /**
   * 差分から変更サマリーを生成します
   *
   * @param diffs 差分結果の配列
   * @returns 変更サマリー
   */
  getSummary(diffs: DiffResult[]): ChangeSummary {
    let addedChars = 0;
    let deletedChars = 0;
    let addedLines = 0;
    let deletedLines = 0;

    for (const diff of diffs) {
      const lines = diff.text.split('\n').length - 1;

      if (diff.type === DiffType.INSERT) {
        addedChars += diff.text.length;
        addedLines += lines;
      } else if (diff.type === DiffType.DELETE) {
        deletedChars += diff.text.length;
        deletedLines += lines;
      }
    }

    const totalChars = addedChars + deletedChars;
    const hasChanges = totalChars > 0;
    const modifiedLines = Math.min(addedLines, deletedLines);

    // 変更の重大度を計算（0-100）
    // 文字数ベースで計算し、100文字以上の変更で100%
    const changeSeverity = Math.min(100, Math.round((totalChars / 100) * 100));

    return {
      hasChanges,
      addedLines,
      deletedLines,
      modifiedLines,
      addedChars,
      deletedChars,
      changeSeverity,
    };
  }

  /**
   * 行単位の変更情報を取得します
   *
   * @param oldText 古いテキスト
   * @param newText 新しいテキスト
   * @returns 行単位の変更情報の配列
   */
  getLineChanges(oldText: string, newText: string): LineChange[] {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const changes: LineChange[] = [];

    const maxLength = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === undefined && newLine !== undefined) {
        // 新しい行が追加された
        changes.push({
          lineNumber: i,
          type: 'added',
          newContent: newLine,
        });
      } else if (oldLine !== undefined && newLine === undefined) {
        // 古い行が削除された
        changes.push({
          lineNumber: i,
          type: 'deleted',
          oldContent: oldLine,
        });
      } else if (oldLine !== newLine) {
        // 行が変更された
        changes.push({
          lineNumber: i,
          type: 'modified',
          oldContent: oldLine,
          newContent: newLine,
        });
      }
    }

    return changes;
  }

  /**
   * 特定のパターンにマッチする変更のみを抽出します
   *
   * @param diffs 差分結果の配列
   * @param pattern 検索パターン（正規表現）
   * @returns マッチした差分結果の配列
   */
  filterByPattern(diffs: DiffResult[], pattern: RegExp): DiffResult[] {
    return diffs.filter(diff => pattern.test(diff.text));
  }

  /**
   * 変更がタスク関連かどうかを判定します
   *
   * @param diffs 差分結果の配列
   * @returns タスク関連の変更がある場合はtrue
   */
  hasTaskChanges(diffs: DiffResult[]): boolean {
    const taskPatterns = [
      /^- \[[ x]\]/m, // チェックボックス
      /^\d+\./m, // 番号付きリスト
      /^#+ /m, // 見出し
    ];

    return diffs.some(diff =>
      taskPatterns.some(pattern => pattern.test(diff.text))
    );
  }

  /**
   * 変更がメタデータ関連かどうかを判定します
   *
   * @param diffs 差分結果の配列
   * @returns メタデータ関連の変更がある場合はtrue
   */
  hasMetadataChanges(diffs: DiffResult[]): boolean {
    const metadataPatterns = [
      /^---$/m, // Front matter区切り
      /^title:/m, // タイトル
      /^version:/m, // バージョン
      /^created:/m, // 作成日
      /^updated:/m, // 更新日
    ];

    return diffs.some(diff =>
      metadataPatterns.some(pattern => pattern.test(diff.text))
    );
  }

  /**
   * 差分を人間が読みやすい形式で出力します
   *
   * @param diffs 差分結果の配列
   * @param maxLength 最大表示文字数（デフォルト: 100）
   * @returns フォーマットされた文字列
   */
  formatDiff(diffs: DiffResult[], maxLength: number = 100): string {
    const lines: string[] = [];

    for (const diff of diffs) {
      const text =
        diff.text.length > maxLength
          ? diff.text.substring(0, maxLength) + '...'
          : diff.text;

      const prefix =
        diff.type === DiffType.INSERT
          ? '+ '
          : diff.type === DiffType.DELETE
            ? '- '
            : '  ';

      const formattedText = text.replace(/\n/g, '\\n');
      lines.push(`${prefix}${formattedText}`);
    }

    return lines.join('\n');
  }

  /**
   * 2つのファイル内容が同一かどうかを高速に判定します
   *
   * @param content1 ファイル内容1
   * @param content2 ファイル内容2
   * @returns 同一の場合はtrue
   */
  isIdentical(content1: string, content2: string): boolean {
    // 長さチェック（高速）
    if (content1.length !== content2.length) {
      return false;
    }

    // 厳密比較
    return content1 === content2;
  }

  /**
   * 変更が閾値を超えているかを判定します
   *
   * @param diffs 差分結果の配列
   * @param thresholdChars 文字数閾値（デフォルト: 1000）
   * @returns 閾値を超えている場合はtrue
   */
  exceedsThreshold(
    diffs: DiffResult[],
    thresholdChars: number = 1000
  ): boolean {
    const summary = this.getSummary(diffs);
    return summary.addedChars + summary.deletedChars > thresholdChars;
  }

  /**
   * 差分を統計情報として出力します
   *
   * @param diffs 差分結果の配列
   * @returns 統計情報オブジェクト
   */
  getStatistics(diffs: DiffResult[]): {
    totalDiffs: number;
    insertions: number;
    deletions: number;
    unchanged: number;
    summary: ChangeSummary;
  } {
    const insertions = diffs.filter(d => d.type === DiffType.INSERT).length;
    const deletions = diffs.filter(d => d.type === DiffType.DELETE).length;
    const unchanged = diffs.filter(d => d.type === DiffType.EQUAL).length;
    const summary = this.getSummary(diffs);

    return {
      totalDiffs: diffs.length,
      insertions,
      deletions,
      unchanged,
      summary,
    };
  }

  /**
   * 複数の変更をマージします
   *
   * @param diffsList 複数の差分結果配列
   * @returns マージされた差分結果
   */
  mergeDiffs(diffsList: DiffResult[][]): DiffResult[] {
    // 単純な連結（将来的にはより高度なマージロジックを実装）
    return diffsList.flat();
  }

  /**
   * チャンク単位で差分を検出します（大容量ファイル対応）
   *
   * @param oldText 古いテキスト
   * @param newText 新しいテキスト
   * @param chunkSize チャンクサイズ（文字数）
   * @returns 差分結果の配列
   */
  detectDiffChunked(
    oldText: string,
    newText: string,
    chunkSize: number = 10000
  ): DiffResult[] {
    // ファイルが小さい場合は通常の差分検出
    if (oldText.length < chunkSize && newText.length < chunkSize) {
      return this.detectDiff(oldText, newText);
    }

    // 大容量ファイルの場合はチャンク単位で処理
    const allDiffs: DiffResult[] = [];
    const maxLength = Math.max(oldText.length, newText.length);

    for (let i = 0; i < maxLength; i += chunkSize) {
      const oldChunk = oldText.substring(i, i + chunkSize);
      const newChunk = newText.substring(i, i + chunkSize);
      const chunkDiffs = this.detectDiff(oldChunk, newChunk);
      allDiffs.push(...chunkDiffs);
    }

    return allDiffs;
  }
}
