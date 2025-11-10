/**
 * Data Access Policy - taskflow-app × taskflow-graphql統合
 *
 * このファイルは、IndexedDB（ローカルストレージ）とGraphQL API（リモートサービス）の
 * アクセス範囲を明確に定義し、アーキテクチャ違反を防ぎます。
 *
 * @version 1.0.0
 * @date 2025-11-09
 * @see /Users/sanae.abe/workspace/taskflow-app/docs/BACKEND_COORDINATION_RESPONSE.md
 */

/**
 * データアクセス層の種類
 */
export type DataAccessLayer = 'indexeddb' | 'graphql' | 'forbidden';

/**
 * データアクセスポリシー定義
 */
export interface DataAccessPolicyDefinition {
  /** アクセス層 */
  layer: DataAccessLayer;

  /** 操作の種類 */
  operations: string[];

  /** 説明 */
  description: string;

  /** 実装例 */
  examples?: string[];

  /** 注意事項 */
  warnings?: string[];
}

/**
 * データアクセスポリシー
 *
 * **基本原則**:
 * - IndexedDB: 既存機能の直接アクセス（変更なし）
 * - GraphQL: 新機能専用レイヤー（追加機能のみ）
 * - 禁止: GraphQL経由でIndexedDBアクセス（アーキテクチャ違反）
 */
export const DATA_ACCESS_POLICY: Record<string, DataAccessPolicyDefinition> = {
  // ========================================
  // IndexedDB直接アクセス（既存機能維持）
  // ========================================

  tasks_crud: {
    layer: 'indexeddb',
    operations: ['create', 'read', 'update', 'delete'],
    description: 'タスクのCRUD操作（既存実装を維持）',
    examples: [
      'useTasks() フックでのタスク作成・編集・削除',
      'TaskContext での状態管理',
      'オフライン操作のキューイング',
    ],
    warnings: [
      'GraphQL API経由でのタスクCRUDは使用しない',
      '既存のuseReducer + IndexedDBパターンを継続',
    ],
  },

  boards_crud: {
    layer: 'indexeddb',
    operations: ['create', 'read', 'update', 'delete'],
    description: 'ボードのCRUD操作（既存実装を維持）',
    examples: ['useBoards() フックでのボード管理', 'BoardContext での状態管理'],
  },

  labels_crud: {
    layer: 'indexeddb',
    operations: ['create', 'read', 'update', 'delete'],
    description: 'ラベルのCRUD操作（既存実装を維持）',
    examples: [
      'useLabelManagement() フックでのラベル管理',
      'LabelContext での状態管理',
    ],
  },

  offline_operations: {
    layer: 'indexeddb',
    operations: ['queue', 'sync', 'conflict_resolution'],
    description: 'オフライン操作のキューイングと同期',
    examples: ['ネットワーク切断時のCRUD操作', 'オンライン復帰時の自動同期'],
  },

  local_cache: {
    layer: 'indexeddb',
    operations: ['read', 'write'],
    description: 'ローカルキャッシュ管理',
    examples: [
      'Apollo Client InMemoryCacheとの連携',
      'パフォーマンス最適化のためのキャッシュ',
    ],
  },

  // ========================================
  // GraphQL API経由（新機能専用レイヤー）
  // ========================================

  ai_natural_language: {
    layer: 'graphql',
    operations: ['createTaskFromNaturalLanguage', 'breakdownTask'],
    description: 'AI自然言語タスク作成・分解機能',
    examples: [
      'mutation createTaskFromNaturalLanguage(query: "明日までにレポート")',
      'mutation breakdownTask(taskId: "task-1")',
    ],
    warnings: [
      'AI生成タスクはGraphQL経由で取得後、IndexedDBに保存',
      'DOMPurifyでサニタイズ必須（XSS対策）',
    ],
  },

  ai_recommendations: {
    layer: 'graphql',
    operations: ['aiSuggestedTasks', 'getNextRecommendedTask'],
    description: 'AIタスク推奨・次のタスク取得',
    examples: [
      'query aiSuggestedTasks(context: { boardId: "board-1" })',
      'query getNextRecommendedTask(userId: "user-1")',
    ],
  },

  todo_md_sync: {
    layer: 'graphql',
    operations: ['syncFileToApp', 'syncAppToFile', 'getTodoMdStatus'],
    description: 'TODO.md同期（MCP Tool経由のみ）',
    examples: [
      'mutation syncFileToApp(filePath: "./TODO.md")',
      'query getTodoMdStatus',
    ],
    warnings: [
      'TODO.md同期はフロントエンドUIからは使用しない（MCP専用）',
      'Claude Desktop（MCP）経由でのみ利用可能',
    ],
  },

  websocket_subscriptions: {
    layer: 'graphql',
    operations: ['taskCreated', 'taskUpdated', 'taskDeleted'],
    description: 'WebSocketリアルタイム通知',
    examples: [
      'subscription taskCreated(boardId: "board-1")',
      'subscription taskUpdated(taskId: "task-1")',
    ],
    warnings: [
      'WebSocket接続エラー時はIndexedDBフォールバック',
      '受信データは必ずIndexedDBに反映',
    ],
  },

  supabase_migration_prep: {
    layer: 'graphql',
    operations: ['importBoardsFromLocalStorage', 'exportBoardsToSupabase'],
    description: '将来のSupabase移行準備（Phase 8+）',
    examples: ['mutation importBoardsFromLocalStorage(boards: [...])'],
    warnings: [
      '現在は未実装（Week 6以降）',
      'localStorage全データを一括移行する用途',
    ],
  },

  // ========================================
  // 禁止事項（アーキテクチャ違反パターン）
  // ========================================

  graphql_to_indexeddb: {
    layer: 'forbidden',
    operations: ['direct_access'],
    description: 'GraphQL経由でIndexedDBに直接アクセス（禁止）',
    examples: [
      '❌ GraphQL Resolver内でIndexedDBを操作',
      '❌ Apollo Server内でブラウザのIndexedDBを参照',
    ],
    warnings: [
      '理由: Node.js（バックエンド）はブラウザのIndexedDBにアクセス不可',
      'アーキテクチャ的に不可能',
    ],
  },

  duplicate_data_management: {
    layer: 'forbidden',
    operations: ['dual_storage'],
    description: '同一データの二重管理（禁止）',
    examples: [
      '❌ TasksをIndexedDBとGraphQLの両方で管理',
      '❌ Boardsを両方のデータソースで持つ',
    ],
    warnings: [
      '理由: データ整合性の破綻リスク',
      'Single Source of Truth原則違反',
    ],
  },

  indexeddb_from_graphql_resolver: {
    layer: 'forbidden',
    operations: ['resolver_access'],
    description: 'GraphQL Resolver内でIndexedDBアクセス（禁止）',
    examples: ['❌ resolvers/task-resolvers.ts内でIndexedDB操作'],
    warnings: [
      'バックエンドはIndexedDBを知らない',
      '代わりにSupabase等のバックエンドDBを使用',
    ],
  },
};

