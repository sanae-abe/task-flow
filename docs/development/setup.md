# 🛠️ 環境構築・セットアップガイド

TaskFlowの開発環境を構築するための詳細ガイドです。

## 📋 前提条件

### 必要なソフトウェア

- **Node.js**: 18.0.0以上
- **npm**: 8.0.0以上
- **Git**: 最新版推奨
- **エディタ**: VS Code推奨（TypeScript拡張機能付き）

### 推奨環境

- **OS**: macOS / Linux / Windows 10/11
- **メモリ**: 8GB以上（16GB推奨）
- **ストレージ**: 5GB以上の空き容量

## 🚀 クイックスタートアップ

### 1. リポジトリのクローン

```bash
# SSH（推奨）
git clone ssh://git@rendezvous.m3.com:3789/sanae-abe/taskflow-app.git
cd taskflow-app

# または HTTPS
git clone https://rendezvous.m3.com:3789/sanae-abe/taskflow-app.git
cd taskflow-app
```

### 2. 依存関係のインストール

```bash
# Node.jsバージョン確認
node --version  # v18.0.0以上であることを確認

# 依存関係をインストール
npm install
```

### 3. 開発サーバーの起動

```bash
# 開発サーバー起動（Vite）
npm start

# ブラウザで http://localhost:3000 を開く
```

## 🔧 開発ツールセットアップ

### VS Code拡張機能（推奨）

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "vitest.explorer"
  ]
}
```

### ESLint・Prettier設定確認

```bash
# コード品質チェック
npm run lint:check

# コード整形
npm run format

# TypeScript型チェック
npm run typecheck
```

### テスト環境確認

```bash
# Vitestテスト実行
npm run test:run

# テストUIダッシュボード
npm run test:ui
```

## 📝 よく使用する開発コマンド

### 🔍 品質チェック

```bash
# 全品質チェック（推奨）
npm run quality

# 自動修正付き品質チェック
npm run quality:fix

# 個別チェック
npm run typecheck      # TypeScript型チェック
npm run lint:check     # ESLintチェック
npm run format:check   # Prettierチェック
```

### 🧪 テスト・デバッグ

```bash
# インタラクティブテスト
npm test

# カバレッジレポート生成
npm run test:coverage

# Vitest UIダッシュボード
npm run test:ui

# ウォッチモード
npm run typecheck:watch
```

### 🚀 ビルド・デプロイ

```bash
# プロダクションビルド
npm run build

# ビルド + サイズ解析
npm run build:prod

# バンドルサイズ解析
npm run analyze:size

# Lighthouseパフォーマンス監査
npm run lighthouse
```

## 🔒 セキュリティ・監査

### 依存関係セキュリティチェック

```bash
# セキュリティ監査
npm run audit

# 高レベルセキュリティチェック
npm run audit:security

# セキュリティ特化ESLintチェック
npm run lint:security

# 脆弱性自動修正
npm run audit:fix
```

### 依存関係管理

```bash
# 依存関係更新チェック
npm run check-deps

# 依存関係の更新
npm update

# package-lock.jsonの再生成
rm package-lock.json node_modules -rf
npm install
```

## 🏗️ プロジェクト構造理解

### 主要ディレクトリ

```
src/
├── components/          # 再利用可能なUIコンポーネント
├── contexts/           # React Context（状態管理）
├── hooks/              # カスタムフック
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
└── App.tsx             # メインアプリケーション
```

### 重要な設定ファイル

- `vite.config.ts` - Vite設定（ビルド・開発サーバー）
- `tsconfig.json` - TypeScript設定
- `eslint.config.js` - ESLint設定
- `tailwind.config.js` - Tailwind CSS設定
- `vitest.config.ts` - Vitest設定

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### Node.jsバージョンエラー

```bash
# Node.jsバージョン確認
node --version

# nvmを使用している場合
nvm use 18
```

#### 依存関係インストールエラー

```bash
# キャッシュクリア
npm cache clean --force

# node_modules削除後再インストール
rm -rf node_modules package-lock.json
npm install
```

#### ビルドエラー

```bash
# TypeScript型エラーチェック
npm run typecheck

# ESLintエラーチェック
npm run lint:check

# 自動修正試行
npm run quality:fix
```

#### 開発サーバー起動エラー

```bash
# ポート3000が使用中の場合
lsof -ti:3000 | xargs kill

# または別のポートで起動
npm start -- --port 3001
```

### パフォーマンス問題

- **メモリ不足**: Node.js起動時に `--max-old-space-size=4096` オプション追加
- **ビルド遅延**: `npm run build:prod` でサイズ解析を実行
- **HMR遅延**: ファイル変更を保存後、ブラウザのハードリフレッシュ試行

## 🔗 追加リソース

- [Vite公式ドキュメント](https://vitejs.dev/)
- [React 19ドキュメント](https://react.dev/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)
- [Shadcn/UIドキュメント](https://ui.shadcn.com/)
- [Tailwind CSSドキュメント](https://tailwindcss.com/)

---

💡 **Pro Tip**: 開発中は `npm run quality:fix` を定期的に実行して、コード品質を維持しましょう！
