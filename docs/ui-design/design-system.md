# 🎨 デザインシステム・Shadcn/UI + Tailwindガイド

TaskFlowのデザインシステム、Shadcn/UIコンポーネントライブラリ、Tailwind CSSの活用方法について説明します。

## 🎯 デザインシステム概要

### 🏆 統一原則
- **Shadcn/UI**: モダンで統一されたコンポーネントライブラリ
- **Tailwind CSS 4.1.16**: ユーティリティファーストCSS・最新版
- **@radix-ui**: アクセシブルなプリミティブコンポーネント
- **lucide-react**: 統一アイコンライブラリ（完全統一済み）
- **一貫性**: Look & Feel・インタラクション・アクセシビリティの統一

### 🎨 デザイン哲学
- **Accessibility First**: WCAG準拠のアクセシブルUI
- **Mobile First**: レスポンシブデザイン対応
- **Performance First**: 軽量・高速なコンポーネント
- **Developer Experience**: 使いやすく拡張性の高いAPI

## 🎨 カラーシステム

### プライマリカラーパレット
```css
/* Tailwind CSS Variables */
:root {
  /* Primary (Blue) */
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;

  /* Secondary (Slate) */
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;

  /* Accent (Blue) */
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;

  /* Destructive (Red) */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  /* Muted */
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;

  /* Border & Ring */
  --border: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
}
```

### ステータス別カラー
```typescript
// 優先度カラー
export const PRIORITY_COLORS = {
  critical: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800'
  },
  high: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800'
  },
  medium: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  low: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-800'
  }
} as const

// ステータスカラー
export const STATUS_COLORS = {
  todo: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-800'
  },
  'in-progress': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800'
  },
  done: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800'
  }
} as const
```

### ラベルカラーパレット
```typescript
// 10種類のPrimerカラーバリアント
export const LABEL_COLORS = [
  { name: 'Gray', value: 'gray', class: 'bg-gray-100 text-gray-800' },
  { name: 'Red', value: 'red', class: 'bg-red-100 text-red-800' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-100 text-orange-800' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-100 text-yellow-800' },
  { name: 'Green', value: 'green', class: 'bg-green-100 text-green-800' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-100 text-teal-800' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-100 text-blue-800' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-100 text-indigo-800' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-100 text-purple-800' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-100 text-pink-800' }
] as const
```

## 🧩 Shadcn/UIコンポーネント活用

### 基本コンポーネント

#### 1. Button
```typescript
import { Button } from '@/components/ui/button'

// バリアント一覧
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// サイズバリエーション
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// 組み合わせ例
<Button variant="outline" size="sm" className="gap-2">
  <Plus className="h-4 w-4" />
  Add Task
</Button>
```

#### 2. Card
```typescript
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

<Card className="task-card">
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      Task Title
      <PriorityBadge priority={task.priority} />
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">{task.description}</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <TaskLabels labels={task.labels} />
    <TaskActions task={task} />
  </CardFooter>
</Card>
```

#### 3. Dialog
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Task</DialogTitle>
      <DialogDescription>
        Make changes to your task here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <TaskEditForm task={task} />
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### フォームコンポーネント

#### 1. Input & Label
```typescript
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="task-title">Task Title</Label>
  <Input
    type="text"
    id="task-title"
    placeholder="Enter task title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />
</div>
```

#### 2. Select
```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

<Select value={priority} onValueChange={setPriority}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select priority" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="critical">Critical</SelectItem>
    <SelectItem value="high">High</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="low">Low</SelectItem>
  </SelectContent>
</Select>
```

#### 3. Checkbox
```typescript
import { Checkbox } from '@/components/ui/checkbox'

<div className="items-top flex space-x-2">
  <Checkbox
    id="subtask-1"
    checked={subtask.completed}
    onCheckedChange={(checked) => toggleSubtask(subtask.id, checked)}
  />
  <Label htmlFor="subtask-1" className="text-sm font-normal">
    {subtask.title}
  </Label>
</div>
```

### ナビゲーション・表示コンポーネント

