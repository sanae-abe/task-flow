# AutoDeletion コンポーネント

完了タスクの自動削除機能を提供するコンポーネント群。

## ディレクトリ構造

```
src/components/AutoDeletion/
├── AutoDeletionSettingsPanel.tsx  # メインコンポーネント (99行)
├── DeletionCandidateBadge.tsx     # 削除候補バッジ
├── DeletionNotificationBanner.tsx # 削除通知バナー
├── components/                     # UIセクションコンポーネント
│   ├── AutoDeletionSettingsHeader.tsx      # ヘッダー (30行)
│   ├── BasicSettingsSection.tsx            # 基本設定 (27行)
│   ├── RetentionSettingsSection.tsx        # 保持期間設定 (55行)
│   ├── RetentionDaysInput.tsx              # 日数入力 (29行)
│   ├── RetentionPresetMenu.tsx             # プリセットメニュー (36行)
│   ├── NotificationSettingsSection.tsx     # 通知設定 (41行)
│   ├── NotificationTimingInput.tsx         # 通知タイミング入力 (47行)
│   ├── SoftDeletionSettingsSection.tsx     # ソフトデリート設定 (35行)
│   ├── SoftDeletionRetentionInput.tsx      # 猶予期間入力 (41行)
│   ├── ExportSettingsSection.tsx           # 自動エクスポート設定 (29行)
│   ├── SettingsActions.tsx                 # アクションボタン (33行)
│   ├── SettingsDisclaimer.tsx              # 注意事項 (24行)
│   └── index.ts                            # エクスポート
├── hooks/                          # カスタムフック
│   ├── useAutoDeletionSettings.ts  # 設定状態管理 (41行)
│   ├── useSettingsSave.ts          # 保存処理 (44行)
│   ├── useSettingsValidation.ts    # バリデーション (42行)
│   └── index.ts                    # エクスポート
├── types/                          # 型定義
│   ├── AutoDeletionSettingsTypes.ts # Props型定義
│   └── index.ts                    # エクスポート
└── index.ts                        # メインエクスポート
```

## 主要コンポーネント

### AutoDeletionSettingsPanel

自動削除設定のメインパネル。各セクションコンポーネントを統合。

**使用例:**

```tsx
import { AutoDeletionSettingsPanel } from "@/components/AutoDeletion";

<AutoDeletionSettingsPanel />;
```

### UIセクションコンポーネント

#### BasicSettingsSection

自動削除機能の有効/無効切り替え

#### RetentionSettingsSection

完了タスクの保持期間設定（1-365日）

- RetentionDaysInput: 日数入力フィールド
- RetentionPresetMenu: プリセット選択メニュー

#### NotificationSettingsSection

削除前の通知設定

- NotificationTimingInput: 通知タイミング入力

#### SoftDeletionSettingsSection

ソフトデリート機能の設定

- SoftDeletionRetentionInput: 猶予期間入力

#### ExportSettingsSection

削除前の自動バックアップ設定

#### SettingsActions

保存・リセットボタン

#### SettingsDisclaimer

重要な注意事項の表示

## カスタムフック

### useAutoDeletionSettings

設定状態の管理とリセット機能を提供

```tsx
const { settings, handleChange, resetSettings } = useAutoDeletionSettings();
```

### useSettingsSave

設定の保存処理とステータス管理

```tsx
const { isSaving, saveMessage, handleSave } = useSettingsSave(settings);
```

### useSettingsValidation

設定値のバリデーション（未使用、将来の拡張用）

```tsx
const { isValid, validationErrors } = useSettingsValidation(settings);
```

## 型定義

### SettingsChangeHandler

設定変更ハンドラーの型定義

```tsx
type SettingsChangeHandler = <K extends keyof AutoDeletionSettings>(
  key: K,
  value: AutoDeletionSettings[K],
) => void;
```

### 各セクションProps

- `BasicSettingsSectionProps`
- `RetentionSettingsSectionProps`
- `NotificationSettingsSectionProps`
- `SoftDeletionSettingsSectionProps`
- `ExportSettingsSectionProps`
- `SettingsActionsProps`
- `SettingsDisclaimerProps`

## 設計原則

1. **単一責任原則**: 各コンポーネントは1つの責務のみを持つ
2. **コンポーネントサイズ**: 全コンポーネントが55行以下
3. **型安全性**: TypeScript strict mode準拠
4. **再利用性**: 独立したコンポーネント設計
5. **保守性**: 明確な階層構造とネーミング

## パフォーマンス最適化

- `useCallback`による関数メモ化
- 必要最小限のpropsのみを受け取る設計
- 条件付きレンダリングによる無駄な描画の削減

## アクセシビリティ

- Primer React の FormControl 使用
- disabled 属性による適切な状態管理
- 視覚的フィードバック（opacity変更）

## 今後の拡張ポイント

1. useSettingsValidation の実装統合
2. 設定エクスポート/インポート機能
3. プリセット設定の追加
4. 国際化（i18n）対応
