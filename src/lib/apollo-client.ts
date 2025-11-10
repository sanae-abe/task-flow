/**
 * Apollo Client Configuration
 *
 * GraphQL統合のためのApollo Client設定。
 * データアクセスポリシーに基づき、以下の機能を提供：
 * - 認証ヘッダー送信（x-user-plan, x-user-id）
 * - InMemoryCache設定（Task/Board typePolicies）
 * - fetchPolicy設定（cache-and-network, network-only）
 *
 * @see /Users/sanae.abe/workspace/taskflow-app/src/lib/data-access-policy.ts
 * @see /Users/sanae.abe/workspace/taskflow-app/docs/BACKEND_COORDINATION_RESPONSE.md
 */

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

/**
 * GraphQL APIエンドポイント
 * 開発環境: http://localhost:4000/graphql
 * 本番環境: 環境変数で指定
 */
const GRAPHQL_URL =
  import.meta.env['VITE_GRAPHQL_URL'] || 'http://localhost:4000/graphql';

/**
 * 認証ヘッダーリンク
 *
 * バックエンドBE-1完了後に有効化される暫定認証システム。
 * ヘッダーベース認証（x-user-plan, x-user-id）を送信。
 */
const authLink = setContext((_, { headers }) => {
  // LocalStorageから認証情報を取得（暫定運用）
  const userPlan = localStorage.getItem('userPlan') || 'free';
  const userId = localStorage.getItem('userId') || 'anonymous';

  return {
    headers: {
      ...headers,
      'x-user-plan': userPlan,
      'x-user-id': userId,
    },
  };
});

/**
 * HTTP Link設定
 *
 * GraphQL APIへのHTTP接続を確立。
 */
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
});

/**
 * エラーハンドリングリンク
 *
 * GraphQLエラー・ネットワークエラーを処理し、
 * 適切なフォールバック処理を実行。
 */
const errorLink = onError((errorResponse: any) => {
  const { graphQLErrors, networkError } = errorResponse;

  if (graphQLErrors) {
    graphQLErrors.forEach((error: any) => {
      const { message, locations, path } = error;
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // ネットワークエラー時はIndexedDBフォールバック
    // （各hookで実装）
  }
});

/**
 * InMemoryCache設定
 *
 * Task/Board typePoliciesを定義し、キャッシュ動作を最適化。
 *
 * 重要: GraphQL経由で取得したデータは必ずIndexedDBに反映する。
 * @see /Users/sanae.abe/workspace/taskflow-app/src/lib/data-access-policy.ts
 */
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // AI推奨タスクはキャッシュしない（常に最新を取得）
        aiSuggestedTasks: {
          keyArgs: false,
          merge: false,
        },
        getNextRecommendedTask: {
          keyArgs: false,
          merge: false,
        },
      },
    },
    Task: {
      keyFields: ['id'],
      fields: {
        // タスクフィールドのマージ戦略
        subTasks: {
          merge: (_existing = [], incoming) => incoming,
        },
        labels: {
          merge: (_existing = [], incoming) => incoming,
        },
        files: {
          merge: (_existing = [], incoming) => incoming,
        },
      },
    },
    Board: {
      keyFields: ['id'],
      fields: {
        // ボードフィールドのマージ戦略
        columns: {
          merge: (_existing = [], incoming) => incoming,
        },
        labels: {
          merge: (_existing = [], incoming) => incoming,
        },
      },
    },
  },
});

/**
 * Apollo Client インスタンス
 *
 * 認証・エラーハンドリング・キャッシュを統合した
 * 本番環境対応のGraphQLクライアント。
 */
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      // GraphQL経由データは常に最新を取得しつつキャッシュ活用
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      // AI機能など一部クエリはネットワーク優先
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

/**
 * 使用例
 *
 * @example
 * ```typescript
 * // AI自然言語タスク作成
 * import { useMutation } from '@apollo/client';
 * import { CREATE_TASK_FROM_NL } from '@/graphql/mutations';
 *
 * const [createTask] = useMutation(CREATE_TASK_FROM_NL);
 * const result = await createTask({
 *   variables: { query: '明日までにレポート' }
 * });
 *
 * // 結果をIndexedDBに保存（データアクセスポリシー準拠）
 * await addTask(result.data.createTaskFromNaturalLanguage);
 * ```
 *
 * @example
 * ```typescript
 * // AI推奨タスク取得
 * import { useQuery } from '@apollo/client';
 * import { AI_SUGGESTED_TASKS } from '@/graphql/queries';
 *
 * const { data, loading, error } = useQuery(AI_SUGGESTED_TASKS, {
 *   variables: { context: { boardId: 'board-1' } }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // WebSocket Subscriptions（リアルタイム通知）
 * import { useSubscription } from '@apollo/client';
 * import { TASK_CREATED } from '@/graphql/subscriptions';
 *
 * useSubscription(TASK_CREATED, {
 *   onData: ({ data }) => {
 *     // IndexedDBに反映（データアクセスポリシー準拠）
 *     addTask(data.taskCreated);
 *   }
 * });
 * ```
 */
