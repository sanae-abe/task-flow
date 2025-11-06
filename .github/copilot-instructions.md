# GitHub Copilot Instructions for TaskFlow

## 🎯 プロジェクト概要

TaskFlowは、React + TypeScript + Viteで構築されたモダンなタスク管理アプリケーションです。
Kanbanボード、カレンダービュー、テーブルビューを備え、ドラッグ&ドロップ、ファイル添付、リッチテキストエディタなどの高度な機能を提供します。

## 🛠️ 技術スタック

- **フロントエンド**: React 19.2.0, TypeScript 5.7.3
- **ビルドツール**: Vite 7.1.12
- **UI**: Radix UI, Tailwind CSS, shadcn/ui
- **状態管理**: React Context + useReducer
- **ドラッグ&ドロップ**: @dnd-kit
- **リッチテキスト**: Lexical Editor
- **テスト**: Vitest, React Testing Library
- **ストレージ**: localStorage (IndexedDB検討中)

## 📋 コード品質基準

### TypeScript

- ✅ **strictモード必須**: `tsconfig.json` で `"strict": true` が有効
- ✅ **any型禁止**: やむを得ない場合のみ使用し、コメントで理由を明記
- ✅ **型推論活用**: 冗長な型定義を避け、適切な型推論を利用
- ✅ **型エラーゼロ**: コンパイル時エラーは必ず解決

### コード品質

- ✅ **ESLint**: エラー0件必須（警告は説明付きで許容）
- ✅ **Prettier**: `npm run format` で自動整形
- ✅ **命名規則**:
  - コンポーネント: PascalCase (`TaskCard.tsx`)
  - 関数/変数: camelCase (`handleTaskUpdate`)
  - 定数: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
  - 型/インターフェース: PascalCase (`Task`, `TaskState`)
- ✅ **コメント**: 複雑なロジックには必ず説明を付ける

## 🔒 セキュリティ基準

### OWASP Top 10対策

- [ ] **XSS対策**: ユーザー入力の適切なサニタイズ（DOMPurify使用）
- [ ] **入力検証**: 全ユーザー入力のバリデーション実装
- [ ] **機密情報**: `.env` ファイルへのAPIキー等の保存禁止
- [ ] **依存関係**: 脆弱性を持つライブラリの使用回避

### コード実装

- [ ] **エラーハンドリング**: 機密情報を含まないエラーメッセージ
- [ ] **ファイルアップロード**: サイズ制限（5MB）と型チェック
- [ ] **localStorage**: 機密データの暗号化検討

## ⚡ パフォーマンス基準

### フロントエンド性能

- [ ] **初回ロード**: 3秒以内のページ表示
- [ ] **バンドルサイズ**: 前回比±10%以内
- [ ] **React最適化**:
  - `useMemo`, `useCallback` の適切な使用
  - 不要な再レンダリングの防止
  - 大量リストの仮想化検討
- [ ] **画像最適化**: 適切なサイズとフォーマット

### 開発効率

- [ ] **ビルド時間**: 通常ビルド30秒以内
- [ ] **HMR**: 高速なホットリロード
- [ ] **テスト実行**: 単体テスト10秒以内

## 🏗️ アーキテクチャパターン

### ディレクトリ構造

```
src/
├── components/     # Reactコンポーネント（単一責任の原則）
├── contexts/       # Contextプロバイダー
├── hooks/          # カスタムフック
├── reducers/       # 状態管理reducer
├── utils/          # ユーティリティ関数
├── types/          # TypeScript型定義
├── constants/      # 定数定義
└── styles/         # グローバルスタイル
```

### コンポーネント設計

- **単一責任**: 1コンポーネント1責務
- **Props型定義**: 全Propsに明示的な型定義
- **Hooks分離**: ビジネスロジックはカスタムフックへ
- **Pure Component**: 可能な限り副作用を避ける

### 状態管理

- **Context + useReducer**: グローバル状態管理
- **localStorage**: データ永続化
- **派生状態**: useMemoで計算結果をメモ化

## 📝 コーディング規約

### React

```typescript
// ✅ Good: 型定義された関数コンポーネント
interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate }) => {
  // Hooksは関数の最上位で使用
  const [isEditing, setIsEditing] = useState(false);

  // イベントハンドラーはuseCallbackでメモ化
  const handleSave = useCallback(() => {
    onUpdate(task);
  }, [task, onUpdate]);

  return <div>{/* JSX */}</div>;
};

// ❌ Bad: 型定義なし、any型使用
export const TaskCard = (props: any) => {
  return <div>{props.task.name}</div>;
};
```

### TypeScript

```typescript
// ✅ Good: 明示的な型定義
type TaskStatus = 'todo' | 'in-progress' | 'done';

interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  dueDate?: Date;
}

// ❌ Bad: any型の濫用
const updateTask = (task: any) => {
  // ...
};
```

### Hooks

```typescript
// ✅ Good: カスタムフックの適切な使用
export const useTasks = () => {
  const [state, dispatch] = useContext(TaskContext);

  const addTask = useCallback(
    (task: Task) => {
      dispatch({ type: 'ADD_TASK', payload: task });
    },
    [dispatch]
  );

  return { tasks: state.tasks, addTask };
};

// ❌ Bad: ロジックがコンポーネント内に散在
const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  // 複雑なロジックが直接書かれている
};
```

## 🧪 テスト戦略

### テスト要件

