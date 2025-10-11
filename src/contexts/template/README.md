# Template Context

TaskFlowアプリケーションのテンプレート機能の状態管理を提供するContextです。

## 概要

TemplateContextは、タスクテンプレートのCRUD操作、フィルタリング、ソート、インポート/エクスポートなどの機能を提供します。

## 使用方法

### 1. プロバイダーの設定

アプリケーションのルートでTemplateProviderをラップします。

```typescript
import { TemplateProvider } from './contexts/TemplateContext';

function App() {
  return (
    <TemplateProvider>
      <YourApp />
    </TemplateProvider>
  );
}
```

### 2. フックの使用

コンポーネント内でuseTemplateフックを使用します。

```typescript
import { useTemplate } from './contexts/TemplateContext';

function MyComponent() {
  const {
    templates,
    filteredTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setFilter,
  } = useTemplate();

  // テンプレートの作成
  const handleCreate = async () => {
    const formData = {
      name: 'ミーティング準備',
      description: '定例ミーティングの準備タスク',
      category: 'meeting',
      taskTitle: 'ミーティング準備',
      taskDescription: 'アジェンダの作成と資料の準備',
      priority: 'high',
      labels: [],
      dueDate: '+1d', // 1日後
      isFavorite: false,
    };

    const template = await createTemplate(formData);
  };

  return <div>{/* UI */}</div>;
}
```

## API

### State

- `templates: TaskTemplate[]` - 全テンプレートのリスト
- `filteredTemplates: TaskTemplate[]` - フィルタ・ソート済みのテンプレートリスト
- `isLoading: boolean` - ローディング状態
- `error: string | null` - エラーメッセージ

### Methods

#### createTemplate(formData: TemplateFormData): Promise<TaskTemplate>

新しいテンプレートを作成します。

```typescript
const template = await createTemplate({
  name: 'テンプレート名',
  description: '説明',
  category: 'work',
  taskTitle: 'タスクタイトル',
  taskDescription: 'タスクの説明',
  priority: 'medium',
  labels: [],
  dueDate: '+1w',
  isFavorite: false,
});
```

#### updateTemplate(id: string, updates: Partial<TemplateFormData>): Promise<TaskTemplate | null>

既存のテンプレートを更新します。

```typescript
const updated = await updateTemplate(templateId, {
  name: '新しい名前',
  priority: 'high',
});
```

#### deleteTemplate(id: string): Promise<boolean>

テンプレートを削除します。

```typescript
const success = await deleteTemplate(templateId);
```

#### incrementUsage(id: string): void

テンプレートの使用回数をインクリメントします。

```typescript
incrementUsage(templateId);
```

#### toggleFavorite(id: string): void

テンプレートのお気に入り状態を切り替えます。

```typescript
toggleFavorite(templateId);
```

#### setFilter(filter: TemplateFilter): void

テンプレートのフィルターを設定します。

```typescript
setFilter({
  category: 'work',
  isFavorite: true,
  searchQuery: '検索ワード',
});
```

#### setSort(sort: TemplateSortConfig): void

テンプレートのソート順を設定します。

```typescript
setSort({
  field: 'usageCount',
  direction: 'desc',
});
```

#### clearFilter(): void

フィルターをクリアします。

```typescript
clearFilter();
```

#### importTemplates(templates: TaskTemplate[], merge?: boolean): Promise<void>

テンプレートをインポートします。

```typescript
await importTemplates(importedTemplates, true); // マージ
await importTemplates(importedTemplates, false); // 置換
```

#### exportTemplates(): TaskTemplate[]

全テンプレートをエクスポートします。

```typescript
const templates = exportTemplates();
```

#### getTemplateById(id: string): TaskTemplate | undefined

IDでテンプレートを取得します。

```typescript
const template = getTemplateById(templateId);
```

#### getStorageInfo(): StorageInfo

ストレージ情報を取得します。

```typescript
const info = getStorageInfo();
console.log(info.templatesCount); // テンプレート数
console.log(info.storageSize); // ストレージサイズ（バイト）
console.log(info.version); // ストレージバージョン
console.log(info.lastUpdated); // 最終更新日時
```

## 型定義

### TaskTemplate

```typescript
interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  taskTitle: string;
  taskDescription: string;
  priority: Priority;
  labels: Label[];
  dueDate: string | null; // 相対日付 ("+1d", "+1w", etc.)
  recurrence?: RecurrenceConfig;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isFavorite: boolean;
  boardId?: string;
  columnId?: string;
}
```

### TemplateCategory

