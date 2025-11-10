# GraphQL Integration Guide - TaskFlow Application

**Version**: 1.0.0
**Last Updated**: 2025-11-09
**Status**: Phase FE-0～FE-4 Complete | AI Hooks Ready for Implementation

---

## 目次

1. [概要](#概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [セットアップ](#セットアップ)
4. [データアクセスポリシー](#データアクセスポリシー)
5. [AI機能実装ガイド](#ai機能実装ガイド)
6. [WebSocket Subscriptions](#websocket-subscriptions)
7. [エラーハンドリング・フォールバック](#エラーハンドリングフォールバック)
8. [セキュリティガイドライン](#セキュリティガイドライン)
9. [トラブルシューティング](#トラブルシューティング)

---

## 概要

TaskFlowアプリケーションは、**IndexedDB（ローカルストレージ）** と **GraphQL API（リモートサービス）** を統合したハイブリッドアーキテクチャを採用しています。

### 主要機能

- **AI自然言語タスク作成**: `"明日までにレポート"` → 自動的に期限・優先度付きタスク生成
- **AI推奨タスク**: コンテキスト分析に基づく次のタスク提案
- **リアルタイム通知**: WebSocket経由でタスクの作成・更新をリアルタイム受信
- **TODO.md同期**: MCP Tool経由でMarkdownファイル同期（開発者向け）

### 技術スタック

| 技術 | バージョン | 用途 |
|------|----------|------|
| **Apollo Client** | 4.0.9 | GraphQLクライアント（キャッシング・型安全性） |
| **GraphQL Code Generator** | 6.0.1 | 型安全なReact Hooks自動生成 |
| **taskflow-graphql** | - | Apollo Server 4.x（バックエンド） |
| **DOMPurify** | 3.2.6 | XSS対策（AI生成コンテンツのサニタイズ） |
| **IndexedDB** | - | プライマリデータストレージ |

---

## アーキテクチャ

### データフロー原則

**Single Source of Truth**: すべてのデータはIndexedDBに保存されます。GraphQLは**新機能専用レイヤー**として機能します。

```
┌─────────────────────────────────────────────────────────┐
│                   TaskFlow Frontend                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐          ┌──────────────────┐     │
│  │  IndexedDB Layer │          │  GraphQL Layer   │     │
│  │  (既存機能)       │          │  (新機能)         │     │
│  ├──────────────────┤          ├──────────────────┤     │
│  │ ✅ タスクCRUD     │          │ ✅ AI自然言語     │     │
│  │ ✅ ボードCRUD     │          │ ✅ AI推奨タスク   │     │
│  │ ✅ ラベルCRUD     │          │ ✅ WebSocket通知  │     │
│  │ ✅ オフライン対応 │          │ ✅ TODO.md同期    │     │
│  └──────────────────┘          └──────────────────┘     │
│           │                             │                │
│           │                             ▼                │
│           │                   ┌────────────────┐         │
│           └──────────────────>│  IndexedDB同期 │         │
│                               │  (必須)         │         │
│                               └────────────────┘         │
└────────────────────────────────────────────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │ taskflow-graphql    │
                              │ (GraphQL Server)    │
                              │ Port: 4000          │
                              └─────────────────────┘
```

### 重要原則

1. **GraphQL経由のデータは必ずIndexedDBに同期**
2. **既存機能（タスク/ボード/ラベルCRUD）はIndexedDB直接**
3. **新機能（AI・リアルタイム）のみGraphQL使用**

---

## セットアップ

### 1. 環境変数設定

`.env` ファイルに以下を追加：

```bash
# GraphQL API エンドポイント
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

### 2. GraphQLバックエンド起動

```bash
# taskflow-graphql サーバー起動
cd taskflow-graphql
npm install
npm run dev

# → http://localhost:4000/graphql で起動確認
```

### 3. GraphQL型定義生成

```bash
# GraphQLスキーマから型安全なReact Hooksを自動生成
npm run codegen

# 生成ファイル: src/generated/graphql.ts (1,420行)
```

### 4. フロントエンド起動

```bash
npm install
npm start

# → http://localhost:5173 で起動
```

---

## データアクセスポリシー

TaskFlowは **Data Access Policy** (`src/lib/data-access-policy.ts`) を定義し、IndexedDBとGraphQLの役割を明確に分離しています。

### ポリシー概要

#### ✅ IndexedDB直接アクセス（既存機能）

| 操作 | 対象 | 用途 |
|------|------|------|
| `tasks_crud` | タスクCRUD | `useTasks()` フック |
| `boards_crud` | ボードCRUD | `useBoards()` フック |
| `labels_crud` | ラベルCRUD | `useLabelManagement()` フック |
| `offline_operations` | オフライン同期 | キューイング・同期処理 |

**実装例**:
```typescript
// ✅ 正しい - IndexedDB直接アクセス
import { useTasks } from '@/hooks/useTasks';
const { tasks, addTask, updateTask, deleteTask } = useTasks();

await addTask({ title: 'New Task', boardId: 'board-1' });
```

#### ✅ GraphQL経由（新機能専用）

| 操作 | 対象 | 用途 |
|------|------|------|
| `ai_natural_language` | AI自然言語タスク作成 | `createTaskFromNaturalLanguage` mutation |
| `ai_recommendations` | AI推奨タスク | `nextRecommendedTask` query |
| `websocket_subscriptions` | リアルタイム通知 | `taskCreated` subscription |
| `todo_md_sync` | TODO.md同期 | MCP Tool専用（UIからは使用しない） |

**実装例**:
```typescript
// ✅ 正しい - GraphQL → IndexedDB同期
import { useAITaskCreation } from '@/hooks/useAITaskCreation';

const { createTask } = useAITaskCreation();
const result = await createTask('明日までにレポート');
// → 内部で自動的にIndexedDBに保存される
```

#### ❌ 禁止事項

| 操作 | 理由 |
|------|------|
| GraphQL経由でIndexedDBアクセス | バックエンドはブラウザDBにアクセス不可 |
| 同一データの二重管理 | データ整合性の破綻リスク |
| GraphQL経由での既存CRUD操作 | Single Source of Truth原則違反 |

**避けるべき実装**:
```typescript
// ❌ 間違い - GraphQL経由でタスクCRUD
const [updateTaskMutation] = useMutation(UPDATE_TASK);
await updateTaskMutation({ variables: { id, title } });

// ✅ 正しい - IndexedDB直接
await updateTask({ id, title });
```

---

## AI機能実装ガイド

### 1. AI自然言語タスク作成

#### 概要

自然言語入力からタスクを自動生成します。

**入力例**: `"明日までにレポート"`
**出力例**:
```json
{
  "id": "task-xyz",
  "title": "レポート提出",
  "dueDate": "2025-11-10",
  "dueTime": "23:59",
  "priority": "high"
}
```

#### 実装

**GraphQL Mutation** (`src/graphql/ai-features.graphql`):

```graphql
mutation CreateTaskFromNaturalLanguage($query: String!, $context: AIContextInput) {
  createTaskFromNaturalLanguage(query: $query, context: $context) {
    id
    title
    description
    priority
    dueDate
    dueTime
    labels { id name color }
    columnId
    boardId
    estimatedDuration
    status
    position
    createdAt
    updatedAt
  }
}
```

**Custom Hook** (`src/hooks/useAITaskCreation.ts`):

```typescript
import { useCallback } from 'react';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useCreateTaskFromNaturalLanguageMutation } from '../generated/graphql';
import { useKanban } from '../contexts/KanbanContext';
import type { Task } from '../types';

export const useAITaskCreation = () => {
  const { t } = useTranslation();
  const { dispatch } = useKanban();

  const [createTaskMutation, { loading, error }] =
    useCreateTaskFromNaturalLanguageMutation({
      errorPolicy: 'all',
    });

  const createTask = useCallback(
    async (query: string, context?: { boardId?: string }) => {
      // 1. 入力検証
      if (!query || query.trim().length === 0) {
        toast.error(t('ai.errors.emptyQuery'));
        return null;
      }

      if (query.length > 1000) {
        toast.error(t('ai.errors.queryTooLong'));
        return null;
      }

      try {
        // 2. GraphQL mutation実行
        const { data, errors } = await createTaskMutation({
          variables: { query: query.trim(), context: context || {} },
        });

        if (errors || !data?.createTaskFromNaturalLanguage) {
          toast.error(t('ai.errors.graphqlError'));
          return null;
        }

        const aiTask = data.createTaskFromNaturalLanguage;

        // 3. XSS対策（DOMPurifyサニタイズ）
        const sanitizedTask: Task = {
          ...aiTask,
          title: DOMPurify.sanitize(aiTask.title, { ALLOWED_TAGS: [] }),
          description: aiTask.description
            ? DOMPurify.sanitize(aiTask.description, { ALLOWED_TAGS: [] })
            : '',
        };

        // 4. IndexedDBに同期（Data Access Policy準拠）
        dispatch({
          type: 'ADD_TASK',
          payload: {
            boardId: sanitizedTask.boardId,
            columnId: sanitizedTask.columnId,
            task: sanitizedTask,
          },
        });

        // 5. 成功通知
        toast.success(t('ai.success.taskCreated', { title: sanitizedTask.title }));

        return sanitizedTask;
      } catch (err) {
        toast.error(t('ai.errors.networkError'));
        return null;
      }
    },
    [createTaskMutation, dispatch, t]
  );

  return { createTask, loading, error };
};
```

**UI Component** (`src/components/AITaskInput.tsx`):

```typescript
import { useState } from 'react';
import { useAITaskCreation } from '@/hooks/useAITaskCreation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';

export function AITaskInput({ boardId }: { boardId: string }) {
  const [query, setQuery] = useState('');
  const { createTask, loading } = useAITaskCreation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createTask(query, { boardId });
    if (result) {
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="例: 明日までにレポート、高優先度"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !query.trim()}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            AI作成
          </>
        )}
      </Button>
    </form>
  );
}
```

---

### 2. AI推奨タスク

#### 概要

次に取り組むべきタスクをAIが推奨します。

**Custom Hook** (`src/hooks/useAIRecommendations.ts`):

```typescript
import { useCallback } from 'react';
import { useNextRecommendedTaskQuery } from '../generated/graphql';
import type { Task } from '../types';

export const useAIRecommendations = (boardId: string) => {
  const { data, loading, error, refetch } = useNextRecommendedTaskQuery({
    variables: { boardId },
    fetchPolicy: 'network-only', // 常に最新の推奨を取得
    errorPolicy: 'all',
    skip: !boardId,
  });

  const refresh = useCallback(async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh AI recommendations:', err);
    }
  }, [refetch]);

  return {
    recommendation: data?.nextRecommendedTask || null,
    loading,
    error: error ? new Error(error.message) : null,
    refresh,
  };
};
```

---

## WebSocket Subscriptions

### 概要

リアルタイムでタスクの作成・更新・削除を受信します。

### GraphQL Subscriptions

**定義** (`src/graphql/subscriptions.graphql`):

```graphql
subscription OnTaskCreated($boardId: ID) {
  taskCreated(boardId: $boardId) {
    id
    title
    description
    priority
    status
    columnId
    boardId
  }
}

subscription OnTaskUpdated($boardId: ID) {
  taskUpdated(boardId: $boardId) {
    id
    title
    status
    priority
    updatedAt
  }
}

subscription OnTaskDeleted($boardId: ID) {
  taskDeleted(boardId: $boardId) {
    id
    title
    deletedAt
  }
}
```

### Custom Hook実装

**Hook** (`src/hooks/useTaskSubscriptions.ts`):

```typescript
import { useEffect, useState, useCallback } from 'react';
import {
  useOnTaskCreatedSubscription,
  useOnTaskUpdatedSubscription,
  useOnTaskDeletedSubscription,
} from '../generated/graphql';
import { useKanban } from '../contexts/KanbanContext';
import type { Task } from '../types';

export const useTaskSubscriptions = (
  options: {
    boardId?: string;
    skip?: boolean;
    onTaskCreated?: (task: Task) => void;
    onTaskUpdated?: (task: Task) => void;
    onTaskDeleted?: (taskId: string) => void;
  } = {}
) => {
  const { boardId, skip = false, onTaskCreated, onTaskUpdated, onTaskDeleted } = options;
  const { dispatch } = useKanban();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Task Created Subscription
  const { data: createdData, error: createdError } = useOnTaskCreatedSubscription({
    variables: { boardId: boardId || null },
    skip,
    onError: (err) => {
      console.error('Task created subscription error:', err);
      setError(new Error(err.message));
      setConnected(false);
    },
  });

  // Task Updated Subscription
  const { data: updatedData, error: updatedError } = useOnTaskUpdatedSubscription({
    variables: { boardId: boardId || null },
    skip,
    onError: (err) => {
      console.error('Task updated subscription error:', err);
      setError(new Error(err.message));
      setConnected(false);
    },
  });

  // Task Deleted Subscription
  const { data: deletedData, error: deletedError } = useOnTaskDeletedSubscription({
    variables: { boardId: boardId || null },
    skip,
    onError: (err) => {
      console.error('Task deleted subscription error:', err);
      setError(new Error(err.message));
      setConnected(false);
    },
  });

  // Process task created
  useEffect(() => {
    if (createdData?.taskCreated) {
      const task = createdData.taskCreated as Task;
      dispatch({ type: 'ADD_TASK', payload: { boardId: task.boardId, columnId: task.columnId, task } });
      if (onTaskCreated) onTaskCreated(task);
    }
  }, [createdData, dispatch, onTaskCreated]);

  // Process task updated
  useEffect(() => {
    if (updatedData?.taskUpdated) {
      const task = updatedData.taskUpdated as Task;
      dispatch({ type: 'UPDATE_TASK', payload: { taskId: task.id, updates: task } });
      if (onTaskUpdated) onTaskUpdated(task);
    }
  }, [updatedData, dispatch, onTaskUpdated]);

  // Process task deleted
  useEffect(() => {
    if (deletedData?.taskDeleted) {
      const taskId = deletedData.taskDeleted.id;
      dispatch({ type: 'DELETE_TASK', payload: { taskId } });
      if (onTaskDeleted) onTaskDeleted(taskId);
    }
  }, [deletedData, dispatch, onTaskDeleted]);

  // Update connection status
  useEffect(() => {
    const hasError = createdError || updatedError || deletedError;
    setConnected(!skip && !hasError);
    if (hasError) {
      setError(new Error('Subscription connection failed'));
    } else {
      setError(null);
    }
  }, [createdError, updatedError, deletedError, skip]);

  return { connected, error };
};
```

### Apollo Client WebSocket設定

**設定** (`src/lib/apollo-client.ts`):

```typescript
import { split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
    connectionParams: {
      'x-user-plan': localStorage.getItem('userPlan') || 'free',
      'x-user-id': localStorage.getItem('userId') || 'anonymous',
    },
    retryAttempts: 5,
    shouldRetry: () => true,
  })
);

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink, // WebSocket for subscriptions
  httpLink // HTTP for queries/mutations
);
```

---

## エラーハンドリング・フォールバック

### エラー種別と対応

| エラー種別 | 原因 | 対応策 |
|-----------|------|--------|
| **GraphQLエラー** | クエリ構文エラー、バックエンドロジックエラー | エラーメッセージをユーザーに表示 |
| **ネットワークエラー** | サーバー停止、接続断 | IndexedDBフォールバック、再接続リトライ |
| **認証エラー** | 無効なトークン、権限不足 | ログイン促す、エラートースト表示 |

### 実装例

```typescript
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const { createTask, error } = useAITaskCreation();

