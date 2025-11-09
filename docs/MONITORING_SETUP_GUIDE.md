# TaskFlow 監視ツール セットアップガイド

**作成日**: 2025-11-09
**対象**: Sentry + Vercel Analytics統合完了

---

## ✅ 実装完了内容

### 1. Sentry（エラートラッキング）
- パッケージインストール完了: `@sentry/react`
- 初期化コード実装: `src/index.tsx`
- Error Boundary統合完了
- プライバシー保護設定済み（Cookie/IP削除）

### 2. Vercel Analytics（パフォーマンス監視）
- パッケージインストール完了: `@vercel/analytics`
- Analytics統合完了: `src/index.tsx`

### 3. 型定義
- 環境変数型定義追加: `src/vite-env.d.ts`
- TypeScript型チェック0件

---

## 🚀 次のステップ（あなたがやること）

### Step 1: Sentryアカウント作成（無料）

1. **Sentryにアクセス**
   - URL: https://sentry.io/signup/
   - 「Start Free」をクリック

2. **アカウント作成**
   - GitHubアカウントでサインアップ推奨
   - または、メールアドレスで登録

3. **プロジェクト作成**
   - Platform: **React** を選択
   - Alert frequency: デフォルト設定でOK

4. **DSN取得**
   - プロジェクト作成後、DSN（Data Source Name）が表示される
   - 例: `https://xxxxx@o123456.ingest.sentry.io/123456`
   - この値をコピー

### Step 2: 環境変数設定

1. **Vercelダッシュボードで設定**
   ```
   https://vercel.com/your-project/settings/environment-variables
   ```

2. **環境変数を追加**
   - Variable Name: `VITE_SENTRY_DSN`
   - Value: `https://xxxxx@o123456.ingest.sentry.io/123456`（Step 1でコピーしたDSN）
   - Environment: **Production** にチェック
   - 「Save」をクリック

### Step 3: Vercel Analytics有効化（無料）

1. **Vercelダッシュボードで有効化**
   ```
   https://vercel.com/your-project/analytics
   ```

2. **Enableボタンをクリック**
   - 「Enable Web Analytics」をクリック
   - 設定はデフォルトでOK

### Step 4: 再デプロイ

1. **Vercelダッシュボードで再デプロイ**
   ```
   https://vercel.com/your-project/deployments
   ```

2. **最新デプロイメントの「...」→「Redeploy」**
   - 環境変数を反映させるため

---

## 📊 確認方法

### Sentryダッシュボード
1. https://sentry.io/organizations/your-org/projects/
2. エラーが表示される（最初は0件）
3. テストエラー送信方法:
   ```javascript
   // ブラウザコンソールで実行
   throw new Error("Test Sentry Error");
   ```

### Vercel Analytics
1. https://vercel.com/your-project/analytics
2. リアルタイムデータが表示開始（数分後）
3. Core Web Vitals（LCP, FID, CLS）が測定される

---

## 💰 コスト

### 現在の設定（完全無料）
- Sentry無料枠: 5,000エラー/月
- Vercel Analytics無料枠: 100,000イベント/月
- **合計**: ¥0/月

### 有料化の目安
- 月間訪問数が**10,000人を超えたら**検討
- Sentryチームプラン: $26/月（約¥3,900）
- Vercel Analytics Pro: $20/月（約¥3,000）

---

## 🔒 プライバシー設定済み

以下のプライバシー保護設定が実装済みです：

### Sentry
- ✅ Cookie情報の自動削除
- ✅ IPアドレスの自動削除
- ✅ セッションリプレイ時のテキスト・画像マスキング
- ✅ 本番環境のみ有効化（開発環境では無効）

### Vercel Analytics
- ✅ 個人識別情報を収集しない設計
- ✅ GDPRコンプライアンス対応済み

---

## ❓ トラブルシューティング

### エラーがSentryに送信されない
- Vercel環境変数が正しく設定されているか確認
- 本番環境（production）でのみ動作（開発環境では無動作）
- ブラウザコンソールで確認: `Sentry is not defined` エラーがないか

### Vercel Analyticsが動作しない
- Vercelダッシュボードで有効化されているか確認
- 数分待ってからリロード（データ反映に時間がかかる）

---

## 📝 実装詳細

### 変更ファイル
- ✅ `src/index.tsx` - Sentry/Analytics統合
- ✅ `src/vite-env.d.ts` - 環境変数型定義
- ✅ `.env.example` - 環境変数サンプル
- ✅ `package.json` - パッケージ追加

### セキュリティ考慮事項
- 環境変数はGitにコミットしない（`.env`は`.gitignore`済み）
- Sentry DSNは公開しても安全（読み取り専用）
- 機密情報は自動フィルタリングされる

---

## 🎯 次のアクション

1. **Sentryアカウント作成**（5分）
2. **Vercel環境変数設定**（2分）
3. **Vercel Analytics有効化**（1分）
4. **再デプロイ**（3分）
5. **ダッシュボード確認**（5分）

**合計所要時間**: 約15分

---

## 📞 サポート

質問や問題があれば、以下を確認してください：
- Sentry公式ドキュメント: https://docs.sentry.io/platforms/javascript/guides/react/
- Vercel Analytics: https://vercel.com/docs/analytics

---

**ステータス**: ✅ コード実装完了（あとはアカウント設定のみ）
**コスト**: ¥0/月（完全無料で開始可能）