#### 1. Tabs
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="kanban" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="kanban">Kanban</TabsTrigger>
    <TabsTrigger value="table">Table</TabsTrigger>
    <TabsTrigger value="calendar">Calendar</TabsTrigger>
  </TabsList>
  <TabsContent value="kanban">
    <KanbanBoard />
  </TabsContent>
  <TabsContent value="table">
    <TableView />
  </TabsContent>
  <TabsContent value="calendar">
    <CalendarView />
  </TabsContent>
</Tabs>
```

#### 2. Badge
```typescript
import { Badge } from '@/components/ui/badge'

// 優先度バッジ
const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const config = PRIORITY_COLORS[priority]

  return (
    <Badge variant="secondary" className={config.badge}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  )
}

// ステータスバッジ
const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const config = STATUS_COLORS[status]

  return (
    <Badge variant="outline" className={config.badge}>
      {getStatusLabel(status)}
    </Badge>
  )
}
```

## 🎨 カスタムコンポーネントパターン

### 1. 合成パターン（Compound Components）

```typescript
// UnifiedDialog.tsx
const UnifiedDialog = ({ children, ...props }: DialogProps) => {
  return <Dialog {...props}>{children}</Dialog>
}

const UnifiedDialogContent = ({ className, children, ...props }: DialogContentProps) => {
  return (
    <DialogContent className={cn("sm:max-w-[425px]", className)} {...props}>
      {children}
    </DialogContent>
  )
}

UnifiedDialog.Content = UnifiedDialogContent
UnifiedDialog.Header = DialogHeader
UnifiedDialog.Title = DialogTitle
UnifiedDialog.Description = DialogDescription
UnifiedDialog.Footer = DialogFooter

// 使用例
<UnifiedDialog open={isOpen} onOpenChange={setIsOpen}>
  <UnifiedDialog.Content>
    <UnifiedDialog.Header>
      <UnifiedDialog.Title>Task Details</UnifiedDialog.Title>
    </UnifiedDialog.Header>
    <TaskDetailContent task={task} />
    <UnifiedDialog.Footer>
      <Button onClick={onSave}>Save</Button>
    </UnifiedDialog.Footer>
  </UnifiedDialog.Content>
</UnifiedDialog>
```

### 2. バリアントベースコンポーネント

```typescript
// TaskCard.tsx
import { cva, VariantProps } from 'class-variance-authority'

const taskCardVariants = cva(
  "card task-card transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-sm",
        compact: "bg-card text-card-foreground shadow-sm p-3",
        detailed: "bg-card text-card-foreground shadow-md p-6"
      },
      status: {
        todo: "border-l-4 border-l-slate-400",
        "in-progress": "border-l-4 border-l-blue-400",
        done: "border-l-4 border-l-green-400 opacity-75"
      },
      priority: {
        critical: "border-r-4 border-r-red-400",
        high: "border-r-4 border-r-orange-400",
        medium: "border-r-4 border-r-yellow-400",
        low: "border-r-4 border-r-gray-400"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

interface TaskCardProps extends VariantProps<typeof taskCardVariants> {
  task: Task
  className?: string
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  variant,
  className,
  ...props
}) => {
  return (
    <Card
      className={cn(
        taskCardVariants({
          variant,
          status: task.status,
          priority: task.priority
        }),
        className
      )}
      {...props}
    >
      {/* TaskCard content */}
    </Card>
  )
}
```

## 🎨 レスポンシブデザイン

### ブレイクポイント戦略
```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Mobile Large */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop Large */
2xl: 1536px /* Desktop XL */
```

### モバイルファーストアプローチ
```typescript
// レスポンシブコンポーネント例
const ResponsiveTaskCard = ({ task }: { task: Task }) => {
  return (
    <Card className={cn(
      // Mobile: コンパクトレイアウト
      "p-3 mb-2",
      // Tablet: 通常レイアウト
      "md:p-4 md:mb-3",
      // Desktop: 詳細レイアウト
      "lg:p-6 lg:mb-4"
    )}>
      <div className={cn(
        // Mobile: 縦並び
        "flex flex-col space-y-2",
        // Desktop: 横並び
        "lg:flex-row lg:items-center lg:justify-between lg:space-y-0"
      )}>
        <TaskTitle task={task} />
        <TaskMeta task={task} />
      </div>
    </Card>
  )
}

