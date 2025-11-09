# CLAUDE.md - TaskFlow Project Guide

> **設計方針**: AIと人間の両方が効率的に利用できる実用的な単一ファイル設計
> **最終更新**: 2025-11-09

## 📋 Quick Reference（最優先・常時参照）

### プロジェクト識別

```yaml
project:
  type: "Frontend Web App"
  framework: "React 19.2.0"
  language: "TypeScript 5.7.3 (strict mode)"
  build_tool: "Vite 7.1.12"
  test_framework: "Vitest 4.0.3"
  package_manager: "npm"
  total_components: 226  # TSXファイル数
```

### 緊急時対応（P0）

| トリガーキーワード | 推奨Agent | 即座に実行 |
|------------------|----------|-----------|
| 型エラー・ビルド失敗 | **typescript-pro** | `npm run typecheck` |
| XSS・セキュリティインシデント | **security-auditor** | `npm audit` + skill:owasp-compliance-checker |
| React エラー・動かない | **react-specialist** | デバッグ・原因特定 |
| パフォーマンス劣化 | **performance-engineer** | `npm run build` + `npm run analyze` |

### 必須開発コマンド

```bash
# 開発
npm start                # 開発サーバー起動（Vite、ポート5173）
npm run typecheck        # TypeScript型チェック（最重要・頻繁に実行）
npm test                 # Vitestウォッチモード
npm run test:run         # 単発テスト実行

# 品質チェック
npm run lint             # ESLintチェック
npm run quality          # 型チェック + リント
npm audit                # セキュリティ監査

# ビルド・分析
npm run build            # 本番ビルド（目標: 30秒以内）
npm run analyze          # バンドルサイズ分析
```

---

## 🤖 Agent活用ガイド（優先度順）

### P0 Agents（最優先・常時活用）

#### 1. react-specialist（最重要）

**活用シーン**:
- `src/components/**/*.tsx` の作業
- `src/hooks/**/*.ts` のカスタムフック設計
- `src/contexts/**/*.tsx` の状態管理
- React 19新機能の活用
- パフォーマンス最適化（React.memo、useMemo、useCallback）

**トリガーキーワード**:
`React`, `コンポーネント`, `hooks`, `useState`, `useEffect`, `useCallback`, `useMemo`, `Context API`, `レンダリング`, `カスタムフック`

**優先タスク**:
1. React 19新機能積極活用
2. カスタムフック抽出・設計（例: `useLabelManagement`）
3. Context API + useReducer パターン適用
4. パフォーマンス最適化（不要な再レンダリング削減）

**重要ファイル**:
- `src/components/RichTextEditor/` - Lexicalエディタ（12モジュール、セキュリティクリティカル）
- `src/components/KanbanBoard/` - Drag & Drop、高複雑度
- `src/components/TableView/` - 23ファイル分割、12種類カラム
- `src/hooks/useLabelManagement.ts` - 複雑なカスタムフック

**ツール**: `Read`, `Edit`, `mcp__serena__find_symbol`, `Task(Explore)`

---

#### 2. typescript-pro

**活用シーン**:
- `src/types/**/*.ts` の型定義設計
- 型エラー解決（ビルド失敗時）
- any型排除・型推論最適化
- ジェネリクス・ユーティリティ型の活用

**トリガーキーワード**:
`TypeScript`, `型定義`, `型エラー`, `any型`, `ジェネリクス`, `型推論`, `型ガード`, `ユーティリティ型`

**優先タスク**:
1. strict mode 型定義厳密化
2. any型完全排除（プロジェクト全体で禁止）
3. ジェネリクスの積極活用
4. 型推論最適化（明示的型定義とバランス）

**必須コマンド**: `npm run typecheck`

**重要ファイル**:
- `src/types/` - 全型定義
- `tsconfig.json` - strict: true 必須

---

#### 3. security-auditor

**活用シーン**:
- `src/components/RichTextEditor/**` の作業（XSSリスク最高）
- `src/components/FileUploader.tsx` の作業
- `src/utils/sanitize.ts` などユーティリティ関数
- データインポート機能の実装

**トリガーキーワード**:
`セキュリティ`, `XSS`, `DOMPurify`, `サニタイズ`, `入力検証`, `脆弱性`, `OWASP`