const handleSubmit = async () => {
  try {
    const result = await createTask(query);
    if (result) {
      toast.success('タスクを作成しました');
    } else {
      toast.error('タスク作成に失敗しました');
    }
  } catch (err) {
    // ネットワークエラー等
    toast.error('ネットワークエラーが発生しました');
    console.error(err);
  }
};
```

---

## セキュリティガイドライン

### 1. XSS対策（必須）

**すべてのAI生成コンテンツは必ずDOMPurifyでサニタイズ**

```typescript
import DOMPurify from 'dompurify';

// ✅ 正しい - HTMLタグを完全削除
const sanitized = DOMPurify.sanitize(aiContent, { ALLOWED_TAGS: [] });

// ❌ 間違い - サニタイズなし
<div>{aiContent}</div>
```

### 2. 入力検証（必須）

```typescript
if (!query || query.trim().length === 0) {
  toast.error('入力が空です');
  return null;
}

if (query.length > 1000) {
  toast.error('入力は1000文字以内にしてください');
  return null;
}
```

### 3. 認証ヘッダー（暫定運用）

```typescript
// LocalStorageから認証情報を取得
const userPlan = localStorage.getItem('userPlan') || 'free';
const userId = localStorage.getItem('userId') || 'anonymous';

headers: {
  'x-user-plan': userPlan,
  'x-user-id': userId,
}
```

---

## トラブルシューティング

### 1. GraphQLサーバーに接続できない

**症状**: `[Network error]: Failed to fetch`

**確認事項**:
```bash
# 1. サーバーが起動しているか確認
cd taskflow-graphql
npm run dev

