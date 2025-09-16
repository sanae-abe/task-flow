# コードベース構造

## ディレクトリ構成

```
src/
├── components/          # UIコンポーネント
│   ├── shared/         # 共通コンポーネント
│   │   ├── Dialog/     # ダイアログ系
│   │   ├── Form/       # フォーム系
│   │   └── Menu/       # メニュー系
│   └── [各種コンポーネント].tsx
├── contexts/           # React Context（状態管理）
│   ├── AppProviders.tsx     # 全Contextプロバイダー
│   ├── BoardContext.tsx     # ボード状態
│   ├── TaskContext.tsx      # タスク状態
│   ├── LabelContext.tsx     # ラベル状態
│   ├── UIContext.tsx        # UI状態
│   └── __tests__/      # Contextテスト
├── hooks/              # カスタムフック
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
├── reducers/           # useReducer用reducers
└── styles/             # スタイル定義
```

## 主要コンポーネント

### ビューコンポーネント
- **KanbanBoard.tsx** - カンバンビュー
- **TableView.tsx** - テーブルビュー
- **CalendarView.tsx** - カレンダービュー

### ダイアログコンポーネント
- **TaskCreateDialog.tsx** - タスク作成
- **TaskEditDialog.tsx** - タスク編集
- **CommonDialog.tsx** - 共通ダイアログ
- **RecurrenceDetailDialog.tsx** - 繰り返し設定
- **TimeSelectorDialog.tsx** - 時刻選択

### カードコンポーネント
- **TaskCard.tsx** - タスクカード
- **KanbanColumn.tsx** - カンバンカラム
- **TaskCardContent.tsx** - カード内容

## 状態管理構造

### Context階層
```
AppProviders
├── BoardContext    # ボード管理
├── TaskContext     # タスク管理
├── LabelContext    # ラベル管理
└── UIContext       # UI状態管理
```

### Reducer構造
- **taskReducer.ts** - タスク操作ロジック
- **boardReducer.ts** - ボード操作ロジック
- **labelReducer.ts** - ラベル操作ロジック
- **columnReducer.ts** - カラム操作ロジック

## 型定義組織

### 主要型ファイル
- **types/index.ts** - 基本型定義
- **types/task.ts** - タスク関連型
- **types/enhanced-types.ts** - 拡張型定義
- **types/unified-*.ts** - 統合型定義

## ユーティリティ組織

### 主要ユーティリティ
- **storage.ts** - ローカルストレージ操作
- **dateHelpers.ts** - 日付操作
- **taskFilter.ts / taskSort.ts** - タスク絞込・ソート
- **recurrence.ts** - 繰り返し処理
- **fileUtils.ts** - ファイル操作

## エントリーポイント
- **src/index.tsx** - アプリケーションエントリー
- **src/App.tsx** - メインアプリケーション
- **public/index.html** - HTMLテンプレート