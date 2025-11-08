# Supabase セットアップガイド

**最終更新**: 2025-11-08
**想定時間**: 30分
**難易度**: 初級〜中級

---

## 📋 目次

1. [Supabaseプロジェクト作成](#1-supabaseプロジェクト作成)
2. [環境変数設定](#2-環境変数設定)
3. [データベーススキーマ作成](#3-データベーススキーマ作成)
4. [RLSポリシー設定](#4-rlsポリシー設定)
5. [OAuth設定（Google/GitHub）](#5-oauth設定)
6. [動作確認](#6-動作確認)

---

## 1. Supabaseプロジェクト作成

### 1.1 アカウント作成

1. **Supabase公式サイトにアクセス**
   https://supabase.com/dashboard

2. **Start your project ボタンをクリック**
   GitHub/Google/Emailでサインアップ

3. **メール認証を完了**

### 1.2 新規プロジェクト作成

1. **New project ボタンをクリック**

2. **プロジェクト情報を入力**
   ```
   Project name: taskflow-app
   Database Password: [強力なパスワードを生成] ← 必ず控えておく
   Region: Northeast Asia (Tokyo) ← 日本ユーザー向け
   Pricing Plan: Free ← 初期は無料プランでOK
   ```

3. **Create new project ボタンをクリック**
   - プロジェクト作成に1-2分かかります

4. **Project API keys を確認**
   - Settings → API タブを開く
   - 以下の2つをコピーして控える:
     - `Project URL`: `https://xxxxx.supabase.co`
     - `anon public key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

---

## 2. 環境変数設定

### 2.1 .env.local ファイル作成

プロジェクトルートに `.env.local` を作成:

```bash
# Supabase設定
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe設定（Phase 3で使用）
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx

# 開発環境フラグ
VITE_ENABLE_CLOUD_SYNC=true
```

### 2.2 .env.example ファイル作成（Git管理用）

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration (Phase 3)
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx

# Feature Flags
VITE_ENABLE_CLOUD_SYNC=true
```

### 2.3 .gitignore に追加（既存確認）

```.gitignore
# 環境変数ファイル
.env
.env.local
.env.*.local
```

---

## 3. データベーススキーマ作成

### 3.1 SQL Editor を開く

Supabase Dashboard → SQL Editor → New query

### 3.2 スキーマSQLを実行

以下のSQLを**順番に**実行してください。

#### Step 1: UUID拡張を有効化

```sql
-- UUID生成機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### Step 2: profiles テーブル作成

```sql
-- ユーザープロフィールテーブル
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' NOT NULL CHECK (plan IN ('free', 'pro', 'team')),
  language TEXT DEFAULT 'ja' CHECK (language IN ('ja', 'en')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_plan_idx ON profiles(plan);

-- コメント追加
COMMENT ON TABLE profiles IS 'ユーザープロフィール情報';
COMMENT ON COLUMN profiles.plan IS '料金プラン: free, pro, team';
COMMENT ON COLUMN profiles.language IS 'UI言語: ja, en';
```

#### Step 3: boards テーブル作成

```sql
-- ボードテーブル
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) > 0),
  description TEXT,
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX boards_user_id_idx ON boards(user_id);
CREATE INDEX boards_created_at_idx ON boards(created_at DESC);
CREATE INDEX boards_is_shared_idx ON boards(is_shared) WHERE is_shared = true;

-- コメント追加
COMMENT ON TABLE boards IS 'タスクボード（カンバン）';
COMMENT ON COLUMN boards.columns IS 'カラム情報のJSON配列';
COMMENT ON COLUMN boards.settings IS 'ボード設定（デフォルトカラム等）';
```

#### Step 4: tasks テーブル作成

```sql
-- タスクテーブル
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  column_id TEXT NOT NULL,

  -- タスク基本情報
  title TEXT NOT NULL CHECK (char_length(title) > 0),
  description TEXT,
  completed BOOLEAN DEFAULT false,

  -- 日時情報
  due_date TIMESTAMP WITH TIME ZONE,
  due_time TEXT,
  recurrence JSONB,

  -- 優先度・ラベル
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  labels JSONB DEFAULT '[]'::jsonb,

  -- サブタスク・添付ファイル
  subtasks JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,

  -- メタデータ
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- インデックス作成
CREATE INDEX tasks_board_id_idx ON tasks(board_id);
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_due_date_idx ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX tasks_completed_idx ON tasks(completed);
CREATE INDEX tasks_priority_idx ON tasks(priority) WHERE priority IS NOT NULL;

-- コメント追加
COMMENT ON TABLE tasks IS 'タスク情報';
COMMENT ON COLUMN tasks.due_time IS '期限時刻（HH:mm形式）';
COMMENT ON COLUMN tasks.recurrence IS '繰り返し設定のJSON';
```

#### Step 5: team_boards テーブル作成

```sql
-- チームボードテーブル（Phase 4で使用）
CREATE TABLE team_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(board_id, user_id)
);

-- インデックス作成
CREATE INDEX team_boards_board_id_idx ON team_boards(board_id);
CREATE INDEX team_boards_user_id_idx ON team_boards(user_id);

-- コメント追加
COMMENT ON TABLE team_boards IS 'チームコラボレーション用ボード共有';
COMMENT ON COLUMN team_boards.role IS 'ユーザー役割: owner, admin, member, viewer';
```

#### Step 6: subscriptions テーブル作成

```sql
-- サブスクリプションテーブル（Phase 3で使用）
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'team')),
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_stripe_customer_id_idx ON subscriptions(stripe_customer_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);

-- コメント追加
COMMENT ON TABLE subscriptions IS 'Stripe連携サブスクリプション管理';
```

#### Step 7: templates テーブル作成

```sql
-- テンプレートテーブル
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) > 0),
  category TEXT,
  task_template JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX templates_user_id_idx ON templates(user_id);
