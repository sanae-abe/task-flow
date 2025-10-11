# テンプレート管理コンポーネント

TaskFlowアプリケーションのタスクテンプレート管理機能を提供するコンポーネント群です。

## 概要

タスクテンプレート機能により、繰り返し使用するタスクのパターンを事前に定義しておき、ワンクリックで新しいタスクを作成できます。

## コンポーネント一覧

### 1. TemplateManagementPanel

メインの管理パネルコンポーネント。テンプレートの一覧表示、作成、編集、削除を行います。

**機能:**
- テンプレート一覧表示（テーブル形式）
- ソート機能（名前、カテゴリー、使用数、作成日時、更新日時）
- 検索機能（テンプレート名、説明、タスクタイトル）
- カテゴリーフィルター
- お気に入りフィルター
- テンプレートのCRUD操作

**使用例:**
```tsx
import { TemplateManagementPanel } from './components/TemplateManagement';

function SettingsPage() {
  return <TemplateManagementPanel />;
}
```

### 2. TemplateFormDialog

テンプレートの作成・編集を行うダイアログコンポーネント。

**Props:**
```typescript
interface TemplateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TemplateFormData) => void;
  template?: TaskTemplate | null;
  mode: 'create' | 'edit';
}
```

**機能:**
- テンプレート基本情報の入力（名前、説明、カテゴリー）
- タスク情報の設定（タイトル、説明、優先度、ラベル）
- バリデーション機能
- リアルタイムエラー表示

### 3. TemplateCard

テンプレート選択や管理で使用するカード表示コンポーネント。

**Props:**
```typescript
interface TemplateCardProps {
  template: TaskTemplate;
  onSelect?: (template: TaskTemplate) => void;
  onEdit?: (template: TaskTemplate) => void;
  onDelete?: (template: TaskTemplate) => void;
  onToggleFavorite?: (template: TaskTemplate) => void;
  showActions?: boolean;
  compact?: boolean;
}
```

**機能:**
- テンプレート情報の視覚的な表示
- お気に入り表示
- カテゴリーバッジ
- 使用回数表示
- アクションボタン（編集、削除、お気に入り）
- コンパクトモード対応

### 4. TemplateCategorySelector

カテゴリー選択用のセレクトボックスコンポーネント。

**Props:**
```typescript
interface TemplateCategorySelectorProps {
  value: TemplateCategory;
  onChange: (category: TemplateCategory) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  showDescription?: boolean;
}
```

**カテゴリー:**
- work（仕事）
- personal（個人）
- project（プロジェクト）
- meeting（会議）
- routine（ルーティン）
- other（その他）

## データ型

### TaskTemplate

```typescript
interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;

  // タスクデータ
  taskTitle: string;
  taskDescription: string;
  priority: Priority;
  labels: Label[];
  dueDate: string | null;
  recurrence?: RecurrenceConfig;

  // メタデータ
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isFavorite: boolean;

  // ボード関連
  boardId?: string;
  columnId?: string;
}
```

### TemplateFormData

```typescript
interface TemplateFormData {
  name: string;
  description: string;
  category: TemplateCategory;
  taskTitle: string;
  taskDescription: string;
  priority: Priority;
  labels: Label[];
  dueDate: string | null;
  recurrence?: RecurrenceConfig;
  isFavorite: boolean;
  boardId?: string;
  columnId?: string;
}
```

## スタイルガイド

- **カラー**: Primer Design Systemのカラートークンを使用
- **レイアウト**: CSS GridとFlexを使用したレスポンシブ対応
- **アニメーション**: ホバー時の0.2sトランジション
- **タイポグラフィ**: Primerの fontSize スケール（0, 1, 2）を使用

## アクセシビリティ

- 全てのインタラクティブ要素にaria-label設定
- キーボードナビゲーション対応
- フォーカス表示の明示
- スクリーンリーダー対応

## 開発・テスト

### デモページ

`TemplateManagementDemo.tsx`を使用して単体でテスト可能です。

```tsx
import TemplateManagementDemo from './components/TemplateManagement/TemplateManagementDemo';

// App.tsxなどに追加
<TemplateManagementDemo />
```

### ダミーデータ

現在の実装では、TemplateManagementPanel内にダミーデータが含まれています。実際の運用時には、Context APIやReduxなどの状態管理から取得する形に変更してください。

## 今後の拡張

- [ ] テンプレートからタスク作成機能
- [ ] テンプレートのインポート/エクスポート
- [ ] テンプレート共有機能
- [ ] サブタスクのテンプレート対応
- [ ] ファイル添付のテンプレート対応
- [ ] テンプレートプレビュー機能

## ファイル構成

```
src/components/TemplateManagement/
├── index.tsx                         # エクスポート定義
├── TemplateManagementPanel.tsx       # メイン管理パネル
├── TemplateFormDialog.tsx            # フォームダイアログ
├── TemplateCard.tsx                  # テンプレートカード
├── TemplateCategorySelector.tsx      # カテゴリー選択
├── TemplateManagementDemo.tsx        # デモページ
└── README.md                         # このファイル

src/types/
└── template.ts                       # 型定義
```

## パフォーマンス最適化

- `React.memo`による不要な再レンダリング防止
- `useCallback`によるコールバック関数のメモ化
- `useMemo`によるフィルタリング・ソート結果のキャッシュ

## 関連コンポーネント

- `LabelManagementPanel`: ラベル管理（同様のパターンを踏襲）
- `LabelSelector`: ラベル選択機能
- `UnifiedDialog`: 統一ダイアログコンポーネント
- `ConfirmDialog`: 確認ダイアログ

## ライセンス

TaskFlowプロジェクトのライセンスに準拠
