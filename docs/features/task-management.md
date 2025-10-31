# 📋 タスク管理機能詳細

TaskFlowの核心機能であるタスク管理システムの詳細仕様と実装について説明します。

## 🎯 機能概要

TaskFlowは包括的なタスク管理機能を提供し、個人・チームでの効率的なタスク追跡を可能にします。

### 🏆 主要機能
- **CRUD操作**: タスクの作成・編集・削除・復元
- **ステータス管理**: ToDo → In Progress → Done の状態遷移
- **優先度システム**: Critical/High/Medium/Low 4段階管理
- **期限管理**: 日時設定・期限切れ警告・期限なし対応
- **繰り返し設定**: 毎日・毎週・毎月・毎年・期限なし繰り返し
- **ラベル機能**: カスタムカラーラベルによる分類・フィルタリング
- **サブタスク**: チェックリスト形式の進捗管理
- **ファイル添付**: 5MBまでのファイルアップロード・プレビュー
- **リッチテキスト**: Lexicalベースの高機能エディタ

## 🗂️ データモデル

### Task Entity
```typescript
interface Task {
  // 基本情報
  id: string                    // UUID v4
  title: string                 // タスク名（必須）
  description?: string          // 詳細説明（リッチテキスト対応）

  // ステータス・優先度
  status: TaskStatus           // 'todo' | 'in-progress' | 'done'
  priority: TaskPriority       // 'critical' | 'high' | 'medium' | 'low'

  // 日時管理
  createdAt: Date              // 作成日時
  updatedAt: Date              // 更新日時
  dueDate?: Date               // 期限日時（時刻含む、デフォルト23:59）
  completedAt?: Date           // 完了日時

  // 分類・構造
  labels: Label[]              // ラベル配列
  subTasks: SubTask[]          // サブタスク配列
  parentTaskId?: string        // 親タスクID（サブタスクの場合）

  // 繰り返し設定
  recurrence?: RecurrenceRule  // 繰り返しルール

  // ファイル・添付
  attachments: Attachment[]    // 添付ファイル配列

  // システム管理
  isDeleted: boolean           // ソフトデリート状態
  deletedAt?: Date             // 削除日時
  boardId: string              // 所属ボードID
}
```

### 関連エンティティ
```typescript
interface SubTask {
  id: string
  title: string
  completed: boolean
  order: number                // ドラッグ&ドロップ順序
}

interface Label {
  id: string
  name: string
  color: string               // Tailwind color class
  boardId: string
}

interface RecurrenceRule {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'no-due-date'
  interval: number            // 間隔（毎2週間など）
  daysOfWeek?: number[]       // 曜日指定（週次繰り返し）
  dayOfMonth?: number         // 日付指定（月次繰り返し）
  endDate?: Date              // 繰り返し終了日
}

interface Attachment {
  id: string
  name: string
  size: number
  type: string                // MIME type
  data: string                // Base64エンコード
  uploadedAt: Date
}
```

## 🔄 CRUD操作仕様

### 1. タスク作成 (Create)
```typescript
// TaskCreateDialog.tsx
const createTask = async (taskData: CreateTaskInput) => {
  const newTask: Task = {
    id: generateId(),
    ...taskData,
    status: 'todo',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    subTasks: [],
    attachments: [],
    labels: []
  }

  // Context経由でタスク追加
  await tasksContext.addTask(newTask)

  // 繰り返し設定があれば次のタスクをスケジュール
  if (newTask.recurrence) {
    scheduleRecurringTask(newTask)
  }
}
```

### 2. タスク更新 (Update)
```typescript
// TaskEditDialog.tsx
const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const updatedTask = {
    ...existingTask,
    ...updates,
    updatedAt: new Date()
  }

  // ステータス変更時の特別処理
  if (updates.status === 'done' && existingTask.status !== 'done') {
    updatedTask.completedAt = new Date()
  }

  await tasksContext.updateTask(taskId, updatedTask)
}
```

### 3. タスク削除 (Delete)
```typescript
// ソフトデリート実装
const deleteTask = async (taskId: string) => {
  await tasksContext.updateTask(taskId, {
    isDeleted: true,
    deletedAt: new Date()
  })

  // ごみ箱機能で復元可能
}

// 完全削除（ごみ箱から）
const permanentDeleteTask = async (taskId: string) => {
  await tasksContext.removeTask(taskId)
}
```

## 🚦 ステータス管理

### ステータス遷移図
```
[Todo] ──────→ [In Progress] ──────→ [Done]
   ↑               ↑                    ↓
   └───────────────┴────────────────────┘
   （任意のステータスから任意のステータスへ変更可能）
```

### ステータス変更処理
```typescript
const changeTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
  const updates: Partial<Task> = { status: newStatus }

  // Done状態への変更時
  if (newStatus === 'done') {
    updates.completedAt = new Date()

    // 繰り返し設定があれば次のタスクを作成
    if (task.recurrence) {
      createNextRecurringTask(task)
    }
  }

  // Done状態からの変更時
  if (task.status === 'done' && newStatus !== 'done') {
    updates.completedAt = undefined
  }

  await updateTask(taskId, updates)
}
```

