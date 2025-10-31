# 🔄 データフロー・状態管理詳細

TaskFlowアプリケーションのデータフロー、状態管理パターン、Context APIの実装詳細について説明します。

## 🎯 状態管理アーキテクチャ

### 全体構造
```
┌─────────────────────────────────────────────┐
│                App.tsx                      │
├─────────────────────────────────────────────┤
│  ├── TasksContextProvider                   │
│  ├── BoardsContextProvider                  │
│  ├── SettingsContextProvider                │
│  ├── NotificationContextProvider            │
│  └── LabelsContextProvider                  │
└─────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│            Component Tree                   │
│  ├── Header                                 │
│  ├── BoardSelector                          │
│  ├── ViewContainer                          │
│  │   ├── KanbanBoard                        │
│  │   ├── TableView                          │
│  │   └── CalendarView                       │
│  └── Dialogs                                │
└─────────────────────────────────────────────┘
```

## 🗂️ Context構造詳細

### 1. TasksContext（タスクデータ管理）

#### State定義
```typescript
interface TasksState {
  tasks: Task[]                    // 全タスクデータ
  loading: boolean                 // ローディング状態
  error: string | null             // エラー状態
  lastUpdated: Date                // 最終更新日時
}

interface TasksContextValue {
  // State
  ...TasksState

  // Actions
  addTask: (task: Task) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  restoreTask: (id: string) => Promise<void>
  duplicateTask: (id: string) => Promise<void>

  // Queries
  getTask: (id: string) => Task | undefined
  getTasksByStatus: (status: TaskStatus) => Task[]
  getTasksByBoard: (boardId: string) => Task[]
  getDeletedTasks: () => Task[]

  // Computed
  activeTasks: Task[]              // isDeleted = false
  completedTasks: Task[]           // status = 'done'
  overdueTasks: Task[]             // dueDate < now
}
```

#### 実装例
```typescript
// contexts/TasksContext.tsx
const TasksContext = createContext<TasksContextValue | undefined>(undefined)

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TasksState>({
    tasks: [],
    loading: false,
    error: null,
    lastUpdated: new Date()
  })

  // localStorage統合
  useEffect(() => {
    const loadTasks = async () => {
      setState(prev => ({ ...prev, loading: true }))
      try {
        const stored = localStorage.getItem('taskflow-tasks')
        const tasks = stored ? JSON.parse(stored) : []
        setState(prev => ({
          ...prev,
          tasks: tasks.map(deserializeTask),
          loading: false
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'タスクの読み込みに失敗しました',
          loading: false
        }))
      }
    }

    loadTasks()
  }, [])

  // タスク追加
  const addTask = useCallback(async (task: Task) => {
    setState(prev => {
      const newTasks = [...prev.tasks, task]
      localStorage.setItem('taskflow-tasks', JSON.stringify(newTasks.map(serializeTask)))
      return {
        ...prev,
        tasks: newTasks,
        lastUpdated: new Date()
      }
    })
  }, [])

  // その他のアクション実装...

  const value: TasksContextValue = {
    ...state,
    addTask,
    updateTask,
    deleteTask,
    // ... other methods
    activeTasks: state.tasks.filter(t => !t.isDeleted),
    completedTasks: state.tasks.filter(t => t.status === 'done'),
    overdueTasks: state.tasks.filter(t => t.dueDate && t.dueDate < new Date())
  }

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}
```

### 2. BoardsContext（ボード管理）

#### State定義
```typescript
interface BoardsState {
  boards: Board[]
  currentBoardId: string | null
  loading: boolean
  error: string | null
}

interface BoardsContextValue {
  ...BoardsState

  // Actions
  createBoard: (board: Omit<Board, 'id'>) => Promise<void>
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>
  deleteBoard: (id: string) => Promise<void>
  switchBoard: (boardId: string) => void

  // Queries
  currentBoard: Board | undefined
  getBoard: (id: string) => Board | undefined
}
```

### 3. SettingsContext（アプリケーション設定）

#### State定義
```typescript
interface SettingsState {
  // UI設定
  theme: 'light' | 'dark' | 'system'
  language: 'ja' | 'en'

  // カンバン設定
  defaultColumns: Column[]
  showCompletedTasks: boolean

  // テーブル設定
  visibleColumns: string[]
  defaultSort: SortConfig

  // ごみ箱設定
  autoDeleteDays: number
  confirmPermanentDelete: boolean

  // 通知設定
  enableNotifications: boolean
  dueDateReminders: boolean
}

interface SettingsContextValue {
  ...SettingsState

  updateSettings: (updates: Partial<SettingsState>) => Promise<void>
  resetSettings: () => Promise<void>
}
```

### 4. NotificationContext（通知管理）

#### State定義
```typescript
interface NotificationState {
  notifications: Notification[]
  maxNotifications: number
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  createdAt: Date
}

interface NotificationContextValue {
  ...NotificationState

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}
```

## 🔄 データフロー詳細

### 1. ユニディレクショナルフロー

