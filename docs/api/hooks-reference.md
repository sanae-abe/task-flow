# 🔧 カスタムフックリファレンス

TaskFlowで使用されているカスタムフックの完全なリファレンスガイドです。各フックの用途、引数、戻り値、使用例を詳しく説明します。

## 🎯 フック分類

### 📊 データ管理フック

- [useTasks](#usetasks) - タスクデータとCRUD操作
- [useTask](#usetask) - 個別タスクアクセス
- [useBoards](#useboards) - ボード管理
- [useLabels](#uselabels) - ラベル管理

### 🔄 ビジネスロジックフック

- [useTaskActions](#usetaskactions) - タスク操作の複合処理
- [useTaskFilters](#usetaskfilters) - フィルタリング・検索
- [useTaskSort](#usetasksort) - ソート機能
- [useRecurrence](#userecurrence) - 繰り返し処理

### 🎨 UI状態管理フック

- [useDialog](#usedialog) - ダイアログ状態管理
- [useNotifications](#usenotifications) - 通知システム
- [useLocalStorage](#uselocalstorage) - ローカルストレージ
- [useDragAndDrop](#usedraganddrop) - ドラッグ&ドロップ

### ⚡ パフォーマンスフック

- [useDebounce](#usedebounce) - デバウンス処理
- [useVirtualization](#usevirtualization) - 仮想化リスト
- [useMemoizedCallback](#usememoizedcallback) - コールバック最適化

## 📊 データ管理フック

### useTasks

タスクデータの取得とCRUD操作を提供するメインフック。

```typescript
interface UseTasksReturn {
  // State
  tasks: Task[]
  loading: boolean
  error: string | null
  lastUpdated: Date

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
  activeTasks: Task[]
  completedTasks: Task[]
  overdueTasks: Task[]
  taskCount: number
}

const useTasks = (): UseTasksReturn
```

#### 使用例

```typescript
const TaskList = () => {
  const {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask
  } = useTasks()

  const handleCreateTask = async (taskData: CreateTaskInput) => {
    try {
      const newTask = createTaskFromInput(taskData)
      await addTask(newTask)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={(updates) => updateTask(task.id, updates)}
          onDelete={() => deleteTask(task.id)}
        />
      ))}
    </div>
  )
}
```

### useTask

個別タスクへのアクセスと状態管理。

```typescript
interface UseTaskReturn {
  task: Task | undefined
  loading: boolean
  error: string | null
  exists: boolean

  // 計算値
  progress: number
  isOverdue: boolean
  daysUntilDue: number | null
}

const useTask = (taskId: string): UseTaskReturn
```

#### 使用例

```typescript
const TaskDetailPanel = ({ taskId }: { taskId: string }) => {
  const { task, loading, exists, progress, isOverdue } = useTask(taskId)

  if (loading) return <Skeleton />
  if (!exists) return <NotFound />

  return (
    <div>
      <h2>{task.title}</h2>
      <ProgressBar value={progress} />
      {isOverdue && <OverdueAlert />}
    </div>
  )
}
```

### useBoards

ボード管理とボード切り替え機能。

```typescript
interface UseBoardsReturn {
  boards: Board[]
  currentBoard: Board | undefined
  currentBoardId: string | null
  loading: boolean
  error: string | null

  createBoard: (board: Omit<Board, 'id'>) => Promise<void>
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>
  deleteBoard: (id: string) => Promise<void>
  switchBoard: (boardId: string) => void
  getBoard: (id: string) => Board | undefined
}

const useBoards = (): UseBoardsReturn
```

#### 使用例

```typescript
const BoardSelector = () => {
  const {
    boards,
    currentBoardId,
    switchBoard,
    createBoard
  } = useBoards()

  return (
    <Select value={currentBoardId} onValueChange={switchBoard}>
      <SelectTrigger>
        <SelectValue placeholder="Select board" />
      </SelectTrigger>
      <SelectContent>
        {boards.map(board => (
          <SelectItem key={board.id} value={board.id}>
            {board.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### useLabels

ラベル管理とラベル操作。

```typescript
interface UseLabelsReturn {
  labels: Label[]
  loading: boolean
  error: string | null

  createLabel: (label: Omit<Label, 'id'>) => Promise<void>
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>
  deleteLabel: (id: string) => Promise<void>
  getLabelsByBoard: (boardId: string) => Label[]
  getLabel: (id: string) => Label | undefined
}

const useLabels = (): UseLabelsReturn
```

## 🔄 ビジネスロジックフック

### useTaskActions

タスク操作の複合処理とビジネスロジック。

```typescript
interface UseTaskActionsReturn {
  editTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  removeTask: (taskId: string) => Promise<void>
  duplicateTask: (taskId: string) => Promise<void>
  toggleTaskStatus: (taskId: string) => Promise<void>
  bulkUpdateTasks: (taskIds: string[], updates: Partial<Task>) => Promise<void>

  // 通知統合
  isLoading: boolean
  hasError: boolean
}

const useTaskActions = (): UseTaskActionsReturn
```

#### 使用例

```typescript
const TaskActionMenu = ({ task }: { task: Task }) => {
  const {
    editTask,
    removeTask,
    duplicateTask,
    toggleTaskStatus,
    isLoading
  } = useTaskActions()

  return (
    <DropdownMenu>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => toggleTaskStatus(task.id)}
          disabled={isLoading}
        >
          {task.status === 'done' ? 'Mark Incomplete' : 'Mark Complete'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => duplicateTask(task.id)}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => removeTask(task.id)}
          className="text-destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### useTaskFilters

高度なフィルタリング・検索機能。

```typescript
interface TaskFilters {
  search: string
  status: TaskStatus[]
  priority: TaskPriority[]
  labels: string[]
  dueDateRange: { start?: Date; end?: Date }
  hasSubTasks?: boolean
  hasAttachments?: boolean
  isOverdue?: boolean
  boardId?: string
}

interface UseTaskFiltersReturn {
  filters: TaskFilters
  filteredTasks: Task[]
  filteredCount: number

  updateFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void
  clearFilters: () => void
  clearFilter: (key: keyof TaskFilters) => void

  // 便利なセッター
  setSearch: (search: string) => void
  setStatusFilter: (status: TaskStatus[]) => void
  setPriorityFilter: (priority: TaskPriority[]) => void
  setLabelFilter: (labels: string[]) => void

  // プリセットフィルター
  applyPreset: (preset: FilterPreset) => void
  getActiveFilterCount: () => number
}

const useTaskFilters = (
  tasks: Task[],
  initialFilters?: Partial<TaskFilters>
): UseTaskFiltersReturn
```

#### 使用例

```typescript
const TaskFilterPanel = () => {
  const { tasks } = useTasks()
  const {
    filters,
    filteredTasks,
    updateFilter,
    clearFilters,
    getActiveFilterCount
  } = useTaskFilters(tasks)

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className="filter-panel">
      <div className="flex items-center justify-between">
        <h3>Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      <Input
        placeholder="Search tasks..."
        value={filters.search}
        onChange={(e) => updateFilter('search', e.target.value)}
      />

      <MultiSelect
        label="Status"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(status) => updateFilter('status', status)}
      />

      <div className="results">
        {filteredTasks.length} tasks found
      </div>
    </div>
  )
}
```

### useTaskSort

ソート機能とソート状態管理。

```typescript
type SortField = 'title' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

interface UseTaskSortReturn {
  sortConfig: SortConfig
  sortedTasks: Task[]

  setSortField: (field: SortField) => void
  setSortDirection: (direction: SortDirection) => void
  toggleSortDirection: () => void
  resetSort: () => void

  // 便利なメソッド
  sortBy: (field: SortField, direction?: SortDirection) => void
  isSortedBy: (field: SortField) => boolean
  getSortIcon: (field: SortField) => 'asc' | 'desc' | null
}

const useTaskSort = (
  tasks: Task[],
  defaultSort?: SortConfig
): UseTaskSortReturn
```

#### 使用例

```typescript
const SortableTaskTable = ({ tasks }: { tasks: Task[] }) => {
  const {
    sortedTasks,
    sortBy,
    getSortIcon,
    isSortedBy
  } = useTaskSort(tasks, { field: 'createdAt', direction: 'desc' })

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => sortBy(field)}
      className={cn('justify-start', isSortedBy(field) && 'bg-muted')}
    >
      {children}
      <SortIcon type={getSortIcon(field)} />
    </Button>
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <SortButton field="title">Title</SortButton>
          </TableHead>
          <TableHead>
            <SortButton field="priority">Priority</SortButton>
          </TableHead>
          <TableHead>
            <SortButton field="dueDate">Due Date</SortButton>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTasks.map(task => (
          <TaskTableRow key={task.id} task={task} />
        ))}
      </TableBody>
    </Table>
  )
}
```

### useRecurrence

繰り返しタスクの処理と次回作成。

```typescript
interface UseRecurrenceReturn {
  calculateNextDueDate: (
    currentDate: Date,
    recurrence: RecurrenceRule
  ) => Date | null

  createNextTask: (completedTask: Task) => Promise<Task | null>

  validateRecurrence: (recurrence: RecurrenceRule) => {
    isValid: boolean
    errors: string[]
  }

  getRecurrenceDescription: (recurrence: RecurrenceRule) => string

  // 繰り返し候補の生成
  generateRecurrenceDates: (
    startDate: Date,
    recurrence: RecurrenceRule,
    count: number
  ) => Date[]
}

const useRecurrence = (): UseRecurrenceReturn
```

#### 使用例

```typescript
const RecurrencePreview = ({ recurrence }: { recurrence: RecurrenceRule }) => {
  const {
    validateRecurrence,
    getRecurrenceDescription,
    generateRecurrenceDates
  } = useRecurrence()

  const { isValid, errors } = validateRecurrence(recurrence)
  const description = getRecurrenceDescription(recurrence)
  const nextDates = generateRecurrenceDates(new Date(), recurrence, 5)

  return (
    <div className="recurrence-preview">
      <p className="description">{description}</p>

      {!isValid && (
        <div className="errors">
          {errors.map((error, index) => (
            <p key={index} className="text-destructive text-sm">{error}</p>
          ))}
        </div>
      )}

      <div className="next-dates">
        <h4>Next 5 occurrences:</h4>
        <ul>
          {nextDates.map((date, index) => (
            <li key={index}>{formatDate(date)}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

## 🎨 UI状態管理フック

### useDialog

ダイアログの状態管理と制御。

```typescript
interface UseDialogReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void

  // 複数ダイアログの管理
  openDialog: (dialogId: string) => void
  closeDialog: (dialogId: string) => void
  isDialogOpen: (dialogId: string) => boolean
  closeAllDialogs: () => void
}

const useDialog = (initialOpen?: boolean): UseDialogReturn

// 複数ダイアログ管理バージョン
const useDialogs = (): UseDialogReturn
```

#### 使用例

```typescript
const TaskManagementPanel = () => {
  const createDialog = useDialog()
  const editDialog = useDialog()
  const deleteDialog = useDialog()

  return (
    <div>
      <Button onClick={createDialog.open}>
        Create Task
      </Button>

      <TaskCreateDialog
        open={createDialog.isOpen}
        onClose={createDialog.close}
      />

      <TaskEditDialog
        open={editDialog.isOpen}
        onClose={editDialog.close}
      />

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
      />
    </div>
  )
}
```

### useNotifications

統一された通知システム。

```typescript
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface UseNotificationsReturn {
  notifications: Notification[]

  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void

  // 便利なメソッド
  success: (title: string, message?: string) => string
  error: (title: string, message?: string) => string
  warning: (title: string, message?: string) => string
  info: (title: string, message?: string) => string
}

const useNotifications = (): UseNotificationsReturn
```

#### 使用例

```typescript
const TaskActions = () => {
  const { updateTask } = useTasks()
  const { success, error } = useNotifications()

  const handleSaveTask = async (task: Task) => {
    try {
      await updateTask(task.id, task)
      success('Task saved', 'Your changes have been saved successfully.')
    } catch (err) {
      error('Save failed', 'Unable to save your changes. Please try again.')
    }
  }

  return (
    <Button onClick={() => handleSaveTask(task)}>
      Save Task
    </Button>
  )
}
```

### useLocalStorage

型安全なlocalStorage操作。

```typescript
interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  removeValue: () => void

  // 状態
  isLoading: boolean
  error: string | null
}

const useLocalStorage = <T>(
  key: string,
  defaultValue: T,
  options?: {
    serializer?: {
      stringify: (value: T) => string
      parse: (value: string) => T
    }
  }
): UseLocalStorageReturn<T>
```

#### 使用例

```typescript
const UserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    theme: 'light' as const,
    language: 'ja' as const,
    notifications: true
  })

  return (
    <div>
      <Select
        value={preferences.theme}
        onValueChange={(theme) =>
          setPreferences(prev => ({ ...prev, theme }))
        }
      >
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
      </Select>
    </div>
  )
}
```

### useDragAndDrop

ドラッグ&ドロップ機能の実装。

```typescript
interface UseDragAndDropReturn {
  draggedItem: string | null
  isDragging: boolean

  handleDragStart: (itemId: string) => void
  handleDragEnd: () => void
  handleDrop: (targetId: string, position?: 'before' | 'after' | 'inside') => void

  // dnd-kit統合
  sensors: SensorDescriptor<any>[]
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}

const useDragAndDrop = <T>(
  items: T[],
  onReorder: (items: T[]) => void,
  getId: (item: T) => string
): UseDragAndDropReturn
```

#### 使用例

```typescript
const SortableTaskList = ({ tasks }: { tasks: Task[] }) => {
  const { updateTaskOrder } = useTasks()

  const {
    sensors,
    onDragStart,
    onDragEnd
  } = useDragAndDrop(tasks, updateTaskOrder, (task) => task.id)

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={tasks.map(t => t.id)}>
        {tasks.map(task => (
          <SortableTaskCard key={task.id} task={task} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

## ⚡ パフォーマンスフック

### useDebounce

入力値のデバウンス処理。

```typescript
interface UseDebounceReturn<T> {
  debouncedValue: T
  isDebouncing: boolean
  cancel: () => void
  flush: () => void
}

const useDebounce = <T>(
  value: T,
  delay: number
): UseDebounceReturn<T>
```

#### 使用例

```typescript
const TaskSearchInput = () => {
  const [search, setSearch] = useState('')
  const { debouncedValue } = useDebounce(search, 300)
  const { updateFilter } = useTaskFilters()

  useEffect(() => {
    updateFilter('search', debouncedValue)
  }, [debouncedValue, updateFilter])

  return (
    <Input
      placeholder="Search tasks..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  )
}
```

### useVirtualization

大量データの仮想化表示。

```typescript
interface UseVirtualizationReturn {
  virtualItems: VirtualItem[]
  totalSize: number
  scrollToIndex: (index: number) => void
  scrollToOffset: (offset: number) => void

  // Refs
  parentRef: React.RefObject<HTMLDivElement>
  scrollElementRef: React.RefObject<HTMLDivElement>
}

const useVirtualization = (options: {
  count: number
  estimateSize: (index: number) => number
  overscan?: number
}): UseVirtualizationReturn
```

#### 使用例

```typescript
const VirtualizedTaskList = ({ tasks }: { tasks: Task[] }) => {
  const {
    virtualItems,
    totalSize,
    parentRef
  } = useVirtualization({
    count: tasks.length,
    estimateSize: () => 80, // 各タスクカードの高さ
    overscan: 5
  })

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: totalSize, position: 'relative' }}>
        {virtualItems.map(virtualItem => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              left: 0,
              width: '100%',
              height: virtualItem.size
            }}
          >
            <TaskCard task={tasks[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

💡 **Pro Tip**: これらのカスタムフックは、TaskFlowの機能を効率的に活用するために設計されています。新しい機能を実装する際は、既存のフックを組み合わせて使用することで、一貫性のある高品質なコードを書くことができます！
