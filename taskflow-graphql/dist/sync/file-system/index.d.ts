/**
 * FileSystem抽象化モジュール
 * 実ファイルシステムとMockファイルシステムのエクスポート
 */
export { RealFileSystem, realFileSystem } from './real-file-system.js';
export { MockFileSystem } from './mock-file-system.js';
export type { FileSystem, FileSystemStats, } from '../interfaces/file-system.interface.js';
export { FileWatcher, createFileWatcher } from './file-watcher.js';
export type { FileWatcherOptions, WatcherStatistics } from './file-watcher.js';
//# sourceMappingURL=index.d.ts.map