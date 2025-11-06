# 🎨 コンポーネント開発ガイド

TaskFlowでのコンポーネント設計・開発のベストプラクティスとガイドラインです。

## 🏗️ コンポーネント設計原則

### 1. Single Responsibility Principle

各コンポーネントは単一の責任を持ち、明確な目的を果たす

```typescript
// ✅ Good: 明確な責任分離
const TaskCard = ({ task }: { task: Task }) => {
  /* タスク表示のみ */
};
const TaskEditor = ({ task }: { task: Task }) => {
  /* タスク編集のみ */
};

// ❌ Bad: 複数の責任が混在
const TaskComponent = ({ task, isEditing }: Props) => {
  /* 表示と編集が混在 */
};
```

### 2. Composition over Inheritance

継承よりも合成を優先し、柔軟な組み合わせを可能にする

```typescript
// ✅ Good: コンポーネント合成
<UnifiedDialog>
  <DialogHeader title="タスク編集" />
  <TaskEditForm task={task} />
  <DialogActions onSave={handleSave} onCancel={handleCancel} />
</UnifiedDialog>
```

### 3. Props Interface Design

明確で型安全なプロップス設計

```typescript
interface TaskCardProps {
  // 必須プロパティ
  task: Task;

  // オプショナル（デフォルト値あり）
  variant?: 'compact' | 'detailed';
  showActions?: boolean;

  // イベントハンドラー
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;

  // スタイリング
  className?: string;
}
```

## 📁 ファイル構造・命名規則

### ディレクトリ構造

```
src/components/ComponentName/
├── index.ts                    # エクスポート統一
├── ComponentName.tsx           # メインコンポーネント
├── ComponentName.types.ts      # 型定義
├── ComponentName.test.tsx      # テスト
├── components/                 # サブコンポーネント
│   ├── SubComponent.tsx
│   └── AnotherSubComponent.tsx
├── hooks/                      # 専用フック
│   ├── useComponentLogic.ts
│   └── useComponentState.ts
└── utils/                      # ユーティリティ
    └── componentHelpers.ts
```

### 命名規則

- **コンポーネント**: PascalCase (`TaskCard`, `SubTaskItem`)
- **ファイル**: コンポーネント名と同一 (`TaskCard.tsx`)
- **フック**: camelCase + `use` prefix (`useTaskFilters`)
- **型定義**: コンポーネント名 + `Props`/`State` (`TaskCardProps`)

## 🎯 コンポーネント分類・パターン

### 1. Presentational Components（表示専用）

```typescript
interface TaskCardProps {
  task: Task
  className?: string
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, className }) => {
  return (
    <Card className={cn("task-card", className)}>
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{task.description}</p>
        <PriorityBadge priority={task.priority} />
      </CardContent>
    </Card>
  )
}
```

### 2. Container Components（ロジック統合）

```typescript
export const TaskCardContainer: React.FC<{ taskId: string }> = ({ taskId }) => {
  // Custom Hooksでロジック分離
  const { task, isLoading } = useTask(taskId)
  const { editTask, deleteTask } = useTaskActions()

  if (isLoading) return <TaskCardSkeleton />

  return (
    <TaskCard
      task={task}
      onEdit={editTask}
      onDelete={deleteTask}
    />
  )
}
```

### 3. Compound Components（合成パターン）

```typescript
// 親コンポーネント
export const TaskDialog = ({ children }: { children: React.ReactNode }) => {
  return <UnifiedDialog>{children}</UnifiedDialog>
}

// サブコンポーネント
TaskDialog.Header = DialogHeader
TaskDialog.Content = DialogContent
TaskDialog.Actions = DialogActions

// 使用例
<TaskDialog>
  <TaskDialog.Header title="タスク詳細" />
  <TaskDialog.Content>
    <TaskEditForm task={task} />
  </TaskDialog.Content>
  <TaskDialog.Actions onSave={handleSave} />
</TaskDialog>
```

## 🎨 スタイリングガイドライン

### Tailwind CSS活用

```typescript
// ✅ Good: cn()関数でクラス統合
import { cn } from '@/lib/utils'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        // ベースクラス
        "font-medium rounded-md transition-colors",
        // バリアント
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
        },
        // サイズ
        {
          'px-2 py-1 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        // 外部からのクラス
        className
      )}
      {...props}
    />
  )
}
```

### Shadcn/UIコンポーネント拡張

```typescript
// ✅ Good: Shadcn/UIベースの拡張
import { Button as ShadcnButton } from '@/components/ui/button'

interface TaskActionButtonProps {
  action: 'edit' | 'delete' | 'duplicate'
  task: Task
  onAction: (action: string, task: Task) => void
}

export const TaskActionButton: React.FC<TaskActionButtonProps> = ({
  action,
  task,
  onAction
}) => {
  const config = {
    edit: { icon: Edit, variant: 'outline' as const, label: '編集' },
    delete: { icon: Trash, variant: 'destructive' as const, label: '削除' },
    duplicate: { icon: Copy, variant: 'ghost' as const, label: '複製' }
  }

  const { icon: Icon, variant, label } = config[action]

  return (
    <ShadcnButton
      variant={variant}
      size="sm"
      onClick={() => onAction(action, task)}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </ShadcnButton>
  )
}
```

