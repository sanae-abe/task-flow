# TaskFlow - アカウント機能+有料化 実装計画書

**最終更新**: 2025-11-08
**バージョン**: 1.0
**ステータス**: 🟢 実装待機中

---

## 📋 目次

1. [概要](#概要)
2. [技術選定](#技術選定)
3. [システムアーキテクチャ](#システムアーキテクチャ)
4. [データベース設計](#データベース設計)
5. [実装ロードマップ](#実装ロードマップ)
6. [料金プラン設計](#料金プラン設計)
7. [セキュリティ設計](#セキュリティ設計)
8. [移行戦略](#移行戦略)
9. [コスト試算](#コスト試算)
10. [リスク管理](#リスク管理)

---

## 概要

### 🎯 目的

TaskFlowに以下の機能を追加し、持続可能なビジネスモデルを構築する：

1. **マルチデバイス同期**: 複数デバイス間でのデータ同期
2. **チームコラボレーション**: 複数ユーザーでの共同編集
3. **クラウドバックアップ**: デバイス故障時のデータ復旧
4. **有料プラン**: 高度な機能による収益化

### ✅ 要件

- ✅ **無料版維持**: ログイン不要で使える現在の機能は維持
- ✅ **段階的実装**: Phase 1-4に分割し、リスク最小化
- ✅ **無料から開始**: 初期コストゼロでスタート（Supabase無料枠）
- ✅ **フリーミアムモデル**: 無料版→有料版の自然な移行パス

---

## 技術選定

### 🚀 選定技術スタック

```yaml
BaaS: Supabase
  理由:
    - PostgreSQL標準搭載
    - 認証システム組み込み（Google/GitHub/Email OAuth）
    - リアルタイム機能標準装備
    - TypeScript型定義自動生成
    - React公式サポート
    - 無料枠が充実（500MB DB, 1GB Storage, 50,000 MAU）

  代替案:
    Firebase: リアルタイムDB強いがRDBMS不足
    AWS Amplify: 高機能だが複雑、コスト高

決済: Stripe
  理由:
    - 日本の決済に対応
    - Supabase公式統合ガイドあり
    - サブスクリプション管理が容易
    - Webhook標準サポート

  代替案:
    PayPal: 決済手数料が高い
    Square: 日本サポート限定的

ホスティング: Vercel (現状維持)
  理由:
    - 現在既に使用中
    - 自動デプロイ確立済み
    - Supabase連携容易
```

### 🔧 追加パッケージ

```bash
npm install @supabase/supabase-js          # Supabaseクライアント
npm install @supabase/auth-helpers-react   # React認証ヘルパー
npm install @stripe/stripe-js stripe       # Stripe決済
npm install zod                            # ランタイム型検証（既存）
```

---

## システムアーキテクチャ

### 🏗️ 全体構成図

```
┌─────────────────────────────────────────────────────┐
│          TaskFlow（React SPA）                      │
│  - カンバン・テーブル・カレンダービュー             │
│  - PWA（オフライン対応）                            │
│  - LanguageSwitcher（日本語/英語）                  │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼─────────┐  ┌────────▼────────┐
│   Supabase      │  │    Stripe       │
│  - PostgreSQL   │  │  - 決済処理     │
│  - Auth         │  │  - サブスク管理 │
│  - Storage      │  │  - Webhook      │
│  - Realtime     │  └─────────────────┘
│  - RLS          │
└─────────────────┘

認証状態による動作分岐:
  未ログイン → IndexedDB（ローカル専用）
  ログイン済 → Supabase + IndexedDB（リアルタイム同期）
  有料プラン → + AI機能 + チームコラボ + 容量拡張
```

### 📊 データフロー

```
1. 未ログインユーザー:
   React App → IndexedDB（ローカル保存）

2. ログインユーザー（無料版）:
   React App ← 同期 → Supabase PostgreSQL
        ↓
   IndexedDB（キャッシュ）

3. 有料プランユーザー:
   React App ← リアルタイム同期 → Supabase
        ↓                              ↓
   IndexedDB                  + AI機能サーバー
                                     ↓
                              + チームコラボ機能
```

---

## データベース設計

### 🗄️ Supabase PostgreSQL スキーマ

#### 1. `profiles` テーブル（ユーザープロフィール）

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' NOT NULL, -- 'free', 'pro', 'team'
  language TEXT DEFAULT 'ja', -- 'ja', 'en'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS（Row Level Security）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 2. `boards` テーブル（ボード）

```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  columns JSONB NOT NULL DEFAULT '[]', -- カラム情報
  settings JSONB DEFAULT '{}', -- ボード設定
  is_shared BOOLEAN DEFAULT false, -- チームコラボ用
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- インデックス
  CONSTRAINT boards_name_not_empty CHECK (char_length(name) > 0)
);

CREATE INDEX boards_user_id_idx ON boards(user_id);
CREATE INDEX boards_created_at_idx ON boards(created_at DESC);

-- RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boards"
  ON boards FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM team_boards
      WHERE team_boards.board_id = boards.id
      AND team_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own boards"
  ON boards FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM team_boards
      WHERE team_boards.board_id = boards.id
      AND team_boards.user_id = auth.uid()
      AND team_boards.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);
```

#### 3. `tasks` テーブル（タスク）

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  column_id TEXT NOT NULL, -- カラムID

  -- タスク基本情報
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,

  -- 日時情報
  due_date TIMESTAMP,
  due_time TEXT, -- "HH:mm" 形式
  recurrence JSONB, -- 繰り返し設定

  -- 優先度・ラベル
  priority TEXT, -- 'critical', 'high', 'medium', 'low'
  labels JSONB DEFAULT '[]', -- ラベル配列

  -- サブタスク・添付ファイル
  subtasks JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',

  -- メタデータ
  position INTEGER DEFAULT 0, -- ソート順
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  CONSTRAINT tasks_title_not_empty CHECK (char_length(title) > 0)
);

CREATE INDEX tasks_board_id_idx ON tasks(board_id);
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_due_date_idx ON tasks(due_date);
CREATE INDEX tasks_completed_idx ON tasks(completed);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM boards b
      JOIN team_boards tb ON tb.board_id = b.id
      WHERE b.id = tasks.board_id
      AND tb.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks in own boards"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = tasks.board_id
      AND (
        boards.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_boards
          WHERE team_boards.board_id = boards.id
          AND team_boards.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM boards b
      JOIN team_boards tb ON tb.board_id = b.id
      WHERE b.id = tasks.board_id
      AND tb.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

#### 4. `team_boards` テーブル（チームコラボレーション）

```sql
CREATE TABLE team_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT DEFAULT 'member' NOT NULL, -- 'owner', 'admin', 'member', 'viewer'
  invited_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(board_id, user_id)
);

CREATE INDEX team_boards_board_id_idx ON team_boards(board_id);
CREATE INDEX team_boards_user_id_idx ON team_boards(user_id);

-- RLS
ALTER TABLE team_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team boards they're part of"
  ON team_boards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can invite users"
  ON team_boards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_boards existing
      WHERE existing.board_id = team_boards.board_id
      AND existing.user_id = auth.uid()
      AND existing.role = 'owner'
    )
  );
```

#### 5. `subscriptions` テーブル（Stripe連携）

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL, -- 'free', 'pro', 'team'
  status TEXT, -- 'active', 'canceled', 'past_due', 'trialing'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_stripe_customer_id_idx ON subscriptions(stripe_customer_id);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

#### 6. `templates` テーブル（テンプレート）

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  task_template JSONB NOT NULL, -- タスク定義
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false, -- 将来的な公開テンプレート用
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX templates_user_id_idx ON templates(user_id);

-- RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 実装ロードマップ

### 📅 Phase 1: 基礎インフラ構築（2-3週間）

**目標**: Supabaseセットアップ + 基本認証システム実装

#### 1.1 Supabaseプロジェクトセットアップ（1日）

```bash
# 作業内容
1. Supabaseアカウント作成: https://supabase.com/dashboard
2. 新規プロジェクト作成（無料プラン）
3. 環境変数設定:
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
4. パッケージインストール:
   npm install @supabase/supabase-js @supabase/auth-helpers-react
```

#### 1.2 データベーススキーマ作成（2日）

```bash
# 作業内容
1. Supabase SQL Editorで上記スキーマを実行
2. RLSポリシー設定
3. インデックス作成
4. テストデータ投入
```

#### 1.3 認証システム実装（1週間）

**実装ファイル**:

- `src/lib/supabase.ts` - Supabaseクライアント初期化
- `src/contexts/AuthContext.tsx` - 認証状態管理
- `src/components/Auth/LoginDialog.tsx` - ログインダイアログ
- `src/components/Auth/SignupDialog.tsx` - サインアップダイアログ
- `src/components/Auth/UserMenu.tsx` - ユーザーメニュー
- `src/hooks/useAuth.ts` - 認証フック

**主要機能**:

- Email/Password認証
- Google OAuth認証
- GitHub OAuth認証
- セッション管理
- ログアウト機能

#### 1.4 プロフィール管理実装（3日）

**実装ファイル**:

- `src/components/Profile/ProfileDialog.tsx` - プロフィール編集
- `src/hooks/useProfile.ts` - プロフィール管理フック

**主要機能**:

- プロフィール表示・編集
- アバター画像アップロード（Supabase Storage）
- 言語設定連携

---

### 📅 Phase 2: データ同期システム（2-3週間）

**目標**: IndexedDB ↔ Supabase双方向同期実装

#### 2.1 同期ストラテジー設計（3日）

**同期方針**:

```typescript
// ハイブリッド同期戦略
未ログイン:
  - IndexedDB（ローカル専用）
  - 同期なし

ログイン（オンライン）:
  - Supabase（マスター）
  - IndexedDB（キャッシュ）
  - リアルタイム同期

ログイン（オフライン）:
  - IndexedDB（ローカルバッファ）
  - オンライン復帰時に同期
```

#### 2.2 同期ロジック実装（1.5週間）

**実装ファイル**:

- `src/hooks/useSyncBoards.ts` - ボード同期
- `src/hooks/useSyncTasks.ts` - タスク同期
- `src/hooks/useSyncTemplates.ts` - テンプレート同期
- `src/lib/sync/conflictResolution.ts` - 競合解決
- `src/lib/sync/offlineQueue.ts` - オフライン操作キュー

**主要機能**:

- 初回ログイン時のIndexedDB→Supabase移行
- リアルタイム同期（Supabase Realtime使用）
- 競合解決（Last-Write-Wins戦略）
- オフライン操作のキューイング

#### 2.3 エラーハンドリング（3日）

**実装内容**:

- ネットワークエラー処理
- 同期失敗リトライ
- ユーザー通知システム

---

### 📅 Phase 3: Stripe統合・有料化（2週間）

**目標**: プラン管理 + 決済システム実装

#### 3.1 Stripeセットアップ（2日）

```bash
# 作業内容
1. Stripeアカウント作成
2. 商品・価格設定:
   - Proプラン: ¥980/月
   - Teamプラン: ¥2,980/月
3. Webhook URL設定
4. パッケージインストール:
   npm install @stripe/stripe-js stripe
```

#### 3.2 プラン管理システム（5日）

**実装ファイル**:

- `src/lib/plans.ts` - プラン定義
- `src/hooks/useSubscription.ts` - サブスクリプション管理
- `src/hooks/useFeatureLimit.ts` - 機能制限チェック
- `src/components/Pricing/PricingDialog.tsx` - 料金プラン表示
- `src/components/Subscription/SubscriptionManagement.tsx` - サブスク管理

**プラン定義例**:

```typescript
export const PLANS = {
  FREE: {
    id: 'free',
    name: '無料プラン',
    price: 0,
    features: {
      maxBoards: 3,
      maxTasksPerBoard: 50,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      teamCollaboration: false,
      aiFeatures: false,
      prioritySupport: false
    }
  },
  PRO: {
    id: 'pro',
    name: 'Proプラン',
    price: 980,
    priceId: 'price_xxx', // Stripe Price ID
    features: {
      maxBoards: 999,
      maxTasksPerBoard: 999,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      teamCollaboration: false,
      aiFeatures: true,
      prioritySupport: true
    }
  },
  TEAM: {
    id: 'team',
    name: 'Teamプラン',
    price: 2980,
    priceId: 'price_yyy',
    features: {
      maxBoards: 999,
      maxTasksPerBoard: 999,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      teamCollaboration: true,
      maxTeamMembers: 10,
      aiFeatures: true,
      prioritySupport: true
    }
  }
} as const;
```

#### 3.3 決済フロー実装（5日）

**実装ファイル**:

- `src/components/Checkout/CheckoutDialog.tsx` - チェックアウト
- `src/lib/stripe/createCheckoutSession.ts` - セッション作成
- `src/lib/stripe/webhookHandlers.ts` - Webhook処理

**決済フロー**:

```
1. ユーザーがプラン選択
   ↓
2. Stripe Checkout Session作成
   ↓
3. Stripeホストページへリダイレクト
   ↓
4. 決済完了
   ↓
5. Webhook受信
   ↓
6. subscriptionsテーブル更新
   ↓
7. profilesテーブルのplan更新
```

#### 3.4 機能制限実装（2日）

**実装内容**:

```typescript
// 使用例
const { canCreateBoard, canUploadFile, features } = useFeatureLimit();

// ボード作成前チェック
if (!canCreateBoard(currentBoardCount)) {
  showUpgradeDialog('ボード数の上限に達しました');
  return;
}

// ファイルアップロード前チェック
if (!canUploadFile(fileSize)) {
  showUpgradeDialog(`ファイルサイズは${formatBytes(features.maxFileSize)}までです`);
  return;
}
```

---

### 📅 Phase 4: チームコラボレーション（2-3週間）

**目標**: 複数ユーザーでのボード共有・リアルタイム編集

#### 4.1 チーム管理UI（1週間）

**実装ファイル**:

- `src/components/Team/TeamManagementPanel.tsx` - チーム管理
- `src/components/Team/InviteMemberDialog.tsx` - メンバー招待
- `src/components/Team/MemberList.tsx` - メンバー一覧
- `src/hooks/useTeamBoards.ts` - チームボード管理

**主要機能**:

- メンバー招待（メールアドレス）
- 役割管理（Owner/Admin/Member/Viewer）
- メンバー削除
- 権限変更

#### 4.2 リアルタイムコラボレーション（1週間）

**実装内容**:

- Supabase Realtimeによるタスク更新通知
- 他ユーザーの編集中表示
- 競合解決UI

#### 4.3 権限制御（3日）

**権限マトリクス**:

| 役割   | 表示 | タスク編集 | ボード設定 | メンバー管理 | 削除 |
| ------ | ---- | ---------- | ---------- | ------------ | ---- |
| Owner  | ✅   | ✅         | ✅         | ✅           | ✅   |
| Admin  | ✅   | ✅         | ✅         | ✅           | ❌   |
| Member | ✅   | ✅         | ❌         | ❌           | ❌   |
| Viewer | ✅   | ❌         | ❌         | ❌           | ❌   |

---

## 料金プラン設計

### 💰 推奨プラン体系

#### 無料プラン（Free）

```yaml
月額: ¥0
対象: 個人利用、お試しユーザー

機能制限:
  ボード数: 3個まで
  タスク数: 各ボード50個まで
  ファイルサイズ: 1ファイル5MBまで
  ストレージ: 合計100MBまで

利用可能機能:
  - マルチデバイス同期: ✅
  - クラウドバックアップ: ✅
  - 日本語/英語切り替え: ✅
  - PWA機能: ✅
  - カンバン・テーブル・カレンダービュー: ✅

利用不可機能:
  - チームコラボレーション: ❌
  - AI要約・分析機能: ❌
  - 優先サポート: ❌
  - カスタマイズ: ❌
```

#### Proプラン

```yaml
月額: ¥980（年払い¥9,800で2ヶ月無料）
対象: パワーユーザー、個人事業主

機能制限:
  ボード数: 無制限
  タスク数: 無制限
  ファイルサイズ: 1ファイル50MBまで
  ストレージ: 合計10GBまで

利用可能機能:
  - 無料プランすべて +
  - AI要約・分析機能: ✅
    - タスク説明の自動要約
    - 優先度の自動提案
    - スケジュール最適化
  - 優先サポート: ✅（24時間以内返信）
  - データエクスポート: CSV/Excel対応 ✅
  - カスタムテンプレート: 無制限 ✅

利用不可機能:
  - チームコラボレーション: ❌
```

#### Teamプラン

```yaml
月額: ¥2,980（年払い¥29,800で2ヶ月無料）
対象: チーム・企業利用

機能制限:
  ボード数: 無制限
  タスク数: 無制限
  ファイルサイズ: 1ファイル100MBまで
  ストレージ: 合計50GBまで
  チームメンバー: 10人まで

利用可能機能:
  - Proプランすべて +
  - チームコラボレーション: ✅
    - ボード共有
    - リアルタイム共同編集
    - メンバー権限管理
    - アクティビティログ
  - チームレポート機能: ✅
  - API連携: ✅（Webhook, REST API）
  - SSO対応: ✅（Google Workspace, GitHub）
  - SLA保証: ✅（99.9%稼働率）
  - 専用サポート: ✅（1営業日以内返信）

追加オプション:
  - メンバー追加: +¥298/人/月
  - ストレージ追加: +¥498/100GB/月
```

### 📊 プラン比較表

| 機能                     | 無料   | Pro     | Team    |
| ------------------------ | ------ | ------- | ------- |
| **月額料金**             | ¥0     | ¥980    | ¥2,980  |
| **ボード数**             | 3個    | 無制限  | 無制限  |
| **タスク数**             | 50/板  | 無制限  | 無制限  |
| **ファイルサイズ**       | 5MB    | 50MB    | 100MB   |
| **ストレージ**           | 100MB  | 10GB    | 50GB    |
| **デバイス同期**         | ✅     | ✅      | ✅      |
| **AI機能**               | ❌     | ✅      | ✅      |
| **チームコラボ**         | ❌     | ❌      | ✅      |
| **チームメンバー**       | -      | -       | 10人    |
| **優先サポート**         | ❌     | 24h以内 | 1日以内 |
| **データエクスポート**   | JSON   | CSV/XLS | CSV/XLS |
| **API連携**              | ❌     | ❌      | ✅      |
| **SLA保証**              | ❌     | ❌      | 99.9%   |
| **カスタムブランディング** | ❌  | ❌      | 要相談  |

---

## セキュリティ設計

### 🔒 セキュリティ対策

#### 1. 認証セキュリティ

```yaml
実装内容:
  パスワードポリシー:
    - 最小8文字
    - 英大小文字・数字・記号を含む
    - 一般的なパスワードのブロック

  多要素認証（MFA）:
    - TOTP対応（Google Authenticator等）
    - 有料プランで提供

  OAuth:
    - Google OAuth 2.0
    - GitHub OAuth

  セッション管理:
    - JWT（JSON Web Token）
    - リフレッシュトークンローテーション
    - 30日間の有効期限
```

#### 2. データ保護

```yaml
暗号化:
  通信: HTTPS（TLS 1.3）必須
  保存: Supabase標準暗号化（AES-256）

アクセス制御:
  RLS（Row Level Security）:
    - ユーザーは自分のデータのみアクセス可能
    - チームメンバーは共有ボードのみアクセス可能

  API認証:
    - Supabase Anon Key（公開可能）
    - Service Role Key（サーバー専用、非公開）
```

#### 3. 脆弱性対策

```yaml
XSS対策:
  - DOMPurify（既存実装継続）
  - CSP（Content Security Policy）設定

SQLインジェクション対策:
  - Supabaseのパラメータバインディング
  - RLS完全依存

CSRF対策:
  - SameSite Cookie設定
  - Supabase標準対策

ファイルアップロード:
  - MIME type検証
  - ファイルサイズ制限
  - ウイルススキャン（将来実装）
```

#### 4. プライバシー保護

```yaml
GDPR対応:
  - データダウンロード機能
  - アカウント削除機能（完全削除）
  - Cookie同意バナー

データ保持:
  - 削除アカウントのデータは30日後に完全削除
  - ログ保持期間: 90日間
```

---

## 移行戦略

### 🔄 既存ユーザーの移行方法

#### パターン1: 未ログインユーザー → ログインユーザー

```typescript
// 初回ログイン時の移行フロー
async function migrateLocalDataToCloud(userId: string) {
  const localBoards = await getLocalBoards(); // IndexedDBから取得
  const localTemplates = await getLocalTemplates();

  // Supabaseへアップロード
  for (const board of localBoards) {
    await supabase.from('boards').insert({
      id: board.id, // UUID維持
      user_id: userId,
      name: board.name,
      columns: board.columns,
      settings: board.settings
    });

    // タスクも移行
    const tasks = await getLocalTasks(board.id);
    for (const task of tasks) {
      await supabase.from('tasks').insert({
        id: task.id,
        board_id: board.id,
        user_id: userId,
        ...task
      });
    }
  }

  // テンプレート移行
  for (const template of localTemplates) {
    await supabase.from('templates').insert({
      id: template.id,
      user_id: userId,
      ...template
    });
  }

  // 移行完了通知
  showNotification('データをクラウドに移行しました！', 'success');
}
```

#### パターン2: ログインユーザー → 有料プラン

```typescript
// プラン変更時の処理
async function upgradeToPaidPlan(userId: string, plan: 'pro' | 'team') {
  // 1. Stripeチェックアウト
  const checkoutUrl = await createStripeCheckoutSession(userId, plan);
  window.location.href = checkoutUrl;

  // 2. Webhook受信後（サーバー側）
  // subscriptions テーブル更新
  // profiles.plan 更新

  // 3. クライアント側で機能解放
  const { features } = await getSubscription(userId);
  // AI機能・チームコラボ等が利用可能に
}
```

---

## コスト試算

### 💵 運用コスト試算

#### 開発フェーズ（無料）

```yaml
Supabase: 無料枠
  - 500MB PostgreSQL
  - 1GB Storage
  - 50,000 MAU
  - リアルタイム機能

Stripe: テストモード無料

Vercel: 無料枠（現状維持）
  - Hobby Plan: $0/月
  - 100GB帯域

合計: ¥0/月
```

#### 運用開始〜100ユーザー

```yaml
Supabase: 無料枠で十分
  - 想定データ量: 50MB以下
  - 想定MAU: 100人以下

Stripe: 決済手数料のみ
  - 3.6%（日本の決済）
  - 売上の変動費

Vercel: 無料枠で十分

合計: 変動費のみ（売上の3.6%）
```

#### 1,000ユーザー想定

```yaml
Supabase Pro: $25/月（約¥3,500）
  - 8GB PostgreSQL
  - 100GB Storage
  - 100,000 MAU
  - 追加バックアップ

Stripe手数料: 売上の3.6%
  - 想定: 100人 × ¥980 = ¥98,000/月
  - 手数料: ¥3,528/月

Vercel Pro: $20/月（約¥2,800）
  - 1TB帯域
  - Analytics

合計: 約¥9,828/月 + 売上の3.6%
```

#### 10,000ユーザー想定

```yaml
Supabase Team: $599/月（約¥84,000）
  - 専用インスタンス
  - 無制限DB・Storage
  - SLA 99.9%

Stripe手数料: 売上の3.6%
  - 想定: 1,000人 × ¥980 = ¥980,000/月
  - 手数料: ¥35,280/月

Vercel Enterprise: 要見積もり
  - 想定: $100/月（約¥14,000）

AI機能サーバー: 約¥50,000/月
  - OpenAI API使用料

合計: 約¥183,000/月 + 売上の3.6%
```

### 📊 損益分岐点分析

```yaml
固定費（1,000ユーザー時）:
  - Supabase: ¥3,500/月
  - Vercel: ¥2,800/月
  - その他ツール: ¥3,000/月
  合計: ¥9,300/月

変動費率: 売上の3.6%（Stripe手数料）

損益分岐点:
  固定費 ÷ (1 - 変動費率) = ¥9,300 ÷ 0.964 = 約¥9,650/月

必要有料ユーザー数:
  - Proプラン（¥980）: 約10人
  - Teamプラン（¥2,980）: 約4チーム

結論: 非常に低い損益分岐点で収益化可能
```

---

## リスク管理

### ⚠️ 想定リスクと対策

#### 1. 技術リスク

**リスク**: Supabaseサービス障害

```yaml
影響度: 高
発生確率: 低（SLA 99.9%）

対策:
  - IndexedDBキャッシュ継続利用
  - オフライン機能維持
  - エラーハンドリング強化
  - ステータスページ設置
```

**リスク**: データ移行失敗

```yaml
影響度: 中
発生確率: 中

対策:
  - 段階的移行（Phase 1-4）
  - ロールバック機能実装
  - テストユーザーでの事前検証
  - バックアップ自動取得
```

#### 2. ビジネスリスク

**リスク**: 有料プラン未達成

```yaml
影響度: 中
発生確率: 中

対策:
  - 無料版でも価値提供継続
  - トライアル期間設定（14日間）
  - 段階的機能制限（ハードリミットなし）
  - ユーザーフィードバック重視
```

**リスク**: 競合サービス台頭

```yaml
影響度: 中
発生確率: 高

対策:
  - 日本語完全対応（差別化）
  - PWA・オフライン対応（独自性）
  - 柔軟なカスタマイズ性
  - コミュニティ重視
```

#### 3. 法的リスク

**リスク**: GDPR/個人情報保護法違反

```yaml
影響度: 高
発生確率: 低

対策:
  - プライバシーポリシー整備
  - 利用規約作成
  - Cookie同意バナー実装
  - データ削除機能実装
```

---

## 次のステップ

### ✅ 実装開始前の準備

1. **ビジネス判断**
   - [ ] 料金プラン最終決定
   - [ ] ターゲットユーザー明確化
   - [ ] 収益目標設定

2. **技術検証**
   - [ ] Supabaseプロジェクト作成（無料）
   - [ ] 認証フロー検証
   - [ ] データ同期検証

3. **デザイン**
   - [ ] 認証UI設計
   - [ ] プラン選択UI設計
   - [ ] チーム管理UI設計

4. **法務**
   - [ ] 利用規約作成
   - [ ] プライバシーポリシー作成
   - [ ] 特定商取引法表記

### 🚀 実装開始タイミング

**推奨**: Phase 1から順次開始

```yaml
Phase 1: 2-3週間（基礎インフラ）
  ↓
Phase 2: 2-3週間（データ同期）
  ↓
Phase 3: 2週間（有料化）
  ↓
Phase 4: 2-3週間（チームコラボ）

合計: 約8-11週間（2-3ヶ月）
```

---

## 付録

### 📚 参考リソース

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Stripe公式ドキュメント](https://stripe.com/docs)
- [Supabase + Stripe統合ガイド](https://supabase.com/partners/integrations/stripe)
- [React + Supabase認証ガイド](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)

### 🔧 開発環境セットアップ

```bash
# 1. Supabase CLIインストール（オプション）
npm install -g supabase

# 2. ローカル開発環境起動
supabase start

# 3. 環境変数設定
cp .env.example .env.local
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY を設定

# 4. 開発サーバー起動
npm start
```

---

**最終更新日**: 2025-11-08
**作成者**: Claude Code
**レビュー**: 未実施
**承認**: 未承認
