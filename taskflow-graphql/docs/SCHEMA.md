# TaskFlow GraphQL Schema Documentation

> **Version**: 1.0.0
> **Created**: 2025-11-08
> **Status**: Week 1 Day 1-2 Implementation

## 📋 概要

TaskFlowのGraphQL APIスキーマドキュメント。型安全で柔軟なデータアクセスレイヤーを提供し、すべてのAI統合機能の基盤となります。

## 🎯 設計原則

### 1. 型安全性
- すべてのフィールドに明示的な型定義
- Non-nullableフィールドの適切な使用
- カスタムスカラー型（DateTime, JSON）の活用

### 2. 柔軟性
- フィルタリング・ソート・ページネーション対応
- 複数の検索パターン（ID, status, priority, labels, due date, text search）
- バッチ操作サポート

### 3. AI統合最適化
- AI-specific queries/mutations
- 計算フィールド（isOverdue, completionPercentage）
- 自然言語検索インターフェース

### 4. リアルタイム対応
- GraphQL Subscriptions（WebSocket）
- Webhook統合のためのイベント駆動

## 📊 スキーマ構造

### Core Types（6種類）

#### Task
```graphql
type Task {
  id: ID!
  boardId: ID!
  columnId: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: Priority!
  dueDate: DateTime
  dueTime: String
  labels: [Label!]!
  subtasks: [SubTask!]!
  files: [Attachment!]!
  recurrence: RecurrenceConfig
  position: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
  completedAt: DateTime
  deletedAt: DateTime

  # Computed fields
  isOverdue: Boolean!
  completionPercentage: Float!
  estimatedDuration: Int
}
```

**主要機能**:
- ソフトデリート対応（deletedAt）
- 繰り返しタスク（recurrence）
- サブタスク・ファイル添付
- 計算フィールド（isOverdue等）