## 🔧 カスタムフック設計

### 1. ロジック抽象化

```typescript
// hooks/useTaskActions.ts
export const useTaskActions = () => {
  const { updateTask, deleteTask } = useContext(TasksContext);
  const { addNotification } = useNotifications();

  const editTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      try {
        await updateTask(taskId, updates);
        addNotification('タスクを更新しました', 'success');
      } catch (error) {
        addNotification('更新に失敗しました', 'error');
        throw error;
      }
    },
    [updateTask, addNotification]
  );

  return { editTask, deleteTask };
};
```

### 2. 状態管理統合

```typescript
// hooks/useTaskFilters.ts
export const useTaskFilters = () => {
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    labels: [],
    search: '',
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.search && !task.title.includes(filters.search)) return false;
      if (filters.status.length && !filters.status.includes(task.status)) return false;
      if (filters.priority.length && !filters.priority.includes(task.priority)) return false;
      return true;
    });
  }, [tasks, filters]);

  return { filters, setFilters, filteredTasks };
};
```

## 🧪 テスト戦略

### 1. コンポーネントテスト

```typescript
// TaskCard.test.tsx
import { render, screen } from '@testing-library/react'
import { TaskCard } from './TaskCard'
import { mockTask } from '@/test/mocks'

describe('TaskCard', () => {
  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} />)

    expect(screen.getByText(mockTask.title)).toBeInTheDocument()
    expect(screen.getByText(mockTask.description)).toBeInTheDocument()
  })

  it('handles edit action', async () => {
    const onEdit = jest.fn()
    render(<TaskCard task={mockTask} onEdit={onEdit} />)

    await user.click(screen.getByRole('button', { name: /編集/ }))
    expect(onEdit).toHaveBeenCalledWith(mockTask)
  })
})
```

### 2. フックテスト

```typescript
// useTaskActions.test.ts
import { renderHook, act } from '@testing-library/react';
import { useTaskActions } from './useTaskActions';

describe('useTaskActions', () => {
  it('updates task successfully', async () => {
    const { result } = renderHook(() => useTaskActions());

    await act(async () => {
      await result.current.editTask('task-1', { title: 'Updated Task' });
    });

    // アサーション
  });
});
```

## 🔍 パフォーマンス最適化

### 1. メモ化戦略

```typescript
// ✅ Good: 適切なメモ化
const TaskList = React.memo<TaskListProps>(({ tasks, onTaskUpdate }) => {
  const sortedTasks = useMemo(() =>
    tasks.sort((a, b) => a.priority.localeCompare(b.priority)),
    [tasks]
  )

  const handleTaskUpdate = useCallback((taskId: string, updates: Partial<Task>) => {
    onTaskUpdate(taskId, updates)
  }, [onTaskUpdate])

  return (
    <div>
      {sortedTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={handleTaskUpdate}
        />
      ))}
    </div>
  )
})
```

### 2. 遅延読み込み

```typescript
// ✅ Good: コンポーネント遅延読み込み
const RichTextEditor = React.lazy(() =>
  import('./RichTextEditor').then(module => ({ default: module.RichTextEditor }))
)

const TaskEditDialog = () => {
  return (
    <Dialog>
      <DialogContent>
        <React.Suspense fallback={<EditorSkeleton />}>
          <RichTextEditor />
        </React.Suspense>
      </DialogContent>
    </Dialog>
  )
}
```

## 🔧 デバッグ・開発ツール

### 1. React DevTools活用

```typescript
// デバッグ用プロパティ
const TaskCard = ({ task }: TaskCardProps) => {
  // Development only
  useDebugValue(task.id, taskId => `Task: ${task.title} (${taskId})`)

  return <Card>...</Card>
}
```

### 2. エラーバウンダリ

```typescript
export const TaskErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={<TaskErrorFallback />}
      onError={(error) => console.error('Task component error:', error)}
    >
      {children}
    </ErrorBoundary>
  )
}
```

## 📋 チェックリスト

### コンポーネント作成前

- [ ] 単一責任原則を満たしているか
- [ ] 既存コンポーネントで再利用可能か
- [ ] Propsインターフェースが明確か
- [ ] 型安全性が確保されているか

### 実装中

- [ ] Shadcn/UIコンポーネントを活用しているか
- [ ] cn()関数でクラス統合しているか
- [ ] 適切なメモ化を行っているか
- [ ] エラーハンドリングを実装しているか

### 実装後

- [ ] テストケースを作成したか
- [ ] アクセシビリティを確認したか
- [ ] パフォーマンスを検証したか
- [ ] ドキュメントを更新したか

---

💡 **Pro Tip**: 新しいコンポーネントを作成する際は、まず既存の類似コンポーネントを参考にして、統一性を保ちましょう！