**セキュリティクリティカルコンポーネント**:

| Component | Path | リスク | 必須対策 |
|-----------|------|-------|---------|
| **RichTextEditor** | `src/components/RichTextEditor/` | XSS（最高） | DOMPurify必須 |
| **LinkifiedText** | `src/components/LinkifiedText.tsx` | XSS | HTMLサニタイズ |
| **FileUploader** | `src/components/FileUploader.tsx` | ファイルアップロード | 5MB制限・MIME検証 |
| **DataManagementPanel** | `src/components/DataManagementPanel.tsx` | データインポート | 入力検証 |

**必須コマンド**: `npm audit`, `npm audit --json`

**推奨スキル**: `owasp-compliance-checker`, `xss-vulnerability-scanner`

---

### P1 Agents（高優先度・定期活用）

#### 4. performance-engineer

**活用シーン**:
- バンドルサイズ削減
- Lighthouseスコア改善
- Core Web Vitals最適化
- ビルド時間短縮

**パフォーマンス目標**:
```yaml
lighthouse:
  Performance: 90+
  Accessibility: 100
  Best Practices: 100
  SEO: 90+

core_web_vitals:
  LCP: <2.5秒
  FID: <100ms
  CLS: <0.1

bundle_size:
  JavaScript: <300KB (gzip)
  CSS: <50KB (gzip)
  Total: <500KB (gzip)
```

**コマンド**: `npm run build`, `npm run analyze`

---

#### 5. test-automator

**活用シーン**:
- テストカバレッジ向上（目標: 80%）
- Vitest テスト設計
- E2Eテスト実装（Playwright）

**コマンド**:
```bash
npm test                  # Vitestウォッチモード
npm run test:run          # 単発実行
npm run test:coverage     # カバレッジ測定
npm run test:ui           # Vitest UIダッシュボード
```

**推奨スキル**: `unit-test-generator`, `e2e-test-framework`, `test-coverage-analyzer`

---

#### 6. frontend-developer

**活用シーン**:
- Shadcn/UI + Radix UI コンポーネント
- Tailwind CSS 4.1.16 スタイリング
- アクセシビリティ（WCAG準拠）
- レスポンシブデザイン

---

### P2 Agents（中優先度・特定領域）

- **accessibility-tester** - WCAG準拠確認、ARIA属性
- **code-reviewer** - コード品質レビュー、ESLint準拠
- **ui-ux-designer** - デザインシステム一貫性

---

## 📦 主要コンポーネント一覧

### セキュリティクリティカル（P0 - 要security-auditor協調）

| Component | Path | Modules | Agent | Security |
|-----------|------|---------|-------|----------|
| **RichTextEditor** | `src/components/RichTextEditor/` | 12 | react-specialist + **security-auditor** | XSS（DOMPurify） |
| **LinkifiedText** | `src/components/LinkifiedText.tsx` | - | react-specialist + **security-auditor** | XSS（自動リンク） |
| **FileUploader** | `src/components/FileUploader.tsx` | - | react-specialist + **security-auditor** | ファイル検証 |

### 高複雑度コンポーネント（P1）

| Component | Path | Modules/Files | 特徴 |
|-----------|------|--------------|------|
| **TableView** | `src/components/TableView/` | 23 | 12種類カラム、表示/非表示切替 |
| **RichTextEditor** | `src/components/RichTextEditor/` | 12 | Lexical、Emoji、コードハイライト |
| **KanbanBoard** | `src/components/KanbanBoard/` | - | @dnd-kit、カラム管理 |
| **TaskCreateDialog** | `src/components/TaskCreateDialog/` | 8 | モジュラー分割、複雑フォーム |

### 主要機能別コンポーネント

**タスク管理**:
- `TaskCreateDialog`, `TaskEditDialog` - タスク作成・編集
- `TaskCard`, `TaskDetailSidebar` - タスク表示・詳細
- `SubTaskList`, `SubTaskItem` - サブタスク管理（Drag & Drop）

**ビューシステム**:
- `KanbanBoard` - カンバンビュー
- `TableView` - テーブルビュー
- `CalendarView` - カレンダービュー

**ラベル・テンプレート**:
- `LabelSelector`, `LabelManagementPanel` - ラベル管理
- `TemplateManagementPanel`, `TemplateFormDialog` - テンプレート管理

