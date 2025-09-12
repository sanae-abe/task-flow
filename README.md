# 🏷️ Offline Kanban

React + TypeScript で構築されたモダンなKanbanボードアプリケーション

![GitHub](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.1.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)

## ✨ 主要機能

### 📋 タスク管理
- **ドラッグ&ドロップ**: 直感的なタスク移動とカラム並び替え
- **カスタムラベル**: 10種類のPrimerカラーバリアント対応
- **期限管理**: 期限切れ・当日・明日期限の自動警告表示
- **完了機能**: ワンクリックでタスク完了状態を切り替え
- **サブタスク**: チェックリスト形式のサブタスク管理と進捗表示

### 📎 ファイル機能
- **ファイル添付**: ドラッグ&ドロップによるファイルアップロード（5MBまで）
- **プレビュー**: 画像・テキストファイルのフルスクリーンプレビュー
- **ダウンロード**: Base64エンコード形式でブラウザ内保存・ダウンロード

### 🔍 フィルタリング・ソート
- **スマートフィルタ**: 期限別・ラベル別の高度なフィルタリング
- **多軸ソート**: 作成日・更新日・期限・名前順の4種類ソート
- **統計表示**: 未完了タスク数・期限警告の集計表示

### 💾 データ管理
- **ローカル保存**: ブラウザのlocalStorageでオフライン対応
- **データインポート**: JSONファイルによるデータ一括インポート
- **複数ボード**: プロジェクト別のボード管理

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
git clone https://github.com/your-username/kanban-app.git
cd kanban-app

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

## 🛠️ 利用可能なスクリプト

### 開発
```bash
npm start          # 開発サーバー起動
npm run typecheck  # TypeScript型チェック
npm run lint       # ESLintによるコード品質チェック
npm run format     # Prettierによるコード整形
```

### テスト
```bash
npm test               # インタラクティブテスト実行
npm run test:coverage  # カバレッジレポート生成
npm run test:ci        # CI用テスト実行
```

### ビルド・デプロイ
```bash
npm run build      # プロダクションビルド
npm run analyze    # バンドルサイズ解析
```

### コード品質
```bash
npm run quality        # 全品質チェック実行
npm run quality:fix    # 自動修正付き品質チェック
npm run audit          # セキュリティ監査
npm run audit:security # 高レベルセキュリティチェック
```

## 🏗️ 技術スタック

### フロントエンド
- **React 19.1.1**: UIライブラリ
- **TypeScript 5.7.3**: 型安全性とDX向上
- **Primer React**: GitHubのデザインシステム
- **Styled Components**: CSS-in-JS
- **@dnd-kit**: ドラッグ&ドロップ機能

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
├── components/          # 再利用可能なUIコンポーネント
│   ├── dialogs/        # ダイアログコンポーネント
│   ├── forms/          # フォームコンポーネント
│   └── ui/             # 基本UIコンポーネント
├── contexts/           # React Context (状態管理)
├── hooks/              # カスタムフック
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
└── App.tsx             # メインアプリケーション
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