- [ ] **単体テスト**: 新機能・修正箇所のテストカバレッジ
- [ ] **命名**: `describe` と `it` で明確なテストケース記述
- [ ] **AAA Pattern**: Arrange, Act, Assert の構造
- [ ] **モック**: 外部依存のモック化

### テスト例

```typescript
describe('TaskCard', () => {
  it('should display task name correctly', () => {
    const task = { id: '1', name: 'Test Task', status: 'todo' };
    render(<TaskCard task={task} onUpdate={vi.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

## 🔄 開発フロー

### 実装手順

1. **要件確認**: 機能要件・制約条件の明確化
2. **型定義**: TypeScript型・インターフェースの設計
3. **実装**: 段階的な機能実装
4. **テスト**: 単体・統合テストの作成
5. **検証**: ESLint, TypeScript, 手動テスト実行

### Git ワークフロー

- **ブランチ**: `feature/`, `fix/`, `refactor/` プレフィックス
- **コミット**: 変更内容を明確に記述（英語推奨）
- **プルリクエスト**: 変更の目的と影響範囲を説明

## 📂 ファイル操作規則

### 許可

- ✅ **ソースコード**: 自由に読み書き・作成
- ✅ **ドキュメント**: README, CHANGELOG等の更新
- ✅ **テスト**: テストファイルの作成・編集

### 要確認

- ⚠️ **設定ファイル**: `package.json`, `tsconfig.json`, `vite.config.ts` の変更は影響説明
- ⚠️ **重要ファイル削除**: メインコンポーネント等の削除は事前確認

### 禁止

- ❌ **環境変数**: `.env`, `.envrc` の読み書き完全禁止
- ❌ **Git内部**: `.git/` ディレクトリの直接操作禁止
- ❌ **node_modules**: 依存関係の直接編集禁止

## 💡 実装パターン

### カスタムフック作成

```typescript
// src/hooks/useTaskFilter.ts
export const useTaskFilter = (tasks: Task[]) => {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');

  const filteredTasks = useMemo(() => {
    if (filterStatus === 'all') return tasks;
    return tasks.filter(task => task.status === filterStatus);
  }, [tasks, filterStatus]);

  return { filteredTasks, filterStatus, setFilterStatus };
};
```

### Context利用

```typescript
// contexts/TaskContext.tsx
const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
};
```

### エラーハンドリング

```typescript
try {
  const result = await performOperation();
  return result;
} catch (error) {
  // ユーザーに分かりやすいエラーメッセージ
  console.error('Operation failed:', error);
  throw new Error('タスクの保存に失敗しました');
}
```

## 🎨 UI/UX原則

### アクセシビリティ

- [ ] **キーボード操作**: 全機能がキーボードで操作可能
- [ ] **ARIAラベル**: 適切なaria属性の設定
- [ ] **フォーカス管理**: 視覚的に分かりやすいフォーカス表示
- [ ] **カラーコントラスト**: WCAG AA基準を満たすコントラスト

### レスポンシブデザイン

- [ ] **モバイルファースト**: スマホ表示を優先設計
- [ ] **ブレークポイント**: Tailwind標準（sm, md, lg, xl）
- [ ] **タッチ操作**: 十分なタップターゲットサイズ

## 🚨 エラー対応

### デバッグ手順

1. **エラーメッセージ確認**: コンソール・TypeScriptエラー
2. **原因特定**: React DevTools, ブレークポイント活用
3. **修正実装**: 最小限の変更で問題解決
4. **回帰テスト**: 既存機能への影響確認

### よくあるエラー

- **型エラー**: `any` を避け、適切な型定義を使用
- **再レンダリング**: `useMemo`, `useCallback` で最適化
- **メモリリーク**: `useEffect` のクリーンアップ関数を忘れずに

## 📚 学習リソース

### 公式ドキュメント

- [React公式](https://react.dev/)
- [TypeScript公式](https://www.typescriptlang.org/)
- [Vite公式](https://vitejs.dev/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### プロジェクト固有

- `README.md`: 機能一覧・セットアップ手順
- `TECHNICAL_ROADMAP.md`: 技術的な改善計画
- `PROJECT_QUALITY_REPORT.md`: 品質レポート

## 🎯 開発原則

### 基本姿勢

- **実用性優先**: 理想と現実のバランスを取った実装
- **段階的改善**: 完璧を求めず、継続的な改善を重視
- **チーム協働**: コードレビューとペアプログラミングの活用
- **ドキュメント**: コードだけでなく、意図も説明

### コードレビューポイント

- [ ] 型安全性が確保されているか
- [ ] パフォーマンスへの影響は考慮されているか
- [ ] アクセシビリティ要件を満たしているか
- [ ] テストカバレッジは十分か
- [ ] セキュリティリスクはないか

## 🔧 よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# リント
npm run lint

# フォーマット
npm run format

# 型チェック
npm run type-check

# テスト実行
npm run test

# テスト（ウォッチモード）
npm run test:watch
```

## ⚠️ 注意事項

### パフォーマンス

- 大量のタスク表示時の仮想化検討
- 画像添付時のサイズ最適化
- localStorageの容量制限（5-10MB）

### ブラウザ互換性

- モダンブラウザ対応（Chrome, Firefox, Safari, Edge最新版）
- ES2020+ 機能の使用OK
- Polyfillは必要に応じて追加

### 将来の改善

- IndexedDBへの移行検討
- オフライン機能の追加
- PWA対応の強化
- バックエンドAPI連携

---

**最終更新**: 2025年10月31日
**対象バージョン**: TaskFlow v1.0.0
