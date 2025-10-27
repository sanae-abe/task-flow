# 技術スタック

## フロントエンド
- **React**: 19.1.1
- **TypeScript**: 5.7.3 (strictモード)
- **Shadcn/UI**: モダンなUIコンポーネントライブラリ
- **@radix-ui/***: アクセシブルなプリミティブコンポーネント
- **Tailwind CSS**: ユーティリティファーストCSS + CSS Variables
- **@dnd-kit**: ドラッグ&ドロップ機能
- **React Router DOM**: 7.9.1 (HashRouter)
- **Lexical**: 0.35.0 リッチテキストエディタ
- **DOMPurify**: XSSサニタイズ

## UI・スタイリング
- **lucide-react**: 統一アイコンライブラリ（完全統一済み）
- **@uiw/react-color**: カラーピッカー
- **emoji-picker-react**: 絵文字ピッカー
- **react-day-picker**: 日付選択UI
- **date-fns**: 4.1.0 日付処理ライブラリ

## 状態管理
- **React Context API**: グローバル状態管理
- **useReducer**: 複雑な状態ロジック

## 開発ツール
- **Create React App + Craco**: プロジェクト構成・ビルド設定
- **ESLint**: コード品質・セキュリティチェック
- **Prettier**: コード整形
- **TypeScript**: 厳密な型チェック（strict mode）

## テスト
- **Jest**: テストフレームワーク
- **React Testing Library**: UIテスト
- **@testing-library/user-event**: ユーザーインタラクションテスト

## ビルド・解析
- **Webpack**: バンドラー（CRA内蔵）
- **compression-webpack-plugin**: Gzip圧縮
- **webpack-bundle-analyzer**: バンドルサイズ解析
- **Tailwind CSS**: PostCSS + Autoprefixer

## パッケージ管理
- **npm**: 依存関係管理
- **class-variance-authority**: CSS variant管理
- **clsx**: 条件付きクラス名
- **tailwind-merge**: Tailwindクラス統合

## 要求環境
- Node.js 18.0.0以上
- npm 8.0.0以上
- 対応ブラウザ: モダンブラウザ（IE 11非対応）

## 大規模移行完了項目（2024年10月）
- ✅ GitHub Primer React → Shadcn/UI完全移行
- ✅ @primer/octicons-react → lucide-react完全統一
- ✅ Styled Components → Tailwind CSS移行
- ✅ CSS custom properties → Tailwind統一
- ✅ RichTextEditor 12モジュール分割完了
- ✅ useTaskEdit 5モジュール分割完了