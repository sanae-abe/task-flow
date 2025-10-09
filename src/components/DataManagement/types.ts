/**
 * データ管理機能の型定義
 */

export type ImportMode = 'merge' | 'replace';

export type DataStatisticsVariant = 'primary' | 'success';

export interface DataStatistics {
  /** ボード総数 */
  boardCount: number;
  /** タスク総数 */
  taskCount: number;
  /** ラベル総数 */
  labelCount: number;
  /** 添付ファイル総数 */
  attachmentCount: number;
  /** 推定データサイズ（バイト） */
  estimatedSize: number;
}

export interface ExportOptions {
  /** エクスポート種別 */
  type: 'all' | 'current';
  /** エクスポート実行コールバック */
  onExport: () => void;
}

export interface ImportState {
  /** ローディング状態 */
  isLoading: boolean;
  /** 選択されたファイル */
  selectedFile: File | null;
  /** インポートモード */
  mode: ImportMode;
  /** メッセージ */
  message: {
    type: 'success' | 'error';
    text: string;
  } | null;
}