/**
 * データアクセス層の検証
 *
 * 指定された操作がポリシーに準拠しているかチェックします。
 *
 * @param operation - 操作の識別子（例: 'tasks_crud', 'ai_natural_language'）
 * @param layer - 期待されるアクセス層
 * @returns ポリシー準拠の場合 true
 * @throws アクセス層が'forbidden'の場合エラー
 *
 * @example
 * ```typescript
 * // ✅ 正しい使用例
 * validateDataAccess('tasks_crud', 'indexeddb'); // true
 * validateDataAccess('ai_natural_language', 'graphql'); // true
 *
 * // ❌ 誤った使用例
 * validateDataAccess('graphql_to_indexeddb', 'graphql'); // throws Error
 * ```
 */
export function validateDataAccess(
  operation: string,
  layer: DataAccessLayer
): boolean {
  const policy = DATA_ACCESS_POLICY[operation];

  if (!policy) {
    console.warn(`[DataAccessPolicy] Unknown operation: ${operation}`);
    return false;
  }

  if (policy.layer === 'forbidden') {
    throw new Error(
      `[DataAccessPolicy] Forbidden operation: ${operation}\n` +
        `Description: ${policy.description}\n` +
        `Warnings: ${policy.warnings?.join(', ')}`
    );
  }

  if (policy.layer !== layer) {
    console.warn(
      `[DataAccessPolicy] Layer mismatch for operation: ${operation}\n` +
        `Expected: ${policy.layer}, Got: ${layer}`
    );
    return false;
  }

  return true;
}

