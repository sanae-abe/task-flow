# 🧪 テスト戦略・Vitestガイド

TaskFlowにおけるテスト戦略、Vitestの活用方法、品質保証のベストプラクティスを説明します。

## 🎯 テスト戦略概要

### テストピラミッド

```
    🔺 E2E Tests (少数・重要フロー)
       │
   🔺🔺 Integration Tests (中程度・機能統合)
      │
  🔺🔺🔺 Unit Tests (多数・詳細機能)
```

### 📊 テストカバレッジ目標

- **Branches**: 80%以上
- **Functions**: 80%以上
- **Lines**: 80%以上
- **Statements**: 80%以上

## 🛠️ Vitest設定・活用

### 基本設定確認

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', '**/*.config.*'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### テストセットアップ

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { beforeEach, afterEach, vi } from 'vitest';

// テスト間でのクリーンアップ
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// localStorage モック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// ResizeObserver モック
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// matchMedia モック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

## 🔧 単体テスト（Unit Tests）

### 1. ユーティリティ関数テスト

```typescript
// utils/dateUtils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDueDate, isOverdue, calculateRecurrence } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDueDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-15T10:30:00');
      expect(formatDueDate(date)).toBe('2025年1月15日 10:30');
    });

    it('should handle undefined date', () => {
      expect(formatDueDate(undefined)).toBe('期限なし');
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(isOverdue(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date('2030-01-01');
      expect(isOverdue(futureDate)).toBe(false);
    });

    it('should return false for undefined date', () => {
      expect(isOverdue(undefined)).toBe(false);
    });
  });

  describe('calculateRecurrence', () => {
    it('should calculate daily recurrence correctly', () => {
      const baseDate = new Date('2025-01-15');
      const recurrence = { type: 'daily', interval: 2 };
      const result = calculateRecurrence(baseDate, recurrence);

      expect(result).toEqual(new Date('2025-01-17'));
    });

    it('should calculate weekly recurrence correctly', () => {
      const baseDate = new Date('2025-01-15'); // 水曜日
      const recurrence = { type: 'weekly', interval: 1 };
      const result = calculateRecurrence(baseDate, recurrence);

      expect(result).toEqual(new Date('2025-01-22'));
    });
  });
});
```

### 2. カスタムフックテスト

```typescript
// hooks/useTaskFilters.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTaskFilters } from '../useTaskFilters';
import { mockTasks } from '@/test/mocks';

describe('useTaskFilters', () => {
  it('should initialize with empty filters', () => {
    const { result } = renderHook(() => useTaskFilters());

    expect(result.current.filters).toEqual({
      search: '',
      status: [],
      priority: [],
      labels: [],
      dueDateRange: {},
    });
  });

  it('should filter tasks by search term', () => {
    const { result } = renderHook(() => useTaskFilters());

    act(() => {
      result.current.updateFilter('search', 'テスト');
    });

    const filteredTasks = result.current.getFilteredTasks(mockTasks);
    expect(filteredTasks).toHaveLength(2);
    expect(filteredTasks.every(task => task.title.includes('テスト') || task.description?.includes('テスト'))).toBe(
      true
    );
  });

  it('should filter tasks by status', () => {
    const { result } = renderHook(() => useTaskFilters());

    act(() => {
      result.current.updateFilter('status', ['done']);
    });

    const filteredTasks = result.current.getFilteredTasks(mockTasks);
    expect(filteredTasks.every(task => task.status === 'done')).toBe(true);
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useTaskFilters());

    act(() => {
      result.current.updateFilter('search', 'test');
      result.current.updateFilter('status', ['done']);
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters.search).toBe('');
    expect(result.current.filters.status).toEqual([]);
  });
});
```

### 3. コンポーネント単体テスト

```typescript
// components/TaskCard/TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TaskCard } from './TaskCard'
import { mockTask } from '@/test/mocks'

describe('TaskCard', () => {
  const defaultProps = {
    task: mockTask,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onStatusChange: vi.fn()
  }

  it('should render task information correctly', () => {
    render(<TaskCard {...defaultProps} />)

    expect(screen.getByText(mockTask.title)).toBeInTheDocument()
    expect(screen.getByText(mockTask.description)).toBeInTheDocument()
    expect(screen.getByTestId('priority-badge')).toHaveTextContent('High')
  })

  it('should call onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<TaskCard {...defaultProps} onEdit={onEdit} />)

    const editButton = screen.getByRole('button', { name: /編集/ })
    fireEvent.click(editButton)

    expect(onEdit).toHaveBeenCalledWith(mockTask)
  })

  it('should call onStatusChange when status is changed', async () => {
    const onStatusChange = vi.fn()
    render(<TaskCard {...defaultProps} onStatusChange={onStatusChange} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(onStatusChange).toHaveBeenCalledWith(mockTask.id, 'done')
  })

  it('should show overdue indicator for overdue tasks', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: new Date('2020-01-01')
    }

    render(<TaskCard {...defaultProps} task={overdueTask} />)

    expect(screen.getByTestId('overdue-indicator')).toBeInTheDocument()
    expect(screen.getByText('期限切れ')).toBeInTheDocument()
  })

  it('should display subtask progress correctly', () => {
    const taskWithSubTasks = {
      ...mockTask,
      subTasks: [
        { id: '1', title: 'Sub 1', completed: true, order: 0 },
        { id: '2', title: 'Sub 2', completed: false, order: 1 },
        { id: '3', title: 'Sub 3', completed: true, order: 2 }
      ]
    }

    render(<TaskCard {...defaultProps} task={taskWithSubTasks} />)

    expect(screen.getByText('2/3 完了')).toBeInTheDocument()
    expect(screen.getByTestId('progress-bar')).toHaveAttribute('value', '67')
  })
})
```

## 🔗 統合テスト（Integration Tests）

### 1. Context統合テスト

```typescript
// contexts/TasksContext.test.tsx
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TasksProvider, useTasks } from '../TasksContext'
import { mockTasks } from '@/test/mocks'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TasksProvider>{children}</TasksProvider>
)

describe('TasksContext Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should load tasks from localStorage on initialization', async () => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(mockTasks))

    const { result } = renderHook(() => useTasks(), { wrapper })

    expect(result.current.tasks).toHaveLength(mockTasks.length)
  })

  it('should add task and persist to storage', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper })

    const newTask = {
      id: 'new-task',
      title: 'New Task',
      status: 'todo',
      priority: 'medium',
      // ... other required fields
    }

    await act(async () => {
      await result.current.addTask(newTask)
    })

    expect(result.current.tasks).toContain(newTask)
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'taskflow-tasks',
      expect.stringContaining(newTask.id)
    )
  })

  it('should update task status and trigger side effects', async () => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(mockTasks))
    const { result } = renderHook(() => useTasks(), { wrapper })

    const taskId = mockTasks[0].id

    await act(async () => {
      await result.current.updateTask(taskId, { status: 'done' })
    })

    const updatedTask = result.current.getTask(taskId)
    expect(updatedTask?.status).toBe('done')
    expect(updatedTask?.completedAt).toBeInstanceOf(Date)
  })

  it('should handle recurring task completion', async () => {
    const recurringTask = {
      ...mockTasks[0],
      recurrence: { type: 'daily', interval: 1 }
    }

    localStorage.setItem('taskflow-tasks', JSON.stringify([recurringTask]))
    const { result } = renderHook(() => useTasks(), { wrapper })

    await act(async () => {
      await result.current.updateTask(recurringTask.id, { status: 'done' })
    })

    // 次回のタスクが作成されることを確認
    const newTasks = result.current.tasks.filter(t => t.title === recurringTask.title)
    expect(newTasks).toHaveLength(2) // 元のタスク + 新しいタスク
  })
})
```

### 2. コンポーネント統合テスト

```typescript
// components/TaskCreateDialog/TaskCreateDialog.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TaskCreateDialog } from './TaskCreateDialog'
import { TestProviders } from '@/test/TestProviders'

describe('TaskCreateDialog Integration', () => {
  const renderWithProviders = (props = {}) => {
    return render(
      <TestProviders>
        <TaskCreateDialog open={true} onClose={vi.fn()} {...props} />
      </TestProviders>
    )
  }

  it('should create task with all filled information', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    renderWithProviders({ onClose })

    // フォーム入力
    await user.type(screen.getByLabelText('タスク名'), 'テストタスク')
    await user.type(screen.getByLabelText('説明'), 'テスト説明')

    // 優先度選択
    await user.click(screen.getByRole('button', { name: /優先度/ }))
    await user.click(screen.getByRole('option', { name: 'High' }))

    // 期限設定
    await user.click(screen.getByLabelText('期限設定'))
    await user.type(screen.getByLabelText('日付'), '2025-12-31')
    await user.type(screen.getByLabelText('時刻'), '15:30')

    // サブタスク追加
    await user.click(screen.getByRole('button', { name: /サブタスク追加/ }))
    await user.type(screen.getByPlaceholderText('サブタスクを入力'), 'サブタスク1')
    await user.keyboard('{Enter}')

    // ラベル選択
    await user.click(screen.getByRole('button', { name: /ラベル/ }))
    await user.click(screen.getByRole('option', { name: '重要' }))

    // 作成実行
    await user.click(screen.getByRole('button', { name: '作成' }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })

    // 作成されたタスクの確認（Context経由）
    expect(screen.getByText('タスクを作成しました')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()

    renderWithProviders()

    // タスク名なしで作成を試行
    await user.click(screen.getByRole('button', { name: '作成' }))

    expect(screen.getByText('タスク名は必須です')).toBeInTheDocument()
  })

  it('should handle file attachment', async () => {
    const user = userEvent.setup()

    renderWithProviders()

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = screen.getByLabelText('ファイル添付')

    await user.upload(fileInput, file)

    expect(screen.getByText('test.txt')).toBeInTheDocument()
    expect(screen.getByText('(テキスト, 12 B)')).toBeInTheDocument()
  })
})
```

## 🎭 モック・テストユーティリティ

### 1. モックデータ

```typescript
// test/mocks/tasks.ts
export const mockTask: Task = {
  id: 'task-1',
  title: 'テストタスク',
  description: 'テスト用の説明',
  status: 'todo',
  priority: 'high',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  dueDate: new Date('2025-01-31'),
  labels: [{ id: 'label-1', name: '重要', color: 'red', boardId: 'board-1' }],
  subTasks: [
    { id: 'sub-1', title: 'サブタスク1', completed: false, order: 0 },
    { id: 'sub-2', title: 'サブタスク2', completed: true, order: 1 },
  ],
  attachments: [],
  isDeleted: false,
  boardId: 'board-1',
};

export const mockTasks: Task[] = [
  mockTask,
  {
    ...mockTask,
    id: 'task-2',
    title: '完了済みタスク',
    status: 'done',
    completedAt: new Date('2025-01-15'),
  },
  {
    ...mockTask,
    id: 'task-3',
    title: '期限切れタスク',
    status: 'in-progress',
    dueDate: new Date('2020-01-01'),
  },
];
```

### 2. テストプロバイダー

```typescript
// test/TestProviders.tsx
import React from 'react'
import { TasksProvider } from '@/contexts/TasksContext'
import { BoardsProvider } from '@/contexts/BoardsContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { mockTasks, mockBoards } from './mocks'

interface TestProvidersProps {
  children: React.ReactNode
  initialTasks?: Task[]
  initialBoards?: Board[]
}

export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  initialTasks = mockTasks,
  initialBoards = mockBoards
}) => {
  return (
    <NotificationProvider>
      <BoardsProvider initialBoards={initialBoards}>
        <TasksProvider initialTasks={initialTasks}>
          {children}
        </TasksProvider>
      </BoardsProvider>
    </NotificationProvider>
  )
}
```

### 3. カスタムテストユーティリティ

```typescript
// test/utils/testUtils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { TestProviders } from './TestProviders'

// カスタムレンダー関数
const customRender = (
  ui: React.ReactElement,
  options?: RenderOptions & {
    initialTasks?: Task[]
    initialBoards?: Board[]
  }
) => {
  const { initialTasks, initialBoards, ...renderOptions } = options || {}

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders
      initialTasks={initialTasks}
      initialBoards={initialBoards}
    >
      {children}
    </TestProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// テストヘルパー
export const waitForLoadingToFinish = () => {
  return waitFor(() => {
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
  })
}

export const expectToastMessage = (message: string) => {
  expect(screen.getByRole('alert')).toHaveTextContent(message)
}

// re-export everything
export * from '@testing-library/react'
export { customRender as render }
```

## 🔍 E2Eテスト戦略

### 1. Playwright設定（将来実装）

```typescript
// e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    port: 3000,
  },
});
```

### 2. 重要フローのE2Eテスト

```typescript
// e2e/task-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Task Management E2E', () => {
  test('should create, edit, and complete task', async ({ page }) => {
    await page.goto('/');

    // タスク作成
    await page.click('[data-testid="create-task-button"]');
    await page.fill('[data-testid="task-title-input"]', 'E2Eテストタスク');
    await page.fill('[data-testid="task-description-input"]', 'E2Eテスト説明');
    await page.click('[data-testid="save-task-button"]');

    // 作成確認
    await expect(page.locator('text=E2Eテストタスク')).toBeVisible();

    // タスク編集
    await page.click('[data-testid="task-item"]:has-text("E2Eテストタスク")');
    await page.click('[data-testid="edit-task-button"]');
    await page.fill('[data-testid="task-title-input"]', 'E2Eテストタスク（編集済み）');
    await page.click('[data-testid="save-task-button"]');

    // 編集確認
    await expect(page.locator('text=E2Eテストタスク（編集済み）')).toBeVisible();

    // タスク完了
    await page.click('[data-testid="task-checkbox"]:near(text="E2Eテストタスク（編集済み）")');

    // 完了確認
    await expect(page.locator('[data-testid="completed-tasks-section"]')).toContainText('E2Eテストタスク（編集済み）');
  });

  test('should handle drag and drop in kanban board', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="kanban-view-button"]');

    // ドラッグ&ドロップ
    const taskCard = page.locator('[data-testid="task-card"]').first();
    const targetColumn = page.locator('[data-testid="column-in-progress"]');

    await taskCard.dragTo(targetColumn);

    // ステータス変更確認
    await expect(targetColumn).toContainText(await taskCard.textContent());
  });
});
```

## 📊 テストカバレッジ・品質管理

### 1. カバレッジレポート

```bash
# カバレッジレポート生成
npm run test:coverage

# HTML形式でブラウザ表示
npm run test:coverage -- --reporter=html
open coverage/index.html
```

### 2. CI/CD統合

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:coverage
      - run: npm run build

      # カバレッジレポートのアップロード
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

## 🔧 デバッグ・トラブルシューティング

### よくあるテスト問題

#### 1. 非同期処理のテスト

```typescript
// ❌ Bad: 非同期処理を待たない
test('should update task', () => {
  const { result } = renderHook(() => useTasks());
  result.current.updateTask('task-1', { title: 'Updated' });
  expect(result.current.tasks[0].title).toBe('Updated'); // 失敗する可能性
});

// ✅ Good: 適切に非同期を待つ
test('should update task', async () => {
  const { result } = renderHook(() => useTasks());

  await act(async () => {
    await result.current.updateTask('task-1', { title: 'Updated' });
  });

  expect(result.current.tasks[0].title).toBe('Updated');
});
```

#### 2. タイマー・日付のテスト

```typescript
// ❌ Bad: 実際の時間に依存
test('should show overdue status', () => {
  const task = { dueDate: new Date('2020-01-01') };
  expect(isOverdue(task.dueDate)).toBe(true); // 将来的に失敗する可能性
});

// ✅ Good: 時間をモック
test('should show overdue status', () => {
  vi.setSystemTime(new Date('2025-01-01'));

  const task = { dueDate: new Date('2020-01-01') };
  expect(isOverdue(task.dueDate)).toBe(true);

  vi.useRealTimers();
});
```

---

💡 **Pro Tip**: テストは品質保証だけでなく、リファクタリングの安全性確保とドキュメント的役割も果たします。新機能実装時は必ずテストも作成しましょう！
