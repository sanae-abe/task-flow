# Database Abstraction Interface

FileSystem interfaceと同等のDatabase抽象化インターフェースを提供し、IndexedDB/Supabase両対応の統一データアクセス層を実現します。

## 設計原則

### 1. 抽象化による柔軟性

FileSystem interfaceと一貫した設計パターンを踏襲：

```typescript
// FileSystem Interface Pattern
interface FileSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

// Database Interface Pattern
interface Database {
  getTask(id: string): Promise<TaskRecord | null>;
  createTask(task: TaskRecord): Promise<TaskRecord>;
  deleteTask(id: string): Promise<boolean>;
}
```

### 2. Dependency Injection対応

実装詳細を隠蔽し、テスタビリティとモック実装を容易にします：

```typescript
// Production: IndexedDB
const db: Database = new IndexedDBDatabase();

// Testing: Mock
const db: Database = new MockDatabase();

// Future: Supabase
const db: Database = new SupabaseDatabase();
```

### 3. 型安全性の保証

TypeScript strict modeで完全な型安全性を実現：

- ジェネリクスによる型推論
- 明示的な戻り値型定義
- `TaskRecord`, `BoardRecord`, `LabelRecord`の完全型付け

## インターフェース仕様

### 📦 主要型定義

```typescript
/**
 * データベース統計情報
 */
interface DatabaseStats {
  count: number;              // レコード総数
  lastModified: Date;         // 最終更新日時
  storageSize?: number;       // ストレージ使用量（バイト）
}

/**
 * バッチ操作結果
 */
interface BatchOperationResult<T> {
  success: T[];                              // 成功レコード
  failed: Array<{ record: T; error: Error }>; // 失敗レコード
  successCount: number;                       // 成功数
  failureCount: number;                       // 失敗数
}

/**
 * クエリオプション（ページネーション・ソート）
 */
interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

/**
 * クエリ結果（ページネーション対応）
 */
interface QueryResult<T> {
  data: T[];       // 取得レコード
  total: number;   // 総件数
  hasMore: boolean; // 次のページ有無
}
```

### 🔧 CRUD Operations

#### Tasks

```typescript
// 基本CRUD
getTask(id: string): Promise<TaskRecord | null>
getTasks(ids: string[]): Promise<TaskRecord[]>
createTask(task: TaskRecord): Promise<TaskRecord>
updateTask(id: string, updates: Partial<TaskRecord>): Promise<TaskRecord>
deleteTask(id: string): Promise<boolean>
deleteTasks(ids: string[]): Promise<BatchOperationResult<string>>

// クエリ
getTasksByBoard(boardId: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>
getTasksByColumn(columnId: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>
getTasksByLabel(labelId: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>
getTasksByDateRange(startDate: string, endDate: string, boardId?: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>

// 検索
searchTasks(query: string, boardId?: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>

// ゴミ箱
getDeletedTasks(boardId?: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>
purgeDeletedTasks(retentionDays: number): Promise<string[]>
```

#### Boards

```typescript
getBoard(id: string): Promise<BoardRecord | null>
getBoards(options?: QueryOptions): Promise<QueryResult<BoardRecord>>
createBoard(board: BoardRecord): Promise<BoardRecord>
updateBoard(id: string, updates: Partial<BoardRecord>): Promise<BoardRecord>
deleteBoard(id: string): Promise<boolean>
```

#### Labels

```typescript
getLabel(id: string): Promise<LabelRecord | null>
getLabelsByBoard(boardId?: string): Promise<LabelRecord[]>
createLabel(label: LabelRecord): Promise<LabelRecord>
updateLabel(id: string, updates: Partial<LabelRecord>): Promise<LabelRecord>
deleteLabel(id: string): Promise<boolean>
```

#### Templates

```typescript
getTemplate(id: string): Promise<TemplateRecord | null>
getTemplates(options?: QueryOptions): Promise<QueryResult<TemplateRecord>>
getTemplatesByCategory(category: string): Promise<TemplateRecord[]>
createTemplate(template: TemplateRecord): Promise<TemplateRecord>
updateTemplate(id: string, updates: Partial<TemplateRecord>): Promise<TemplateRecord>
deleteTemplate(id: string): Promise<boolean>
```

### ⚡ バッチ操作

複数レコードの一括処理で高速化：

```typescript
batchCreateTasks(tasks: TaskRecord[]): Promise<BatchOperationResult<TaskRecord>>
batchUpdateTasks(updates: Array<{ id: string; updates: Partial<TaskRecord> }>): Promise<BatchOperationResult<TaskRecord>>
batchCreateLabels(labels: LabelRecord[]): Promise<BatchOperationResult<LabelRecord>>
```

### 🔄 トランザクション

複数操作のアトミック実行：

```typescript
transaction<T>(callback: (tx: TransactionContext) => Promise<T>): Promise<T>

// 使用例
await db.transaction(async (tx) => {
  const task = await db.createTask(newTask);
  await db.updateBoard(boardId, { updatedAt: new Date().toISOString() });
  return task;
});
```

### 📊 統計情報

```typescript
getTaskStats(boardId?: string): Promise<DatabaseStats>
getBoardStats(): Promise<DatabaseStats>
getLabelStats(boardId?: string): Promise<DatabaseStats>
```

### 🔌 接続管理

```typescript
connect(): Promise<void>
disconnect(): Promise<void>
isConnected(): boolean
initialize(): Promise<void>
clear(): Promise<void> // テスト専用
```

## 実装例

### MockDatabase（テスト用）

完全機能のインメモリ実装：

