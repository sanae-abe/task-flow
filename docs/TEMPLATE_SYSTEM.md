# テンプレートシステム実装ドキュメント

TaskFlowアプリケーションのテンプレート機能の完全なインフラストラクチャ実装。

## 概要

このドキュメントでは、テンプレート機能のデータ構造、ストレージ、状態管理、バリデーションなど、バックエンドインフラストラクチャの全体像を説明します。

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                  React Components                       │
│          (TemplateManagementPanel, etc.)                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│              TemplateContext (React Context)            │
│          - State Management                             │
│          - CRUD Operations                              │
│          - Filter/Sort Logic                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│              TemplateStorage (LocalStorage)             │
│          - Data Persistence                             │
│          - Import/Export                                │
│          - Migration                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│              Validation & Utilities                     │
│          - Data Validation                              │
│          - Template ↔ Task Conversion                   │
│          - Relative Date Parsing                        │
└─────────────────────────────────────────────────────────┘
```

## 実装ファイル

### 1. 型定義

#### `/src/types/template.ts`
テンプレート関連の型定義。

**主要な型:**
- `TaskTemplate` - テンプレートのメインデータ構造
- `TemplateFormData` - フォーム入力用データ構造
- `TemplateCategory` - カテゴリー定義
- `TemplateFilter` - フィルタリング設定
- `TemplateSortConfig` - ソート設定

**特徴:**
- 相対日付サポート（"+1d", "+1w", etc.）
- ボード/カラムとの関連付け
- 使用回数トラッキング
- お気に入り機能

### 2. ストレージ層

#### `/src/utils/templateStorage.ts`
LocalStorageを使用したテンプレートデータの永続化。

**主要クラス:**
```typescript
class TemplateStorage {
  static load(): TaskTemplate[]
  static save(templates: TaskTemplate[]): void
  static create(formData: TemplateFormData): TaskTemplate
  static update(id: string, updates: Partial<TemplateFormData>): TaskTemplate | null
  static delete(id: string): boolean
  static incrementUsage(id: string): void
  static toggleFavorite(id: string): boolean
  static import(data: unknown, options?: ImportOptions): void
  static export(): TemplateStorageSchema
  static getStorageInfo(): StorageInfo
}
```

**機能:**
- 自動バリデーション
- エラーハンドリング
- データマイグレーション
- ストレージサイズ管理
- インポート/エクスポート

**ストレージスキーマ:**
```typescript
interface TemplateStorageSchema {
  version: string;        // "1.0.0"
  templates: TaskTemplate[];
  updatedAt: string;
}
```

**エラーハンドリング:**
- `TemplateStorageError` カスタムエラークラス
- エラータイプ: `STORAGE_UNAVAILABLE`, `PARSE_ERROR`, `VALIDATION_ERROR`, `QUOTA_EXCEEDED`

### 3. 状態管理

#### `/src/contexts/TemplateContext.tsx`
React Context APIを使用したグローバル状態管理。

**提供される機能:**
```typescript
interface TemplateContextType {
  // State
  templates: TaskTemplate[];
  filteredTemplates: TaskTemplate[];
  isLoading: boolean;
  error: string | null;

  // CRUD Operations
  createTemplate(formData: TemplateFormData): Promise<TaskTemplate>;
  updateTemplate(id: string, updates: Partial<TemplateFormData>): Promise<TaskTemplate | null>;
  deleteTemplate(id: string): Promise<boolean>;

  // Usage Tracking
  incrementUsage(id: string): void;
  toggleFavorite(id: string): void;

  // Filter/Sort
  setFilter(filter: TemplateFilter): void;
  setSort(sort: TemplateSortConfig): void;
  clearFilter(): void;

  // Import/Export
  importTemplates(templates: TaskTemplate[], merge?: boolean): Promise<void>;
  exportTemplates(): TaskTemplate[];

