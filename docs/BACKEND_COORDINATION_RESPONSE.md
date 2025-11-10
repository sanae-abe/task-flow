# バックエンド調整ドキュメントへの回答

**作成日**: 2025-11-09
**フロントエンド**: taskflow-app
**バックエンド**: taskflow-graphql
**対応者**: Claude (taskflow-app側)

---

## 📝 質問事項への回答

### 1. 認証方式の決定

**採用案**: **A. ヘッダーベース（暫定）**

**理由**:
- Stripe統合はアカウント機能Phase 3（8-11週間後）に延期
- 暫定運用で開発速度優先
- 将来のJWT移行は容易（ヘッダー名変更のみ）

**実装方針**:
```typescript
// Apollo Client設定（taskflow-app側）
const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
    headers: {
      'x-user-plan': localStorage.getItem('userPlan') || 'free',
      'x-user-id': localStorage.getItem('userId') || 'anonymous',
    },
  }),
});
```

**Stripe統合タイミング**: アカウント機能Phase 3実装時（3-6ヶ月後）

**将来の移行パス**:
1. 暫定（現在）: `x-user-plan: free/pro`（ヘッダー）
2. Phase 2（1-2ヶ月後）: JWT生成・検証実装
3. Phase 3（3-6ヶ月後）: Stripe webhook連携

---

### 2. TODO.md同期の設計見直し

**回答**: **フロント統合から除外**

**理由**:
- TODO.mdはバックエンドのローカルファイルシステムに存在
- ブラウザ（フロント）からファイルシステムアクセス不可
- MCP（Model Context Protocol）経由でClaude Desktopが利用する開発者向け機能

**結論**: TODO.md同期はGraphQL連携の対象外とし、MCP専用機能として分離

**フロント統合の対象機能**:
- ✅ AI自然言語タスク作成
- ✅ タスクAI分解（breakdownTask）
- ✅ 次の推奨タスク取得
- ✅ リアルタイム通知（WebSocket）
- ❌ TODO.md同期（MCP専用）

---

### 3. Supabase移行パスの再検討

**回答**: **localStorage → Supabase直接移行** を推奨

**理由**:
1. **IndexedDB経由は二重移行**（工数2倍、データロスリスク増）
2. **バッチインポートAPI（BE-4）で一括移行可能**
3. **開発期間短縮**（Week 5-7で移行完了）

**推奨スケジュール**:
```
Week 1-4: localStorage運用継続（既存実装）
Week 5-7: GraphQL統合完了（Apollo Client導入）
Week 8+:  Supabase移行開始
  └─ localStorage全データをバッチAPIで一括送信
     （importBoardsFromLocalStorage mutation）
```

**データ移行フロー**:
```typescript
// Step 1: localStorage全データ読み込み
const boards = JSON.parse(localStorage.getItem('kanban-boards') || '[]');

// Step 2: バッチインポートAPI呼び出し（1回のみ）
const result = await apolloClient.mutate({
  mutation: IMPORT_BOARDS_FROM_LOCALSTORAGE,
  variables: { boards },
});

// Step 3: 成功確認後、localStorage削除
if (result.data.importBoardsFromLocalStorage.success) {
  localStorage.removeItem('kanban-boards');
  // Supabase同期モードに切り替え
}
```

**IndexedDBを使わない理由**:
- 現在IndexedDBは使用していない（localStorage + Reducer管理）
- 中間レイヤー追加は複雑性増加のみ
- Supabase直接移行の方が明快

---

### 4. データ形式の完全仕様共有

**回答**: **型定義+サンプルデータを提供**

#### 4-1. TypeScript型定義（完全版）

**ソースコード**: `/Users/sanae.abe/workspace/taskflow-app/src/types.ts`

**主要型定義**:
```typescript
export interface KanbanBoard {
  id: string;
  title: string;
  columns: Column[];
  labels: Label[];
  createdAt: string;
  updatedAt: string;
  deletionState?: 'active' | 'deleted';
  deletedAt?: string | null;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
  deletionState?: 'active' | 'deleted';
  deletedAt?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  completedAt: string | null;
  priority?: Priority; // 'low' | 'medium' | 'high' | 'critical'
  labels: Label[];
  subTasks: SubTask[];
  files: FileAttachment[];
  recurrence?: RecurrenceConfig;
  recurrenceId?: string;
  occurrenceCount?: number;
  deletionState?: 'active' | 'deleted';
  deletedAt?: string | null;
}

export interface Label {
  id: string;
  name: string;
  color: string; // Hex色コード（例: "#FF5733"）
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string; // MIME type（例: "image/png"）
  size: number; // bytes
  data: string; // Base64エンコード済み
  uploadedAt: string;
}

export interface RecurrenceConfig {
  enabled: boolean;
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // 間隔（例：2週間おき = interval: 2, pattern: 'weekly'）
  daysOfWeek?: number[]; // 週次の場合（0=日曜, 1=月曜...）
  dayOfMonth?: number; // 月次の場合（1-31）
  weekOfMonth?: number; // 第N週（1-4, -1=最終週）
  dayOfWeekInMonth?: number; // 月次の曜日指定
  endDate?: string; // ISO 8601形式
  maxOccurrences?: number; // 最大回数
}
```

