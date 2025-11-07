# CLAUDE.md

> **📝 このファイルについて**
> このファイルはClaude Code専用の技術詳細・設定ファイルです。
> 一般的なプロジェクト情報は [README.md](../README.md) を、
> 開発者向けドキュメントは [docs/](../docs/) を参照してください。

## プロジェクト概要

React + TypeScriptで構築されたモダンなタスク管理アプリケーション（TaskFlow）

## 技術スタック

- Frontend: React 19.2.0 + TypeScript 5.7.3
- UI Framework: Shadcn/UI + @radix-ui/\* (モダンなUIコンポーネント)
- Styling: Tailwind CSS 4.1.16 + CSS Variables
- State Management: React Context API
- Build Tool: Vite 7.1.12 (高速ビルド・HMR対応)
- Test Framework: Vitest 4.0.3 (高速テスト実行)
- Package Manager: npm
- Drag & Drop: @dnd-kit
- Icons: lucide-react (完全統一済み)
- Color Picker: カスタム実装（CircleColorPicker）
- Emoji Picker: emoji-picker-react
- Rich Text Editor: Lexical 0.35.0
- Date Utilities: date-fns 4.1.0 + react-day-picker
- Security: DOMPurify (HTMLサニタイズ) + ESLint security plugin

## 開発コマンド

```bash
# 開発サーバー起動（Vite）
npm start

# 本番ビルド（Vite）
npm run build

# 型チェック
npm run typecheck

# リント
npm run lint

# 品質チェック（全体）
npm run quality

# テスト実行（Vitest）
npm test
npm run test:run      # 単発テスト実行
npm run test:ui       # Vitest UIダッシュボード

# Bundle分析
npm run analyze       # ANALYZE=true でビルド分析
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
- **ごみ箱機能**: 削除されたタスクの一時保存・復元機能
- **設定管理**: デフォルトカラム設定・ごみ箱設定・各種カスタマイズ
- **データ管理**: ローカル保存・ボード選択エクスポート・インポート機能
- **通知システム**: DialogFlashMessage統合による統一されたメッセージ表示
- **セキュリティ**: DOMPurifyによるHTMLサニタイズ機能（ESLintセキュリティ警告の段階的改善中）

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

- `LabelManagementPanel`: ラベル管理テーブル（ソート機能付き・DialogFlashMessage統合）
- `BoardSettingsPanel`: デフォルトカラム設定パネル
- `RecycleBinSettingsPanel`: ごみ箱設定パネル
- `DataManagementPanel`: データ管理パネル（DialogFlashMessage統合）
- `ExportSection`: ボード選択エクスポート機能
- `ImportSection`: インポート機能（DialogFlashMessage統合）

### 通知・メッセージシステム

- `DialogFlashMessage`: 統一されたダイアログ内メッセージ表示
- `NotificationContainer`: Toast通知システム
- `InlineMessage`: インライン形式のメッセージ表示

### ごみ箱機能

- `RecycleBinView`: ソフトデリートされたタスクの復元（DialogFlashMessage統合）
- `RecycleBinItemDetailDialog`: ごみ箱アイテム詳細ダイアログ
- `DeletionCandidateBadge`: 削除候補表示バッジ
- `DeletionNotificationBanner`: 削除通知バナー
- `RecycleBinTaskActions`: 操作ActionMenu（復元・完全削除）

### 時刻・日付

- `TimeSelector`/`TimeSelectorDialog`: 時刻設定機能
- `RecurrenceSelector`/`RecurrenceDetailDialog`: 繰り返し設定機能（モジュラー分割済み）

### ラベル・セレクター

- `LabelSelector`: 統合ラベル選択システム（現在ボード・他ボード選択）
- `LabelColorCircle`: ラベル色表示コンポーネント
- `useLabelManagement`: ラベル管理ロジック

### 共有コンポーネント・システム

- `UnifiedDialog`: 統一ダイアログシステム
- `UnifiedForm`: 統一フォームシステム
- `ActionMenu`: 統一アクションメニューシステム
- `ConfirmDialog`: 確認ダイアログ
- `LoadingButton`: ローディング状態付きボタン
- `FlexBox`: レイアウト用フレックスコンテナ

### その他

- `Header`: アプリケーションヘッダー
- `Logo`: アプリケーションロゴコンポーネント
- `HelpSidebar`: 機能説明サイドバー
- `SettingsDialog`: 設定ダイアログ（タブ形式・DialogFlashMessage統合）
- `OfflineIndicator`: オフライン状態表示
- `TaskStatsDisplay`: タスク統計表示
- `BoardSelector`: ボード選択コンポーネント
- `LinkifiedText`: リンク対応・HTMLサニタイズテキスト表示

## 🤖 推奨Subagents（プロジェクト特化）

このプロジェクトでは以下のsubagentsを**積極的に活用**してください：

### 🔴 最優先Agents（常時活用）

#### 1. **react-specialist** - React専門家（最重要）
```yaml
活用シーン:
  - React 19.2.0の最新機能活用
  - カスタムフック設計（useLabelManagement等）
  - Context API最適化
  - パフォーマンス最適化（React.memo、useMemo、useCallback）
  - コンポーネント設計パターン

