# DataManagement コンポーネント

データ管理機能（エクスポート/インポート）を提供するコンポーネント群。

## コンポーネント構成

```
DataManagement/
├── index.ts                 # エクスポート定義
├── types.ts                 # 型定義
├── DataManagementPanel.tsx  # メインパネル
├── ExportSection.tsx        # エクスポート機能
├── ImportSection.tsx        # インポート機能
└── DataStatistics.tsx       # データ統計表示
```

## 使用例

```tsx
import { DataManagementPanel } from "./components/DataManagement";

function SettingsDialog() {
  const handleExportAll = () => {
    // 全データエクスポート処理
  };

  const handleExportCurrent = () => {
    // 現在のボードエクスポート処理
  };

  return (
    <DataManagementPanel
      onExportAll={handleExportAll}
      onExportCurrent={handleExportCurrent}
      onImportSuccess={() => {
        console.log("インポート成功");
      }}
    />
  );
}
```

## 各コンポーネントの詳細

### DataManagementPanel

データ管理機能を統合するメインパネル。

**Props:**

- `onExportAll?: () => void` - 全データエクスポート時のコールバック
- `onExportCurrent?: () => void` - 現在のボードエクスポート時のコールバック
- `onImportSuccess?: () => void` - インポート成功時のコールバック

### ExportSection

エクスポート機能を提供するセクション。

**機能:**

- 全データエクスポート（カード型UI）
- 現在のボードエクスポート（カード型UI）
- データ統計の表示
- ホバー時のインタラクション

**内部で使用:**

- `useKanban` - ボード/ラベルデータの取得
- `calculateDataStatistics` - 統計情報の計算
- `DataStatistics` - 統計情報の表示

### ImportSection

インポート機能を提供するセクション（折りたたみ可能）。

**機能:**

- JSONファイルのインポート
- インポートモード選択（追加/置換）
- ファイル選択UI
- 警告メッセージ表示
- 進捗状態の表示

**内部で使用:**

- `useDataImport` - インポートロジック
- `useDataImportDropZone` - ファイル選択UI

**状態:**

- `isExpanded` - 展開/折りたたみ状態

### DataStatistics

データ統計情報を表示するコンポーネント。

**Props:**

- `statistics: DataStatisticsType` - 統計データ
- `title?: string` - タイトル（デフォルト: "データ概要"）

**表示項目:**

- ボード数
- タスク数
- ラベル数
- 添付ファイル数
- 推定データサイズ

## カスタムフック

### useDataImport

インポート機能のロジックを提供するカスタムフック。

```tsx
import { useDataImport } from '../../hooks/useDataImport';

function ImportComponent() {
  const {
    state,           // インポート状態
    selectFile,      // ファイル選択
    setImportMode,   // モード変更
    clearSelection,  // 選択クリア
    executeImport,   // インポート実行
    maxFileSize      // 最大ファイルサイズ
  } = useDataImport({
    onSuccess: (count) => console.log(`${count}個インポート成功`),
    onError: (error) => console.error('エラー:', error)
  });

  return (
    // UI実装
  );
}
```

**返り値:**

```typescript
{
  state: {
    isLoading: boolean;
    selectedFile: File | null;
    mode: 'merge' | 'replace';
    message: { type: 'success' | 'error'; text: string } | null;
  };
  selectFile: (file: File) => void;
  setImportMode: (mode: ImportMode) => void;
  clearMessage: () => void;
  clearSelection: () => void;
  executeImport: () => Promise<void>;
  maxFileSize: number;
}
```

## ユーティリティ関数

### calculateDataStatistics

全体のデータ統計を計算。

```tsx
import { calculateDataStatistics } from "../../utils/dataStatistics";

const stats = calculateDataStatistics(boards, labels);
// => {
//   boardCount: 5,
//   taskCount: 42,
//   labelCount: 10,
//   attachmentCount: 15,
//   estimatedSize: 51200 // bytes
// }
```

### calculateCurrentBoardStatistics

現在のボードのデータ統計を計算。

```tsx
import { calculateCurrentBoardStatistics } from "../../utils/dataStatistics";

const stats = calculateCurrentBoardStatistics(currentBoard);
// => {
//   taskCount: 12,
//   attachmentCount: 3,
//   estimatedSize: 10240 // bytes
// }
```

