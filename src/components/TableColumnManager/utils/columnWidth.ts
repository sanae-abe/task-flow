/**
 * カラム幅のバリデーション結果
 */
export interface ColumnWidthValidationResult {
  isValid: boolean;
  formattedWidth: string;
}

/**
 * カラム幅の最小値（px）
 */
export const MIN_COLUMN_WIDTH = 50;

/**
 * カラム幅の最大値（px）
 */
export const MAX_COLUMN_WIDTH = 1000;

/**
 * カラム幅をバリデーションしてフォーマットする
 *
 * @description
 * - 空文字列はそのまま許可
 * - 数値のみまたは数値+px形式を受け入れる
 * - 50px〜1000pxの範囲内に収まるようにクランプ
 * - 最終的にpx形式で返す
 *
 * @param width - 入力された幅（例: "100", "150px", ""）
 * @returns バリデーション結果とフォーマット済みの幅
 *
 * @example
 * validateColumnWidth("100")     // => { isValid: true, formattedWidth: "100px" }
 * validateColumnWidth("150px")   // => { isValid: true, formattedWidth: "150px" }
 * validateColumnWidth("30")      // => { isValid: true, formattedWidth: "50px" } (クランプ)
 * validateColumnWidth("2000")    // => { isValid: true, formattedWidth: "1000px" } (クランプ)
 * validateColumnWidth("")        // => { isValid: true, formattedWidth: "" }
 */
export const validateColumnWidth = (
  width: string
): ColumnWidthValidationResult => {
  // 空文字列は許可
  if (width === '') {
    return {
      isValid: true,
      formattedWidth: '',
    };
  }

  // pxを削除して数値のみを取得
  const numericValue = parseInt(width.replace(/px$/, ''), 10);

  // 数値として有効でない場合
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      formattedWidth: width,
    };
  }

  // 範囲内にクランプ
  const clampedValue = Math.max(
    MIN_COLUMN_WIDTH,
    Math.min(MAX_COLUMN_WIDTH, numericValue)
  );

  return {
    isValid: true,
    formattedWidth: `${clampedValue}px`,
  };
};
