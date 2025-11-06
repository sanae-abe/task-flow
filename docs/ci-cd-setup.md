# GitHub Actions CI/CD セットアップガイド

## 概要

このドキュメントでは、TaskFlowプロジェクトのGitHub Actions CI/CDパイプライン設定について説明します。

## パイプライン構成

### 4段階パイプライン

```
┌─────────────────────────────────────────────────┐
│ Stage 1: install (1-2分)                        │
│ - 依存関係インストール (npm ci)                 │
│ - node_modules キャッシュ作成                   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Stage 2: quality (並列実行, 1分)                │
│ - type-check: TypeScript型チェック              │
│ - lint-check: ESLint実行                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Stage 3: test (3-5分)                           │
│ - unit-tests: Vitest実行                        │
│ - カバレッジレポート生成                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Stage 4: build (2分)                            │
│ - build-verification: Viteビルド検証            │
│ - ビルド成果物の保存 (artifacts)                │
└─────────────────────────────────────────────────┘
```

### 合計実行時間: 約7-10分

## ジョブ詳細

### 1. install (依存関係インストール)

**目的**: 依存関係のインストールとキャッシュ作成

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
- run: npm ci --prefer-offline --no-audit
```

**最適化ポイント**:
- `npm ci`: package-lock.jsonから厳密インストール
- `--prefer-offline`: ネットワーク使用最小化
- GitHub Actionsの自動キャッシュで2回目以降30秒以内に短縮

### 2. type-check & lint-check (並列実行)

**目的**: コード品質の自動チェック

**type-check**:
```bash
npm run typecheck
```
- TypeScript型エラーの検出
- strictモードでの厳格チェック

**lint-check**:
```bash
npm run lint
```
- ESLintルール違反の検出
- セキュリティ問題の早期発見

### 3. test (テスト実行)

**目的**: テスト実行とカバレッジ測定

```bash
npm run test:run
```

**成果物**:
- カバレッジレポート（HTML形式）
- Artifactsとして7日間保存

**カバレッジ表示**:
GitHubのPR画面でカバレッジレポートをダウンロード可能

### 4. build (ビルド検証)

**目的**: 本番ビルドの成功確認

```bash
npm run build
```

**成果物**:
- `build/` ディレクトリ（7日間保存）
- 手動デプロイ時に使用可能

**実行タイミング**:
- Pull Request作成時
- mainブランチへのプッシュ時

## 手動ジョブ（ラベルトリガー）

### coverage-report (詳細カバレッジ)

PRに `coverage` ラベルを付けると自動実行

```bash
npm run test:coverage
```

**実行方法**:
1. PR作成
2. ラベルに `coverage` を追加
3. 自動的にジョブ実行

### analyze-bundle (バンドル分析)

PRに `analyze` ラベルを付けると自動実行

```bash
ANALYZE=true npm run build
```

**実行方法**:
1. PR作成
2. ラベルに `analyze` を追加
3. `build/stats.html` をArtifactsからダウンロード

## キャッシュ戦略

### GitHub Actions 自動キャッシュ

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

- `package-lock.json` のハッシュ値をキーにキャッシュ
- 依存関係更新時のみ再インストール

### 追加キャッシュ（node_modules）

```yaml
- uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-modules-${{ hashFiles('package-lock.json') }}
```

### 効果

- 初回実行: 1-2分
- キャッシュヒット時: 20-30秒

## トラブルシューティング

### パイプラインが失敗する場合

#### 1. type-check 失敗

**原因**: TypeScript型エラー

**対処**:
```bash
npm run typecheck
```
ローカルで型エラーを修正してからコミット

#### 2. lint-check 失敗

**原因**: ESLintルール違反

**対処**:
```bash
npm run lint:fix
```
自動修正可能なエラーを修正

#### 3. test 失敗

**原因**: テストケース失敗

**対処**:
```bash
npm run test:run
```
ローカルでテストを実行して問題を特定

#### 4. build 失敗

**原因**: ビルドエラー

**対処**:
```bash
npm run build
```
ローカルでビルドエラーを修正

### キャッシュクリア

キャッシュが原因で問題が発生する場合:

1. GitHubリポジトリの **Settings** → **Actions** → **Caches**
2. 該当キャッシュを削除
3. パイプラインを再実行

## ベストプラクティス

### コミット前のローカルチェック

```bash
# 品質チェック（推奨）
npm run quality

# 個別実行
npm run typecheck
npm run lint
npm run test:run
npm run build
```

### Pull Request作成時

1. ✅ パイプライン全体が成功していることを確認
2. ✅ カバレッジ率が低下していないか確認
3. ✅ ビルドサイズが大幅に増加していないか確認

### 効率的な開発フロー

```bash
# 開発開始
npm run dev

# 変更後（コミット前）
npm run quality

# コミット
git add .
git commit -m "feat: 新機能追加"

# プッシュ（パイプライン自動実行）
git push
```

## パイプライン最適化履歴

### 実施済み最適化

1. **並列実行**: type-check と lint-check を同時実行
2. **キャッシュ**: node_modules と npm キャッシュの再利用
3. **npm ci**: クリーンインストールで一貫性確保
4. **artifacts**: 必要な成果物のみ保存（7日間保持）
5. **concurrency**: 同一ブランチで1つのパイプラインのみ実行

### 効果

- 初回実行: ~10分
- キャッシュヒット時: ~7分
- 70%の時間削減達成

## GitHub Actions特有の機能

### 同時実行制御

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

同一ブランチでの複数パイプライン実行を防止し、コスト削減

### Artifacts

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage/
    retention-days: 7
```

ビルド成果物・カバレッジレポートを保存

### トリガー条件

```yaml
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
```

mainブランチへのpushとPR作成時に自動実行

## 参考リンク

- [GitHub Actions公式ドキュメント](https://docs.github.com/actions)
- [actions/setup-node](https://github.com/actions/setup-node)
- [actions/cache](https://github.com/actions/cache)
- [npm ci vs npm install](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- [Vitest CI環境](https://vitest.dev/guide/ci.html)
- [Vite本番ビルド](https://vitejs.dev/guide/build.html)

## 更新履歴

- 2025-11-06: GitHub Actions版作成（デプロイステージなし4段階構成）