優先タスク:
  - src/hooks/: カスタムフックの最適化
  - src/contexts/: Context API設計改善
  - 226個のTSXファイルのパフォーマンスレビュー
  - React 19新機能の積極活用
```

#### 2. **typescript-pro** - TypeScript専門家
```yaml
活用シーン:
  - TypeScript 5.7.3の最新機能活用
  - 型安全性の強化（strict mode）
  - src/types/: 型定義の最適化
  - ジェネリクス・条件型の活用
  - 型推論の改善

優先タスク:
  - 型定義の厳密化
  - any型の排除
  - 型推論の最適化
  - ユーティリティ型の活用
```

#### 3. **frontend-developer** - フロントエンド開発
```yaml
活用シーン:
  - Shadcn/UI + Radix UIの最適活用
  - Tailwind CSS 4.1.16設計
  - アクセシビリティ（WCAG準拠）
  - レスポンシブデザイン
  - PWA対応

優先タスク:
  - src/components/: UIコンポーネント改善
  - アクセシビリティ強化
  - モバイル対応の最適化
  - PWA機能の実装・強化
```

### 🟡 高優先Agents（定期活用）

#### 4. **security-auditor** - セキュリティ監査
```yaml
活用シーン:
  - XSS対策（DOMPurify使用確認）
  - eslint-plugin-security対応
  - 入力検証・サニタイズ
  - 依存関係の脆弱性監査

優先タスク:
  - RichTextEditor: HTMLサニタイズ強化
  - FileUploader: ファイルアップロードセキュリティ
  - データインポート機能の安全性確認
```

#### 5. **performance-engineer** - パフォーマンス最適化
```yaml
活用シーン:
  - Vite 7.1.12ビルド最適化
  - バンドルサイズ削減
  - Lighthouse スコア改善
  - レンダリングパフォーマンス
  - Core Web Vitals最適化

優先タスク:
  - バンドルサイズ分析・削減
  - 遅延ローディング実装
  - 画像最適化
  - Service Worker最適化
```

#### 6. **test-automator** - テスト自動化
```yaml
活用シーン:
  - Vitest 4.0.3テスト設計
  - Playwright E2Eテスト
  - React Testing Libraryテスト
  - カバレッジ80%目標達成

優先タスク:
  - テストカバレッジ向上
  - E2Eテストシナリオ追加
  - コンポーネントテスト強化
```

### 🟢 中優先Agents（特定領域強化）

#### 7. **accessibility-tester** - アクセシビリティ
```yaml
活用シーン:
  - WCAG準拠確認
  - Radix UIのa11y活用
  - キーボードナビゲーション
  - スクリーンリーダー対応

優先タスク:
  - アクセシビリティ監査
  - aria属性の適切な使用
  - フォーカス管理の改善
```

#### 8. **ui-ux-designer** - UI/UX設計
```yaml
活用シーン:
  - Shadcn/UI デザインシステム
  - ユーザー体験改善
  - デザイントークン管理
  - インタラクションデザイン

優先タスク:
  - デザインシステムの一貫性確認
  - ユーザーフロー最適化
  - マイクロインタラクション改善
```

#### 9. **code-reviewer** - コード品質
```yaml
活用シーン:
  - ESLint準拠確認
  - コード品質レビュー
  - ベストプラクティス適用
  - リファクタリング提案

優先タスク:
  - 226個のTSXファイルの品質確認
  - モジュラー設計の一貫性確認
```

### 💡 状況依存Agents（特定タスク時）

#### 10. **nextjs-developer** - Next.js移行検討
```yaml
活用シーン: 将来的なNext.js移行時
タスク: SSR/SSG対応、ルーティング設計
```

#### 11. **devops-engineer** - CI/CD・デプロイ
```yaml
活用シーン: Vercel デプロイ最適化
タスク: GitHub Actions CI/CD、ビルドパイプライン
```

#### 12. **multi-agent-coordinator** - 複数エージェント協調
```yaml
活用シーン: 大規模リファクタリング、総合レビュー
タスク: react-specialist + typescript-pro + security-auditor 並列実行
```

## 📋 Agent活用戦略

### 🎯 開発フェーズ別の推奨Agent

```yaml
新機能実装:
  1. react-specialist: コンポーネント設計レビュー
  2. typescript-pro: 型定義設計
  3. frontend-developer: UI/UX評価
  4. test-automator: テスト設計

パフォーマンス改善:
  1. performance-engineer: ボトルネック特定
  2. react-specialist: React最適化実装
  3. test-automator: パフォーマンステスト

リリース準備:
  1. security-auditor: セキュリティ監査
  2. accessibility-tester: アクセシビリティ確認
  3. test-automator: 統合テスト
  4. performance-engineer: Lighthouseスコア確認
