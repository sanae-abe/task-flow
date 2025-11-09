/**
 * Chrome DevTools Protocol (CDP) を使用して既存ブラウザのエラーを監視
 *
 * 【Claude Code用】自律的ブラウザエラー検出スクリプト
 *
 * 使い方（手動実行）:
 * 1. Chromeをデバッグモードで起動:
 *    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
 * 2. このスクリプトを実行: npm run monitor:browser
 *
 * Claude Code向け使用方法:
 * - npm run monitor:browser -- --timeout=30  （30秒間監視して自動終了）
 * - npm run monitor:browser -- --json         （JSON形式でエラーを出力）
 */

import CDP from 'chrome-remote-interface';
import fs from 'fs';
import path from 'path';

interface ErrorLog {
  timestamp: string;
  type: 'console' | 'exception' | 'network';
  level?: string;
  message: string;
  stack?: string;
  url?: string;
}

// コマンドライン引数のパース
const args = process.argv.slice(2);
const timeout = args.find(arg => arg.startsWith('--timeout='))?.split('=')[1];
const jsonOutput = args.includes('--json');
const timeoutMs = timeout ? parseInt(timeout, 10) * 1000 : undefined;

const logFile = path.join(process.cwd(), 'logs', 'browser-errors.log');
const jsonLogFile = path.join(process.cwd(), 'logs', 'browser-errors.json');

// ログディレクトリ作成
if (!fs.existsSync(path.dirname(logFile))) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
}

// JSON出力用エラーコレクター
const collectedErrors: ErrorLog[] = [];

function writeLog(log: ErrorLog) {
  const logLine = JSON.stringify(log) + '\n';
  fs.appendFileSync(logFile, logLine);

  // エラーコレクターに追加
  collectedErrors.push(log);

  // JSON出力モードでない場合のみコンソール出力
  if (!jsonOutput) {
    const color = log.type === 'exception' ? '\x1b[31m' : log.level === 'error' ? '\x1b[31m' : '\x1b[33m';
    const reset = '\x1b[0m';
    console.log(`${color}[${log.type.toUpperCase()}]${reset}`, log.message);
    if (log.stack) {
      console.log(`  ${color}Stack:${reset}`, log.stack.split('\n')[0]);
    }
  }
}

function outputResults(client: any) {
  if (jsonOutput) {
    // JSON形式で出力
    const result = {
      totalErrors: collectedErrors.length,
      errors: collectedErrors,
      summary: {
        console: collectedErrors.filter(e => e.type === 'console').length,
        exception: collectedErrors.filter(e => e.type === 'exception').length,
        network: collectedErrors.filter(e => e.type === 'network').length,
      },
    };

    fs.writeFileSync(jsonLogFile, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('\n\n========== 監視終了 ==========');
    console.log(`検出されたエラー総数: ${collectedErrors.length}`);
    console.log(`  - コンソールエラー: ${collectedErrors.filter(e => e.type === 'console').length}`);
    console.log(`  - JavaScript例外: ${collectedErrors.filter(e => e.type === 'exception').length}`);
    console.log(`  - ネットワークエラー: ${collectedErrors.filter(e => e.type === 'network').length}`);
    console.log(`ログ保存先: ${logFile}`);
  }

  client.close();
}

async function monitorBrowser() {
  try {
    console.log('🔍 Connecting to Chrome on port 9222...');

    // CDPクライアント接続
    const client = await CDP({ port: 9222 });
    const { Runtime, Log, Network, Page } = client;

    console.log('✅ Connected! Monitoring errors...\n');
    console.log(`📝 Logs will be saved to: ${logFile}\n`);

    // Runtime有効化
    await Runtime.enable();
    await Log.enable();
    await Network.enable();
    await Page.enable();

    // コンソールログ監視
    Runtime.consoleAPICalled((params) => {
      if (params.type === 'error' || params.type === 'warning') {
        const message = params.args.map((arg) => arg.value || arg.description || '').join(' ');
        writeLog({
          timestamp: new Date().toISOString(),
          type: 'console',
          level: params.type,
          message,
        });
      }
    });

    // JavaScript例外監視
    Runtime.exceptionThrown((params) => {
      const exception = params.exceptionDetails;
      writeLog({
        timestamp: new Date().toISOString(),
        type: 'exception',
        message: exception.text || exception.exception?.description || 'Unknown exception',
        stack: exception.stackTrace?.callFrames.map((frame) =>
          `  at ${frame.functionName || '<anonymous>'} (${frame.url}:${frame.lineNumber}:${frame.columnNumber})`
        ).join('\n'),
        url: exception.url,
      });
    });

    // ログエントリ監視
    Log.entryAdded((params) => {
      const entry = params.entry;
      if (entry.level === 'error' || entry.level === 'warning') {
        writeLog({
          timestamp: new Date().toISOString(),
          type: 'console',
          level: entry.level,
          message: entry.text,
          url: entry.url,
        });
      }
    });

    // ネットワークエラー監視
    Network.loadingFailed((params) => {
      writeLog({
        timestamp: new Date().toISOString(),
        type: 'network',
        message: `Network request failed: ${params.errorText}`,
        url: params.type,
      });
    });

    if (!jsonOutput) {
      console.log('👀 Monitoring started. Press Ctrl+C to stop.\n');
      console.log('📍 Navigate to http://localhost:5173 in the Chrome window\n');
      if (timeoutMs) {
        console.log(`⏱️  Auto-stop in ${timeout} seconds\n`);
      }
    }

    // タイムアウト設定
    if (timeoutMs) {
      setTimeout(async () => {
        if (!jsonOutput) {
          console.log('\n\n⏱️  Timeout reached. Stopping monitor...');
        }
        outputResults(client);
        process.exit(0);
      }, timeoutMs);
    }

    // プロセス終了時のクリーンアップ
    process.on('SIGINT', async () => {
      if (!jsonOutput) {
        console.log('\n\n🛑 Stopping monitor...');
      }
      outputResults(client);
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to Chrome:');
    console.error(error);
    console.log('\n💡 Make sure Chrome is running with:');
    console.log('   /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222');
    process.exit(1);
  }
}

monitorBrowser();
