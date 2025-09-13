# CLAUDE.md

## プロジェクト概要
React + TypeScriptで構築されたTodoアプリケーション

## 技術スタック
- Frontend: React 18 + TypeScript
- Styling: CSS Modules / Tailwind CSS
- State Management: React Context API
- Build Tool: Vite
- Package Manager: npm

## 開発コマンド
```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 型チェック
npm run typecheck

# リント
npm run lint
```

## 機能
- タスクの作成・編集・削除
- ステータス管理（未着手・進行中・完了）
- 期限設定と期限表示
- カンバンビューとテーブルビュー
- カラム表示/非表示切り替え機能

## 主要コンポーネント
- `TaskForm`: タスクの作成・編集フォーム
- `KanbanBoard`: カンバン形式の表示
- `TableView`: テーブル形式の表示
- `TaskCard`: 個別タスクカード
- `CommonDialog`: 共通ダイアログコンポーネント