/**
 * UnifiedFormField関連のスタイル定義
 *
 * このファイルはUnifiedFormFieldコンポーネントで使用される
 * スタイル定義を一元管理します。
 */

/**
 * フォームフィールドの基本スタイル定義
 */
export const UNIFIED_FORM_STYLES = {
  /** コンテナスタイル - 下部マージンを設定 */
  container: {
    mb: 4,
  },
  /** 入力フィールドスタイル - 幅100%を設定 */
  input: {
    width: "100%",
  },
} as const;

/**
 * フォームフィールドタイプの定義
 * 各フィールドタイプに応じたスタイルのカスタマイズが必要な場合は
 * ここに追加定義します。
 */
export const FIELD_TYPE_STYLES = {
  text: {},
  email: {},
  password: {},
  number: {},
  date: {},
  datetime: {},
  time: {},
  textarea: {},
  select: {},
  file: {},
  checkbox: {},
  radio: {},
} as const;

/**
 * バリデーション状態に応じたスタイル
 */
export const VALIDATION_STYLES = {
  error: {
    borderColor: "danger.emphasis",
  },
  valid: {
    borderColor: "success.emphasis",
  },
} as const;