CREATE INDEX templates_is_favorite_idx ON templates(is_favorite) WHERE is_favorite = true;
CREATE INDEX templates_is_public_idx ON templates(is_public) WHERE is_public = true;

-- コメント追加
COMMENT ON TABLE templates IS 'タスクテンプレート';
COMMENT ON COLUMN templates.is_public IS '公開テンプレート（将来機能）';
```

#### Step 8: updated_at 自動更新トリガー作成

```sql
-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー適用
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 4. RLSポリシー設定

### 4.1 RLS（Row Level Security）とは？

ユーザーが**自分のデータのみ**アクセスできるようにするPostgreSQLのセキュリティ機能。

### 4.2 RLSポリシーSQL

以下のSQLを実行してください。

#### profiles テーブル

```sql
-- RLS有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: ユーザーは自分のプロフィールのみ閲覧可能
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- UPDATE: ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- INSERT: 新規ユーザー登録時のみ（auth.users作成と同時）
CREATE POLICY "Users can insert own profile on signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### boards テーブル

```sql
-- RLS有効化
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分のボード または 共有されたボード
CREATE POLICY "Users can view own or shared boards"
  ON boards FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM team_boards
      WHERE team_boards.board_id = boards.id
        AND team_boards.user_id = auth.uid()
    )
  );

-- INSERT: 自分のボードのみ作成可能
CREATE POLICY "Users can insert own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分のボード または 管理者権限
CREATE POLICY "Users can update own or admin boards"
  ON boards FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM team_boards
      WHERE team_boards.board_id = boards.id
        AND team_boards.user_id = auth.uid()
        AND team_boards.role IN ('owner', 'admin')
    )
  );

-- DELETE: 自分のボードのみ削除可能
CREATE POLICY "Users can delete own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);
```

#### tasks テーブル

```sql
-- RLS有効化
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分のタスク または 共有ボードのタスク
CREATE POLICY "Users can view own or shared tasks"
  ON tasks FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM boards b
      JOIN team_boards tb ON tb.board_id = b.id
      WHERE b.id = tasks.board_id
        AND tb.user_id = auth.uid()
    )
  );

-- INSERT: 自分のボード または 共有ボードにタスク作成可能
CREATE POLICY "Users can insert tasks in accessible boards"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = tasks.board_id
        AND (
          boards.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM team_boards
            WHERE team_boards.board_id = boards.id
              AND team_boards.user_id = auth.uid()
          )
        )
    )
  );

-- UPDATE: 自分のタスク または 共有ボードのタスク
CREATE POLICY "Users can update accessible tasks"
  ON tasks FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM boards b
      JOIN team_boards tb ON tb.board_id = b.id
      WHERE b.id = tasks.board_id
        AND tb.user_id = auth.uid()
    )
  );

-- DELETE: 自分のタスクのみ削除可能
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

#### team_boards テーブル

```sql
-- RLS有効化
ALTER TABLE team_boards ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分が参加しているチームボードのみ閲覧
CREATE POLICY "Users can view team boards they belong to"
  ON team_boards FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: オーナーのみメンバー招待可能
CREATE POLICY "Owners can invite members"
  ON team_boards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_boards existing
      WHERE existing.board_id = team_boards.board_id
        AND existing.user_id = auth.uid()
        AND existing.role = 'owner'
    )
  );

-- UPDATE: オーナーのみ役割変更可能
CREATE POLICY "Owners can update member roles"
  ON team_boards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_boards existing
      WHERE existing.board_id = team_boards.board_id
        AND existing.user_id = auth.uid()
        AND existing.role = 'owner'
    )
  );

-- DELETE: オーナーのみメンバー削除可能
CREATE POLICY "Owners can remove members"
  ON team_boards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_boards existing
      WHERE existing.board_id = team_boards.board_id
        AND existing.user_id = auth.uid()
        AND existing.role = 'owner'
    )
  );
```

#### subscriptions テーブル

```sql
-- RLS有効化
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分のサブスクリプション情報のみ閲覧
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT/UPDATE: サーバー側（Stripe Webhook）からのみ実行
-- クライアント側からの直接操作は禁止（service_role keyのみ許可）
```

