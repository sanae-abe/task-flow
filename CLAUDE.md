# CLAUDE.md

## プロジェクト概要
React + TypeScriptで構築されたモダンなタスク管理アプリケーション（TaskFlow）

## 技術スタック
- Frontend: React 19.1.1 + TypeScript 5.7.3
- UI Framework: Primer React (GitHub Design System)
- Styling: Styled Components
- State Management: React Context API
- Build Tool: Create React App (CRA)
- Package Manager: npm
- Drag & Drop: @dnd-kit
- Icons: @primer/octicons-react

## 開発コマンド
```bash
# 開発サーバー起動
npm start

# 本番ビルド
npm run build

# 型チェック
npm run typecheck

# リント
npm run lint

# 品質チェック（全体）
npm run quality

# テスト実行
npm test
```

## 主要機能
- **タスク管理**: 作成・編集・削除・完了機能
- **期限・時刻設定**: 詳細な日時管理（デフォルト23:59）
- **繰り返し設定**: 毎日・毎週・毎月・毎年の自動再作成
- **サブタスク**: チェックリスト形式の進捗管理
- **ラベル機能**: カスタムカラーラベルによる分類
- **ファイル添付**: ドラッグ&ドロップ対応（5MBまで）
- **複数ビュー**: カンバン・テーブル・カレンダービュー
- **テーブルカスタマイズ**: カラム表示/非表示切り替え
- **フィルタリング・ソート**: 多角的なタスク整理
- **データ管理**: ローカル保存・インポート機能

## ビュー詳細

### カンバンビュー
- ドラッグ&ドロップによる直感的なタスク管理
- カラム間でのタスク移動
- ステータス別のビジュアル管理

### テーブルビュー
- 12種類のカラム表示項目
- リアルタイムタスク件数表示
- サブタスク進捗の視覚化
- 柔軟なカラム管理機能

### カレンダービュー
- 月次カレンダー表示
- 期限ベースのタスク管理
- 直接編集・詳細確認

## 主要コンポーネント
- `TaskCreateDialog`/`TaskEditDialog`: タスクの作成・編集フォーム
- `KanbanBoard`: カンバン形式の表示
- `TableView`: テーブル形式の表示・カラム管理
- `CalendarView`: カレンダー形式の表示
- `TaskCard`: 個別タスクカード
- `CommonDialog`: 共通ダイアログコンポーネント
- `TimeSelector`/`TimeSelectorDialog`: 時刻設定機能
- `RecurrenceSelector`/`RecurrenceDetailDialog`: 繰り返し設定機能
- `HelpSidebar`: 機能説明サイドバー