#### Board
```graphql
type Board {
  id: ID!
  name: String!
  description: String
  columns: [BoardColumn!]!
  settings: BoardSettings!
  isShared: Boolean!
  taskCount: Int!
  completedTaskCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

**主要機能**:
- カスタムカラム管理
- ボード設定（デフォルトカラム等）
- タスク統計（taskCount, completedTaskCount）

#### Label
```graphql
type Label {
  id: ID!
  name: String!
  color: String!
  boardId: ID        # null = グローバルラベル
  taskCount: Int!
  createdAt: DateTime!
}
```

**主要機能**:
- ボード固有 or グローバルラベル
- カラーコード管理
- 使用統計（taskCount）

#### Template
```graphql
type Template {
  id: ID!
  name: String!
  category: String
  taskTemplate: TaskTemplateData!
  isFavorite: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

**主要機能**:
- タスクテンプレート保存
- カテゴリー分類
- お気に入り機能

### Enums（5種類）

```graphql
enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  DELETED
}

enum Priority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum RecurrencePattern {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}

enum BreakdownStrategy {
  BY_FEATURE
  BY_PHASE
  BY_COMPONENT
  BY_COMPLEXITY
}

enum SuggestionType {
  BREAKDOWN_RECOMMENDED
  PRIORITY_ADJUSTMENT
  RELATED_TASKS
  NEXT_TASK
  DEADLINE_ALERT
}
```

### Scalar Types（2種類）

```graphql
scalar DateTime   # ISO 8601形式（例: "2025-11-08T10:30:00Z"）
scalar JSON       # 任意のJSON data
```

## 🔍 Query Operations

### Task Queries

#### task(id: ID!): Task
```graphql
query GetTask {
  task(id: "task-uuid") {
    id
    title
    description
    status
    priority
    dueDate
    labels {
      name
      color
    }
    subtasks {
      title
      completed
    }
    isOverdue
    completionPercentage
  }
}
```

#### tasks(...): [Task!]!
```graphql
query SearchTasks {
  tasks(
    boardId: "board-uuid"
    status: TODO
    priority: HIGH
    labels: ["urgent", "bug"]
    dueBefore: "2025-11-15T00:00:00Z"
    search: "authentication"
    limit: 20
    offset: 0
  ) {
    id
    title
    priority
    dueDate
    isOverdue
  }
}
```

**フィルタリングオプション**:
- `boardId`: ボードID
- `status`: TaskStatus enum
- `priority`: Priority enum
- `labels`: ラベルID配列
- `dueBefore/dueAfter`: 期限範囲
- `search`: title/description全文検索
- `limit/offset`: ページネーション

### Board Queries

#### boards: [Board!]!
```graphql
query GetBoards {
  boards {
    id
    name
    description
    taskCount
    completedTaskCount
    columns {
      id
      title
      taskCount
    }
  }
}
```

### Statistics Queries

#### taskStatistics(boardId: ID): TaskStatistics!
```graphql
query GetStatistics {
  taskStatistics(boardId: "board-uuid") {
    total
    byStatus {
      todo
      inProgress
      completed
      deleted
    }
    byPriority {
      critical
      high
      medium
      low
    }
    completionRate
    overdueCount
    averageCompletionTime
  }
}
```

### AI-Optimized Queries

#### nextRecommendedTask(boardId: ID!): Task
```graphql
query GetNextTask {
  nextRecommendedTask(boardId: "board-uuid") {
    id
    title
    priority
    dueDate
  }
}
```

**アルゴリズム**:
1. 優先度順（CRITICAL → HIGH → MEDIUM → LOW）
2. 期限順（近い順）
3. 作成日順

## ✏️ Mutation Operations

### Task Mutations

#### createTask(input: CreateTaskInput!): Task!
```graphql
mutation CreateTask {
  createTask(input: {
    boardId: "board-uuid"
    columnId: "col-uuid"
    title: "Implement authentication"
    description: "Add JWT authentication"
    priority: HIGH
    dueDate: "2025-11-15T23:59:00Z"
    labels: ["feature", "backend"]
    subtasks: [
      { title: "Design auth flow", position: 0 },
      { title: "Implement JWT", position: 1 },
      { title: "Add tests", position: 2 }
    ]
  }) {
    id
    title
    status
    createdAt
  }
}
```

#### updateTask(id: ID!, input: UpdateTaskInput!): Task!
```graphql
mutation UpdateTask {
  updateTask(
    id: "task-uuid"
    input: {
      status: IN_PROGRESS
      priority: CRITICAL
    }
  ) {
    id
    status
    priority
    updatedAt
  }
}
```

#### deleteTask(id: ID!): Boolean!
```graphql
mutation DeleteTask {
  deleteTask(id: "task-uuid")
}
```

**Note**: Soft delete（deletedAt設定）

### Batch Mutations

#### createTasks(inputs: [CreateTaskInput!]!): [Task!]!
```graphql
mutation CreateMultipleTasks {
  createTasks(inputs: [
    { boardId: "board-uuid", columnId: "col-uuid", title: "Task 1" },
    { boardId: "board-uuid", columnId: "col-uuid", title: "Task 2" },
    { boardId: "board-uuid", columnId: "col-uuid", title: "Task 3" }
  ]) {
    id
    title
  }
}
```

### AI-Driven Mutations

#### breakdownTask(taskId: ID!, strategy: BreakdownStrategy): [Task!]!
```graphql
mutation BreakdownTask {
  breakdownTask(
    taskId: "task-uuid"
    strategy: BY_FEATURE
  ) {
    id
    title
    description
  }
}
```

**分解戦略**:
- `BY_FEATURE`: 機能別分解
- `BY_PHASE`: フェーズ別分解
- `BY_COMPONENT`: コンポーネント別分解
- `BY_COMPLEXITY`: 複雑度別分解

## 📡 Subscription Operations

### Task Subscriptions

#### taskCreated(boardId: ID): Task!
```graphql
subscription OnTaskCreated {
  taskCreated(boardId: "board-uuid") {
    id
    title
    status
    priority
    createdAt
  }
}
```

#### taskUpdated(boardId: ID): Task!
```graphql
subscription OnTaskUpdated {
  taskUpdated {
    id
    title
    status
    updatedAt
  }
}
```

#### taskCompleted(boardId: ID): Task!
```graphql
subscription OnTaskCompleted {
  taskCompleted {
    id
    title
    completedAt
  }
}
```

### AI Suggestion Subscriptions

#### aiSuggestionAvailable(boardId: ID!): AISuggestion!
```graphql
subscription OnAISuggestion {
  aiSuggestionAvailable(boardId: "board-uuid") {
    type
    message
    confidence
    task {
      id
      title
    }
    actions {
      type
      description
      parameters
    }
  }
}
```

**Suggestion Types**:
- `BREAKDOWN_RECOMMENDED`: タスク分解推奨
- `PRIORITY_ADJUSTMENT`: 優先度調整推奨
- `RELATED_TASKS`: 関連タスク表示
- `NEXT_TASK`: 次のタスク推奨
- `DEADLINE_ALERT`: 期限アラート

## 🔐 セキュリティ考慮事項

### Input Validation
- すべてのInput typeでバリデーション実施
- 文字列長制限（title: 200文字, description: 5000文字）
- ファイルサイズ制限（5MB）

### Rate Limiting
```typescript
// Resolver level rate limiting
const rateLimiter = new RateLimiterMemory({
  points: 100,    // 100 requests
  duration: 60,   // per minute
});
```

### Authentication（将来実装）
```graphql
type Query {
  # Requires authentication
  tasks: [Task!]! @auth
  boards: [Board!]! @auth
}
```

## 📈 パフォーマンス最適化

### DataLoader Pattern
```typescript
const labelLoader = new DataLoader(async (labelIds) => {
  return await fetchLabelsByIds(labelIds);
});

// Usage in resolver
const task = {
  labels: () => labelLoader.loadMany(task.labelIds)
};
```

### Query Complexity Limits
```typescript
const complexityLimit = createComplexityLimitRule(1000);
// Prevents overly complex queries
```

### Pagination
```graphql
query GetTasks {
  tasks(
    limit: 20
    offset: 0
  ) {
    id
    title
  }
}
```

## 🧪 テスト戦略

### Unit Tests
```typescript
describe('Task Queries', () => {
  it('should return task by ID', async () => {
    const result = await executeQuery(GET_TASK, { id: 'test-id' });
    expect(result.data.task).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('Task Mutations', () => {
  it('should create task successfully', async () => {
    const result = await executeMutation(CREATE_TASK, { input });
    expect(result.data.createTask.id).toBeTruthy();
  });
});
```

## 📊 使用統計（計画）

### Query Distribution
```
tasks:               45%
taskStatistics:      20%
boards:              15%
labels:              10%
nextRecommendedTask:  5%
Others:               5%
```

### Performance Targets
```
Simple queries:      < 50ms
Complex queries:     < 100ms
Mutations:           < 100ms
Subscriptions:       < 100ms (event delivery)
```

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-08 | Initial schema design |

## 📚 References

- [GraphQL Specification](https://spec.graphql.org/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [Best Practices](https://graphql.org/learn/best-practices/)

---

**Next Steps**:
- Week 1 Day 3-4: Apollo Server構築
- Week 1 Day 5-7: Resolvers実装
