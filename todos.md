# TaskFlow Development TODO List

**Generated from**: TODO.md
**Last Updated**: 2025-11-10
**Format**: ISO 8601 (YYYY-MM-DD)

---

## 🔴 Critical Priority (Phase FE-8 - GraphQL残存課題)

- [x] KanbanContext dispatch API追加（BoardContextパターン参照） | Priority: critical | Context: api | Due: 2025-11-10
- [x] useTaskSubscriptions.ts型安全化完了（as any削除）| Priority: critical | Context: test | Due: 2025-11-10
- [x] GraphQL統合テスト38/45通過（84.4%カバレッジ、目標80%達成）| Priority: critical | Context: test | Due: 2025-11-10

---

## 🟠 High Priority (Phase FE-8 - AI機能UI実装)

- [ ] AITaskInput.tsx実装（156行想定、DOMPurify統合） | Priority: high | Context: ui | Due: 2025-11-24
- [ ] AIRecommendationsPanel.tsx実装 | Priority: high | Context: ui | Due: 2025-11-25
- [ ] 既存UIへのAI機能統合（TaskCreateDialog等） | Priority: high | Context: ui | Due: 2025-11-26
- [ ] DOMPurifyサニタイズ統合確認 | Priority: high | Context: security | Due: 2025-11-26

---

## 🟡 Medium Priority (Phase FE-8 - E2Eテスト)

- [ ] e2e/ai-task-creation.spec.ts実装（AI UI実装後） | Priority: medium | Context: test | Due: 2025-12-01
- [ ] e2e/graphql-subscriptions.spec.ts実装 | Priority: medium | Context: test | Due: 2025-12-02
- [ ] GraphQL API呼び出し確認 | Priority: medium | Context: test | Due: 2025-12-03

---

## 🟡 Medium Priority (監視・運用)

- [ ] Sentry本番動作確認（次回デプロイ後、リリース確認） | Priority: medium | Context: build | Due: 2025-11-15
- [ ] Sentryエラートラッキング正常動作確認 | Priority: medium | Context: build | Due: 2025-11-15

---

## 🔵 Low Priority (中期計画 1-2ヶ月)

- [ ] react-i18next導入 | Priority: low | Context: ui | Due: 2025-12-15
- [ ] 翻訳ファイル作成（日本語・英語） | Priority: low | Context: docs | Due: 2025-12-20
- [ ] 言語切り替え機能実装 | Priority: low | Context: ui | Due: 2025-12-25
- [ ] アクセシビリティ監査実施（WCAG 2.1 AA準拠） | Priority: low | Context: ui | Due: 2025-12-30
- [ ] aria属性の適切な使用確認 | Priority: low | Context: ui | Due: 2026-01-05
- [ ] フォーカス管理の改善 | Priority: low | Context: ui | Due: 2026-01-10
- [ ] ショートカットキー実装 | Priority: low | Context: ui | Due: 2026-01-15
- [ ] タブナビゲーション最適化 | Priority: low | Context: ui | Due: 2026-01-20

---

## 📊 Completed Tasks (Recent)

- [x] GraphQL Phase FE-0〜FE-7完了（Apollo Client統合） | Priority: critical | Context: api | Due: 2025-11-09
- [x] テストカバレッジ81.71%達成（目標80%超過+1.71%） | Priority: high | Context: test | Due: 2025-11-09
- [x] Sentry実装・設定完了（エラー監視体制構築） | Priority: high | Context: build | Due: 2025-11-09
- [x] Vercel Analytics設定完了 | Priority: medium | Context: build | Due: 2025-11-09
- [x] TODO.md双方向同期実装完了（Phase 0-5） | Priority: critical | Context: api | Due: 2025-11-08

---

## 📝 Notes

**優先度定義**:
- **critical**: 本番障害・緊急対応（Phase FE-8残存課題）
- **high**: 重要機能・期限あり（AI機能UI実装）
- **medium**: 通常開発・改善（E2Eテスト、監視確認）
- **low**: 最適化・調査・将来対応（国際化、アクセシビリティ）

**コンテキスト定義**:
- **ui**: フロントエンド・デザイン
- **api**: バックエンド・サーバーサイド
- **docs**: ドキュメント・コメント
- **test**: テスト・品質保証
- **build**: ビルド・CI/CD・インフラ
- **security**: セキュリティ・認証

**期限の目安**:
- Critical: 1週間以内
- High: 2週間以内
- Medium: 1ヶ月以内
- Low: 2-3ヶ月以内

**関連ドキュメント**:
- 詳細計画: `TODO.md`
- GraphQL統合: `docs/GRAPHQL_INTEGRATION.md`
- データアクセスポリシー: `src/lib/data-access-policy.ts`