# 2. ポート4000が使用中か確認
lsof -i :4000

# 3. 環境変数が正しいか確認
cat .env | grep VITE_GRAPHQL_URL
```

**解決策**:
```bash
# サーバー再起動
cd taskflow-graphql
npm run dev

# フロントエンド再起動
npm run dev
```

---

### 2. 型エラーが発生する

**症状**: `Property 'createTaskFromNaturalLanguage' does not exist`

**解決策**:
```bash
# GraphQL Code Generatorを再実行
npm run codegen

# 型定義ファイルが生成されることを確認
ls -l src/generated/graphql.ts
```

---

### 3. WebSocket接続が失敗する

**症状**: `WebSocket connection to 'ws://localhost:4000/graphql' failed`

**確認事項**:
```bash
# WebSocket設定を確認
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:4000/graphql
```

**解決策**: taskflow-graphqlのWebSocket設定を確認し、サーバーを再起動

---

### 4. 認証エラー（401 Unauthorized）

**症状**: `[GraphQL error]: Unauthorized`

**解決策**:
```javascript
// ブラウザコンソールで認証情報を設定
localStorage.setItem('userPlan', 'free');
localStorage.setItem('userId', 'user-123');

// ページをリロード
location.reload();
```

---

## 関連ドキュメント

### プロジェクト内

- [Data Access Policy](../src/lib/data-access-policy.ts) - データアクセスルール（384行）
- [Apollo Client設定](../src/lib/apollo-client.ts) - Apollo Client設定（206行）
- [AI Features GraphQL](../src/graphql/ai-features.graphql) - AI機能のクエリ定義
- [useAITaskCreation](../src/hooks/useAITaskCreation.ts) - AI自然言語タスク作成フック
- [useAIRecommendations](../src/hooks/useAIRecommendations.ts) - AI推奨タスクフック
- [useTaskSubscriptions](../src/hooks/useTaskSubscriptions.ts) - リアルタイム通知フック

### 外部リソース

- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)

---

**作成者**: documentation-engineer
**レビュー状態**: Phase 6完了
**次回更新予定**: BE-1完了時（本格認証実装後）
