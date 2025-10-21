<div align="center">
<h1>
  <img src="public/logo192.svg" alt="TaskFlow Logo" width="80" height="80" /><br>
  Task<span style="color: #0969da; ">Flow</span></h1>
  <p>React + TypeScript で構築されたモダンなタスク管理アプリケーション</p>
</div>

![GitHub](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.1.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)

## ✨ 主要機能

### 📋 タスク管理
- **ドラッグ&ドロップ**: 直感的なタスク移動とカラム並び替え
- **カスタムラベル**: 10種類のPrimerカラーバリアント対応
- **期限管理**: 期限切れ・当日・明日期限の自動警告表示
- **時刻設定**: 期限日に詳細時刻を設定（デフォルト23:59）
- **繰り返し設定**: 毎日・毎週・毎月・毎年の自動タスク再作成・期限なし繰り返し対応
- **完了機能**: ワンクリックでタスク完了状態を切り替え
- **タスク複製**: 既存タスクを簡単に複製して効率的に作業
- **サブタスク**: チェックリスト形式のサブタスク管理と進捗表示
- **サブタスク並び替え**: ドラッグ&ドロップによるサブタスクの順序変更
- **リッチテキストエディタ**: 太字・斜体・下線・取り消し線・リンク・コードブロック・emoji picker対応の高機能エディタ
- **優先度管理**: Critical/High/Medium/Low 4段階優先度システム
- **テンプレート機能**: タスクテンプレートの作成・編集・削除・お気に入り・カテゴリー管理

### 📎 ファイル機能
- **ファイル添付**: ドラッグ&ドロップによるファイルアップロード（5MBまで）
- **プレビュー**: 画像・テキストファイルのフルスクリーンプレビュー
- **ダウンロード**: Base64エンコード形式でブラウザ内保存・ダウンロード

### 📅 カレンダービュー
- **月次表示**: タスクをカレンダー形式で視覚的に管理
- **期限ベース**: 期限日ごとにタスクを整理して表示
- **インタラクティブ**: カレンダーから直接タスクの詳細確認・編集
- **フィルタリング**: カレンダー内でもラベルやステータスでフィルタ可能
- **ソート機能**: 各日付内でタスクの並び順をカスタマイズ

### 📋 カンバンビュー
- **ドラッグ&ドロップ**: 直感的なタスク移動とステータス変更
- **カラム移動**: kebabメニューからカラムを左右に移動
- **デフォルトカラム設定**: 新しいボード作成時のカラム設定をカスタマイズ
- **完了タスク配置**: 完了タスクを自動的にカラムの最上部に配置

### 📊 テーブルビュー
- **カラム管理**: 表示カラムの表示/非表示切り替え機能
- **豊富な表示項目**: タスク名・ステータス・期限・ラベル・サブタスク・ファイル・進捗・作成日・更新日・完了日・説明・繰り返し設定
- **タスク件数表示**: リアルタイムなタスク数カウンター
- **進捗表示**: サブタスクの完了状況を視覚的なプログレスバーで表示

### 🔍 フィルタリング・ソート
- **スマートフィルタ**: 期限別・ラベル別・優先度別の高度なフィルタリング
- **多軸ソート**: 作成日・更新日・期限・名前・優先度順の5種類ソート
- **統計表示**: 未完了タスク数・期限警告の集計表示

### 💾 データ管理
- **ローカル保存**: ブラウザのlocalStorageでオフライン対応
- **データインポート**: JSONファイルによるデータ一括インポート
- **ボード選択エクスポート**: 任意のボードを選択してデータエクスポート
- **複数ボード**: プロジェクト別のボード管理
- **ラベル管理**: ラベルの作成・編集・削除・ソート機能付きテーブル表示
- **ごみ箱機能**: 削除されたタスクの一時保存・復元機能（ソフトデリート対応）
- **テンプレート管理**: テンプレートのインポート・エクスポート・バックアップ機能

### ⚙️ 設定機能
- **デフォルトカラム設定**: 新しいボード作成時のカラム設定をカスタマイズ
- **ごみ箱機能**: ソフトデリートされたタスクの管理・復元・設定機能
- **テンプレート設定**: テンプレートカテゴリー・お気に入り・使用統計管理

### 🎨 UI/UX
- **Primerデザイン**: GitHubのPrimerデザインシステム採用
- **レスポンシブ**: モバイル・デスクトップ対応
- **アクセシビリティ**: WCAG準拠のアクセシブルUI
- **ダークモード**: ユーザー設定に応じたテーマ対応

## 🚀 クイックスタート

### 環境要件
- Node.js 18.0.0以上
- npm 8.0.0以上