#### 4-2. サンプルデータ（実際のlocalStorage形式）

```json
{
  "boards": [
    {
      "id": "board-1",
      "title": "プロジェクト管理",
      "createdAt": "2025-11-01T09:00:00.000Z",
      "updatedAt": "2025-11-09T15:30:00.000Z",
      "deletionState": "active",
      "labels": [
        {
          "id": "label-1",
          "name": "緊急",
          "color": "#FF5733"
        },
        {
          "id": "label-2",
          "name": "バグ",
          "color": "#DC3545"
        }
      ],
      "columns": [
        {
          "id": "col-1",
          "title": "未着手",
          "color": "#6C757D",
          "deletionState": "active",
          "tasks": [
            {
              "id": "task-1",
              "title": "GraphQL統合実装",
              "description": "Apollo Clientを導入してtaskflow-graphqlと統合する",
              "createdAt": "2025-11-09T10:00:00.000Z",
              "updatedAt": "2025-11-09T10:30:00.000Z",
              "dueDate": "2025-11-15T23:59:59.000Z",
              "completedAt": null,
              "priority": "high",
              "labels": [
                {
                  "id": "label-1",
                  "name": "緊急",
                  "color": "#FF5733"
                }
              ],
              "subTasks": [
                {
                  "id": "subtask-1",
                  "title": "Apollo Client設定",
                  "completed": false,
                  "createdAt": "2025-11-09T10:15:00.000Z"
                },
                {
                  "id": "subtask-2",
                  "title": "GraphQL Code Generator設定",
                  "completed": false,
                  "createdAt": "2025-11-09T10:20:00.000Z"
                }
              ],
              "files": [],
              "deletionState": "active"
            }
          ]
        },
        {
          "id": "col-2",
          "title": "進行中",
          "color": "#FFC107",
          "deletionState": "active",
          "tasks": [
            {
              "id": "task-2",
              "title": "E2Eテスト修正",
              "description": "失敗している10-13件のテストを修正",
              "createdAt": "2025-11-09T08:00:00.000Z",
              "updatedAt": "2025-11-09T14:00:00.000Z",
              "dueDate": null,
              "completedAt": null,
              "priority": "medium",
              "labels": [],
              "subTasks": [],
              "files": [
                {
                  "id": "file-1",
                  "name": "test-screenshot.png",
                  "type": "image/png",
                  "size": 45678,
                  "data": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
                  "uploadedAt": "2025-11-09T13:30:00.000Z"
                }
              ],
              "deletionState": "active"
            }
          ]
        },
        {
          "id": "col-3",
          "title": "完了",
          "color": "#28A745",
          "deletionState": "active",
          "tasks": [
            {
              "id": "task-3",
              "title": "i18n導入",
              "description": "react-i18nextで多言語対応実装",
              "createdAt": "2025-11-08T09:00:00.000Z",
              "updatedAt": "2025-11-09T12:00:00.000Z",
              "dueDate": "2025-11-09T23:59:59.000Z",
              "completedAt": "2025-11-09T12:00:00.000Z",
              "priority": "high",
              "labels": [],
              "subTasks": [
                {
                  "id": "subtask-3",
                  "title": "react-i18nextインストール",
                  "completed": true,
                  "createdAt": "2025-11-08T09:30:00.000Z"
                }
              ],
              "files": [],
              "recurrence": {
                "enabled": true,
                "pattern": "weekly",
                "interval": 1,
                "daysOfWeek": [1, 3, 5],
                "endDate": "2025-12-31T23:59:59.000Z"
              },
              "recurrenceId": "recur-1",
              "occurrenceCount": 3,
              "deletionState": "active"
            }
          ]
        }
      ]
    }
  ]
}
```

#### 4-3. 特殊ケースのサンプル