## 🎚️ 優先度システム

### 優先度レベル
```typescript
type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

const PRIORITY_CONFIG = {
  critical: {
    label: 'Critical',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    order: 0  // ソート順（低い方が高優先度）
  },
  high: {
    label: 'High',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    order: 1
  },
  medium: {
    label: 'Medium',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    order: 2
  },
  low: {
    label: 'Low',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    order: 3
  }
}
```

### 優先度フィルタリング・ソート
```typescript
// 優先度別フィルタリング
const filterByPriority = (tasks: Task[], priorities: TaskPriority[]) => {
  return tasks.filter(task => priorities.includes(task.priority))
}

// 優先度ソート
const sortByPriority = (tasks: Task[]) => {
  return tasks.sort((a, b) =>
    PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order
  )
}
```

## 📅 期限管理システム

### 期限設定
```typescript
interface DueDateConfig {
  date: Date                   // 期限日
  time: string                 // 時刻（HH:mm形式、デフォルト"23:59"）
  hasTime: boolean             // 時刻指定有無
}

const setDueDate = (task: Task, config: DueDateConfig) => {
  const dueDate = new Date(config.date)

  if (config.hasTime) {
    const [hours, minutes] = config.time.split(':').map(Number)
    dueDate.setHours(hours, minutes, 0, 0)
  } else {
    dueDate.setHours(23, 59, 59, 999)  // デフォルト23:59
  }

  return { ...task, dueDate }
}
```

### 期限アラート
```typescript
const getDueDateStatus = (task: Task) => {
  if (!task.dueDate) return 'none'

  const now = new Date()
  const dueDate = new Date(task.dueDate)
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'      // 期限切れ
  if (diffDays === 0) return 'today'      // 当日期限
  if (diffDays === 1) return 'tomorrow'   // 明日期限
  return 'upcoming'                       // 今後の期限
}
```

## 🔄 繰り返し機能

### 繰り返しタイプ
```typescript
type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'no-due-date'

const RECURRENCE_CONFIG = {
  daily: { label: '毎日', maxInterval: 365 },
  weekly: { label: '毎週', maxInterval: 52 },
  monthly: { label: '毎月', maxInterval: 12 },
  yearly: { label: '毎年', maxInterval: 10 },
  'no-due-date': { label: '期限なし繰り返し', maxInterval: 1 }
}
```

### 次回タスク生成
```typescript
const createNextRecurringTask = (completedTask: Task) => {
  if (!completedTask.recurrence) return

  const nextDueDate = calculateNextDueDate(
    completedTask.dueDate,
    completedTask.recurrence
  )

  // 終了日チェック
  if (completedTask.recurrence.endDate && nextDueDate > completedTask.recurrence.endDate) {
    return // 繰り返し終了
  }

  const nextTask: Task = {
    ...completedTask,
    id: generateId(),
    status: 'todo',
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: nextDueDate,
    completedAt: undefined,
    subTasks: completedTask.subTasks.map(st => ({ ...st, completed: false }))
  }

  await tasksContext.addTask(nextTask)
}
```

## 🏷️ ラベル管理

### ラベル機能
```typescript
const LabelManager = {
  // ラベル作成
  createLabel: async (name: string, color: string, boardId: string) => {
    const label: Label = {
      id: generateId(),
      name,
      color,
      boardId
    }
    await labelsContext.addLabel(label)
    return label
  },

  // タスクにラベル追加
  addLabelToTask: async (taskId: string, labelId: string) => {
    const task = await tasksContext.getTask(taskId)
    const label = await labelsContext.getLabel(labelId)

    if (!task.labels.find(l => l.id === labelId)) {
      const updatedTask = {
        ...task,
        labels: [...task.labels, label]
      }
      await tasksContext.updateTask(taskId, updatedTask)
    }
  }
}
```

## 📎 ファイル添付機能

### ファイルアップロード
```typescript
const attachFileToTask = async (taskId: string, file: File) => {
  // サイズ制限チェック（5MB）
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('ファイルサイズが5MBを超えています')
  }

  // Base64エンコード
  const base64Data = await fileToBase64(file)

  const attachment: Attachment = {
    id: generateId(),
    name: file.name,
    size: file.size,
    type: file.type,
    data: base64Data,
    uploadedAt: new Date()
  }

  const task = await tasksContext.getTask(taskId)
  const updatedTask = {
    ...task,
    attachments: [...task.attachments, attachment]
  }

  await tasksContext.updateTask(taskId, updatedTask)
}
```