```
User Action → Component Event → Custom Hook → Context Action → State Update → Component Re-render
     ↓                                            ↓
  UI Event                              localStorage Persistence
```

### 2. タスク作成フロー例

```typescript
// 1. UI Component
const TaskCreateDialog = () => {
  const { addTask } = useTasks()
  const { addNotification } = useNotifications()

  const handleSubmit = async (formData: TaskFormData) => {
    try {
      const newTask = createTaskFromFormData(formData)
      await addTask(newTask)  // → Context Action
      addNotification({
        type: 'success',
        title: 'タスクを作成しました'
      })
      closeDialog()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'タスクの作成に失敗しました'
      })
    }
  }
}

// 2. Custom Hook
const useTasks = () => {
  const context = useContext(TasksContext)
  if (!context) throw new Error('TasksProvider required')
  return context
}

// 3. Context Action
const addTask = useCallback(async (task: Task) => {
  // Optimistic Update
  setState(prev => ({
    ...prev,
    tasks: [...prev.tasks, task]
  }))

  try {
    // Persistence
    await saveTaskToStorage(task)

    // 繰り返し設定があれば次回タスクをスケジュール
    if (task.recurrence) {
      scheduleNextRecurringTask(task)
    }
  } catch (error) {
    // Rollback on error
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== task.id),
      error: 'タスクの保存に失敗しました'
    }))
    throw error
  }
}, [])
```

### 3. ドラッグ&ドロップフロー

```typescript
// KanbanBoard.tsx
const handleDragEnd = async (result: DropResult) => {
  const { source, destination, draggableId } = result

  if (!destination) return

  // 1. Optimistic Update (即座にUIを更新)
  const updatedTasks = reorderTasks(tasks, source, destination)

  // 2. Context Update
  const newStatus = getColumnStatus(destination.droppableId)
  await updateTask(draggableId, {
    status: newStatus,
    order: destination.index
  })

  // 3. Side Effects
  if (newStatus === 'done') {
    // 完了処理：繰り返しタスクの次回作成など
    handleTaskCompletion(draggableId)
  }
}
```

## 🏗️ カスタムフック設計パターン

### 1. データアクセスフック

```typescript
// hooks/useTasks.ts
export const useTasks = () => {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider')
  }
  return context
}

// hooks/useTask.ts
export const useTask = (taskId: string) => {
  const { getTask } = useTasks()

  return useMemo(() => {
    const task = getTask(taskId)
    return {
      task,
      isLoading: !task,
      exists: !!task
    }
  }, [taskId, getTask])
}
```

### 2. 複合操作フック

```typescript
// hooks/useTaskActions.ts
export const useTaskActions = () => {
  const { updateTask, deleteTask, duplicateTask } = useTasks()
  const { addNotification } = useNotifications()

  const editTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates)
      addNotification({
        type: 'success',
        title: 'タスクを更新しました'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: '更新に失敗しました'
      })
      throw error
    }
  }, [updateTask, addNotification])

  const removeTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId)
      addNotification({
        type: 'success',
        title: 'タスクをごみ箱に移動しました'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: '削除に失敗しました'
      })
      throw error
    }
  }, [deleteTask, addNotification])

  return { editTask, removeTask, duplicateTask }
}
```

### 3. フィルタリング・ソートフック

```typescript
// hooks/useTaskFilters.ts
export const useTaskFilters = (initialFilters?: Partial<TaskFilters>) => {
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: [],
    priority: [],
    labels: [],
    dueDateRange: {},
    ...initialFilters
  })

  const { activeTasks } = useTasks()

  const filteredTasks = useMemo(() => {
    return activeTasks.filter(task => {
      // 検索フィルタ
      if (filters.search && !matchesSearch(task, filters.search)) return false

      // ステータスフィルタ
      if (filters.status.length && !filters.status.includes(task.status)) return false

      // 優先度フィルタ
      if (filters.priority.length && !filters.priority.includes(task.priority)) return false

      // ラベルフィルタ
      if (filters.labels.length && !hasMatchingLabel(task, filters.labels)) return false

      return true
    })
  }, [activeTasks, filters])

  const updateFilter = useCallback(<K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  return {
    filters,
    filteredTasks,
    updateFilter,
    clearFilters: () => setFilters({
      search: '',
      status: [],
      priority: [],
      labels: [],
      dueDateRange: {}
    })
  }
}
```

## 💾 データ永続化パターン

### 1. localStorage統合