### formatFileSize

バイトサイズを人間が読みやすい形式に変換。

```tsx
import { formatFileSize } from "../../utils/dataStatistics";

formatFileSize(1024); // "1.0 KB"
formatFileSize(1536); // "1.5 KB"
formatFileSize(1048576); // "1.0 MB"
formatFileSize(1610612736); // "1.5 GB"
```

## 型定義

### ImportMode

```typescript
type ImportMode = "merge" | "replace";
```

### DataStatistics

```typescript
interface DataStatistics {
  boardCount: number;
  taskCount: number;
  labelCount: number;
  attachmentCount: number;
  estimatedSize: number; // bytes
}
```

### ImportState

```typescript
interface ImportState {
  isLoading: boolean;
  selectedFile: File | null;
  mode: ImportMode;
  message: {
    type: "success" | "error";
    text: string;
  } | null;
}
```

## パフォーマンス最適化

### メモ化

- 全コンポーネントで`React.memo`を使用
- データ統計計算は`useMemo`でキャッシュ
- 依存配列を適切に設定して不要な再計算を防止

### 計算量

- `calculateDataStatistics`: O(n) - ボード×カラム×タスク数に比例
- `formatFileSize`: O(1) - 定数時間

### 推奨される使用パターン

```tsx
// Good: useMemoで統計計算をキャッシュ
const stats = useMemo(
  () => calculateDataStatistics(boards, labels),
  [boards, labels],
);

// Bad: 毎回計算される
const stats = calculateDataStatistics(boards, labels);
```

## エラーハンドリング

### ファイル選択時

- ファイルサイズチェック（最大10MB）
- ファイルタイプチェック（JSONのみ）
- エラー時はメッセージを表示

### インポート時

- JSON構文エラー
- バリデーションエラー
- その他のランタイムエラー

すべてのエラーは適切なメッセージと共にUIに表示されます。

## アクセシビリティ

- セマンティックHTML
- キーボードナビゲーション対応
- 適切なARIA属性
- 色だけでなくアイコンと文字でも情報伝達
- フォーカス管理

## スタイリング

Primer Reactの`sx` propを使用してスタイリング。

**主要な色:**

- `accent.subtle` - エクスポート機能（青）
- `success.subtle` - 現在のボード（緑）
- `attention.subtle` - インポート機能（オレンジ）
- `danger.emphasis` - 置換モード（赤）

**インタラクション:**

- ホバー時のボーダー色変更
- ホバー時のシャドウ追加
- スムーズなトランジション

## テスト

現時点では手動テストのみ。今後追加予定:

```tsx
// ユニットテスト例
describe("calculateDataStatistics", () => {
  it("正確な統計を計算する", () => {
    const stats = calculateDataStatistics(mockBoards, mockLabels);
    expect(stats.boardCount).toBe(2);
    expect(stats.taskCount).toBe(10);
  });
});

// 統合テスト例
describe("DataManagementPanel", () => {
  it("エクスポートボタンが動作する", () => {
    const onExportAll = jest.fn();
    render(<DataManagementPanel onExportAll={onExportAll} />);

    fireEvent.click(screen.getByText("全データをエクスポート"));
    expect(onExportAll).toHaveBeenCalled();
  });
});
```

## トラブルシューティング

### データ統計が更新されない

- `useMemo`の依存配列を確認
- ボード/ラベルの参照が変わっているか確認

### インポートが失敗する

- ファイルサイズが10MB以下か確認
- JSONフォーマットが正しいか確認
- ブラウザコンソールでエラーを確認

### スタイルが適用されない

- Primer Reactのテーマが正しく設定されているか確認
- `sx` propの構文が正しいか確認

## 今後の拡張予定

1. ドラッグ&ドロップ対応
2. インポートプレビュー機能
3. エクスポート形式の選択（CSV、Excel）
4. 自動バックアップ
5. クラウドストレージ連携
6. バージョン管理

## 参考資料

- [Primer React Documentation](https://primer.style/react/)
- [GitHub Design System](https://primer.style/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