**セレクター・入力**:
- `PrioritySelector` - 優先度選択（4段階）
- `TimeSelector`, `TimeSelectorDialog` - 時刻選択
- `RecurrenceSelector` - 繰り返し設定

**共有システム**:
- `UnifiedDialog` - 統一ダイアログシステム
- `UnifiedForm` - 統一フォームシステム
- `ActionMenu` - 統一アクションメニュー
- `ConfirmDialog` - 確認ダイアログ

---

## 🛠️ 技術スタック詳細

### コアフレームワーク

| 技術 | バージョン | 担当Agent | 重要度 |
|-----|-----------|----------|--------|
| **React** | 19.2.0 | react-specialist | P0 |
| **TypeScript** | 5.7.3 (strict) | typescript-pro | P0 |
| **Vite** | 7.1.12 | performance-engineer | P1 |
| **Vitest** | 4.0.3 | test-automator | P1 |

### UIフレームワーク

- **Shadcn/UI** + **Radix UI** - アクセシブルなプリミティブ（frontend-developer）
- **Tailwind CSS** 4.1.16 - ユーティリティファーストCSS（frontend-developer）
- **Lucide React** - アイコン（完全統一済み）

### 特殊ライブラリ

| ライブラリ | 用途 | 担当Agent | セキュリティ |
|-----------|------|----------|------------|
| **Lexical** 0.35.0 | リッチテキストエディタ | react-specialist | - |
| **DOMPurify** | HTMLサニタイズ | **security-auditor** | **P0** |
| **@dnd-kit** | Drag & Drop | react-specialist | - |
| **date-fns** 4.1.0 | 日付処理 | react-specialist | - |
| **emoji-picker-react** | Emoji選択 | react-specialist | - |
| **react-day-picker** | カレンダー | react-specialist | - |

### セキュリティツール

- **DOMPurify** - XSS防止（RichTextEditor、LinkifiedText）
- **eslint-plugin-security** - セキュリティリンティング
- **npm audit** - 依存関係脆弱性監査

---

## 🎯 開発フェーズ別Agent活用戦略

### 新機能実装フロー

1. **設計フェーズ** - `react-specialist`
   - コンポーネント設計レビュー
   - 既存パターンとの一貫性確認

2. **型定義フェーズ** - `typescript-pro`
   - インターフェース・型定義設計
   - ジェネリクス活用検討

3. **UI実装フェーズ** - `frontend-developer`
   - Shadcn/UI コンポーネント選定
   - アクセシビリティ確認

4. **テスト設計フェーズ** - `test-automator`
   - Vitestテスト設計
   - カバレッジ目標設定

### パフォーマンス改善フロー

1. **ボトルネック特定** - `performance-engineer`
   - `npm run analyze` でバンドル分析
   - Lighthouseスコア測定

2. **React最適化** - `react-specialist`
   - React.memo、useMemo、useCallback 適用
   - 不要な再レンダリング削減

3. **パフォーマンステスト** - `test-automator`
   - ビルド時間測定
   - バンドルサイズ検証

### リリース準備チェックリスト

```yaml
Phase 1 - テスト:
  - agent: test-automator
  - tasks:
      - npm run test:run（全テストパス）
      - npm run test:coverage（80%以上）

Phase 2 - セキュリティ:
  - agent: security-auditor
  - tasks:
      - npm audit（脆弱性0件）
      - RichTextEditor XSS確認
      - skill: owasp-compliance-checker

Phase 3 - パフォーマンス:
  - agent: performance-engineer
  - tasks:
      - npm run build（30秒以内）
      - Lighthouseスコア確認（90+）
      - バンドルサイズ確認（<500KB gzip）

Phase 4 - アクセシビリティ:
  - agent: accessibility-tester
  - tasks:
      - WCAG 2.1準拠確認
      - キーボードナビゲーション確認
```

---

## 📏 品質基準・開発ガイドライン

### セキュリティ基準（P0 - 最優先）

**XSS対策**:
- RichTextEditor: DOMPurify必須（HTML出力前に必ずサニタイズ）
- LinkifiedText: 自動リンク検出時のサニタイズ
- ユーザー入力: 全て検証・エスケープ