```typescript
// utils/storage.ts
export const StorageManager = {
  // タスクデータの保存
  saveTasks: (tasks: Task[]) => {
    const serialized = tasks.map(serializeTask)
    localStorage.setItem('taskflow-tasks', JSON.stringify(serialized))
  },

  // タスクデータの読み込み
  loadTasks: (): Task[] => {
    try {
      const stored = localStorage.getItem('taskflow-tasks')
      if (!stored) return []

      const parsed = JSON.parse(stored)
      return parsed.map(deserializeTask)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      return []
    }
  },

  // 設定の保存・読み込み
  saveSettings: (settings: SettingsState) => {
    localStorage.setItem('taskflow-settings', JSON.stringify(settings))
  },

  loadSettings: (): Partial<SettingsState> => {
    try {
      const stored = localStorage.getItem('taskflow-settings')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to load settings:', error)
      return {}
    }
  }
}

// シリアライズ・デシリアライズ
const serializeTask = (task: Task): SerializedTask => ({
  ...task,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
  dueDate: task.dueDate?.toISOString(),
  completedAt: task.completedAt?.toISOString(),
  deletedAt: task.deletedAt?.toISOString()
})

const deserializeTask = (serialized: SerializedTask): Task => ({
  ...serialized,
  createdAt: new Date(serialized.createdAt),
  updatedAt: new Date(serialized.updatedAt),
  dueDate: serialized.dueDate ? new Date(serialized.dueDate) : undefined,
  completedAt: serialized.completedAt ? new Date(serialized.completedAt) : undefined,
  deletedAt: serialized.deletedAt ? new Date(serialized.deletedAt) : undefined
})
```

### 2. Optimistic Updates

```typescript
// 楽観的更新パターン
const updateTaskWithOptimisticUpdate = useCallback(async (
  taskId: string,
  updates: Partial<Task>
) => {
  // 1. 即座にUIを更新
  setState(prev => ({
    ...prev,
    tasks: prev.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    )
  }))

  try {
    // 2. 永続化
    await StorageManager.saveTasks(state.tasks)
  } catch (error) {
    // 3. エラー時はロールバック
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, ...originalTask } : task
      ),
      error: '更新に失敗しました'
    }))
    throw error
  }
}, [])
```

## 🔄 状態同期・整合性管理

### 1. 依存関係の管理

```typescript
// ボード削除時のタスク整合性
const deleteBoard = useCallback(async (boardId: string) => {
  // 1. 関連タスクを確認
  const relatedTasks = tasks.filter(task => task.boardId === boardId)

  if (relatedTasks.length > 0) {
    // 2. ユーザーに確認
    const confirmed = await confirmDialog({
      title: 'ボードを削除しますか？',
      message: `${relatedTasks.length}個のタスクも削除されます。`
    })

    if (!confirmed) return
  }

  // 3. 関連データの削除
  await Promise.all([
    // タスクの削除
    ...relatedTasks.map(task => deleteTask(task.id)),
    // ボードの削除
    removeBoardFromStorage(boardId)
  ])
}, [tasks, deleteTask])
```

### 2. データ整合性チェック

```typescript
// データ整合性検証
export const validateDataIntegrity = (tasks: Task[], boards: Board[]) => {
  const issues: string[] = []

  tasks.forEach(task => {
    // ボードの存在確認
    if (!boards.find(board => board.id === task.boardId)) {
      issues.push(`Task ${task.id} references non-existent board ${task.boardId}`)
    }

    // サブタスクの重複確認
    const subTaskIds = task.subTasks.map(st => st.id)
    if (subTaskIds.length !== new Set(subTaskIds).size) {
      issues.push(`Task ${task.id} has duplicate subtask IDs`)
    }

    // 日付の妥当性確認
    if (task.dueDate && task.createdAt && task.dueDate < task.createdAt) {
      issues.push(`Task ${task.id} has due date before creation date`)
    }
  })

  return issues
}
```

## 🎯 パフォーマンス最適化

### 1. メモ化戦略

```typescript
// Context値のメモ化
const TasksProvider = ({ children }) => {
  const [state, setState] = useState(initialState)

  // アクションのメモ化
  const actions = useMemo(() => ({
    addTask: (task: Task) => {
      setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }))
    },
    updateTask: (id: string, updates: Partial<Task>) => {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      }))
    }
    // ... other actions
  }), [])

  // 計算値のメモ化
  const computed = useMemo(() => ({
    activeTasks: state.tasks.filter(t => !t.isDeleted),
    completedTasks: state.tasks.filter(t => t.status === 'done'),
    tasksByPriority: groupBy(state.tasks, 'priority')
  }), [state.tasks])

  const value = useMemo(() => ({
    ...state,
    ...actions,
    ...computed
  }), [state, actions, computed])

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}
```

### 2. 選択的更新

```typescript
// 細分化されたContext
const TasksDataContext = createContext<TasksData>()
const TasksActionsContext = createContext<TasksActions>()

// アクションのみが必要なコンポーネント
const TaskActionButton = () => {
  const { deleteTask } = useContext(TasksActionsContext)  // データは不要
  // ...
}

// データのみが必要なコンポーネント
const TaskList = () => {
  const { tasks } = useContext(TasksDataContext)  // アクションは不要
  // ...
}
```

---

💡 **Pro Tip**: このデータフロー設計により、TaskFlowは一貫性・パフォーマンス・保守性を兼ね備えた状態管理を実現しています。新機能追加時はこのパターンに従って実装してください。