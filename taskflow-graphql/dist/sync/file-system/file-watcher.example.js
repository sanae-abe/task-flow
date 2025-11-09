/**
 * FileWatcher使用例
 *
 * このファイルは実装例を示すためのものであり、
 * 実際のプロダクションコードでは使用しません。
 */
import { FileWatcher, createFileWatcher } from './file-watcher';
/**
 * 基本的な使用例
 */
async function basicExample() {
    // 同期設定
    const config = {
        todoPath: './TODO.md',
        direction: 'bidirectional',
        strategy: 'last_write_wins',
        conflictResolution: 'prefer_file',
        debounceMs: 500,
        throttleMs: 2000,
        maxFileSizeMB: 5,
        maxTasks: 1000,
        webhooksEnabled: false,
        autoBackup: true,
    };
    // FileWatcherの作成
    const watcher = new FileWatcher({
        filePath: config.todoPath,
        config,
    });
    // イベントリスナーの登録
    watcher.on('change', (event) => {
        console.log('File changed:', event.path);
        console.log('File size:', event.stats?.size);
        console.log('Modified at:', event.stats?.mtime);
    });
    watcher.on('add', (event) => {
        console.log('File added:', event.path);
    });
    watcher.on('unlink', (event) => {
        console.log('File deleted:', event.path);
    });
    watcher.on('error', (event) => {
        console.error('Watcher error:', event.error);
    });
    // 監視開始
    await watcher.start();
    // 10秒後に停止
    setTimeout(async () => {
        await watcher.stop();
    }, 10000);
}
/**
 * 統一イベントハンドラの例
 */
async function unifiedEventExample() {
    const config = {
        todoPath: './TODO.md',
        direction: 'bidirectional',
        strategy: 'last_write_wins',
        conflictResolution: 'prefer_file',
        debounceMs: 500,
        throttleMs: 2000,
        maxFileSizeMB: 5,
        maxTasks: 1000,
        webhooksEnabled: false,
        autoBackup: true,
    };
    const watcher = createFileWatcher({ filePath: config.todoPath, config });
    // すべてのイベントを統一的に処理
    watcher.on('event', (event) => {
        switch (event.type) {
            case 'change':
                console.log('[CHANGE]', event.path);
                handleFileChange(event);
                break;
            case 'add':
                console.log('[ADD]', event.path);
                handleFileAdd(event);
                break;
            case 'unlink':
                console.log('[UNLINK]', event.path);
                handleFileDelete(event);
                break;
            case 'error':
                console.error('[ERROR]', event.error);
                handleError(event);
                break;
        }
    });
    await watcher.start();
}
/**
 * 統計情報の取得例
 */
async function statisticsExample() {
    const config = {
        todoPath: './TODO.md',
        direction: 'bidirectional',
        strategy: 'last_write_wins',
        conflictResolution: 'prefer_file',
        debounceMs: 500,
        throttleMs: 2000,
        maxFileSizeMB: 5,
        maxTasks: 1000,
        webhooksEnabled: false,
        autoBackup: true,
    };
    const watcher = new FileWatcher({ filePath: config.todoPath, config });
    await watcher.start();
    // 定期的に統計を出力
    setInterval(() => {
        const stats = watcher.getStats();
        console.log('=== Watcher Statistics ===');
        console.log('Total events:', stats.totalEvents);
        console.log('Change events:', stats.eventCounts.change);
        console.log('Add events:', stats.eventCounts.add);
        console.log('Unlink events:', stats.eventCounts.unlink);
        console.log('Error events:', stats.eventCounts.error);
        console.log('Error count:', stats.errorCount);
        console.log('Retry count:', stats.retryCount);
        console.log('Is watching:', stats.isWatching);
        console.log('Current file size:', stats.currentFileSize);
        console.log('Last modified:', stats.lastModifiedAt);
        console.log('Last event at:', stats.lastEventAt);
        // レート制限統計
        const rateLimiterStats = watcher.getRateLimiterStats();
        console.log('\n=== Rate Limiter Statistics ===');
        for (const [name, stat] of rateLimiterStats) {
            console.log(`${name}:`, stat);
        }
    }, 5000); // 5秒ごと
}
/**
 * エラーハンドリングとリトライの例
 */
