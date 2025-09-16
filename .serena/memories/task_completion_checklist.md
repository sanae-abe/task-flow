# タスク完了時のチェックリスト

## 必須実行項目

### 1. コード品質チェック
```bash
npm run quality:fix    # 自動修正付き品質チェック
```

これは以下を含む：
- `npm run lint` - ESLintによる修正
- `npm run format` - Prettierによる整形
- `npm run typecheck` - TypeScript型チェック

### 2. テスト実行
```bash
npm run test:ci        # CI用テスト実行
```

カバレッジ目標：
- Branches: 80%以上
- Functions: 80%以上
- Lines: 80%以上
- Statements: 80%以上

### 3. ビルド確認
```bash
npm run build          # プロダクションビルド成功確認
```

## 推奨実行項目

### セキュリティチェック
```bash
npm run audit:security # 高レベルセキュリティ監査
```

### パフォーマンス確認
```bash
npm run analyze:size   # バンドルサイズ確認
```

### 大きな変更の場合
```bash
npm run lighthouse     # パフォーマンス測定
npm run seo:validate   # SEO検証
```

## エラー対応

### TypeScriptエラー
- 型定義の追加・修正
- strictモード対応必須

### ESLintエラー
- セキュリティルール違反は必ず修正
- `@typescript-eslint/no-explicit-any` エラーは型指定で解決

### テストエラー
- 新機能には対応するテストを追加
- 既存テストの修正が必要な場合は慎重に検討

## Git コミット前
```bash
npm run pre-commit     # 全チェック実行
```

## 品質基準
- TypeScript strict モード準拠
- ESLint ルール準拠
- Prettier フォーマット準拠
- テストカバレッジ 80%以上維持
- セキュリティ脆弱性ゼロ