# コードスタイルと規約

## TypeScript設定

- **strict**: true - 厳密な型チェック
- **noEmit**: true - 型チェックのみ実行
- **noUnusedLocals**: true - 未使用ローカル変数エラー
- **noUnusedParameters**: true - 未使用パラメータエラー
- **noImplicitReturns**: true - 暗黙的returnエラー
- **noUncheckedIndexedAccess**: true - インデックスアクセス安全性
- **strictNullChecks**: true - null/undefined厳密チェック

## ESLint規約

- **no-explicit-any**: error - any型禁止
- **no-unused-vars**: error - 未使用変数エラー（\_プレフィックス除外）
- **no-console**: warn - console.log警告
- **prefer-const**: error - const推奨
- **eqeqeq**: always - 厳密等価演算子必須

## React規約

- **jsx-key**: error - key属性必須
- **react-hooks/rules-of-hooks**: error - Hooks規則
- **react-hooks/exhaustive-deps**: warn - 依存配列完全性
- **self-closing-comp**: error - 自己完結タグ
- **jsx-boolean-value**: never - boolean属性短縮記法

## 命名規約

- **コンポーネント**: PascalCase (例: TaskCard, KanbanBoard)
- **hooks**: camelCase + useプレフィックス (例: useTaskActions)
- **型定義**: PascalCase + 適切なサフィックス (例: TaskType, BoardState)
- **定数**: UPPER_SNAKE_CASE (例: Z_INDEX, MAX_FILE_SIZE)

## ファイル構成規約

- **src/components/**: 再利用可能なUIコンポーネント
- **src/contexts/**: React Context定義
- **src/hooks/**: カスタムフック
- **src/types/**: TypeScript型定義
- **src/utils/**: ユーティリティ関数
- **src/reducers/**: useReducer用reducers

## インポート規約

- パスエイリアス使用: @/_ (src/_)
- 相対パス最小化
- 型インポートとランタイムインポートの分離