/**
 * 操作種別の型安全な定義
 */
export const OPERATION_KEYS = {
  // IndexedDB operations
  TASKS_CRUD: 'tasks_crud',
  BOARDS_CRUD: 'boards_crud',
  LABELS_CRUD: 'labels_crud',
  OFFLINE_OPERATIONS: 'offline_operations',
  LOCAL_CACHE: 'local_cache',

  // GraphQL operations
  AI_NATURAL_LANGUAGE: 'ai_natural_language',
  AI_RECOMMENDATIONS: 'ai_recommendations',
  TODO_MD_SYNC: 'todo_md_sync',
  WEBSOCKET_SUBSCRIPTIONS: 'websocket_subscriptions',
  SUPABASE_MIGRATION_PREP: 'supabase_migration_prep',

  // Forbidden operations
  GRAPHQL_TO_INDEXEDDB: 'graphql_to_indexeddb',
  DUPLICATE_DATA_MANAGEMENT: 'duplicate_data_management',
  INDEXEDDB_FROM_GRAPHQL_RESOLVER: 'indexeddb_from_graphql_resolver',
} as const;

export type OperationKey = (typeof OPERATION_KEYS)[keyof typeof OPERATION_KEYS];

/**
 * ポリシーサマリーの取得
 *
 * 開発者向けにポリシー概要を表示します。
 */
export function getPolicySummary(): void {
  console.group('📋 Data Access Policy Summary');

  console.group('✅ IndexedDB Direct Access (Existing)');
  Object.entries(DATA_ACCESS_POLICY)
    .filter(([_, policy]) => policy.layer === 'indexeddb')
    .forEach(([key, policy]) => {
      console.log(`- ${key}: ${policy.description}`);
    });
  console.groupEnd();

  console.group('🚀 GraphQL API (New Features)');
  Object.entries(DATA_ACCESS_POLICY)
    .filter(([_, policy]) => policy.layer === 'graphql')
    .forEach(([key, policy]) => {
      console.log(`- ${key}: ${policy.description}`);
    });
  console.groupEnd();

  console.group('❌ Forbidden Operations');
  Object.entries(DATA_ACCESS_POLICY)
    .filter(([_, policy]) => policy.layer === 'forbidden')
    .forEach(([key, policy]) => {
      console.log(`- ${key}: ${policy.description}`);
    });
  console.groupEnd();

  console.groupEnd();
}

/**
 * 使用例とベストプラクティス
 *
 * @example
 * ```typescript
 * // ✅ 正しい使用パターン
 *
 * // 1. IndexedDB直接アクセス（既存機能）
 * import { useTasks } from '@/hooks/useTasks';
 * const { tasks, addTask, updateTask } = useTasks();
 * await addTask({ title: 'New Task' }); // IndexedDB直接書き込み
 *
 * // 2. GraphQL API（新機能）
 * import { useMutation } from '@apollo/client';
 * import { CREATE_TASK_FROM_NL } from '@/graphql/mutations';
 * const [createTask] = useMutation(CREATE_TASK_FROM_NL);
 * const result = await createTask({ variables: { query: '明日までにレポート' } });
 * // 結果をIndexedDBに保存
 * await addTask(result.data.createTaskFromNaturalLanguage);
 *
 * // 3. WebSocket Subscriptions
 * import { useSubscription } from '@apollo/client';
 * import { TASK_CREATED } from '@/graphql/subscriptions';
 * useSubscription(TASK_CREATED, {
 *   onData: ({ data }) => {
 *     // IndexedDBに反映
 *     addTask(data.taskCreated);
 *   }
 * });
 *
 * // ❌ 避けるべきパターン
 *
 * // 1. GraphQL経由でのCRUD操作（既存機能はIndexedDB直接）
 * const [updateTaskMutation] = useMutation(UPDATE_TASK); // ❌ 使わない
 * await updateTask({ id: 'task-1', title: 'Updated' }); // ✅ IndexedDB直接
 *
 * // 2. データの二重管理
 * // ❌ 両方で同じタスクを管理しない
 * await addTask({ ... }); // IndexedDB
 * await createTaskMutation({ ... }); // GraphQL ← 二重管理になる
 * ```
 */