**ファイルアップロード**:
- 最大サイズ: 5MB
- MIME type検証必須
- Base64エンコード保存

**依存関係管理**:
- `npm audit` 定期実行（週1回）
- eslint-plugin-security 有効化

### TypeScript規約

**必須ルール**:
```typescript
// ✅ 推奨
- strict: true 必須
- 明示的な型定義
- ジェネリクスの積極活用
- ユーティリティ型（Partial, Pick, Omit等）活用
- 型ガード・型推論

// ❌ 禁止
- any型の使用
- @ts-ignore の使用
- type assertion（as）の多用
```

### React開発規約

**パフォーマンス最適化**:
```typescript
// ✅ 推奨パターン
- React.memo() でコンポーネントメモ化
- useMemo() で高コスト計算のメモ化
- useCallback() でイベントハンドラーのメモ化
- カスタムフック抽出（ロジック再利用）
- Context API + useReducer（状態管理）

// ❌ 避けるパターン
- 過度なprop drilling
- useEffectの過剰使用
- 不要な再レンダリング
```

### テスト基準

```yaml
coverage_target: 80%
execution_time: <30秒

unit_tests:
  - 全カスタムフック
  - 複雑なユーティリティ関数
  - 状態管理ロジック

integration_tests:
  - 主要ユーザーフロー
  - フォーム送信
  - データ永続化
```

---

## 📁 ディレクトリ構造とAgent対応

```
src/
├── components/           # 226 TSXファイル → react-specialist
│   ├── RichTextEditor/   # 12モジュール → react-specialist + security-auditor
│   ├── CalendarView/     # → react-specialist
│   ├── TableView/        # 23ファイル → react-specialist
│   ├── KanbanBoard/      # → react-specialist
│   ├── LabelManagement/  # → react-specialist
│   ├── TemplateManagement/ # → react-specialist
│   └── shared/           # 共有コンポーネント → react-specialist
│
├── contexts/             # 状態管理 → react-specialist
│   ├── TaskContext.tsx
│   ├── BoardContext.tsx
│   └── LanguageContext.tsx
│
├── hooks/                # カスタムフック → react-specialist + typescript-pro
│   ├── useTasks.ts
│   ├── useLabelManagement.ts
│   └── useBoards.ts
│
├── types/                # 型定義 → typescript-pro
│   ├── types.ts
│   └── supabase.ts
│
├── utils/                # ユーティリティ → typescript-pro + security-auditor
│   ├── sanitize.ts       # セキュリティクリティカル
│   └── priorityConfig.ts
│
└── i18n/                 # 国際化 → frontend-developer
    ├── config.ts
    └── locales/
        ├── en.json
        ├── ja.json
        ├── ko.json
        └── zh-CN.json
```

---

## 🔍 トラブルシューティング

### 型エラー発生時

1. `npm run typecheck` で詳細確認
2. **typescript-pro** に相談
3. `src/types/` の型定義を確認
4. any型で回避しない（必ず適切な型定義）

### パフォーマンス問題

1. `npm run analyze` でバンドル分析
2. **performance-engineer** に相談
3. React DevTools Profilerで再レンダリング確認
4. 不要なuseEffect、依存配列を確認

### セキュリティ懸念

1. `npm audit` で脆弱性確認
2. **security-auditor** に即座に相談
3. RichTextEditor使用箇所のDOMPurify適用確認
4. skill: `owasp-compliance-checker` 実行

---

## 📊 統計情報

```yaml
project_stats:
  total_components: 226
  total_tsx_files: 226
  total_contexts: 3
  total_custom_hooks: 10+

  security_critical_components: 3
  high_complexity_components: 4

  primary_agents: 3  # react-specialist, typescript-pro, security-auditor
  total_agents: 8

last_updated: "2025-11-09"
file_size: "~8KB"
```

---

**💡 開発のヒント**:
- **React 19の新機能を積極活用** → react-specialist に相談
- **型安全性を最優先** → typescript-pro でany型を排除
- **セキュリティファースト** → security-auditor で定期監査
- **パフォーマンス目標を常に意識** → Lighthouse 90+、Bundle <500KB

**🔗 関連ドキュメント**:
- README.md - プロジェクト概要
- docs/ - 開発者向け詳細ドキュメント