**空配列・null値のケース**:
```json
{
  "id": "task-empty",
  "title": "最小構成タスク",
  "description": "",
  "createdAt": "2025-11-09T00:00:00.000Z",
  "updatedAt": "2025-11-09T00:00:00.000Z",
  "dueDate": null,
  "completedAt": null,
  "labels": [],
  "subTasks": [],
  "files": [],
  "deletionState": "active",
  "deletedAt": null
}
```

**削除済みタスク**:
```json
{
  "id": "task-deleted",
  "title": "削除されたタスク",
  "description": "ゴミ箱に移動されたタスク",
  "createdAt": "2025-11-01T00:00:00.000Z",
  "updatedAt": "2025-11-08T00:00:00.000Z",
  "dueDate": null,
  "completedAt": null,
  "labels": [],
  "subTasks": [],
  "files": [],
  "deletionState": "deleted",
  "deletedAt": "2025-11-08T15:00:00.000Z"
}
```

#### 4-4. 日付形式

**すべてISO 8601形式**:
- `createdAt`: `"2025-11-09T10:00:00.000Z"`
- `updatedAt`: `"2025-11-09T15:30:00.000Z"`
- `dueDate`: `"2025-11-15T23:59:59.000Z"` or `null`
- `completedAt`: `"2025-11-09T12:00:00.000Z"` or `null`

#### 4-5. localStorage保存形式

```typescript
// localStorage key
const STORAGE_KEY = 'kanban-boards';

// 保存
localStorage.setItem(STORAGE_KEY, JSON.stringify({ boards }));

// 読み込み
const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"boards":[]}');
```

---

## 📋 追加提案・調整事項

### 5. バックエンド実装の優先順位提案

**P0（並行開発可能）**:
- Phase BE-0: CORS設定（1-2日）
- Phase BE-3: localStorage互換レイヤー（1-2日）

**P1（フロント依存）**:
- Phase BE-1: 認証・プラン管理（2-3日）← フロントがヘッダー送信実装後
- Phase BE-2: WebSocket（2-3日）← Apollo Client導入後
- Phase BE-4: バッチインポートAPI（1-2日）← データ移行フロー確定後

**P2（後回し可）**:
- Phase BE-5: AI機能プラン制限（1-2日）
- Phase BE-6: エラーレスポンス標準化（1日）

### 6. フロント側の対応事項

**Week 1-2（BE-0完了後、並行開発）**:
- Phase FE-0: データアクセスポリシー文書化（1日）
- Phase FE-1: Apollo Client基盤構築（5-7日）

**Week 3（BE-1完了後）**:
- 認証ヘッダー送信実装（1日）
- Phase FE-2: GraphQL Code Generator（2-3日）

**Week 4（BE-2, BE-4完了後）**:
- WebSocket Subscriptions統合（2-3日）
- バッチインポート実装（2-3日）

### 7. 型定義の共有方法

**提案**: GraphQL Schemaから自動生成

```bash
# taskflow-graphql側
npm run codegen  # schema.graphql → TypeScript型定義

# 生成物を共有
cp src/generated/graphql.ts ../taskflow-app/src/generated/
```

**メリット**:
- 型の二重管理を回避
- GraphQL Schemaが唯一の真実の情報源（Single Source of Truth）
- 自動同期（schema変更時に自動反映）

---

## 📞 次のアクション

### バックエンド側へのお願い

1. **Phase BE-0（CORS）の実装開始** ← 最優先
2. **Phase BE-3（localStorage互換）の実装開始** ← 並行実装推奨
3. **型定義共有方法の確認**（GraphQL Code Generator使用でOK？）

### フロント側の対応

1. **Phase FE-0（データアクセスポリシー）の文書化** ← 即座に開始可能
2. **型定義ファイル（types.ts）の共有完了** ← 本ドキュメントで完了
3. **サンプルデータ提供完了** ← 本ドキュメントで完了
4. **Phase FE-1（Apollo Client）の実装待機** ← BE-0完了後に開始

---

## 📄 関連ファイル

- **型定義**: `/Users/sanae.abe/workspace/taskflow-app/src/types.ts`
- **データ管理**: `/Users/sanae.abe/workspace/taskflow-app/src/reducers/kanbanReducer.ts`
- **localStorage操作**: `/Users/sanae.abe/workspace/taskflow-app/src/contexts/TaskContext.tsx`

---

**作成者**: Claude (taskflow-app)
**更新日**: 2025-11-09
**ステータス**: 回答完了、バックエンド実装開始待ち