  // Utilities
  getTemplateById(id: string): TaskTemplate | undefined;
  getStorageInfo(): StorageInfo;
}
```

**最適化:**
- `useMemo` でフィルタリング・ソート結果をメモ化
- `useCallback` でメソッドをメモ化
- 自動的な通知（成功/エラー）

### 4. テンプレート ↔ タスク変換

#### `/src/utils/templateToTask.ts`
テンプレートからタスクへの変換と相対日付の処理。

**主要関数:**
```typescript
// テンプレート → タスク
function templateToTask(
  template: TaskTemplate,
  options?: TemplateToTaskOptions
): Task;

// タスク → テンプレート
function taskToTemplate(
  task: Task,
  templateData: TemplateMetadata
): Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>;

// 相対日付処理
function getRelativeDateLabel(relativeDateStr: string | null): string;
function isValidRelativeDate(dateStr: string): boolean;
function createRelativeDate(amount: number, unit: 'd' | 'w' | 'm' | 'y', direction?: '+' | '-'): string;
```

**相対日付のサポート:**
- `+1d` - 1日後
- `+1w` - 1週間後
- `+1m` - 1ヶ月後
- `+1y` - 1年後
- 負の値も可能（例: `-1d`）

**プリセット:**
```typescript
const RELATIVE_DATE_PRESETS = [
  { label: '今日', value: '+0d' },
  { label: '明日', value: '+1d' },
  { label: '3日後', value: '+3d' },
  { label: '1週間後', value: '+1w' },
  { label: '2週間後', value: '+2w' },
  { label: '1ヶ月後', value: '+1m' },
  { label: '3ヶ月後', value: '+3m' },
  { label: '6ヶ月後', value: '+6m' },
  { label: '1年後', value: '+1y' },
];
```

### 5. バリデーション

#### `/src/utils/templateValidation.ts`
包括的なデータバリデーション機能。

**主要関数:**
```typescript
// フォームデータのバリデーション
function validateTemplateFormData(formData: Partial<TemplateFormData>): ValidationResult;

// テンプレート全体のバリデーション
function validateTemplate(template: Partial<TaskTemplate>): ValidationResult;

// フィールド別バリデーション
function validateTemplateName(name: string): ValidationError | null;
function validateTaskTitle(title: string): ValidationError | null;
function validateCategory(category: string): ValidationError | null;
function validatePriority(priority: string): ValidationError | null;
function validateDueDate(dueDate: string | null): ValidationError | null;

// サニタイゼーション
function sanitizeTemplateFormData(formData: Partial<TemplateFormData>): TemplateFormData;

// 複数テンプレートのバリデーション
function validateTemplates(templates: Partial<TaskTemplate>[]): {
  validTemplates: TaskTemplate[];
  invalidTemplates: Array<{ template: Partial<TaskTemplate>; errors: ValidationError[] }>;
};

// インポートデータのバリデーション
function validateImportData(data: unknown): {
  isValid: boolean;
  templates: TaskTemplate[];
  errors: string[];
};
```

**バリデーションルール:**
- テンプレート名: 必須、100文字以内
- テンプレート説明: 500文字以内
- タスクタイトル: 必須、200文字以内
- タスク説明: 10000文字以内
- カテゴリー: 必須、有効な値のみ
- プライオリティ: 必須、有効な値のみ
- 期限: 相対日付形式またはISO形式

### 6. ユーティリティ集約

#### `/src/utils/template/index.ts`
テンプレート関連のすべてのユーティリティをエクスポート。

```typescript
export {
  // Storage
  TemplateStorage,
  TemplateStorageError,
  type TemplateStorageSchema,

  // Conversion
  templateToTask,
  taskToTemplate,
  getRelativeDateLabel,
  RELATIVE_DATE_PRESETS,

  // Validation
  validateTemplateFormData,
  validateTemplate,
  sanitizeTemplateFormData,
  validateImportData,
};
```

## 使用例

### 基本的な使い方

```typescript
import { useTemplate } from '@/contexts/TemplateContext';
import { templateToTask } from '@/utils/templateToTask';