### ファイルプレビュー
```typescript
const FilePreview = ({ attachment }: { attachment: Attachment }) => {
  const isImage = attachment.type.startsWith('image/')
  const isText = attachment.type.startsWith('text/')

  if (isImage) {
    return <img src={`data:${attachment.type};base64,${attachment.data}`} />
  }

  if (isText) {
    return <pre>{atob(attachment.data)}</pre>
  }

  return <FileIcon fileName={attachment.name} />
}
```

## 🗂️ サブタスク機能

### サブタスク管理
```typescript
const SubTaskManager = {
  // サブタスク追加
  addSubTask: async (taskId: string, title: string) => {
    const task = await tasksContext.getTask(taskId)
    const newSubTask: SubTask = {
      id: generateId(),
      title,
      completed: false,
      order: task.subTasks.length
    }

    const updatedTask = {
      ...task,
      subTasks: [...task.subTasks, newSubTask]
    }

    await tasksContext.updateTask(taskId, updatedTask)
  },

  // サブタスク完了状態切り替え
  toggleSubTask: async (taskId: string, subTaskId: string) => {
    const task = await tasksContext.getTask(taskId)
    const updatedSubTasks = task.subTasks.map(st =>
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    )

    await tasksContext.updateTask(taskId, { subTasks: updatedSubTasks })
  },

  // サブタスク並び替え（ドラッグ&ドロップ）
  reorderSubTasks: async (taskId: string, sourceIndex: number, destinationIndex: number) => {
    const task = await tasksContext.getTask(taskId)
    const reorderedSubTasks = reorderArray(task.subTasks, sourceIndex, destinationIndex)

    // order プロパティを更新
    const updatedSubTasks = reorderedSubTasks.map((st, index) => ({
      ...st,
      order: index
    }))

    await tasksContext.updateTask(taskId, { subTasks: updatedSubTasks })
  }
}
```

## 📊 進捗表示

### サブタスク進捗計算
```typescript
const calculateTaskProgress = (task: Task) => {
  if (task.subTasks.length === 0) {
    return task.status === 'done' ? 100 : 0
  }

  const completedCount = task.subTasks.filter(st => st.completed).length
  return Math.round((completedCount / task.subTasks.length) * 100)
}

const getProgressColor = (progress: number) => {
  if (progress === 100) return 'text-green-600'
  if (progress >= 75) return 'text-blue-600'
  if (progress >= 50) return 'text-yellow-600'
  if (progress >= 25) return 'text-orange-600'
  return 'text-gray-400'
}
```

## 🗑️ ごみ箱機能（ソフトデリート）

### 削除・復元
```typescript
const RecycleBinManager = {
  // ソフトデリート
  moveToTrash: async (taskId: string) => {
    await tasksContext.updateTask(taskId, {
      isDeleted: true,
      deletedAt: new Date()
    })
  },

  // 復元
  restoreTask: async (taskId: string) => {
    await tasksContext.updateTask(taskId, {
      isDeleted: false,
      deletedAt: undefined
    })
  },

  // 完全削除
  permanentDelete: async (taskId: string) => {
    await tasksContext.removeTask(taskId)
  },

  // 自動削除（30日後）
  autoCleanup: async () => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30)

    const expiredTasks = await tasksContext.getDeletedTasksOlderThan(cutoffDate)
    for (const task of expiredTasks) {
      await this.permanentDelete(task.id)
    }
  }
}
```

## 🔍 検索・フィルタリング

### 高度なフィルタリング
```typescript
interface TaskFilters {
  search: string                    // テキスト検索
  status: TaskStatus[]              // ステータスフィルタ
  priority: TaskPriority[]          // 優先度フィルタ
  labels: string[]                  // ラベルIDフィルタ
  dueDateRange: {                   // 期限日範囲
    start?: Date
    end?: Date
  }
  hasSubTasks?: boolean             // サブタスク有無
  hasAttachments?: boolean          // 添付ファイル有無
  isOverdue?: boolean               // 期限切れのみ
}

const filterTasks = (tasks: Task[], filters: TaskFilters) => {
  return tasks.filter(task => {
    // テキスト検索
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(searchTerm)
      const matchesDescription = task.description?.toLowerCase().includes(searchTerm)
      if (!matchesTitle && !matchesDescription) return false
    }

    // ステータスフィルタ
    if (filters.status.length && !filters.status.includes(task.status)) return false

    // 優先度フィルタ
    if (filters.priority.length && !filters.priority.includes(task.priority)) return false

    // ラベルフィルタ
    if (filters.labels.length) {
      const hasMatchingLabel = task.labels.some(label =>
        filters.labels.includes(label.id)
      )
      if (!hasMatchingLabel) return false
    }

    // 期限切れフィルタ
    if (filters.isOverdue) {
      if (!task.dueDate || task.dueDate > new Date()) return false
    }

    return true
  })
}
```

---

💡 **Pro Tip**: TaskFlowのタスク管理機能は段階的に拡張されており、新機能追加時はこの文書に従って実装することで、一貫性のある機能を提供できます。