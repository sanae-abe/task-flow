// 設定関連の型定義
export interface DefaultColumnConfig {
  id: string;
  name: string;
}

export interface AutoDeletionSettings {
  enabled: boolean;
  retentionDays: number; // 完了後何日で削除するか
  notifyBeforeDeletion: boolean; // 削除前に通知するか
  notificationDays: number; // 削除何日前に通知するか
  excludeLabelIds: string[]; // 削除対象外とするラベルID
  excludePriorities: string[]; // 削除対象外とする優先度
  autoExportBeforeDeletion: boolean; // 削除前に自動エクスポートするか
  enableSoftDeletion: boolean; // ソフトデリート機能を有効にするか
  softDeletionRetentionDays: number; // ソフトデリート後の保持日数
}

/**
 * シンプルなゴミ箱設定
 * 複雑なAutoDeleteionSettingsを置き換える新しい設計
 */
export interface RecycleBinSettings {
  retentionDays: number | null; // ゴミ箱の保持期間（null = 無制限、数値 = 日数）
}

/**
 * デフォルトのゴミ箱設定
 */
export const DEFAULT_RECYCLE_BIN_SETTINGS: RecycleBinSettings = {
  retentionDays: 30, // 30日間ゴミ箱に保持
};

export interface AppSettings {
  defaultColumns: DefaultColumnConfig[];
  autoDeletion: AutoDeletionSettings;
}

// デフォルト設定
export const DEFAULT_SETTINGS: AppSettings = {
  defaultColumns: [
    { id: "todo", name: "To Do" },
    { id: "inprogress", name: "In Progress" },
    { id: "done", name: "Done" },
  ],
  autoDeletion: {
    enabled: false, // デフォルトはオフ（オプトイン）
    retentionDays: 30, // 30日
    notifyBeforeDeletion: true, // 通知は有効
    notificationDays: 7, // 7日前に通知
    excludeLabelIds: [], // 初期状態では除外なし
    excludePriorities: ["critical"], // 緊急タスクは自動除外
    autoExportBeforeDeletion: true, // 安全のため自動エクスポート
    enableSoftDeletion: true, // ソフトデリート有効
    softDeletionRetentionDays: 7, // 7日間の猶予
  },
};
