# TaskFlow GraphQL - TODO.md Sync Implementation

## 🎯 Project Goal
cldev ↔ TaskFlow TODO.md 双方向同期システムの実装

---

## ✅ Phase 1: Markdown Parser/Generator (完了)

### [x] MarkdownParser実装 (完了 2025-11-09)
- ファイルサイズ: 9.4KB (250 LOC)
- 機能:
  - Priority mapping: 🔥CRITICAL / ⚠️HIGH / 📌MEDIUM / 📝LOW
  - Status parsing: [ ] TODO / [~] IN_PROGRESS / [x] COMPLETED
  - Label extraction: #rust #performance → TaskFlow Labels
  - Date handling: ISO 8601 ↔ YYYY-MM-DD
  - Metadata preservation: created/completed timestamps
- セキュリティ:
  - XSS prevention: DOMPurify sanitization
  - Path traversal: PathValidator統合
  - Input validation: strict type checking
- テスト: 30 tests (100% pass)

### [x] MarkdownGenerator実装 (完了 2025-11-09)
- ファイルサイズ: 5.8KB (200 LOC)
- 機能:
  - Task → TODO.md変換
  - Section-based formatting
  - Priority emoji generation
  - Label → hashtag conversion
  - Metadata serialization
- セキュリティ:
  - Title/Description sanitization
  - Safe markdown formatting
- テスト: 25 tests (100% pass)

### [x] FileSystem抽象化 (完了 2025-11-09)
- RealFileSystem: Node.js fs/promises wrapper
- MockFileSystem: In-memory testing implementation
- テスト: 30 tests (100% pass)

### [x] 型定義修正 (完了 2025-11-09)
- Priority enum: URGENT → CRITICAL
- TaskStatus enum: DONE → COMPLETED
- Task型: boardId, columnId, subtasks, files, position追加
- Label型: taskCount, createdAt追加

**Phase 1 総テスト数**: 85 tests (100% pass)

---

## ✅ Phase 2: File Watcher + DI Container (完了)

### [x] FileWatcher実装 (完了 2025-11-09)
- ファイルサイズ: 634行 (15KB)
- chokidar v4.0.3統合
- 機能:
  - Debounce: 300ms (設定可能)
  - Throttle: 1000ms (設定可能)
  - File size validation: 5MB limit
  - Path traversal protection
  - Event types: change, add, unlink, error
  - Statistics tracking: event counts, timing
  - Pause/Resume機能
  - Manual flush機能
- テスト: **73 tests (100% pass)** ✅

### [x] DI Container実装 (完了 2025-11-09)
- ファイルサイズ: 557行
- Lifetime管理:
  - Singleton: 単一インスタンス
  - Transient: 毎回新規生成
  - Factory: 引数付き動的生成
- Parser/Generator/Watcher登録済み

### [x] テスト修正 (完了 2025-11-09)
**修正内容**:
1. Factory Function tests (2件)
   - require() → import変更
   - CommonJS → ESモジュール移行
2. chokidarモック削除
   - 実際のファイルシステムイベントテスト化
3. Event detection tests (10件)
   - 初期化待機: 100ms → 500~1000ms
   - タイムアウト追加: 5秒
   - debounce/throttle調整

**Phase 2 総テスト数**: 73 tests (100% pass)

---

## 🚧 Phase 3: 双方向同期オーケストレーション (次のステップ)

### [ ] SyncOrchestrator実装
**優先度**: 🔥 CRITICAL

**設計**:
```typescript
export class SyncOrchestrator {
  constructor(
    private parser: MarkdownParser,
    private generator: MarkdownGenerator,
    private watcher: FileWatcher,
    private taskRepository: TaskRepository
  );

  async start(): Promise<void>;
  async stop(): Promise<void>;

  // TODO.md変更 → TaskFlow DB
  private async handleFileChange(event: FileWatcherEvent): Promise<void>;

  // TaskFlow DB変更 → TODO.md
  private async handleDbChange(tasks: Task[]): Promise<void>;

  // 競合解決
  private async resolveConflict(
    fileTask: Task,
    dbTask: Task
  ): Promise<Task>;
}
```

**実装タスク**:
- [ ] SyncOrchestrator基本実装
- [ ] handleFileChange実装
- [ ] handleDbChange実装
- [ ] Conflict resolution戦略
- [ ] Last-write-wins実装
- [ ] Merge strategy実装
- [ ] テスト実装 (目標: 50+ tests)

### [ ] TaskRepository統合
- [ ] TaskFlow DB接続
- [ ] Task CRUD operations
- [ ] Change notification system

### [ ] 統合テスト
- [ ] End-to-end sync tests
- [ ] Conflict resolution tests
- [ ] Error recovery tests
- [ ] Performance tests

**Phase 3 目標テスト数**: 50+ tests

---

## 📊 Phase 4: MCP Tool統合・最終調整 (計画中)

### [ ] MCP Tool実装
- [ ] `cldev-todo-sync` MCP server
- [ ] Claude Code統合
- [ ] VSCode extension (optional)

### [ ] ドキュメント整備
- [ ] README.md更新
- [ ] API documentation
- [ ] Architecture diagram

### [ ] パフォーマンス最適化
- [ ] Batch processing
- [ ] Incremental sync
- [ ] Cache strategy

---

## 📈 進捗サマリー

| Phase | Status | Tests | 完了日 |
|-------|--------|-------|--------|
| Phase 1: Parser/Generator | ✅ 完了 | 85/85 (100%) | 2025-11-09 |
| Phase 2: FileWatcher + DI | ✅ 完了 | 73/73 (100%) | 2025-11-09 |
| Phase 3: Sync Orchestration | 🚧 進行中 | 0/50 (0%) | - |
| Phase 4: MCP Tool + Docs | ⏳ 計画中 | - | - |

**総テスト数**: 158/208+ (76% 完了)

---

## 🔐 セキュリティチェックリスト

### ✅ 実装済み
- [x] XSS prevention (DOMPurify)
- [x] Path traversal protection (PathValidator)
- [x] File size limits (5MB)
- [x] Input validation (Zod schemas)
- [x] Null byte detection
- [x] Symlink resolution
- [x] Output sanitization

### [ ] Phase 3で追加予定
- [ ] Rate limiting (API calls)
- [ ] Authentication (MCP)
- [ ] Authorization (file access)
- [ ] Audit logging

---

## 🎯 Next Action

**優先度**: 🔥 CRITICAL
**推定時間**: 4-6 hours
**担当**: Claude Code Agent

**タスク**: Phase 3 - SyncOrchestrator実装開始
1. SyncOrchestrator基本クラス作成
2. handleFileChange実装
3. handleDbChange実装
4. 統合テスト実装

**開始予定**: 2025-11-09 18:30

---

## 📝 Notes

### 技術的決定事項
- **chokidarモック削除**: 実際のファイルシステムイベントテストのため
- **Debounce 300ms**: ファイル保存の連続操作を適切に処理
- **Throttle 1000ms**: 高頻度イベントの制限
- **待機時間延長**: macOS ファイルシステム遅延対応 (500-1000ms)

### 既知の課題
- なし (Phase 2まで全テスト合格)

### 学習記録候補
- FileWatcher実装とchokidar統合
- TypeScript strict mode + RefObject型エラー解決
- Vitest統合テスト戦略

---

**Last Updated**: 2025-11-09 18:28
**Status**: Phase 2完了、Phase 3準備完了
