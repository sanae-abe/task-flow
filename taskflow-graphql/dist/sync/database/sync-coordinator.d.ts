import { EventEmitter } from 'events';
import type { IDBPDatabase } from 'idb';
import type { SyncConfig, SyncStatistics, SyncHistory, Conflict } from '../types';
import type { FileSystem } from '../interfaces/file-system.interface';
/**
 * FileWatcher型定義（インターフェース）
 * 実装は後のフェーズで提供される想定
 */
interface FileWatcher extends EventEmitter {
    start(): Promise<void>;
    stop(): Promise<void>;
    isWatching(): boolean;
}
/**
 * SyncCoordinatorのオプション
 */
export interface SyncCoordinatorOptions {
    /** 同期設定 */
    config: SyncConfig;
    /** FileWatcherインスタンス（オプショナル） */
    fileWatcher?: FileWatcher;
    /** FileSystemインスタンス（DI用） */
    fileSystem?: FileSystem;
    /** IndexedDBインスタンス（DI用） */
    database?: IDBPDatabase;
}
/**
 * SyncCoordinator - TODO.md ↔ App 同期オーケストレーター
 *
 * TODO.mdファイルとアプリケーション（IndexedDB）間の双方向同期を管理します。
 * 既存コンポーネントをDI経由で統合し、以下の機能を提供：
 *
 * - ファイル→アプリ同期（TODO.mdをパース→IndexedDB更新）
 * - アプリ→ファイル同期（IndexedDBを読み取り→TODO.md書き込み）
 * - 差分同期（変更されたタスクのみ処理）
 * - 競合検出（基本的な競合検出、3-way mergeはPhase 4）
 * - バックアップ（書き込み前の自動バックアップ）
 * - 統計追跡（同期回数、成功率、エラー等）
 *
 * @example
 * ```typescript
 * const coordinator = new SyncCoordinator({
 *   config: {
 *     todoPath: '/path/to/TODO.md',
 *     direction: 'bidirectional',
 *     strategy: 'last_write_wins',
 *     conflictResolution: 'prefer_file',
 *     debounceMs: 1000,
 *     throttleMs: 5000,
 *     maxFileSizeMB: 5,
 *     maxTasks: 10000,
 *     webhooksEnabled: false,
 *     autoBackup: true,
 *   },
 *   database: db,
 * });
 *
 * await coordinator.start();
 * await coordinator.syncFileToApp();
 * const stats = coordinator.getStats();
 * await coordinator.stop();
 * ```
 */
export declare class SyncCoordinator extends EventEmitter {
    private config;
    private fileWatcher?;
    private fileSystem?;
    private database?;
    private parser;
    private serializer;
    private pathValidator;
    private diffDetector;
    private batchWriter;
    private retry;
    private circuitBreaker;
    private threeWayMerger;
    private conflictResolver;
    private stateManager;
    private isRunning;
    private isSyncing;
    private lastFileContent;
    private lastFileHash;
    private syncHistory;
    private conflicts;
    private statistics;
    constructor(options: SyncCoordinatorOptions);
    /**
     * 設定を検証します
     */
    private validateConfig;
    /**
     * Circuit Breakerを設定します
     */
    private setupCircuitBreakers;
    /**
     * SyncCoordinatorを起動します
     */
    start(): Promise<void>;
    /**
     * SyncCoordinatorを停止します
     */
    stop(): Promise<void>;
    /**
     * FileWatcherのイベントリスナーを設定します
     */
    private setupFileWatcherListeners;
    /**
     * ファイル→アプリ同期を実行します
     *
     * TODO.mdをパースしてIndexedDBを更新します
     */
    syncFileToApp(): Promise<void>;
    /**
     * アプリ→ファイル同期を実行します
     *
     * IndexedDBからタスクを読み取りTODO.mdに書き込みます
     */
    syncAppToFile(): Promise<void>;
    /**
     * 同期統計情報を取得します
     */
    getStats(): SyncStatistics;
    /**
     * 同期履歴を取得します
     */
    getSyncHistory(limit?: number): SyncHistory[];
    /**
     * 未解決の競合を取得します
     */
    getConflicts(): Conflict[];
    /**
     * 同期状態を取得します
     */
    getSyncState(): import("../types").SyncState;
    /**
     * ベースバージョンを取得します（3-way merge用）
     */
    getBaseVersion(taskId: string): Promise<import("./sync-state-manager").BaseVersion | undefined>;
    /**
     * 古いベースバージョンをクリーンアップします
     */
    cleanupOldBaseVersions(olderThanDays?: number): Promise<number>;
    /**
     * バックアップを作成します
     */
    private createBackup;
    /**
     * IndexedDBから全タスクを取得します
     */
    private getAllTasksFromDB;
    /**
     * ParsedTaskをTaskに変換します
     */
    private parsedTaskToTask;
    /**
     * 競合を検出します（基本実装）
     */
    private detectConflicts;
    /**
     * 競合を解決します
     */
    private resolveConflicts;
    /**
     * タスクの変更を検出します
     */
    private detectTaskChanges;
    /**
     * ハッシュ値を計算します（簡易実装）
     */
    private calculateHash;
    /**
     * 平均同期時間を更新します
     */
    private updateAverageDuration;
    /**
     * 同期IDを生成します（簡易UUID）
     */
    private generateSyncId;
    /**
     * タスクIDを生成します（簡易UUID）
     */
    private generateTaskId;
}
export {};
//# sourceMappingURL=sync-coordinator.d.ts.map