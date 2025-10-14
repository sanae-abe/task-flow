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
- Icons: @primer/octicons-react + react-feather
- Emoji Picker: emoji-picker-react
- Rich Text Editor: Lexical 0.35.0
- Date Utilities: date-fns 4.1.0
- Security: DOMPurify (HTMLサニタイズ)

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
- **タスク管理**: 作成・編集・削除・完了・複製機能
- **期限・時刻設定**: 詳細な日時管理（デフォルト23:59）
- **繰り返し設定**: 毎日・毎週・毎月・毎年の自動再作成・期限なし繰り返し対応
- **サブタスク**: チェックリスト形式の進捗管理・ドラッグ&ドロップ並び替え
- **ラベル機能**: カスタムカラーラベルによる分類・ソート機能付き管理テーブル
- **ファイル添付**: ドラッグ&ドロップ対応（5MBまで）
- **リッチテキストエディタ**: Lexicalベースの高性能エディタ（太字・斜体・下線・取り消し線・リンク・コードブロック・emoji picker対応）
- **複数ビュー**: カンバン・テーブル・カレンダービュー
- **カンバン機能**: カラム移動・デフォルトカラム設定・完了タスク自動配置
- **テーブルカスタマイズ**: カラム表示/非表示切り替え
- **フィルタリング・ソート**: 多角的なタスク整理・優先度フィルター・優先度ソート対応
- **優先度管理**: Critical/High/Medium/Low 4段階優先度システム
- **テンプレート管理**: タスクテンプレートの作成・編集・削除・お気に入り機能
- **自動削除システム**: 完了タスクの自動削除・ソフトデリート・ごみ箱機能
- **設定管理**: デフォルトカラム設定・自動削除設定・各種カスタマイズ
- **データ管理**: ローカル保存・ボード選択エクスポート・インポート機能
- **セキュリティ**: DOMPurifyによるHTMLサニタイズ機能

## ビュー詳細

### カンバンビュー
- ドラッグ&ドロップによる直感的なタスク管理
- カラム間でのタスク移動
- カラム位置移動（kebabメニューから左右移動）
- デフォルトカラム設定機能
- 完了タスクの自動上部配置
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

### フォーム・ダイアログ
- `TaskCreateDialog`/`TaskEditDialog`: タスクの作成・編集フォーム（モジュラー分割済み）
- `TemplateFormDialog`: テンプレート作成・編集フォーム
- `CommonDialog`: 共通ダイアログコンポーネント

### エディタ・表示
- `RichTextEditor`: Lexicalベースのリッチテキストエディタ（emoji picker対応・12モジュール分割）
- `LinkifiedText`: HTMLサニタイズ対応のテキスト表示コンポーネント
- `TaskCard`: 個別タスクカード
- `TaskDetailSidebar`: タスク詳細・編集・複製サイドバー

### ビュー・レイアウト
- `KanbanBoard`: カンバン形式の表示
- `TableView`: テーブル形式の表示・カラム管理（23ファイル分割）
- `CalendarView`: カレンダー形式の表示

### タスク管理
- `SubTaskList`/`SubTaskItem`: サブタスク管理（ドラッグ&ドロップ対応・モジュラー分割）
- `PrioritySelector`: 優先度選択（ラジオボタン形式）
- `PriorityBadge`: 優先度表示バッジ

### テンプレート管理
- `TemplateManagementPanel`: テンプレート管理メインパネル
- `TemplateCard`: テンプレート表示カード
- `TemplateCategorySelector`: カテゴリー選択

### 設定・管理
- `LabelManagementPanel`: ラベル管理テーブル（ソート機能付き）
- `BoardSettingsPanel`: デフォルトカラム設定パネル
- `AutoDeletionSettingsPanel`: 自動削除設定パネル（多数のサブコンポーネント）
- `DataManagementPanel`: データ管理パネル
- `ExportSection`: ボード選択エクスポート機能

### 自動削除・ごみ箱
- `RecycleBinView`: ソフトデリートされたタスクの復元
- `DeletionCandidateBadge`: 削除候補表示バッジ
- `DeletionNotificationBanner`: 削除通知バナー

### 時刻・日付
- `TimeSelector`/`TimeSelectorDialog`: 時刻設定機能
- `RecurrenceSelector`/`RecurrenceDetailDialog`: 繰り返し設定機能（モジュラー分割済み）

### その他
- `HelpSidebar`: 機能説明サイドバー
- `SettingsDialog`: 設定ダイアログ（タブ形式）