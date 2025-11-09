# TODO.md ↔ TaskFlow App 連携実装計画

**作成日**: 2025-11-09
**バージョン**: 1.0
**レビュー**: 3視点反復レビュー完了（セキュリティ・パフォーマンス・保守性）

---

## 📋 目次

1. [概要](#概要)
2. [アーキテクチャ設計](#アーキテクチャ設計)
3. [セキュリティ要件](#セキュリティ要件)
4. [パフォーマンス要件](#パフォーマンス要件)
5. [実装アプローチ比較](#実装アプローチ比較)
6. [Phase別実装計画](#phase別実装計画)
7. [コンポーネント実装詳細](#コンポーネント実装詳細)
8. [テスト戦略](#テスト戦略)
9. [リスク管理](#リスク管理)
10. [次のアクション](#次のアクション)

---

## 概要

### 目的

TaskFlow AppのタスクデータとプロジェクトルートのTODO.mdを双方向同期させ、以下を実現する：

- ✅ Claude Code/Claude DesktopでTODO.md編集 → TaskFlow Appに自動反映
- ✅ TaskFlow Appでタスク操作 → TODO.mdに自動反映
- ✅ Git管理可能なMarkdown形式でのタスク管理
- ✅ iTerm停止・再起動時のタスク永続化

### 背景

**課題**:
- iTerm/ターミナル停止時にClaude CodeのTodoWriteが消失
- セッション間でのタスク状態引き継ぎ不可

**解決策**:
- TODO.mdをプロジェクトルートに配置し、Git管理
- TaskFlow AppのIndexedDBと双方向同期
- MCPサーバー経由でClaude Code/Desktopと連携

### 主要機能

1. **File Watcher同期**: TODO.md変更を監視して自動反映（推奨方式）
2. **MCP Tool同期**: Claude Code/Desktopから明示的に同期実行
3. **Webhook同期**: TaskFlow App内の変更をTODO.mdへ自動反映
4. **3-way merge**: 競合時のデータロス防止

---

## アーキテクチャ設計

### システムアーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                    ~/workspace/taskflow-app/                 │
│                                                               │
│  ┌──────────────┐         ┌──────────────────┐              │
│  │   TODO.md    │◄────────│  File Watcher    │              │
│  │  (Markdown)  │         │  (chokidar)      │              │
│  └──────┬───────┘         └────────┬─────────┘              │
│         │                          │                         │
│         │ parse                    │ change event            │
│         ▼                          ▼                         │
│  ┌──────────────────────────────────────────┐               │
│  │      TODO Sync Service                   │               │
│  │  • Markdown Parser (TODO.md → Tasks)     │               │
│  │  • Markdown Generator (Tasks → TODO.md)  │               │
│  │  • Conflict Resolver (3-way merge)       │               │
│  │  • Security Layer (Path validation)      │               │
│  │  • Performance Layer (Diff detection)    │               │
│  └──────────────┬───────────────────────────┘               │
│                 │                                            │
│                 │ GraphQL Mutation                           │
│                 ▼                                            │
│  ┌──────────────────────────────────────────┐               │
│  │      TaskFlow GraphQL Server             │               │
│  │  • MCP Server (26 tools + sync_todo_md)  │               │
│  │  • GraphQL API                           │               │
│  │  • IndexedDB Storage                     │               │
│  └──────────────┬───────────────────────────┘               │
│                 │                                            │
│                 │ update                                     │
│                 ▼                                            │
│  ┌──────────────────────────────────────────┐               │
│  │      React App (localhost:5173)          │               │
│  │  • Task List UI                          │               │
│  │  • Board View                            │               │
│  │  • IndexedDB (idb)                       │               │
│  └──────────────────────────────────────────┘               │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Claude Code / Claude Desktop                    │
│  ┌──────────────────────────────────────────┐               │
│  │   MCP Client                             │               │
│  │   • create_task                          │               │
│  │   • sync_todo_md (New!)                  │               │
│  │   • export_board_markdown                │               │
│  └──────────────────────────────────────────┘               │
└───────────────────────────────────────────────────────────────┘
```

### データフロー

#### 1. TODO.md → TaskFlow App（File Watcher方式）

```
TODO.md編集
  ↓
chokidar change event
  ↓
Debounce (500ms)
  ↓
Security validation (Path traversal check)
  ↓
Markdown Parser (差分パース)
  ↓
Sanitization (DOMPurify)
  ↓
3-way merge conflict detection
  ↓
IndexedDB batch write
  ↓
React App自動更新（Subscription経由）
```

#### 2. TaskFlow App → TODO.md（Webhook方式）

```
React AppでTask更新
  ↓
IndexedDB write
  ↓
GraphQL Subscription notification
  ↓
Webhook trigger (task.updated)
  ↓
Markdown Generator (差分生成)
  ↓
TODO.md write (atomic operation)
  ↓
File Watcher一時停止（無限ループ防止）
```

#### 3. Claude Code/Desktop → TODO.md（MCP Tool方式）

```
Claude Code: "Sync TODO.md"
  ↓
MCP Tool: sync_todo_md
  ↓
Authentication check
  ↓
Direction選択 (import/export/bidirectional)
  ↓
Bidirectional Sync実行
  ↓
Success response
```

### コンポーネント構成

```
taskflow-graphql/
├── src/
│   ├── sync/                          # 新規ディレクトリ
│   │   ├── todo-md-watcher.ts         # File Watcher
│   │   ├── markdown-parser.ts         # Markdown → Task変換
│   │   ├── markdown-generator.ts      # Task → Markdown変換
│   │   ├── conflict-resolver.ts       # 3-way merge
│   │   ├── bidirectional-sync.ts      # 双方向同期ロジック
│   │   ├── security/
│   │   │   ├── path-validator.ts      # Path traversal対策
│   │   │   ├── sanitizer.ts           # Markdownサニタイゼーション
│   │   │   └── auth-validator.ts      # MCP認証
│   │   ├── performance/
│   │   │   ├── diff-detector.ts       # 差分検出
│   │   │   ├── batch-writer.ts        # バッチ書き込み
│   │   │   └── cache-manager.ts       # キャッシュ管理
│   │   ├── interfaces/
│   │   │   ├── file-system.interface.ts
│   │   │   ├── database.interface.ts
│   │   │   └── sync-service.interface.ts
│   │   └── __tests__/
│   │       ├── markdown-parser.test.ts
│   │       ├── conflict-resolver.test.ts
│   │       └── integration.test.ts
│   ├── mcp/
│   │   └── tools/
│   │       └── todo-md-tools.ts       # 新規MCPツール
│   ├── types/
│   │   └── task.ts                    # 統一型定義（新規）
│   └── config/
│       └── todo-sync.config.ts        # 設定外部化（新規）
└── docs/
    ├── adr/                            # Architecture Decision Records
    │   ├── 0001-file-watcher-approach.md
    │   ├── 0002-3way-merge-strategy.md
    │   ├── 0003-di-pattern-adoption.md
    │   ├── 0004-security-requirements.md
    │   └── 0005-performance-optimization.md
    └── TODO_MD_SYNC_IMPLEMENTATION_PLAN.md (このファイル)
```

---

## セキュリティ要件

### 🔴 Critical（実装必須）

#### 1. パストラバーサル対策

**脅威**: 任意ディレクトリへの読み書き攻撃

**対策**:
```typescript
// src/sync/security/path-validator.ts
import path from 'path';

export class PathValidator {
  private allowedBasePath: string;

  constructor(basePath: string = process.cwd()) {
    this.allowedBasePath = path.resolve(basePath);
  }

  validate(filePath: string): string {
    const resolvedPath = path.resolve(this.allowedBasePath, filePath);

    if (!resolvedPath.startsWith(this.allowedBasePath)) {
      throw new Error('Path traversal detected');
    }

    return resolvedPath;
  }
}

// 使用例
const validator = new PathValidator();
const safePath = validator.validate(userInputPath); // throws if invalid
```

#### 2. MCP Tool認証機構

**脅威**: 悪意あるMCPクライアントからのデータ改ざん

**対策**:
```typescript
// src/sync/security/auth-validator.ts
import { z } from 'zod';

const MCP_AUTH_TOKEN_SCHEMA = z.string().min(32);

export class AuthValidator {
  validateMcpToken(token: string | undefined): boolean {
    if (!token) return false;

    try {
      MCP_AUTH_TOKEN_SCHEMA.parse(token);
      // 環境変数と照合
      return token === process.env.MCP_AUTH_TOKEN;
    } catch {
      return false;
    }
  }
}

// src/mcp/tools/todo-md-tools.ts での使用
export const syncTodoMdTool = {
  handler: async ({ todoPath, direction }, context) => {
    const authValidator = new AuthValidator();

    if (!authValidator.validateMcpToken(context.authToken)) {
      throw new Error('Unauthorized MCP access');
    }

    // 同期処理
  }
};
```

#### 3. Markdownサニタイゼーション

**脅威**: XSS、スクリプトインジェクション

**対策**:
```typescript
// src/sync/security/sanitizer.ts
import DOMPurify from 'isomorphic-dompurify';

export class MarkdownSanitizer {
  sanitizeTitle(title: string): string {
    return DOMPurify.sanitize(title, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }

  sanitizeDescription(description: string): string {
    return DOMPurify.sanitize(description, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code'],
      ALLOWED_ATTR: []
    });
  }
}

// markdown-parser.ts での使用
const sanitizer = new MarkdownSanitizer();
const safeTitle = sanitizer.sanitizeTitle(rawTitle);
```

### 🟡 Important（1週間以内）

#### 4. ファイルサイズ制限

```typescript
// src/sync/security/path-validator.ts (拡張)
export class PathValidator {
  async validateFileSize(filePath: string, maxSizeMB: number = 5): Promise<void> {
    const stats = await fs.stat(filePath);
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (stats.size > maxBytes) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }
  }
}
```

#### 5. 構造化ログ（機密情報除外）

```typescript
// src/utils/logger.ts (拡張)
import pino from 'pino';

const logger = pino({
  redact: {
    paths: ['*.password', '*.apiKey', '*.token', 'tasks.*.title'],
    remove: true
  }
});

// 安全なログ
logger.info('TODO.md sync completed', {
  taskCount: tasks.length,
  syncDirection: direction
  // タスク内容は含めない
});
```

#### 6. 環境変数バリデーション

```typescript
// src/config/todo-sync.config.ts
import { z } from 'zod';

const TODO_SYNC_CONFIG_SCHEMA = z.object({
  TODO_MD_PATH: z.string().default('./TODO.md'),
  TODO_DEBOUNCE_MS: z.number().min(100).max(5000).default(500),
  TODO_MAX_FILE_SIZE_MB: z.number().min(1).max(50).default(5),
  TODO_MAX_TASKS: z.number().min(100).max(100000).default(10000),
  TODO_WEBHOOKS_ENABLED: z.boolean().default(false),
  MCP_AUTH_TOKEN: z.string().min(32).optional(),
});

export const TODO_SYNC_CONFIG = TODO_SYNC_CONFIG_SCHEMA.parse({
  TODO_MD_PATH: process.env.TODO_MD_PATH,
  TODO_DEBOUNCE_MS: Number(process.env.TODO_DEBOUNCE_MS),
  TODO_MAX_FILE_SIZE_MB: Number(process.env.TODO_MAX_FILE_SIZE_MB),
  TODO_MAX_TASKS: Number(process.env.TODO_MAX_TASKS),
  TODO_WEBHOOKS_ENABLED: process.env.TODO_WEBHOOKS_ENABLED === 'true',
  MCP_AUTH_TOKEN: process.env.MCP_AUTH_TOKEN,
});
```

---

## パフォーマンス要件

### 目標性能

| 操作 | 目標時間 | 最大許容時間 |
|------|---------|------------|
| TODO.md変更検出 | <100ms | 500ms |
| Markdown解析（100タスク） | <200ms | 1s |
| IndexedDB同期（100タスク） | <300ms | 1s |
| TODO.md生成（1000タスク） | <500ms | 2s |
| 競合解決（100タスク） | <400ms | 1.5s |

### 🔴 Critical（実装必須）

#### 1. IndexedDBバッチ書き込み

**問題**: N+1問題で100タスクに100回書き込み

**対策**:
```typescript
// src/sync/performance/batch-writer.ts
import { openDB } from 'idb';

export class BatchWriter {
  async bulkUpsertTasks(tasks: Task[]): Promise<void> {
    const db = await openDB('taskflow', 1);

    await db.transaction('rw', db.tasks, async () => {
      // 1トランザクションで全タスク書き込み
      await db.tasks.bulkPut(tasks);
    });
  }
}

// 使用例（修正前）
// ❌ N+1問題
for (const task of tasks) {
  await db.tasks.put(task); // 100タスク = 100トランザクション
}

// 使用例（修正後）
// ✅ バッチ書き込み
const batchWriter = new BatchWriter();
await batchWriter.bulkUpsertTasks(tasks); // 1トランザクション
```

#### 2. 差分検出ロジック

**問題**: TODO.md全体を毎回パース

**対策**:
```typescript
// src/sync/performance/diff-detector.ts
import { diff, DIFF_INSERT, DIFF_DELETE, DIFF_EQUAL } from 'fast-diff';

export class DiffDetector {
  detectChanges(oldContent: string, newContent: string): ChangedLines {
    const changes = diff(oldContent, newContent);
    const changedLines: number[] = [];

    let lineNumber = 0;
    for (const [operation, text] of changes) {
      const lineCount = text.split('\n').length - 1;

      if (operation === DIFF_INSERT || operation === DIFF_DELETE) {
        for (let i = 0; i < lineCount; i++) {
          changedLines.push(lineNumber + i);
        }
      }

      lineNumber += lineCount;
    }

    return { changedLines, totalLines: lineNumber };
  }
}

// markdown-parser.ts での使用
export class MarkdownParser {
  private lastContent: string = '';
  private diffDetector = new DiffDetector();

  async parseIncremental(filePath: string): Promise<ParsedTask[]> {
    const newContent = await fs.readFile(filePath, 'utf-8');
    const { changedLines } = this.diffDetector.detectChanges(
      this.lastContent,
      newContent
    );

    // 変更行のみパース
    const lines = newContent.split('\n');
    const changedTasks = this.parseLines(
      changedLines.map(i => lines[i])
    );

    this.lastContent = newContent;
    return changedTasks;
  }
}
```

#### 3. Throttle + Debounce組み合わせ

**問題**: 連続編集時に過剰な同期処理

**対策**:
```typescript
// src/sync/todo-md-watcher.ts
import { throttle } from 'lodash-es';

export class TodoMdWatcher {
  private syncThrottled = throttle(
    async (tasks: ParsedTask[]) => {
      // 差分のみ同期
      const diff = await this.diffDetector.computeDiff(
        this.lastSyncedTasks,
        tasks
      );
      await this.batchWriter.bulkUpsertTasks(diff.added.concat(diff.updated));
      this.lastSyncedTasks = tasks;
    },
    2000, // 2秒間に最大1回
    { leading: false, trailing: true }
  );

  start() {
    this.watcher.on('change', async (path) => {
      // Debounce: 500ms
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(async () => {
        const tasks = await this.parser.parseIncremental(path);
        await this.syncThrottled(tasks);
      }, 500);
    });
  }
}
```

### 🟡 Important（1週間以内）

#### 4. DataLoader活用

```typescript
// src/utils/dataloader.ts (拡張)
import DataLoader from 'dataloader';

export const createTaskLoader = () => {
  return new DataLoader<string, Task>(async (ids) => {
    const db = await openDB('taskflow', 1);
    const tasks = await db.tasks.bulkGet(ids);
    return tasks;
  }, {
    cache: true,
    maxBatchSize: 100
  });
};

// Resolver での使用
export const taskResolvers = {
  Query: {
    tasks: async (_, __, context) => {
      const taskIds = await getAllTaskIds();
      return context.taskLoader.loadMany(taskIds);
    }
  }
};
```

#### 5. chokidar最適化

```typescript
// src/sync/todo-md-watcher.ts
import { watch } from 'chokidar';

export class TodoMdWatcher {
  constructor(private todoPath: string) {
    this.watcher = watch(todoPath, {
      persistent: true,
      ignoreInitial: false,
      ignored: /(^|[\/\\])\.(git|node_modules)/, // 除外
      awaitWriteFinish: {
        stabilityThreshold: 1000, // 1秒間変更なしで確定
        pollInterval: 100
      }
    });
  }
}
```

#### 6. メモリリーク対策

```typescript
// src/sync/performance/cache-manager.ts
export class CacheManager {
  private cache: Map<string, ParsedTask[]> = new Map();
  private maxCacheSize = 10000;

  set(key: string, tasks: ParsedTask[]): void {
    if (this.cache.size >= this.maxCacheSize) {
      // 最古のエントリを削除（LRU）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, tasks);
  }

  get(key: string): ParsedTask[] | undefined {
    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

---

## 実装アプローチ比較

### アプローチ1: File Watcher方式（推奨）

**特徴**: TODO.mdの変更を監視して自動反映

**利点**:
- ✅ リアルタイム同期（<1秒）
- ✅ Claude Code編集との親和性高
- ✅ ユーザー操作不要
- ✅ Git管理との相性良好

**欠点**:
- ⚠️ ファイルシステムイベント依存
- ⚠️ 無限ループリスク（双方向同期時）

**実装難易度**: 中

**推奨ユースケース**: メイン同期方式として採用

---

### アプローチ2: MCP Tool方式

**特徴**: Claude Code/Desktopから明示的に同期

**利点**:
- ✅ 制御しやすい
- ✅ 意図的な同期のみ実行
- ✅ エラーハンドリング容易
- ✅ 既存MCPインフラ活用

**欠点**:
- ⚠️ 手動実行が必要
- ⚠️ 同期忘れリスク

**実装難易度**: 低

**推奨ユースケース**: File Watcherの補助、手動同期

---

### アプローチ3: Webhook方式

**特徴**: TaskFlow App内の変更をTODO.mdへ自動反映

**利点**:
- ✅ 既存Webhook機能活用
- ✅ イベント駆動アーキテクチャ
- ✅ 拡張性高い

**欠点**:
- ⚠️ Webhook設定が必要
- ⚠️ 片方向同期のみ

**実装難易度**: 低

**推奨ユースケース**: TaskFlow App → TODO.md同期

---

### 推奨構成

**メイン**: File Watcher（TODO.md → TaskFlow App）
**サブ1**: Webhook（TaskFlow App → TODO.md）
**サブ2**: MCP Tool（手動同期・トラブルシューティング）

---

## Phase別実装計画

### Phase 0: アーキテクチャ改善（Week 1）

**目的**: セキュリティ・パフォーマンス・型定義の基盤整備

#### Day 1-2: セキュリティ強化

- [ ] **Path Validator実装**
  - `src/sync/security/path-validator.ts` 作成
  - パストラバーサル対策
  - ファイルサイズ制限
  - テスト実装（10ケース）

- [ ] **Auth Validator実装**
  - `src/sync/security/auth-validator.ts` 作成
  - MCP認証機構
  - トークン検証
  - テスト実装（8ケース）

- [ ] **Markdown Sanitizer実装**
  - `src/sync/security/sanitizer.ts` 作成
  - `isomorphic-dompurify` 導入
  - XSS対策
  - テスト実装（15ケース）

#### Day 3-4: パフォーマンス基盤

- [ ] **Batch Writer実装**
  - `src/sync/performance/batch-writer.ts` 作成
  - IndexedDB bulkPut実装
  - トランザクション最適化
  - テスト実装（12ケース）

- [ ] **Diff Detector実装**
  - `src/sync/performance/diff-detector.ts` 作成
  - `fast-diff` 導入
  - 差分検出ロジック
  - テスト実装（20ケース）

- [ ] **Throttle + Debounce実装**
  - `lodash-es` 導入
  - `todo-md-watcher.ts` にthrottle統合
  - テスト実装（8ケース）

#### Day 5: 型定義統一

- [ ] **Single Source of Truth実装**
  - `src/types/task.ts` 作成
  - `BaseTask`, `ParsedTask`, `DbTask`, `GqlTask` 定義
  - 既存コードの型置き換え
  - テスト実装（5ケース）

```typescript
// src/types/task.ts
export interface BaseTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedTask extends Omit<BaseTask, 'id' | 'createdAt' | 'updatedAt'> {
  section: string; // Markdown固有フィールド
}

export type DbTask = BaseTask; // IndexedDB用
export type GqlTask = BaseTask; // GraphQL用
```

#### Day 6-7: エラーハンドリング・ログ

- [ ] **Retry + Circuit Breaker実装**
  - `@lifeomic/attempt` 導入
  - `opossum` 導入
  - `src/sync/resilience/` ディレクトリ作成
  - テスト実装（15ケース）

```typescript
// src/sync/resilience/retry-handler.ts
import { retry } from '@lifeomic/attempt';
import CircuitBreaker from 'opossum';

export const createSyncCircuitBreaker = (syncFn: Function) => {
  return new CircuitBreaker(syncFn, {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
  });
};

export const retryWithCircuitBreaker = async (fn: Function) => {
  return retry(async () => {
    return await fn();
  }, {
    maxAttempts: 3,
    delay: 1000,
    factor: 2 // exponential backoff
  });
};
```

- [ ] **構造化ログ実装**
  - `pino` 既存設定拡張
  - 機密情報redact設定
  - テスト実装（5ケース）

**成果物**:
- `src/sync/security/` (3ファイル)
- `src/sync/performance/` (3ファイル)
- `src/sync/resilience/` (2ファイル)
- `src/types/task.ts`
- `src/config/todo-sync.config.ts`
- テスト: 98ケース

**所要時間**: 7日間（56時間）

---

### Phase 1: Markdown Parser実装（Week 2: Day 8-10）

**前提**: Phase 0完了

#### Day 8-9: Parser本体実装

- [ ] **Markdown Parser実装**
  - `src/sync/markdown-parser.ts` 作成
  - 差分パース対応（Diff Detector統合）
  - サニタイゼーション統合
  - セクション検出（🔴最優先、🟠高優先度等）
  - タスクステータス検出（`[ ]`, `[x]`）
  - 優先度推測ロジック

```typescript
// src/sync/markdown-parser.ts
import { PathValidator } from './security/path-validator';
import { MarkdownSanitizer } from './security/sanitizer';
import { DiffDetector } from './performance/diff-detector';
import type { ParsedTask } from '../types/task';

export class MarkdownParser {
  private lastContent: string = '';
  private pathValidator: PathValidator;
  private sanitizer: MarkdownSanitizer;
  private diffDetector: DiffDetector;

  constructor() {
    this.pathValidator = new PathValidator();
    this.sanitizer = new MarkdownSanitizer();
    this.diffDetector = new DiffDetector();
  }

  async parse(filePath: string): Promise<ParsedTask[]> {
    const safePath = this.pathValidator.validate(filePath);
    await this.pathValidator.validateFileSize(safePath);

    const content = await fs.readFile(safePath, 'utf-8');
    return this.parseContent(content);
  }

  async parseIncremental(filePath: string): Promise<ParsedTask[]> {
    const safePath = this.pathValidator.validate(filePath);
    const newContent = await fs.readFile(safePath, 'utf-8');

    const { changedLines } = this.diffDetector.detectChanges(
      this.lastContent,
      newContent
    );

    const lines = newContent.split('\n');
    const tasks = this.parseLines(
      changedLines.map(i => lines[i])
    );

    this.lastContent = newContent;
    return tasks;
  }

  private parseContent(content: string): ParsedTask[] {
    const tasks: ParsedTask[] = [];
    let currentSection = '';

    const lines = content.split('\n');

    for (const line of lines) {
      // セクション検出
      if (line.startsWith('## ')) {
        currentSection = line.replace('## ', '').trim();
        continue;
      }

      // タスク検出
      const taskMatch = line.match(/^- \[([ xX])\] (.+)/);
      if (taskMatch) {
        const [_, status, rawTitle] = taskMatch;
        const title = this.sanitizer.sanitizeTitle(rawTitle.trim());

        // 優先度判定
        let priority: 'low' | 'medium' | 'high' = 'medium';
        if (currentSection.includes('🔴') || currentSection.includes('最優先')) {
          priority = 'high';
        } else if (currentSection.includes('🟢') || currentSection.includes('長期')) {
          priority = 'low';
        }

        tasks.push({
          title,
          status: status.toLowerCase() === 'x' ? 'completed' : 'pending',
          priority,
          section: currentSection,
        });
      }
    }

    return tasks;
  }

  private parseLines(lines: string[]): ParsedTask[] {
    // 変更行のみパース（実装省略）
    return [];
  }
}
```

#### Day 10: テスト実装

- [ ] **単体テスト実装**
  - `src/sync/__tests__/markdown-parser.test.ts` 作成
  - 正常系テスト（15ケース）
  - 異常系テスト（10ケース）
  - エッジケーステスト（5ケース）
  - カバレッジ90%+達成

```typescript
// src/sync/__tests__/markdown-parser.test.ts
import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../markdown-parser';

describe('MarkdownParser', () => {
  describe('parse', () => {
    it('should parse simple tasks', async () => {
      const parser = new MarkdownParser();
      const tasks = await parser.parse('./fixtures/simple.md');

      expect(tasks).toHaveLength(3);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[0].status).toBe('pending');
    });

    it('should detect completed tasks', async () => {
      const parser = new MarkdownParser();
      const tasks = await parser.parse('./fixtures/completed.md');

      expect(tasks[0].status).toBe('completed');
    });

    it('should sanitize XSS in titles', async () => {
      const parser = new MarkdownParser();
      const tasks = await parser.parse('./fixtures/xss.md');

      expect(tasks[0].title).not.toContain('<script>');
    });

    it('should throw on path traversal', async () => {
      const parser = new MarkdownParser();

      await expect(parser.parse('../../../etc/passwd')).rejects.toThrow(
        'Path traversal detected'
      );
    });

    // ... 残り26ケース
  });
});
```

**成果物**:
- `src/sync/markdown-parser.ts` (200行)
- `src/sync/__tests__/markdown-parser.test.ts` (400行)
- テスト: 30ケース、カバレッジ90%+

**所要時間**: 3日間（24時間）

---

### Phase 2: File Watcher + DI実装（Week 2-3: Day 11-17）

**前提**: Phase 1完了

#### Day 11-12: DI基盤構築

- [ ] **FileSystem抽象化**
  - `src/sync/interfaces/file-system.interface.ts` 作成
  - 実装: `RealFileSystem`, `MockFileSystem`

```typescript
// src/sync/interfaces/file-system.interface.ts
export interface FileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  stat(path: string): Promise<{ size: number; mtime: Date }>;
}

// src/sync/file-system/real-file-system.ts
export class RealFileSystem implements FileSystem {
  async readFile(path: string): Promise<string> {
    return await fs.readFile(path, 'utf-8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    await fs.writeFile(path, content, 'utf-8');
  }

  async stat(path: string): Promise<{ size: number; mtime: Date }> {
    const stats = await fs.stat(path);
    return { size: stats.size, mtime: stats.mtime };
  }
}

// src/sync/file-system/mock-file-system.ts (テスト用)
export class MockFileSystem implements FileSystem {
  private files: Map<string, string> = new Map();

  async readFile(path: string): Promise<string> {
    return this.files.get(path) || '';
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async stat(path: string): Promise<{ size: number; mtime: Date }> {
    const content = this.files.get(path) || '';
    return { size: content.length, mtime: new Date() };
  }
}
```

- [ ] **Database抽象化**
  - `src/sync/interfaces/database.interface.ts` 作成
  - 実装: `IndexedDbAdapter`, `MockDatabase`

- [ ] **責務分離**
  - `Parser`, `Syncer`, `Notifier` の分離
  - `SyncService` インターフェース定義

#### Day 13-14: Watcher実装

- [ ] **TodoMdWatcher実装**
  - `src/sync/todo-md-watcher.ts` 作成
  - chokidar最適化設定
  - Throttle + Debounce統合
  - メモリリーク対策（CacheManager使用）
  - 無限ループ防止（一時停止機構）

```typescript
// src/sync/todo-md-watcher.ts
import { watch, FSWatcher } from 'chokidar';
import { throttle } from 'lodash-es';
import type { FileSystem } from './interfaces/file-system.interface';
import type { Database } from './interfaces/database.interface';
import { MarkdownParser } from './markdown-parser';
import { BatchWriter } from './performance/batch-writer';
import { DiffDetector } from './performance/diff-detector';
import { TODO_SYNC_CONFIG } from '../config/todo-sync.config';

export class TodoMdWatcher {
  private watcher: FSWatcher;
  private debounceTimeout: NodeJS.Timeout | null = null;
  private lastSyncedTasks: ParsedTask[] = [];
  private isPaused = false;

  private syncThrottled = throttle(
    async (tasks: ParsedTask[]) => {
      const diff = await this.diffDetector.computeDiff(
        this.lastSyncedTasks,
        tasks
      );

      await this.batchWriter.bulkUpsertTasks(
        diff.added.concat(diff.updated)
      );

      this.lastSyncedTasks = tasks;
    },
    TODO_SYNC_CONFIG.TODO_DEBOUNCE_MS * 4,
    { leading: false, trailing: true }
  );

  constructor(
    private todoPath: string,
    private fs: FileSystem,
    private db: Database,
    private parser: MarkdownParser,
    private batchWriter: BatchWriter,
    private diffDetector: DiffDetector
  ) {
    this.watcher = watch(todoPath, {
      persistent: true,
      ignoreInitial: false,
      ignored: /(^|[\/\\])\.(git|node_modules)/,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
      }
    });
  }

  start(): void {
    this.watcher.on('change', async (path) => {
      if (this.isPaused) {
        console.log('Watcher paused, skipping...');
        return;
      }

      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(async () => {
        try {
          const tasks = await this.parser.parseIncremental(path);
          await this.syncThrottled(tasks);
        } catch (error) {
          console.error('Sync error:', error);
          // エラー時も継続動作
        }
      }, TODO_SYNC_CONFIG.TODO_DEBOUNCE_MS);
    });
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  async stop(): Promise<void> {
    await this.watcher.close();
    clearTimeout(this.debounceTimeout);
  }
}
```

#### Day 15-17: 3-way merge実装

- [ ] **Conflict Resolver実装**
  - `src/sync/conflict-resolver.ts` 作成
  - 競合検出ロジック
  - 基本的な自動解決（Last-Write-Wins）
  - 手動解決準備（UI未実装）

```typescript
// src/sync/conflict-resolver.ts
import type { Task, ParsedTask } from '../types/task';

export interface ConflictResolution {
  strategy: 'last-write-wins' | 'manual' | '3-way-merge';
  conflicts: TaskConflict[];
  resolvedTasks: Task[];
}

export interface TaskConflict {
  taskId: string;
  base: Task;
  local: Task; // IndexedDB
  remote: ParsedTask; // TODO.md
  conflictType: 'both-modified' | 'local-deleted' | 'remote-deleted';
}

export class ConflictResolver {
  async resolve(
    baseTasks: Task[],
    localTasks: Task[],
    remoteTasks: ParsedTask[]
  ): Promise<ConflictResolution> {
    const conflicts = this.detectConflicts(baseTasks, localTasks, remoteTasks);

    if (conflicts.length === 0) {
      // 競合なし: 3-way merge
      return {
        strategy: '3-way-merge',
        conflicts: [],
        resolvedTasks: this.merge3Way(baseTasks, localTasks, remoteTasks)
      };
    }

    // 競合あり: Last-Write-Wins（手動解決は将来実装）
    return {
      strategy: 'last-write-wins',
      conflicts,
      resolvedTasks: this.resolveByLastWrite(localTasks, remoteTasks)
    };
  }

  private detectConflicts(
    baseTasks: Task[],
    localTasks: Task[],
    remoteTasks: ParsedTask[]
  ): TaskConflict[] {
    const conflicts: TaskConflict[] = [];
    const baseMap = new Map(baseTasks.map(t => [t.id, t]));
    const localMap = new Map(localTasks.map(t => [t.id, t]));
    const remoteMap = new Map(remoteTasks.map(t => [t.title, t])); // titleベース

    for (const [id, localTask] of localMap) {
      const baseTask = baseMap.get(id);
      const remoteTask = remoteMap.get(localTask.title);

      if (!baseTask) continue; // 新規タスク
      if (!remoteTask) {
        // リモートで削除
        conflicts.push({
          taskId: id,
          base: baseTask,
          local: localTask,
          remote: null,
          conflictType: 'remote-deleted'
        });
        continue;
      }

      // 両方で変更
      if (
        localTask.status !== baseTask.status &&
        remoteTask.status !== baseTask.status
      ) {
        conflicts.push({
          taskId: id,
          base: baseTask,
          local: localTask,
          remote: remoteTask,
          conflictType: 'both-modified'
        });
      }
    }

    return conflicts;
  }

  private merge3Way(
    baseTasks: Task[],
    localTasks: Task[],
    remoteTasks: ParsedTask[]
  ): Task[] {
    // 3-way mergeロジック（競合なし前提）
    const merged: Task[] = [];

    // ローカル変更を優先
    for (const localTask of localTasks) {
      merged.push(localTask);
    }

    // リモート新規追加
    for (const remoteTask of remoteTasks) {
      const exists = localTasks.find(t => t.title === remoteTask.title);
      if (!exists) {
        merged.push({
          id: crypto.randomUUID(),
          ...remoteTask,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    return merged;
  }

  private resolveByLastWrite(
    localTasks: Task[],
    remoteTasks: ParsedTask[]
  ): Task[] {
    // Last-Write-Wins（簡易実装）
    // 実際はタイムスタンプ比較
    return localTasks; // 仮実装
  }
}
```

**成果物**:
- `src/sync/interfaces/` (3ファイル)
- `src/sync/file-system/` (2ファイル)
- `src/sync/todo-md-watcher.ts` (200行)
- `src/sync/conflict-resolver.ts` (150行)
- `src/sync/__tests__/` (3ファイル、400行)
- テスト: 50ケース

**所要時間**: 7日間（56時間）

---

### Phase 3: MCP Tool追加（Week 3: Day 18-20）

**前提**: Phase 2完了

#### Day 18-19: MCP Tool実装

- [ ] **sync_todo_md Tool実装**
  - `src/mcp/tools/todo-md-tools.ts` 作成
  - 認証統合（AuthValidator使用）
  - エラーハンドリング（Retry + Circuit Breaker）
  - ツール登録（`src/mcp/tools/index.ts`）

```typescript
// src/mcp/tools/todo-md-tools.ts
import { z } from 'zod';
import { AuthValidator } from '../../sync/security/auth-validator';
import { BidrectionalSync } from '../../sync/bidirectional-sync';
import { retryWithCircuitBreaker } from '../../sync/resilience/retry-handler';

const SYNC_TODO_MD_INPUT_SCHEMA = z.object({
  todoPath: z.string().default('./TODO.md').describe('Path to TODO.md'),
  direction: z.enum(['import', 'export', 'bidirectional'])
    .default('bidirectional')
    .describe('Sync direction'),
});

export const syncTodoMdTool = {
  name: 'sync_todo_md',
  description: 'Sync TODO.md with TaskFlow App (bidirectional)',
  inputSchema: SYNC_TODO_MD_INPUT_SCHEMA,

  handler: async ({ todoPath, direction }, context) => {
    // 認証チェック
    const authValidator = new AuthValidator();
    if (!authValidator.validateMcpToken(context.authToken)) {
      throw new Error('Unauthorized MCP access');
    }

    // Retry + Circuit Breaker
    const sync = new BidrectionalSync(todoPath);
    const result = await retryWithCircuitBreaker(async () => {
      if (direction === 'import' || direction === 'bidirectional') {
        await sync.importFromTodoMd();
      }

      if (direction === 'export' || direction === 'bidirectional') {
        await sync.exportToTodoMd();
      }

      return await sync.getStats();
    });

    return {
      success: true,
      direction,
      stats: result
    };
  }
};

// src/mcp/tools/index.ts (既存ファイル拡張)
import { syncTodoMdTool } from './todo-md-tools';

export const ALL_TOOLS = [
  // 既存26ツール
  ...existingTools,
  // 新規
  syncTodoMdTool,
];
```

#### Day 20: テスト実装

- [ ] **統合テスト実装**
  - `src/mcp/__tests__/todo-md-tools.test.ts` 作成
  - MCP Protocol準拠テスト
  - 認証テスト
  - エラーハンドリングテスト

```typescript
// src/mcp/__tests__/todo-md-tools.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { syncTodoMdTool } from '../tools/todo-md-tools';
import { MockFileSystem } from '../../sync/file-system/mock-file-system';

describe('syncTodoMdTool', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      authToken: process.env.MCP_AUTH_TOKEN,
      fs: new MockFileSystem(),
    };
  });

  it('should sync bidirectionally', async () => {
    const result = await syncTodoMdTool.handler(
      { todoPath: './TODO.md', direction: 'bidirectional' },
      mockContext
    );

    expect(result.success).toBe(true);
    expect(result.direction).toBe('bidirectional');
    expect(result.stats.syncedTasks).toBeGreaterThan(0);
  });

  it('should reject unauthorized access', async () => {
    mockContext.authToken = 'invalid';

    await expect(
      syncTodoMdTool.handler(
        { todoPath: './TODO.md', direction: 'import' },
        mockContext
      )
    ).rejects.toThrow('Unauthorized MCP access');
  });

  // ... 残り18ケース
});
```

**成果物**:
- `src/mcp/tools/todo-md-tools.ts` (150行)
- `src/mcp/__tests__/todo-md-tools.test.ts` (300行)
- テスト: 20ケース

**所要時間**: 3日間（24時間）

---

### Phase 4: 双方向同期実装（Week 3-4: Day 21-24）

**前提**: Phase 3完了

#### Day 21-22: Markdown Generator実装

- [ ] **Markdown Generator実装**
  - `src/sync/markdown-generator.ts` 作成
  - 配列結合最適化（文字列結合回避）
  - セクション別グルーピング
  - フォーマット整形

```typescript
// src/sync/markdown-generator.ts
import type { Task } from '../types/task';

export class MarkdownGenerator {
  async generate(tasks: Task[], filePath: string): Promise<void> {
    const grouped = this.groupByPriority(tasks);
    const lines: string[] = [];

    // ヘッダー
    lines.push('# 📋 TaskFlow TODO\n');
    lines.push(`**最終更新**: ${new Date().toISOString().split('T')[0]}\n`);
    lines.push('**自動生成**: TaskFlow App\n');
    lines.push('\n---\n\n');

    // 🔴 最優先
    if (grouped.high.length > 0) {
      lines.push('## 🔴 最優先\n\n');
      for (const task of grouped.high) {
        const checkbox = task.status === 'completed' ? '[x]' : '[ ]';
        lines.push(`- ${checkbox} **${task.title}**\n`);
        if (task.dueDate) {
          lines.push(`  - 期限: ${task.dueDate}\n`);
        }
      }
      lines.push('\n---\n\n');
    }

    // 🟠 高優先度
    if (grouped.medium.length > 0) {
      lines.push('## 🟠 高優先度\n\n');
      for (const task of grouped.medium) {
        const checkbox = task.status === 'completed' ? '[x]' : '[ ]';
        lines.push(`- ${checkbox} ${task.title}\n`);
      }
      lines.push('\n---\n\n');
    }

    // 🟢 長期計画
    if (grouped.low.length > 0) {
      lines.push('## 🟢 長期計画\n\n');
      for (const task of grouped.low) {
        const checkbox = task.status === 'completed' ? '[x]' : '[ ]';
        lines.push(`- ${checkbox} ${task.title}\n`);
      }
    }

    // ファイル書き込み（atomic operation）
    const content = lines.join('');
    await this.fs.writeFile(filePath, content);
  }

  private groupByPriority(tasks: Task[]): {
    high: Task[];
    medium: Task[];
    low: Task[];
  } {
    return {
      high: tasks.filter(t => t.priority === 'high'),
      medium: tasks.filter(t => t.priority === 'medium'),
      low: tasks.filter(t => t.priority === 'low'),
    };
  }
}
```

#### Day 23-24: Bidirectional Sync実装

- [ ] **BidrectionalSync実装**
  - `src/sync/bidirectional-sync.ts` 作成
  - バッチ書き込み統合
  - 3-way merge統合
  - DataLoader活用

```typescript
// src/sync/bidirectional-sync.ts
import type { FileSystem } from './interfaces/file-system.interface';
import type { Database } from './interfaces/database.interface';
import { MarkdownParser } from './markdown-parser';
import { MarkdownGenerator } from './markdown-generator';
import { ConflictResolver } from './conflict-resolver';
import { BatchWriter } from './performance/batch-writer';

export class BidrectionalSync {
  constructor(
    private todoPath: string,
    private fs: FileSystem,
    private db: Database,
    private parser: MarkdownParser,
    private generator: MarkdownGenerator,
    private conflictResolver: ConflictResolver,
    private batchWriter: BatchWriter
  ) {}

  async sync(): Promise<SyncStats> {
    // 1. 現在のIndexedDBタスクを取得
    const dbTasks = await this.db.getAllTasks();

    // 2. TODO.mdをパース
    const mdTasks = await this.parser.parse(this.todoPath);

    // 3. 基準タスクを取得（前回同期時点）
    const baseTasks = await this.db.getBaseTasks();

    // 4. 競合解決（3-way merge）
    const resolution = await this.conflictResolver.resolve(
      baseTasks,
      dbTasks,
      mdTasks
    );

    if (resolution.strategy === 'manual') {
      // 手動解決が必要（将来実装）
      throw new Error('Manual conflict resolution required');
    }

    // 5. IndexedDBに書き込み
    await this.batchWriter.bulkUpsertTasks(resolution.resolvedTasks);

    // 6. TODO.mdに書き込み
    await this.generator.generate(resolution.resolvedTasks, this.todoPath);

    // 7. 基準タスク更新
    await this.db.updateBaseTasks(resolution.resolvedTasks);

    return {
      syncedTasks: resolution.resolvedTasks.length,
      conflicts: resolution.conflicts.length,
      strategy: resolution.strategy
    };
  }

  async importFromTodoMd(): Promise<void> {
    const mdTasks = await this.parser.parse(this.todoPath);
    await this.batchWriter.bulkUpsertTasks(mdTasks);
  }

  async exportToTodoMd(): Promise<void> {
    const dbTasks = await this.db.getAllTasks();
    await this.generator.generate(dbTasks, this.todoPath);
  }

  async getStats(): Promise<SyncStats> {
    const dbTasks = await this.db.getAllTasks();
    return {
      syncedTasks: dbTasks.length,
      conflicts: 0,
      strategy: '3-way-merge'
    };
  }
}

interface SyncStats {
  syncedTasks: number;
  conflicts: number;
  strategy: string;
}
```

**成果物**:
- `src/sync/markdown-generator.ts` (150行)
- `src/sync/bidirectional-sync.ts` (200行)
- `src/sync/__tests__/` (2ファイル、500行)
- テスト: 40ケース

**所要時間**: 4日間（32時間）

---

### Phase 5: 統合テスト + ドキュメント（Week 4: Day 25-28）

**前提**: Phase 4完了

#### Day 25-26: E2Eテスト実装

- [ ] **統合テスト実装**
  - `src/sync/__tests__/integration.test.ts` 作成
  - End-to-Endシナリオテスト
  - パフォーマンステスト
  - セキュリティテスト

```typescript
// src/sync/__tests__/integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TodoMdWatcher } from '../todo-md-watcher';
import { BidrectionalSync } from '../bidirectional-sync';
import { MockFileSystem } from '../file-system/mock-file-system';
import { MockDatabase } from '../database/mock-database';

describe('TODO.md Sync Integration', () => {
  describe('File Watcher E2E', () => {
    it('should sync TODO.md changes to IndexedDB in <1s', async () => {
      const fs = new MockFileSystem();
      const db = new MockDatabase();
      const watcher = new TodoMdWatcher('./TODO.md', fs, db);

      watcher.start();

      // TODO.md更新
      const startTime = Date.now();
      await fs.writeFile('./TODO.md', '## 🔴 最優先\n- [ ] Test Task');

      // 同期完了待機
      await new Promise(resolve => setTimeout(resolve, 1000));

      const tasks = await db.getAllTasks();
      const elapsedTime = Date.now() - startTime;

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Test Task');
      expect(elapsedTime).toBeLessThan(1000);
    });

    it('should handle 1000 tasks in <2s', async () => {
      const fs = new MockFileSystem();
      const db = new MockDatabase();

      // 1000タスクのTODO.md生成
      const lines = ['# TODO\n', '## 🔴 最優先\n'];
      for (let i = 0; i < 1000; i++) {
        lines.push(`- [ ] Task ${i}\n`);
      }
      await fs.writeFile('./TODO.md', lines.join(''));

      const startTime = Date.now();
      const sync = new BidrectionalSync('./TODO.md', fs, db);
      await sync.importFromTodoMd();
      const elapsedTime = Date.now() - startTime;

      expect(await db.count()).toBe(1000);
      expect(elapsedTime).toBeLessThan(2000);
    });
  });

  describe('Security E2E', () => {
    it('should prevent path traversal attacks', async () => {
      const fs = new MockFileSystem();
      const db = new MockDatabase();
      const sync = new BidrectionalSync('../../../etc/passwd', fs, db);

      await expect(sync.importFromTodoMd()).rejects.toThrow(
        'Path traversal detected'
      );
    });

    it('should sanitize XSS in task titles', async () => {
      const fs = new MockFileSystem();
      const db = new MockDatabase();

      await fs.writeFile(
        './TODO.md',
        '## 🔴 最優先\n- [ ] <script>alert("XSS")</script> Malicious Task'
      );

      const sync = new BidrectionalSync('./TODO.md', fs, db);
      await sync.importFromTodoMd();

      const tasks = await db.getAllTasks();
      expect(tasks[0].title).not.toContain('<script>');
    });
  });

  describe('Conflict Resolution E2E', () => {
    it('should resolve conflicts with 3-way merge', async () => {
      const fs = new MockFileSystem();
      const db = new MockDatabase();

      // 初期状態
      await db.addTask({ id: '1', title: 'Task 1', status: 'pending' });

      // 両方で変更
      await db.updateTask('1', { status: 'in_progress' });
      await fs.writeFile('./TODO.md', '## 🔴 最優先\n- [x] Task 1');

      const sync = new BidrectionalSync('./TODO.md', fs, db);
      const result = await sync.sync();

      expect(result.conflicts).toBeGreaterThan(0);
      expect(result.strategy).toBe('last-write-wins');
    });
  });
});
```

#### Day 27-28: ドキュメント整備

- [ ] **ADR作成**（Architecture Decision Records）
  - `docs/adr/0001-file-watcher-approach.md`
  - `docs/adr/0002-3way-merge-strategy.md`
  - `docs/adr/0003-di-pattern-adoption.md`
  - `docs/adr/0004-security-requirements.md`
  - `docs/adr/0005-performance-optimization.md`

```markdown
# ADR-0001: File Watcher方式の選択

## Status
Accepted

## Context
TODO.mdとTaskFlow Appの双方向同期には、以下3つのアプローチが考えられる：
1. File Watcher方式（chokidar）
2. MCP Tool方式（手動同期）
3. Webhook方式（片方向）

## Decision
File Watcher方式をメイン同期方式として採用し、MCP Tool/Webhookを補助として使用する。

## Rationale
- リアルタイム同期（<1秒）を実現
- Claude Code編集との親和性が高い
- ユーザー操作不要で自動同期

## Consequences
- ファイルシステムイベント依存（OSによる挙動差異）
- 無限ループリスク（双方向同期時の対策が必要）
- メモリ使用量増加（watcher常駐）

## Implementation Notes
- chokidar v3.6.0使用
- Debounce 500ms + Throttle 2s組み合わせ
- 一時停止機構で無限ループ防止
```

- [ ] **API Reference更新**
  - `docs/API_REFERENCE.md` に `sync_todo_md` 追加

- [ ] **README更新**
  - `README.md` のUsage Examplesに同期機能追加

**成果物**:
- `src/sync/__tests__/integration.test.ts` (600行)
- `docs/adr/` (5ファイル、各500行)
- `docs/TODO_MD_SYNC_IMPLEMENTATION_PLAN.md` (このファイル)
- テスト: 30ケース、パフォーマンステスト5ケース

**所要時間**: 4日間（32時間）

---

## コンポーネント実装詳細

### 統一型定義（Single Source of Truth）

```typescript
// src/types/task.ts
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface BaseTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedTask extends Omit<BaseTask, 'id' | 'createdAt' | 'updatedAt'> {
  section: string; // Markdown固有フィールド（🔴最優先等）
}

export type DbTask = BaseTask; // IndexedDB用
export type GqlTask = BaseTask; // GraphQL用

export interface TaskConflict {
  taskId: string;
  base: BaseTask;
  local: BaseTask;
  remote: ParsedTask;
  conflictType: 'both-modified' | 'local-deleted' | 'remote-deleted';
}
```

### 設定外部化

```typescript
// src/config/todo-sync.config.ts
import { z } from 'zod';

const TODO_SYNC_CONFIG_SCHEMA = z.object({
  TODO_MD_PATH: z.string().default('./TODO.md'),
  TODO_DEBOUNCE_MS: z.number().min(100).max(5000).default(500),
  TODO_THROTTLE_MS: z.number().min(500).max(10000).default(2000),
  TODO_MAX_FILE_SIZE_MB: z.number().min(1).max(50).default(5),
  TODO_MAX_TASKS: z.number().min(100).max(100000).default(10000),
  TODO_WEBHOOKS_ENABLED: z.boolean().default(false),
  MCP_AUTH_TOKEN: z.string().min(32).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const TODO_SYNC_CONFIG = TODO_SYNC_CONFIG_SCHEMA.parse({
  TODO_MD_PATH: process.env.TODO_MD_PATH,
  TODO_DEBOUNCE_MS: Number(process.env.TODO_DEBOUNCE_MS),
  TODO_THROTTLE_MS: Number(process.env.TODO_THROTTLE_MS),
  TODO_MAX_FILE_SIZE_MB: Number(process.env.TODO_MAX_FILE_SIZE_MB),
  TODO_MAX_TASKS: Number(process.env.TODO_MAX_TASKS),
  TODO_WEBHOOKS_ENABLED: process.env.TODO_WEBHOOKS_ENABLED === 'true',
  MCP_AUTH_TOKEN: process.env.MCP_AUTH_TOKEN,
  NODE_ENV: process.env.NODE_ENV,
});
```

### 環境変数設定

```bash
# .env.example に追加
TODO_MD_PATH=./TODO.md
TODO_DEBOUNCE_MS=500
TODO_THROTTLE_MS=2000
TODO_MAX_FILE_SIZE_MB=5
TODO_MAX_TASKS=10000
TODO_WEBHOOKS_ENABLED=false
MCP_AUTH_TOKEN=your-32-char-token-here
```

---

## テスト戦略

### テストカバレッジ目標

| コンポーネント | 目標カバレッジ | 重点項目 |
|--------------|--------------|---------|
| **Security層** | 95%+ | Path traversal、XSS、認証 |
| **Performance層** | 90%+ | 差分検出、バッチ処理 |
| **Parser/Generator** | 90%+ | Markdown構文、エッジケース |
| **Conflict Resolver** | 90%+ | 3-way merge、競合検出 |
| **Integration** | 80%+ | E2Eシナリオ |

### テスト種別

#### 1. 単体テスト（Unit Tests）

```bash
# 実行
npm test -- src/sync/__tests__/markdown-parser.test.ts

# カバレッジ
npm run test:coverage -- src/sync/
```

#### 2. 統合テスト（Integration Tests）

```bash
# 実行
npm test -- src/sync/__tests__/integration.test.ts

# E2Eシナリオ
npm test -- --grep "E2E"
```

#### 3. パフォーマンステスト

```bash
# 1000タスク同期テスト
npm test -- --grep "performance"

# プロファイリング
npm test -- --reporter=verbose --profile
```

#### 4. セキュリティテスト

```bash
# Path traversal、XSS等
npm test -- --grep "security"

# 静的解析
npm audit
npm run lint
```

### テストデータ

```typescript
// src/sync/__tests__/fixtures/
// - simple.md: 基本的なタスク（10件）
// - large.md: 大量タスク（1000件）
// - xss.md: XSS攻撃パターン
// - conflicted.md: 競合状態のタスク
```

---

## リスク管理

### 🔴 高リスク（発生時の影響大）

#### 1. データロス

**リスク**: 競合解決失敗でタスク消失

**対策**:
- 3-way merge実装
- 自動バックアップ（TODO.md.backup）
- 手動解決UI（Phase 6で実装）

**軽減策**:
```typescript
// バックアップ機構
async function backupTodoMd(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const backupPath = `${filePath}.backup.${Date.now()}`;
  await fs.writeFile(backupPath, content);

  // 古いバックアップ削除（7日以上）
  await cleanupOldBackups(filePath, 7);
}
```

#### 2. 無限ループ

**リスク**: File Watcher ↔ Markdown Generator の無限ループ

**対策**:
- Watcher一時停止機構
- 変更検出タイムスタンプ管理
- Throttle制限

**軽減策**:
```typescript
// 無限ループ防止
let lastWriteTime = Date.now();

async function writeWithPause(watcher: TodoMdWatcher, content: string) {
  watcher.pause();
  await fs.writeFile('./TODO.md', content);
  lastWriteTime = Date.now();

  setTimeout(() => {
    watcher.resume();
  }, 1000);
}
```

#### 3. パフォーマンス劣化

**リスク**: 大量タスク（10,000+）で2秒以上の同期時間

**対策**:
- 差分検出ロジック
- IndexedDBバッチ書き込み
- DataLoader活用

**軽減策**:
```typescript
// パフォーマンス監視
import { performance } from 'perf_hooks';

async function measureSync() {
  const start = performance.now();
  await sync.sync();
  const duration = performance.now() - start;

  if (duration > 2000) {
    logger.warn('Slow sync detected', { duration });
  }
}
```

### 🟡 中リスク

#### 4. ファイルシステムイベント未発火

**リスク**: OSによってchokidarイベントが発火しない

**対策**:
- MCP Tool手動同期を併用
- Polling fallback機構

#### 5. 認証トークン漏洩

**リスク**: MCP_AUTH_TOKENがGitにコミットされる

**対策**:
- `.gitignore`に`.env`追加
- `.env.example`でテンプレート提供
- 起動時の環境変数検証

### 🟢 低リスク

#### 6. Markdown構文パースエラー

**リスク**: 特殊な構文でパース失敗

**対策**:
- エラーハンドリング
- フォールバック処理
- ログ記録

---

## 次のアクション

### 即座に実施すべきこと

1. **Phase 0開始承認**
   - セキュリティ・パフォーマンス基盤整備（Week 1）
   - 技術選定の最終確認

2. **依存関係インストール**
```bash
cd ~/workspace/taskflow-app/taskflow-graphql
npm install --save \
  chokidar \
  fast-diff \
  isomorphic-dompurify \
  @lifeomic/attempt \
  opossum \
  lodash-es

npm install --save-dev \
  @types/chokidar \
  @types/lodash-es
```

3. **環境変数設定**
```bash
# .env に追加
echo "TODO_MD_PATH=./TODO.md" >> .env
echo "TODO_DEBOUNCE_MS=500" >> .env
echo "TODO_MAX_FILE_SIZE_MB=5" >> .env
echo "MCP_AUTH_TOKEN=$(openssl rand -base64 32)" >> .env
```

4. **ディレクトリ構造作成**
```bash
mkdir -p src/sync/{security,performance,resilience,interfaces,file-system,database,__tests__}
mkdir -p docs/adr
```

### ディスカッションが必要な点

1. **競合解決UI**
   - 手動解決が必要な競合をどう表示するか？
   - React App vs Claude Code どちらで対応？

2. **同期トリガーの優先順位**
   - File Watcher（自動）vs MCP Tool（手動）のどちらを主軸？
   - Webhook併用の判断基準は？

3. **パフォーマンス許容範囲**
   - 最大サポートタスク数: 10,000? 100,000?
   - 同期時間目標: <1s? <2s?

4. **バックアップ戦略**
   - 自動バックアップの保持期間: 7日? 30日?
   - バックアップ世代数: 10世代? 無制限?

---

## 参考リンク

- **chokidar**: https://github.com/paulmillr/chokidar
- **fast-diff**: https://github.com/jhchen/fast-diff
- **isomorphic-dompurify**: https://github.com/kkomelin/isomorphic-dompurify
- **@lifeomic/attempt**: https://github.com/lifeomic/attempt
- **opossum**: https://github.com/nodeshift/opossum
- **MCP Protocol**: https://modelcontextprotocol.io/

---

## 付録

### A. 全Phase所要時間まとめ

| Phase | 期間 | 工数 |
|-------|-----|------|
| Phase 0: アーキテクチャ改善 | Week 1 (7日) | 56時間 |
| Phase 1: Markdown Parser | Week 2 (3日) | 24時間 |
| Phase 2: File Watcher + DI | Week 2-3 (7日) | 56時間 |
| Phase 3: MCP Tool | Week 3 (3日) | 24時間 |
| Phase 4: Bidirectional Sync | Week 3-4 (4日) | 32時間 |
| Phase 5: 統合テスト + Docs | Week 4 (4日) | 32時間 |
| **合計** | **28日** | **224時間** |

### B. チェックリスト

#### Phase 0完了チェック
- [ ] Path Validator実装・テスト完了
- [ ] Auth Validator実装・テスト完了
- [ ] Markdown Sanitizer実装・テスト完了
- [ ] Batch Writer実装・テスト完了
- [ ] Diff Detector実装・テスト完了
- [ ] Throttle + Debounce実装・テスト完了
- [ ] 型定義統一完了
- [ ] Retry + Circuit Breaker実装完了
- [ ] 構造化ログ導入完了
- [ ] テストカバレッジ90%+達成

#### Phase 1完了チェック
- [ ] Markdown Parser実装完了
- [ ] 差分パース対応完了
- [ ] サニタイゼーション統合完了
- [ ] テスト30ケース完了
- [ ] カバレッジ90%+達成

#### Phase 2完了チェック
- [ ] FileSystem抽象化完了
- [ ] Database抽象化完了
- [ ] TodoMdWatcher実装完了
- [ ] Conflict Resolver実装完了
- [ ] 3-way merge実装完了
- [ ] テスト50ケース完了

#### Phase 3完了チェック
- [ ] sync_todo_md Tool実装完了
- [ ] 認証統合完了
- [ ] エラーハンドリング完了
- [ ] テスト20ケース完了

#### Phase 4完了チェック
- [ ] Markdown Generator実装完了
- [ ] BidrectionalSync実装完了
- [ ] テスト40ケース完了

#### Phase 5完了チェック
- [ ] E2Eテスト30ケース完了
- [ ] パフォーマンステスト5ケース完了
- [ ] ADR 5件作成完了
- [ ] README更新完了
- [ ] API Reference更新完了

---

**作成者**: Claude Code (Sonnet 4.5)
**レビュー**: 3視点反復レビュー完了
**承認**: 実装開始前にユーザー承認必要
