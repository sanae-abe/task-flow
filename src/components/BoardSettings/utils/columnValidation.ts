import type { DefaultColumnConfig } from '../../../types/settings';

/**
 * カラム名を正規化する関数
 *
 * @description
 * 大文字小文字、全角半角、前後空白を正規化して比較用の文字列を生成
 *
 * @param name - カラム名
 * @returns 正規化されたカラム名
 */
export const normalizeColumnName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[\uff01-\uff5e]/g, ch =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    );

/**
 * カラム名の重複チェック
 *
 * @param columnName - チェックするカラム名
 * @param existingColumns - 既存のカラム配列
 * @param excludeColumnId - 除外するカラムID（編集時に自分自身を除外）
 * @returns 重複している場合true
 */
export const isDuplicateColumnName = (
  columnName: string,
  existingColumns: DefaultColumnConfig[],
  excludeColumnId?: string
): boolean => {
  const normalizedNewName = normalizeColumnName(columnName);

  return existingColumns.some(col => {
    if (excludeColumnId && col.id === excludeColumnId) {
      return false; // 自分自身は除外
    }
    const normalizedExisting = normalizeColumnName(col.name);
    return normalizedExisting === normalizedNewName;
  });
};

/**
 * カラム名のバリデーション結果
 */
export interface ColumnNameValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * カラム名のバリデーション
 *
 * @param columnName - バリデーションするカラム名
 * @param existingColumns - 既存のカラム配列
 * @param excludeColumnId - 除外するカラムID（編集時に自分自身を除外）
 * @returns バリデーション結果
 */
export const validateColumnName = (
  columnName: string,
  existingColumns: DefaultColumnConfig[],
  excludeColumnId?: string
): ColumnNameValidationResult => {
  const trimmedName = columnName.trim();

  if (!trimmedName) {
    return {
      isValid: false,
      error: 'カラム名を入力してください',
    };
  }

  if (isDuplicateColumnName(trimmedName, existingColumns, excludeColumnId)) {
    return {
      isValid: false,
      error: '同じ名前のカラムが既に存在します',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};