```typescript
import { MockDatabase } from './database/mock-database';

const db = new MockDatabase();
await db.connect();
await db.initialize();

const task = await db.createTask({
  id: '123',
  boardId: 'board1',
  columnId: 'col1',
  title: 'Test Task',
  status: 'TODO',
  priority: 'MEDIUM',
  // ...
});

const result = await db.getTasksByBoard('board1', {
  limit: 10,
  orderBy: { field: 'createdAt', direction: 'desc' }
});

await db.disconnect();
```

### IndexedDBDatabase（実装予定）

ブラウザローカルストレージ実装：

```typescript
import { IndexedDBDatabase } from './database/indexeddb-database';

const db = new IndexedDBDatabase({
  dbName: 'taskflow',
  version: 1
});
await db.connect();

// 同じインターフェースで利用可能
const task = await db.createTask({ ... });
```

### SupabaseDatabase（実装予定）

クラウド同期実装：

```typescript
import { SupabaseDatabase } from './database/supabase-database';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);
const db = new SupabaseDatabase(supabase);
await db.connect();

// 同じインターフェースで利用可能
const task = await db.createTask({ ... });
```

## Type Guards

安全な型チェックのためのユーティリティ関数：

```typescript
import {
  isDatabaseImplementation,
  isBatchOperationSuccess,
  isQueryResultEmpty
} from './database.interface';

// Database実装の検証
if (isDatabaseImplementation(obj)) {
  await obj.getTask('123');
}

// バッチ操作の成功判定
const result = await db.batchCreateTasks(tasks);
if (isBatchOperationSuccess(result)) {
  console.log(`${result.successCount}件作成成功`);
}

// クエリ結果の空判定
const queryResult = await db.searchTasks('keyword');
if (isQueryResultEmpty(queryResult)) {
  console.log('検索結果なし');
}
```

## テスト戦略

### ユニットテスト

MockDatabaseで完全なインターフェース仕様を検証：

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MockDatabase } from '../database/mock-database';
import type { Database } from '../interfaces/database.interface';

describe('Database Interface', () => {
  let db: Database;

  beforeEach(async () => {
    db = new MockDatabase();
    await db.connect();
    await db.initialize();
  });

  it('should create and retrieve task', async () => {
    const task = createMockTask('task1', 'board1', 'column1');
    await db.createTask(task);
    const retrieved = await db.getTask('task1');
    expect(retrieved).toEqual(task);
  });
});
```

### 統合テスト

実際のIndexedDB/Supabase環境でテスト：

```typescript
// IndexedDB統合テスト
const db = new IndexedDBDatabase({ dbName: 'test-db' });
await db.connect();
await db.initialize();

// ... テスト実行

await db.clear();
await db.disconnect();
```

## パフォーマンス最適化

### 1. バッチ操作の活用

```typescript
// ❌ 非効率：ループでcreate
for (const task of tasks) {
  await db.createTask(task);
}

// ✅ 効率的：バッチcreate
const result = await db.batchCreateTasks(tasks);
```

### 2. ページネーション

```typescript
// 大量データの段階的取得
let offset = 0;
const limit = 100;
let hasMore = true;

while (hasMore) {
  const result = await db.getTasksByBoard('board1', { offset, limit });
  processData(result.data);
  offset += limit;
  hasMore = result.hasMore;
}
```

### 3. インデックス活用

```typescript
// 日付範囲検索（インデックス利用）
const result = await db.getTasksByDateRange(
  startDate,
  endDate,
  'board1',
  { limit: 50 }
);
```

## エラーハンドリング

```typescript
try {
  const task = await db.getTask('123');
  if (!task) {
    throw new Error('Task not found');
  }
} catch (error) {
  if (error instanceof Error) {
    console.error('Database error:', error.message);
  }
}

// バッチ操作のエラー
const result = await db.batchCreateTasks(tasks);
if (result.failureCount > 0) {
  console.error('Failed records:', result.failed);
}
```

## 設計比較：FileSystem vs Database

| 観点 | FileSystem Interface | Database Interface |
|------|---------------------|-------------------|
| **抽象化対象** | ファイルシステム（Node.js fs） | データベース（IndexedDB/Supabase） |
| **主要操作** | readFile, writeFile, stat, exists | getTask, createTask, updateTask, deleteTask |
| **メタデータ** | FileSystemStats（size, mtime） | DatabaseStats（count, lastModified） |
| **バッチ処理** | なし（単一ファイル操作） | batchCreateTasks, batchUpdateTasks |
| **トランザクション** | なし | transaction() |
| **クエリ** | なし | searchTasks, getTasksByLabel等 |
| **実装例** | RealFileSystem, MockFileSystem | IndexedDBDatabase, MockDatabase |
| **テスト用途** | Markdown同期テスト | データ永続化テスト |

## 次のステップ

### 実装予定

1. **IndexedDBDatabase** - ブラウザローカルストレージ実装
2. **SupabaseDatabase** - クラウド同期実装
3. **データマイグレーション** - 異なるストレージ間の移行機能
4. **オフライン同期** - ネットワーク切断時の処理

### 拡張予定

- リアルタイム更新（Supabaseサブスクリプション）
- バックグラウンド同期（Service Worker）
- 競合解決戦略（3-way merge）
- データ圧縮・暗号化

## 関連ドキュメント

- [FileSystem Interface](./file-system.interface.ts) - ファイルシステム抽象化
- [Database Types](../../types/database.ts) - データベースレコード型定義
- [MockDatabase](../database/mock-database.ts) - テスト用実装
- [Database Tests](../database/__tests__/database.interface.test.ts) - 統合テスト

---

**作成日**: 2025-11-09
**バージョン**: 1.0.0
**ライセンス**: MIT