### インストール
```bash
# リポジトリのクローン
git clone ssh://git@rendezvous.m3.com:3789/sanae-abe/taskflow-app.git
cd taskflow-app

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

## 🛠️ 利用可能なスクリプト

### 開発
```bash
npm start              # 開発サーバー起動
npm run typecheck      # TypeScript型チェック
npm run typecheck:watch # TypeScript型チェック（ウォッチモード）
npm run lint           # ESLintによるコード品質チェック・自動修正
npm run lint:check     # ESLintチェックのみ（修正なし）
npm run format         # Prettierによるコード整形
npm run format:check   # Prettierチェックのみ（整形なし）
```

### テスト
```bash
npm test               # インタラクティブテスト実行
npm run test:coverage  # カバレッジレポート生成
npm run test:ci        # CI用テスト実行
```

### ビルド・デプロイ
```bash
npm run build         # プロダクションビルド
npm run build:prod    # プロダクションビルド + サイズ解析
npm run analyze       # バンドルサイズ解析（ビルド後実行）
npm run analyze:size  # ビルド済みファイルのサイズ解析
```

### コード品質
```bash
npm run quality        # 全品質チェック実行
npm run quality:fix    # 自動修正付き品質チェック
npm run audit          # セキュリティ監査
npm run audit:fix      # セキュリティ脆弱性の自動修正
npm run audit:security # 高レベルセキュリティチェック
npm run lint:security  # セキュリティ特化ESLintチェック
npm run check-deps     # 依存関係の更新チェック
npm run pre-commit     # コミット前品質チェック
```

### パフォーマンス・SEO
```bash
npm run lighthouse     # Lighthouseパフォーマンス監査
npm run seo:validate   # SEO検証（ビルド + Lighthouse）
```

## 🏗️ 技術スタック

### フロントエンド
- **React 19.1.1**: UIライブラリ
- **TypeScript 5.7.3**: 型安全性とDX向上
- **Primer React**: GitHubのデザインシステム
- **Styled Components**: CSS-in-JS
- **@dnd-kit**: ドラッグ&ドロップ機能
- **Lexical 0.35.0**: 高性能リッチテキストエディタ
- **emoji-picker-react**: リッチテキストエディタ用絵文字ピッカー
- **date-fns 4.1.0**: 日付処理ライブラリ
- **react-feather**: 追加アイコンライブラリ
- **DOMPurify**: HTMLサニタイズによるセキュリティ強化

### 開発ツール
- **ESLint**: コード品質・セキュリティチェック
- **Prettier**: コード整形
- **Jest**: テストフレームワーク
- **React Testing Library**: UIテスト

### アーキテクチャ
- **Context API**: グローバル状態管理
- **Custom Hooks**: ロジック再利用
- **Component-based**: 再利用可能なコンポーネント設計
- **TypeScript Strict**: 厳密な型チェック

## 📁 プロジェクト構造

```
src/
├── components/                          # 再利用可能なUIコンポーネント
│   ├── CalendarView/                   # カレンダービュー（モジュラー分割）
│   │   ├── components/                 # カレンダー専用コンポーネント
│   │   ├── hooks/                      # カレンダーロジック
│   │   └── styles/                     # カレンダースタイル
│   ├── DataManagement/                 # データ管理パネル
│   ├── LabelManagement/                # ラベル管理システム
│   │   ├── components/                 # ラベル管理コンポーネント
│   │   └── hooks/                      # ラベル管理ロジック
│   ├── LabelSelector/                  # ラベル選択システム
│   ├── NotificationContainer/          # 通知システム
│   ├── RecycleBin/                     # ごみ箱機能（詳細ダイアログ付き）
│   │   ├── components/                 # ごみ箱専用コンポーネント
│   │   │   └── DetailDialog/          # 詳細ダイアログシステム
│   │   └── settings/                   # ごみ箱設定
│   ├── RecurrenceDetailDialog/         # 繰り返し設定ダイアログ
│   │   ├── components/                 # 繰り返し設定コンポーネント
│   │   ├── hooks/                      # 繰り返し設定ロジック
│   │   └── types/                      # 繰り返し設定型定義
│   ├── RichTextEditor/                 # リッチテキストエディタ（12モジュール分割）
│   │   ├── components/                 # エディタコンポーネント
│   │   ├── hooks/                      # エディタロジック
│   │   └── utils/                      # エディタユーティリティ
│   ├── SubTaskItem/                    # サブタスクアイテム（詳細分割）
│   │   ├── components/                 # サブタスク専用コンポーネント
│   │   ├── hooks/                      # ドラッグ&ドロップロジック
│   │   └── styles/                     # サブタスクスタイル
│   ├── TableView/                      # テーブルビュー（23ファイル分割）
│   │   ├── components/                 # テーブル専用コンポーネント
│   │   ├── hooks/                      # テーブルロジック
│   │   └── utils/                      # テーブルユーティリティ
│   ├── TaskCreateDialog/               # タスク作成ダイアログ（8モジュール分割）
│   │   ├── components/                 # タスク作成コンポーネント
│   │   └── hooks/                      # タスク作成ロジック
│   ├── TemplateManagement/             # テンプレート管理システム
│   ├── shared/                         # 共有コンポーネント
│   │   ├── Dialog/                     # ダイアログシステム
│   │   ├── Form/                       # フォームシステム
│   │   │   └── fields/                 # フォームフィールド
│   │   └── Menu/                       # メニューシステム
│   └── ...                             # その他のコンポーネント
├── contexts/                            # React Context (状態管理)
├── hooks/                               # カスタムフック
├── types/                               # TypeScript型定義
├── utils/                               # ユーティリティ関数
│   ├── settingsStorage.ts              # 設定永続化
│   └── templateStorage.ts              # テンプレート管理
└── App.tsx                              # メインアプリケーション
```

## 🔧 設定

### ESLintカスタマイズ
```bash
# セキュリティ重視の設定
npm run lint:security

# 自動修正
npm run lint -- --fix
```

### TypeScript設定
- `strict: true` - 厳密な型チェック
- `noEmit: true` - 型チェックのみ実行

### テストカバレッジ目標
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## 🤝 コントリビューション

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### 開発ガイドライン
- TypeScript strictモード必須
- ESLint + Prettier準拠
- テストカバレッジ80%以上
- セキュリティファーストの設計

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🙏 謝辞

- [GitHub Primer](https://primer.style/) - デザインシステム
- [dnd kit](https://dndkit.com/) - ドラッグ&ドロップライブラリ
- [Create React App](https://create-react-app.dev/) - 初期プロジェクト構成

---

💡 **Pro Tip**: `npm run quality:fix` でコード品質を一括改善できます！