function MyComponent() {
  const {
    templates,
    filteredTemplates,
    createTemplate,
    incrementUsage,
  } = useTemplate();

  // テンプレートを作成
  const handleCreate = async () => {
    const template = await createTemplate({
      name: 'ミーティング準備',
      description: '定例ミーティング用',
      category: 'meeting',
      taskTitle: 'ミーティング準備',
      taskDescription: 'アジェンダと資料の準備',
      priority: 'high',
      labels: [],
      dueDate: '+1d', // 明日
      isFavorite: false,
    });
  };

  // テンプレートからタスクを作成
  const handleUseTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const task = templateToTask(template, {
      columnId: 'some-column-id',
    });

    // タスクをボードに追加
    // ...

    // 使用回数をインクリメント
    incrementUsage(templateId);
  };

  return (
    <div>
      {filteredTemplates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          onUse={() => handleUseTemplate(template.id)}
        />
      ))}
    </div>
  );
}
```

### フィルタリングとソート

```typescript
function TemplateList() {
  const { setFilter, setSort, filteredTemplates } = useTemplate();

  // カテゴリーでフィルタ
  const handleCategoryFilter = (category: TemplateCategory) => {
    setFilter({ category });
  };

  // お気に入りのみ表示
  const handleFavoriteFilter = () => {
    setFilter({ isFavorite: true });
  };

  // 使用回数でソート
  const handleSortByUsage = () => {
    setSort({ field: 'usageCount', direction: 'desc' });
  };

  // 検索
  const handleSearch = (query: string) => {
    setFilter({ searchQuery: query });
  };

  return (
    <div>
      <FilterBar
        onCategoryChange={handleCategoryFilter}
        onFavoriteToggle={handleFavoriteFilter}
        onSearch={handleSearch}
      />
      <SortBar onSortChange={handleSortByUsage} />
      <TemplateGrid templates={filteredTemplates} />
    </div>
  );
}
```

### インポート/エクスポート

```typescript
function TemplateImportExport() {
  const { exportTemplates, importTemplates } = useTemplate();

  // エクスポート
  const handleExport = () => {
    const templates = exportTemplates();
    const data = {
      version: '1.0.0',
      templates,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates-${Date.now()}.json`;
    a.click();
  };

  // インポート
  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.templates && Array.isArray(data.templates)) {
        await importTemplates(data.templates, true); // マージ
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleExport}>エクスポート</button>
      <input
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImport(file);
        }}
      />
    </div>
  );
}
```

## データフロー

### テンプレートの作成

```
User Input (Form)
    ↓
validateTemplateFormData()
    ↓
createTemplate() [TemplateContext]
    ↓
TemplateStorage.create()
    ↓
validateTemplate()
    ↓
localStorage.setItem()
    ↓
Dispatch UPDATE_STATE
    ↓
Re-render Components
```

### テンプレートからタスクを作成

```
Select Template
    ↓
templateToTask()
    ↓
parseRelativeDate() [Convert "+1d" to absolute date]
    ↓
Create Task Object
    ↓
Add to Board
    ↓
incrementUsage() [Track template usage]
```

## パフォーマンス最適化

### メモ化

```typescript
// TemplateContext.tsx
const filteredTemplates = useMemo(() => {
  const filtered = filterTemplates(state.templates, state.filter);
  return sortTemplates(filtered, state.sort);
}, [state.templates, state.filter, state.sort]);

const createTemplate = useCallback(async (formData: TemplateFormData) => {
  // ...
}, [notify]);
```

### ストレージ最適化

- 変更時のみ保存（不要な書き込みを防ぐ）
- バリデーションエラー時は保存しない
- ストレージサイズの監視

## エラーハンドリング

### ストレージエラー

```typescript
try {
  const template = await createTemplate(formData);
} catch (error) {
  if (error instanceof TemplateStorageError) {
    switch (error.type) {
      case 'QUOTA_EXCEEDED':
        // ストレージ容量不足
        break;
      case 'VALIDATION_ERROR':
        // バリデーションエラー
        break;
      case 'STORAGE_UNAVAILABLE':
        // LocalStorageが利用不可
        break;
      default:
        // その他のエラー
        break;
    }
  }
}
```

### バリデーションエラー

```typescript
const validation = validateTemplateFormData(formData);
if (!validation.isValid) {
  // エラー表示
  validation.errors.forEach(error => {
    console.error(`${error.field}: ${error.message}`);
  });
}
```

## セキュリティ

### データサニタイゼーション

```typescript
// ユーザー入力を安全な値に変換
const sanitized = sanitizeTemplateFormData(rawFormData);
```

### バリデーション

- すべての入力を検証
- 型安全性の確保
- XSS対策（HTMLサニタイズは別モジュールで実施）

## テスト

### ユニットテスト例

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { TemplateProvider, useTemplate } from '@/contexts/TemplateContext';

describe('TemplateContext', () => {
  it('should create template', async () => {
    const { result } = renderHook(() => useTemplate(), {
      wrapper: TemplateProvider,
    });

    await act(async () => {
      const template = await result.current.createTemplate({
        name: 'Test Template',
        description: 'Test',
        category: 'work',
        taskTitle: 'Test Task',
        taskDescription: 'Test',
        priority: 'medium',
        labels: [],
        dueDate: '+1d',
        isFavorite: false,
      });

      expect(template.name).toBe('Test Template');
      expect(result.current.templates).toHaveLength(1);
    });
  });

  it('should filter templates', () => {
    const { result } = renderHook(() => useTemplate(), {
      wrapper: TemplateProvider,
    });

    act(() => {
      result.current.setFilter({ category: 'work' });
    });

    expect(result.current.state.filter.category).toBe('work');
  });
});
```

## マイグレーション

将来のバージョンアップ時のデータマイグレーション機能を実装済み。

```typescript
// templateStorage.ts
private static migrate(data: TemplateStorageSchema): TemplateStorageSchema {
  // バージョン間のデータ変換
  // 現在は1.0.0のみなので、将来の拡張用
  return {
    ...data,
    version: STORAGE_VERSION,
  };
}
```

## ベストプラクティス

1. **型安全性**
   - TypeScript strict mode準拠
   - すべての関数に明示的な型定義

2. **エラーハンドリング**
   - カスタムエラークラスの使用
   - エラーの適切な分類と処理

3. **パフォーマンス**
   - メモ化による最適化
   - 不要な再レンダリングの防止

4. **ユーザー体験**
   - 操作後の通知
   - ローディング状態の表示
   - エラーメッセージの表示

5. **保守性**
   - 明確な責務分離
   - ドキュメント化
   - 一貫したコーディングスタイル

## 今後の拡張予定

- [ ] サーバーサイドストレージのサポート
- [ ] テンプレートの共有機能
- [ ] テンプレートのバージョン管理
- [ ] テンプレートのカテゴリーカスタマイズ
- [ ] AIによるテンプレート推薦
- [ ] テンプレートの使用統計分析

## 関連ドキュメント

- [Template Context README](/src/contexts/template/README.md)
- [CLAUDE.md](/CLAUDE.md) - プロジェクト全体の説明
- [型定義](/src/types/template.ts)

## まとめ

TaskFlowのテンプレート機能は、以下の要素で構成されています：

1. **堅牢な型システム** - TypeScript strict mode完全準拠
2. **安全なストレージ** - バリデーション、エラーハンドリング、マイグレーション
3. **効率的な状態管理** - React Context API、メモ化最適化
4. **包括的なバリデーション** - 入力検証、データサニタイズ
5. **柔軟な変換機能** - テンプレート ↔ タスク、相対日付処理

この実装により、拡張性が高く、保守しやすい、プロダクション品質のテンプレートシステムが完成しました。