```

### 🚀 Agent活用の具体例

```bash
# React最適化
Task(react-specialist, "src/components/RichTextEditor/ のReact 19パフォーマンス最適化")

# TypeScript型安全性強化
Task(typescript-pro, "src/types/ の型定義を厳密化し、any型を排除")

# セキュリティ監査
Task(security-auditor, "RichTextEditorとFileUploaderのXSS脆弱性監査")

# パフォーマンス最適化
Task(performance-engineer, "Viteバンドルサイズ削減とCore Web Vitals改善")

# 総合レビュー（複数Agent協調）
Task(multi-agent-coordinator, "react-specialist、typescript-pro、security-auditorでtaskflow-app全体を包括的にレビュー")
```

## 🔧 プロジェクト固有の開発ガイドライン

### React開発規約

```typescript
// 推奨パターン
- React 19機能積極活用
- カスタムフック抽出（ロジック再利用）
- Context API + useReducer（状態管理）
- React.memo、useMemo、useCallback（最適化）
- TypeScript strict mode必須

// 避けるパターン
- 過度なprop drilling
- useEffectの過剰使用
- any型の使用
- 不要な再レンダリング
```

### TypeScript規約

```typescript
// 推奨パターン
- strict: true必須
- 明示的な型定義
- ジェネリクスの積極活用
- ユーティリティ型の活用
- 型ガード・型推論

// 避けるパターン
- any、unknown の無差別使用
- type assertion（as）の多用
- @ts-ignore の使用
```

### セキュリティ基準

```yaml
必須チェック項目:
  XSS対策:
    - DOMPurify使用（RichTextEditor）
    - 入力検証・サニタイズ
    - CSP設定

  ファイル処理:
    - アップロードサイズ制限（5MB）
    - MIME type検証
    - Base64エンコード

  依存関係:
    - npm audit定期実行
    - eslint-plugin-security使用
```

### パフォーマンス目標

```yaml
Lighthouse スコア:
  Performance: 90+
  Accessibility: 100
  Best Practices: 100
  SEO: 90+

Core Web Vitals:
  LCP: 2.5s以下
  FID: 100ms以下
  CLS: 0.1以下

バンドルサイズ: 500KB以下（gzip圧縮後）
```

## 📁 重要ディレクトリ構造とAgent対応

```
src/
├── components/                 # UIコンポーネント → react-specialist, frontend-developer
│   ├── RichTextEditor/         # Lexicalエディタ → react-specialist, security-auditor
│   ├── CalendarView/           # カレンダービュー → react-specialist
│   ├── TableView/              # テーブルビュー → react-specialist
│   ├── LabelManagement/        # ラベル管理 → react-specialist
│   ├── TemplateManagement/     # テンプレート管理 → react-specialist
│   └── shared/                 # 共有コンポーネント → react-specialist
├── contexts/                   # 状態管理 → react-specialist
├── hooks/                      # カスタムフック → react-specialist, typescript-pro
├── types/                      # 型定義 → typescript-pro
├── utils/                      # ユーティリティ → typescript-pro, security-auditor
└── App.tsx                     # メインアプリ → react-specialist

tests/                          # テスト → test-automator
e2e/                            # E2Eテスト → test-automator

public/                         # PWA → frontend-developer, performance-engineer
```

## 🎯 今後の開発方向性

### Phase 1: 品質・パフォーマンス強化（現在）
- React 19最適化 → **react-specialist**
- TypeScript型安全性強化 → **typescript-pro**
- セキュリティ強化 → **security-auditor**
- テストカバレッジ80%達成 → **test-automator**

### Phase 2: PWA機能拡張
- オフライン対応強化 → **frontend-developer**
- Service Worker最適化 → **performance-engineer**
- プッシュ通知実装 → **frontend-developer**

### Phase 3: 機能拡張
- コラボレーション機能 → **fullstack-developer**
- バックエンドAPI統合 → **backend-developer**
- リアルタイム同期 → **websocket-engineer**

### Phase 4: スケーリング
- Next.js移行検討 → **nextjs-developer**
- マイクロフロントエンド化 → **microservices-architect**
- パフォーマンス最適化 → **performance-engineer**

## 📊 パフォーマンスベンチマーク目標

```yaml
ビルド時間:
  開発ビルド: 1秒以下（Vite HMR）
  本番ビルド: 30秒以下

バンドルサイズ:
  JavaScript: 300KB以下（gzip）
  CSS: 50KB以下（gzip）
  Total: 500KB以下（gzip）

レンダリング:
  初期表示: 1秒以下
  インタラクション応答: 100ms以下
```

---

**💡 開発時のヒント**:
- **React 19の新機能を積極活用** - react-specialist に相談
- **型安全性を最優先** - typescript-pro でany型を排除
- **セキュリティファースト** - security-auditor で定期監査
- **複雑なタスクは multi-agent-coordinator で複数agentを協調**