#### templates テーブル

```sql
-- RLS有効化
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分のテンプレート または 公開テンプレート
CREATE POLICY "Users can view own or public templates"
  ON templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- INSERT: 自分のテンプレートのみ作成可能
CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分のテンプレートのみ更新可能
CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: 自分のテンプレートのみ削除可能
CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 5. OAuth設定

### 5.1 Google OAuth設定

#### Google Cloud Console設定

1. **Google Cloud Consoleにアクセス**
   https://console.cloud.google.com/

2. **プロジェクト作成**
   - プロジェクト名: `taskflow-app`

3. **OAuth同意画面設定**
   - APIs & Services → OAuth consent screen
   - User Type: External
   - アプリ名: TaskFlow
   - サポートメール: あなたのメール
   - スコープ: `.../auth/userinfo.email`, `.../auth/userinfo.profile`

4. **OAuth 2.0 クライアントID作成**
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Name: TaskFlow Supabase
   - Authorized redirect URIs:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
   - Client IDとClient Secretをコピー

#### Supabase設定

1. **Supabase Dashboard → Authentication → Providers**

2. **Google プロバイダーを有効化**
   ```
   Client ID: 上記でコピーしたClient ID
   Client Secret: 上記でコピーしたClient Secret
   ```

3. **Save ボタンをクリック**

### 5.2 GitHub OAuth設定

#### GitHub設定

1. **GitHub Settings → Developer settings**
   https://github.com/settings/developers

2. **OAuth Apps → New OAuth App**
   ```
   Application name: TaskFlow
   Homepage URL: https://tflow-app.vercel.app
   Authorization callback URL: https://your-project-id.supabase.co/auth/v1/callback
   ```

3. **Client IDとClient Secretをコピー**

#### Supabase設定

1. **Supabase Dashboard → Authentication → Providers**

2. **GitHub プロバイダーを有効化**
   ```
   Client ID: 上記でコピーしたClient ID
   Client Secret: 上記でコピーしたClient Secret
   ```

3. **Save ボタンをクリック**

### 5.3 Email認証設定（デフォルト有効）

Supabase Dashboard → Authentication → Providers

- Email: 既に有効化されています
- Confirm email: ON推奨（メール認証必須）
- Secure email change: ON推奨

---

## 6. 動作確認

### 6.1 SQL Editorでテスト

```sql
-- テーブル一覧確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 期待される結果:
-- boards
-- profiles
-- subscriptions
-- tasks
-- team_boards
-- templates
```

### 6.2 RLSポリシー確認

```sql
-- RLS有効化確認
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- すべてのテーブルで rowsecurity = true であることを確認
```

### 6.3 認証テスト

Supabase Dashboard → Authentication → Users

- **Add user** ボタンで手動テストユーザー作成
- Email: test@example.com
- Password: Test1234!
- Auto Confirm User: ON

### 6.4 Realtime機能有効化（オプション）

Phase 2で使用するリアルタイム同期機能を有効化:

```sql
-- tasks テーブルのRealtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE boards;
```

または Supabase Dashboard → Database → Replication で設定。

---

## 7. トラブルシューティング

### よくあるエラー

#### エラー: "relation does not exist"

**原因**: テーブルが作成されていない

**解決策**:
```sql
-- テーブル存在確認
SELECT * FROM pg_tables WHERE schemaname = 'public';

-- SQLを再実行
```

#### エラー: "permission denied for table"

**原因**: RLSポリシーが正しく設定されていない

**解決策**:
```sql
-- RLS有効化確認
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- ポリシー確認
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

#### エラー: "duplicate key value violates unique constraint"

**原因**: 同じUUIDが既に存在

**解決策**:
```sql
-- UUID拡張確認
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- 存在しない場合
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 8. 次のステップ

### Phase 1実装準備完了！

以下のチェックリストを確認:

- [ ] Supabaseプロジェクト作成完了
- [ ] 環境変数ファイル作成完了（.env.local）
- [ ] 6テーブルすべて作成完了
- [ ] RLSポリシーすべて設定完了
- [ ] Google OAuth設定完了
- [ ] GitHub OAuth設定完了
- [ ] テストユーザー作成・動作確認完了

### 実装開始

次は以下のファイルを実装:

1. `src/lib/supabase.ts` - Supabaseクライアント初期化
2. `src/contexts/AuthContext.tsx` - 認証状態管理
3. `src/components/Auth/LoginDialog.tsx` - ログインUI

詳細は `docs/ACCOUNT_MONETIZATION_PLAN.md` の Phase 1.3 を参照。

---

## 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase認証ガイド](https://supabase.com/docs/guides/auth)
- [PostgreSQL RLSドキュメント](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Google OAuth設定ガイド](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub OAuth設定ガイド](https://supabase.com/docs/guides/auth/social-login/auth-github)

---

**セットアップ完了！お疲れ様でした🎉**