```typescript
type TemplateCategory =
  | 'work'
  | 'personal'
  | 'project'
  | 'meeting'
  | 'routine'
  | 'other';
```

### TemplateFilter

```typescript
interface TemplateFilter {
  category?: TemplateCategory;
  isFavorite?: boolean;
  searchQuery?: string;
  boardId?: string;
}
```

### TemplateSortConfig

```typescript
interface TemplateSortConfig {
  field: 'name' | 'category' | 'usageCount' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}
```

## ストレージ

テンプレートデータはLocalStorageに保存されます。

- **ストレージキー**: `taskflow-templates`
- **バージョン**: `1.0.0`
- **自動保存**: 各操作後に自動的に保存されます
- **エラーハンドリング**: ストレージエラーは適切にハンドリングされ、通知されます

## 相対日付

テンプレートの期限は相対日付形式で指定できます。

### 形式

- `+1d` - 1日後
- `+1w` - 1週間後
- `+1m` - 1ヶ月後
- `+1y` - 1年後
- `-1d` - 1日前（過去の日付）

### プリセット

```typescript
import { RELATIVE_DATE_PRESETS } from './utils/templateToTask';

RELATIVE_DATE_PRESETS.forEach(preset => {
  console.log(`${preset.label}: ${preset.value}`);
});
```

## 使用例

### テンプレート管理画面

```typescript
import { useTemplate } from './contexts/TemplateContext';

function TemplateManagementPanel() {
  const {
    filteredTemplates,
    isLoading,
    createTemplate,
    deleteTemplate,
    setFilter,
    setSort,
  } = useTemplate();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <TemplateFilter onFilterChange={setFilter} />
      <TemplateSorter onSortChange={setSort} />

      {filteredTemplates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          onDelete={() => deleteTemplate(template.id)}
        />
      ))}

      <CreateTemplateButton onCreate={createTemplate} />
    </div>
  );
}
```

### テンプレートからタスクを作成

```typescript
import { useTemplate } from './contexts/TemplateContext';
import { templateToTask } from './utils/templateToTask';
import { useBoard } from './contexts/BoardContext';

function CreateTaskFromTemplate({ templateId, columnId }) {
  const { getTemplateById, incrementUsage } = useTemplate();
  const { currentBoard, updateBoard } = useBoard();

  const handleCreateTask = () => {
    const template = getTemplateById(templateId);
    if (!template || !currentBoard) return;

    // テンプレートからタスクを作成
    const task = templateToTask(template, { columnId });

    // ボードに追加
    const column = currentBoard.columns.find(c => c.id === columnId);
    if (column) {
      column.tasks.push(task);
      updateBoard(currentBoard.id, { columns: currentBoard.columns });

      // 使用回数をインクリメント
      incrementUsage(templateId);
    }
  };

  return <button onClick={handleCreateTask}>テンプレートから作成</button>;
}
```

## エラーハンドリング

```typescript
import { useTemplate } from './contexts/TemplateContext';
import { TemplateStorageError } from './utils/templateStorage';

function MyComponent() {
  const { createTemplate } = useTemplate();

  const handleCreate = async () => {
    try {
      await createTemplate(formData);
    } catch (error) {
      if (error instanceof TemplateStorageError) {
        switch (error.type) {
          case 'QUOTA_EXCEEDED':
            alert('ストレージの容量が不足しています');
            break;
          case 'VALIDATION_ERROR':
            alert('入力内容に誤りがあります');
            break;
          default:
            alert('エラーが発生しました');
        }
      }
    }
  };
}
```

## パフォーマンス最適化

- **メモ化**: `useMemo`を使用してフィルター・ソートを最適化
- **コールバック**: `useCallback`を使用してメソッドを最適化
- **遅延読み込み**: 初回のみストレージから読み込み
- **差分更新**: 変更があったテンプレートのみ更新

## テスト

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { TemplateProvider, useTemplate } from './TemplateContext';

describe('TemplateContext', () => {
  it('should create template', async () => {
    const { result } = renderHook(() => useTemplate(), {
      wrapper: TemplateProvider,
    });

    await act(async () => {
      const template = await result.current.createTemplate({
        name: 'Test Template',
        // ... other fields
      });

      expect(template.name).toBe('Test Template');
    });
  });
});
```

## 注意事項

- TemplateProviderはBoardProviderと独立して動作します
- LocalStorageの容量制限（通常5-10MB）に注意してください
- 大量のテンプレート（100個以上）を扱う場合はパフォーマンスに注意してください
- インポート時は必ずバリデーションを行ってください