async function errorHandlingExample() {
    const config = {
        todoPath: './TODO.md',
        direction: 'bidirectional',
        strategy: 'last_write_wins',
        conflictResolution: 'prefer_file',
        debounceMs: 500,
        throttleMs: 2000,
        maxFileSizeMB: 5,
        maxTasks: 1000,
        webhooksEnabled: false,
        autoBackup: true,
    };
    const watcher = new FileWatcher({
        filePath: config.todoPath,
        config,
        maxRetries: 5, // 最大5回リトライ
        retryDelayMs: 2000, // 2秒間隔でリトライ
    });
    watcher.on('error', (event) => {
        const stats = watcher.getStats();
        console.error('Error occurred:', event.error?.message);
        console.error('Error count:', stats.errorCount);
        console.error('Retry count:', stats.retryCount);
        // エラーが多すぎる場合は停止
        if (stats.errorCount > 10) {
            console.error('Too many errors, stopping watcher');
            watcher.stop().catch(console.error);
        }
    });
    await watcher.start();
}
/**
 * グレースフルシャットダウンの例
 */
async function gracefulShutdownExample() {
    const config = {
        todoPath: './TODO.md',
        direction: 'bidirectional',
        strategy: 'last_write_wins',
        conflictResolution: 'prefer_file',
        debounceMs: 500,
        throttleMs: 2000,
        maxFileSizeMB: 5,
        maxTasks: 1000,
        webhooksEnabled: false,
        autoBackup: true,
    };
    const watcher = new FileWatcher({ filePath: config.todoPath, config });
    await watcher.start();
    // プロセス終了時のクリーンアップ
    process.on('SIGINT', async () => {
        console.log('\nReceived SIGINT, shutting down gracefully...');
        // 保留中のイベントをフラッシュ
        watcher.flush();
        // 統計情報を出力
        const stats = watcher.getStats();
        console.log('Final statistics:', stats);
        // ウォッチャーを停止
        await watcher.dispose();
        console.log('Watcher stopped successfully');
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        console.log('\nReceived SIGTERM, shutting down...');
        await watcher.dispose();
        process.exit(0);
    });
    console.log('Watcher running. Press Ctrl+C to stop.');
}
/**
 * ファイル情報の取得例
 */
async function fileInfoExample() {
    const config = {
        todoPath: './TODO.md',
        direction: 'bidirectional',
        strategy: 'last_write_wins',
        conflictResolution: 'prefer_file',
        debounceMs: 500,
        throttleMs: 2000,
        maxFileSizeMB: 5,
        maxTasks: 1000,
        webhooksEnabled: false,
        autoBackup: true,
    };
    const watcher = new FileWatcher({ filePath: config.todoPath, config });
    // ファイル情報を取得
    const fileInfo = await watcher.getFileInfo();
    console.log('File exists:', fileInfo.exists);
    if (fileInfo.exists) {
        console.log('File size:', fileInfo.size, 'bytes');
        console.log('Last modified:', fileInfo.mtime);
        console.log('Is readable:', fileInfo.isReadable);
        console.log('Is writable:', fileInfo.isWritable);
    }
    else {
        console.log('File does not exist yet, waiting for creation...');
    }
    await watcher.start();
}
// ヘルパー関数
function handleFileChange(event) {
    console.log('Handling file change:', event.path);
    // 同期処理をトリガー
}
function handleFileAdd(event) {
    console.log('Handling file add:', event.path);
    // 初期同期をトリガー
}
function handleFileDelete(event) {
    console.log('Handling file delete:', event.path);
    // 削除処理をトリガー
}
function handleError(event) {
    console.error('Handling error:', event.error);
    // エラーログを記録
}
// 実行例
if (require.main === module) {
    // コマンドライン引数で実行例を選択
    const example = process.argv[2] || 'basic';
    switch (example) {
        case 'basic':
            basicExample().catch(console.error);
            break;
        case 'unified':
            unifiedEventExample().catch(console.error);
            break;
        case 'statistics':
            statisticsExample().catch(console.error);
            break;
        case 'error':
            errorHandlingExample().catch(console.error);
            break;
        case 'shutdown':
            gracefulShutdownExample().catch(console.error);
            break;
        case 'fileinfo':
            fileInfoExample().catch(console.error);
            break;
        default:
            console.error('Unknown example:', example);
            console.error('Available examples: basic, unified, statistics, error, shutdown, fileinfo');
            process.exit(1);
    }
}
export { basicExample, unifiedEventExample, statisticsExample, errorHandlingExample, gracefulShutdownExample, fileInfoExample, };
//# sourceMappingURL=file-watcher.example.js.map