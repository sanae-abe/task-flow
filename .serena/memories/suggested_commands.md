# 推奨開発コマンド

## 日常開発

```bash
npm start          # 開発サーバー起動 (http://localhost:3000)
npm run typecheck  # TypeScript型チェック
npm run lint       # ESLintによるコード品質チェック
npm run format     # Prettierによるコード整形
```

## テスト

```bash
npm test               # インタラクティブテスト実行
npm run test:coverage  # カバレッジレポート生成
npm run test:ci        # CI用テスト実行（watch無効）
```

## コード品質チェック

```bash
npm run quality        # 全品質チェック実行 (lint + format + typecheck)
npm run quality:fix    # 自動修正付き品質チェック
npm run lint:check     # リント確認のみ（修正なし）
npm run format:check   # フォーマット確認のみ（修正なし）
```

## ビルド・解析

```bash
npm run build      # プロダクションビルド
npm run analyze    # バンドルサイズ解析付きビルド
npm run analyze:size # バンドルサイズ解析のみ
```

## セキュリティ・監査

```bash
npm run audit          # セキュリティ監査（moderate以上）
npm run audit:fix      # 自動セキュリティ修正
npm run audit:security # 高レベルセキュリティチェック
npm run lint:security  # セキュリティ重視のESLint
```

## その他ユーティリティ

```bash
npm run lighthouse     # Lighthouseパフォーマンス測定
npm run seo:validate   # SEO検証（build + lighthouse）
npm run check-deps     # 依存関係の更新確認
npm run pre-commit     # プリコミット品質チェック
```

## システムコマンド（Darwin）

```bash
ls -la                 # ファイル一覧（隠しファイル込み）
find . -name "*.tsx"   # TypeScriptファイル検索
grep -r "文字列"       # 文字列検索
git status             # Git状態確認
git log --oneline      # コミット履歴確認
```

## 開発フロー推奨コマンド

```bash
# 作業開始時
npm run quality

# 作業完了時
npm run quality:fix
npm run test:ci

# デプロイ前
npm run build
npm run analyze:size
```