// グリッドレスポンシブ
const TaskGrid = ({ tasks }: { tasks: Task[] }) => {
  return (
    <div className={cn(
      // Mobile: 1カラム
      "grid grid-cols-1 gap-3",
      // Tablet: 2カラム
      "md:grid-cols-2 md:gap-4",
      // Desktop: 3カラム
      "lg:grid-cols-3 lg:gap-6",
      // Desktop Large: 4カラム
      "xl:grid-cols-4"
    )}>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
```

## ♿ アクセシビリティ実装

### WCAG準拠の基本原則

#### 1. フォーカス管理
```typescript
// フォーカストラップ実装
const TaskEditDialog = ({ task, open, onClose }: TaskEditDialogProps) => {
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && titleInputRef.current) {
      // ダイアログ開放時に最初の入力フィールドにフォーカス
      titleInputRef.current.focus()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form>
          <Label htmlFor="task-title">Task Title</Label>
          <Input
            ref={titleInputRef}
            id="task-title"
            value={task.title}
            aria-describedby="task-title-description"
          />
          <p id="task-title-description" className="text-sm text-muted-foreground">
            Enter a descriptive title for your task
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

#### 2. ARIA属性の適切な使用
```typescript
// アクセシブルなタスクリスト
const TaskList = ({ tasks, onTaskUpdate }: TaskListProps) => {
  return (
    <div
      role="list"
      aria-label={`${tasks.length} tasks`}
      className="space-y-2"
    >
      {tasks.map((task, index) => (
        <div
          key={task.id}
          role="listitem"
          aria-posinset={index + 1}
          aria-setsize={tasks.length}
        >
          <TaskCard
            task={task}
            onUpdate={onTaskUpdate}
            aria-label={`Task: ${task.title}. Status: ${task.status}. Priority: ${task.priority}`}
          />
        </div>
      ))}
    </div>
  )
}

// アクセシブルなボタン
const TaskActionButton = ({ action, task, onAction }: TaskActionButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onAction(action, task)}
      aria-label={`${action} task: ${task.title}`}
      className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{action}</span>
    </Button>
  )
}
```

#### 3. カラーコントラスト
```css
/* WCAG AA準拠のコントラスト比確保 */
.priority-critical {
  @apply bg-red-50 text-red-900; /* コントラスト比 > 4.5:1 */
}

.priority-high {
  @apply bg-orange-50 text-orange-900; /* コントラスト比 > 4.5:1 */
}

.status-done {
  @apply bg-green-50 text-green-900; /* コントラスト比 > 4.5:1 */
}

/* フォーカスインジケーター */
.focus-visible {
  @apply ring-2 ring-ring ring-offset-2 ring-offset-background;
}
```

## 🎨 アニメーション・トランジション

### 統一されたアニメーション
```css
/* globals.css */
.animate-in {
  animation: animate-in 0.2s ease-out;
}

.animate-out {
  animation: animate-out 0.15s ease-in;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes animate-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}
```

### React Transitionアニメーション
```typescript
import { Transition } from '@headlessui/react'

const TaskNotification = ({ show, message }: NotificationProps) => {
  return (
    <Transition
      show={show}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <div className="notification">
        {message}
      </div>
    </Transition>
  )
}
```

## 🔧 デザイントークン管理

### CSS Custom Properties
```css
/* src/styles/tokens.css */
:root {
  /* Spacing */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */

  /* Typography */
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */

  /* Border Radius */
  --radius-sm: 0.125rem;  /* 2px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### TypeScriptトークン定義
```typescript
// lib/design-tokens.ts
export const DESIGN_TOKENS = {
  spacing: {
    xs: 'var(--space-xs)',
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)'
  },
  typography: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)'
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)'
  }
} as const
```

---

💡 **Pro Tip**: TaskFlowのデザインシステムは、一貫性・アクセシビリティ・保守性を重視して設計されています。新しいコンポーネントを作成する際は、既存のShadcn/UIコンポーネントをベースに、統一されたデザイントークンを活用してください！