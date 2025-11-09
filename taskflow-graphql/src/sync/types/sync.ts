import type { Task, TaskUpdateInput } from './task';

/**
 * 同期方向
 */
export type SyncDirection = 'file_to_app' | 'app_to_file' | 'bidirectional';

/**
 * 同期戦略
 */
export type SyncStrategy =
  | 'last_write_wins'
  | 'three_way_merge'
  | 'manual_resolution';

/**
 * 競合解決ポリシー
 */
export type ConflictResolutionPolicy =
  | 'prefer_file'
  | 'prefer_app'
  | 'manual'
  | 'merge';

/**
 * 同期設定
 */
export interface SyncConfig {
  /** TODO.mdのパス */
  todoPath: string;

  /** 同期方向 */
  direction: SyncDirection;

  /** 同期戦略 */
  strategy: SyncStrategy;

  /** 競合解決ポリシー */
  conflictResolution: ConflictResolutionPolicy;

  /** デバウンス時間（ミリ秒） */
  debounceMs: number;

  /** スロットル時間（ミリ秒） */
  throttleMs: number;

  /** 最大ファイルサイズ（MB） */
  maxFileSizeMB: number;

  /** 最大タスク数 */
  maxTasks: number;

  /** Webhook有効化フラグ */
  webhooksEnabled: boolean;

  /** 自動バックアップ有効化フラグ */
  autoBackup: boolean;

  /** バックアップ保持期間（日数） */
  backupRetentionDays?: number;

  /** ドライラン（実際の変更を行わない） */
  dryRun?: boolean;
}

/**
 * 同期操作
 */
export interface SyncOperation {
  /** 操作ID */
  id: string;

  /** 操作タイプ */
  type: 'create' | 'update' | 'delete';

  /** 対象タスクID */
  taskId: string;

  /** タスクデータ（create/updateの場合） */
  task?: Task | TaskUpdateInput;

  /** タイムスタンプ */
  timestamp: Date;

  /** 同期元 */
  source: 'file' | 'app';

  /** 競合フラグ */
  hasConflict?: boolean;
}

/**
 * 同期バッチ
 */
export interface SyncBatch {
  /** バッチID */
  id: string;

  /** 操作リスト */
  operations: SyncOperation[];

  /** バッチサイズ */
  size: number;

  /** 作成日時 */
  createdAt: Date;

  /** 実行状態 */
  status: 'pending' | 'processing' | 'completed' | 'failed';

  /** エラー情報（失敗時） */
  error?: Error;
}

/**
 * 競合情報
 */
export interface Conflict {
  /** 競合ID */
  id: string;

  /** タスクID */
  taskId: string;

  /** ファイル側のデータ */
  fileVersion: Task;

  /** アプリ側のデータ */
  appVersion: Task;

  /** 共通の祖先（3-way merge用） */
  baseVersion?: Task;

  /** 競合検出日時 */
  detectedAt: Date;

  /** 競合の種類 */
  conflictType: 'content' | 'deletion' | 'creation';

  /** 解決状態 */
  resolved: boolean;

  /** 解決日時 */
  resolvedAt?: Date;

  /** 解決方法 */
  resolution?: ConflictResolution;
}

/**
 * 競合解決結果
 */
export interface ConflictResolution {
  /** 解決方法 */
  method: 'use_file' | 'use_app' | 'manual_merge' | 'auto_merge';

  /** マージ結果 */
  mergedTask: Task;

  /** 解決者（'system' | 'user'） */
  resolvedBy: 'system' | 'user';

  /** 解決日時 */
  resolvedAt: Date;

  /** 解決理由 */
  reason?: string;
}

/**
 * 同期状態
 */
export interface SyncState {
  /** 同期中フラグ */
  syncing: boolean;

  /** 最終同期日時 */
  lastSyncAt?: Date;

  /** 次回同期予定日時 */
  nextSyncAt?: Date;

  /** 保留中の操作数 */
  pendingOperations: number;

  /** 未解決の競合数 */
  unresolvedConflicts: number;

  /** 同期エラー */
  errors: Array<{
    timestamp: Date;
    message: string;
    details?: any;
  }>;

  /** ファイルハッシュ */
  fileHash?: string;

  /** アプリハッシュ */
  appHash?: string;

  /** 同期バージョン */
  version: number;
}

/**
 * 同期履歴
 */
export interface SyncHistory {
  /** 履歴ID */
  id: string;

  /** 同期開始日時 */
  startedAt: Date;

  /** 同期完了日時 */
  completedAt?: Date;

  /** 同期方向 */
  direction: SyncDirection;

  /** 変更されたタスク数 */
  tasksChanged: number;

  /** 作成されたタスク数 */
  tasksCreated: number;

  /** 更新されたタスク数 */
  tasksUpdated: number;

  /** 削除されたタスク数 */
  tasksDeleted: number;

  /** 検出された競合数 */
  conflictsDetected: number;

  /** 解決された競合数 */
  conflictsResolved: number;

  /** 同期成功フラグ */
  success: boolean;

  /** エラー情報（失敗時） */
  error?: Error;

  /** 所要時間（ミリ秒） */
  durationMs?: number;
}

/**
 * 同期統計
 */
export interface SyncStatistics {
  /** 合計同期回数 */
  totalSyncs: number;

  /** 成功回数 */
  successfulSyncs: number;

  /** 失敗回数 */
  failedSyncs: number;

  /** 平均所要時間（ミリ秒） */
  averageDurationMs: number;

  /** 合計変更タスク数 */
  totalTasksChanged: number;

  /** 合計競合数 */
  totalConflicts: number;

  /** 自動解決された競合数 */
  autoResolvedConflicts: number;

  /** 手動解決が必要な競合数 */
  manualResolvedConflicts: number;

  /** 最終同期日時 */
  lastSyncAt?: Date;

  /** 最終成功同期日時 */
  lastSuccessfulSyncAt?: Date;
}

/**
 * ファイルウォッチャーイベント
 */
export interface FileWatcherEvent {
  /** イベントタイプ */
  type: 'change' | 'add' | 'unlink' | 'error';

  /** ファイルパス */
  path: string;

  /** タイムスタンプ */
  timestamp: Date;

  /** ファイル統計情報 */
  stats?: {
    size: number;
    mtime: Date;
  };

  /** エラー情報（エラーイベントの場合） */
  error?: Error;
}

/**
 * バックアップ情報
 */
export interface BackupInfo {
  /** バックアップID */
  id: string;

  /** バックアップファイルパス */
  path: string;

  /** 作成日時 */
  createdAt: Date;

  /** ファイルサイズ（バイト） */
  size: number;

  /** バックアップ元のハッシュ */
  sourceHash: string;

  /** バックアップ理由 */
  reason: 'manual' | 'auto' | 'before_sync' | 'conflict_detected';

  /** バックアップメタデータ */
  metadata?: {
    taskCount: number;
    version: number;
  };
}

/**
 * リストア結果
 */
export interface RestoreResult {
  /** リストア成功フラグ */
  success: boolean;

  /** リストアされたタスク数 */
  restoredTasks: number;

  /** リストア日時 */
  restoredAt: Date;

  /** リストア元バックアップ */
  backup: BackupInfo;

  /** エラー情報（失敗時） */
  error?: Error;
}
