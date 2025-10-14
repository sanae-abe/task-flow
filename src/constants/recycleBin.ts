/**
 * ゴミ箱機能に関する定数定義
 */

// LocalStorage キー
export const RECYCLE_BIN_STORAGE_KEY = 'recycleBinSettings';

// カスタムイベント名
export const RECYCLE_BIN_SETTINGS_CHANGED_EVENT = 'recycleBinSettingsChanged';

// バリデーション定数
export const RETENTION_DAYS_LIMITS = {
  MIN: 1,
  MAX: 365,
} as const;

// プリセット設定の型定義
export interface RetentionPreset {
  label: string;
  days: number | null;
  description?: string;
}

// プリセット定義
export const RETENTION_PRESETS: readonly RetentionPreset[] = [
  {
    label: '1週間',
    days: 7,
    description: '短期間の保持。頻繁に整理したい場合に適しています'
  },
  {
    label: '2週間',
    days: 14,
    description: '適度な保持期間。日常的な作業に適しています'
  },
  {
    label: '1ヶ月',
    days: 30,
    description: '推奨設定。多くの用途に適したバランスの良い期間'
  },
  {
    label: '3ヶ月',
    days: 90,
    description: '長期保持。重要なタスクを扱う場合に適しています'
  },
  {
    label: '無制限',
    days: null,
    description: '自動削除されません。手動で管理する必要があります'
  },
] as const;

// メッセージ定数
export const MESSAGES = {
  VALIDATION: {
    REQUIRED_INTEGER: '整数で入力してください',
    MIN_DAYS: `${RETENTION_DAYS_LIMITS.MIN}日以上で設定してください`,
    MAX_DAYS: `${RETENTION_DAYS_LIMITS.MAX}日以下で設定してください`,
    INVALID_NUMBER: '数値を入力してください',
  },
  SAVE: {
    SUCCESS: '設定を保存しました',
    FAILED: '保存に失敗しました',
    IN_PROGRESS: '保存中...',
  },
  EMPTY_BIN: {
    CONFIRM_TITLE: 'ゴミ箱を空にする',
    CONFIRM_ACTION: '完全削除',
    CANCEL_ACTION: 'キャンセル',
    IN_PROGRESS: '削除中...',
  },
  RESTORE: {
    IN_PROGRESS: '復元中...',
    CONFIRM_ACTION: '復元を確認',
    CANCEL_ACTION: 'キャンセル',
  },
  RETENTION: {
    UNLIMITED: '無制限（自動削除されません）',
    EXPIRED: '削除予定時刻を過ぎています',
    UNKNOWN: '不明',
  },
} as const;

// UI テキスト定数
export const UI_TEXT = {
  PANEL: {
    TITLE: 'ゴミ箱設定',
    DESCRIPTION: '削除したタスクをゴミ箱に保持する期間を設定します。',
    DESCRIPTION_WITH_UNLIMITED: '削除したタスクをゴミ箱に保持する期間を設定します。\n期間を過ぎたタスクは自動的に完全削除されます。無制限を選択すると自動削除されません。',
    PRESET_TITLE: 'よく使われる設定',
    RETENTION_LABEL: '保持期間',
    RETENTION_UNIT: '日間',
    RETENTION_HELP: '1〜365日の範囲で設定、または「無制限」ボタンで無制限に設定できます（推奨: 30日）',
    SAVE_BUTTON: '設定を保存',
    IMPORTANT_NOTE_TEXT: '保持期間を短くすると、既にゴミ箱にあるタスクも新しい期間で再計算されます。必要なタスクは期間変更前に復元することをお勧めします。',
  },
  VIEW: {
    TITLE: 'ゴミ箱',
    EMPTY_TITLE: 'ゴミ箱は空です',
    EMPTY_DESCRIPTION: '削除されたタスクはありません。',
    TASK_COUNT: (count: number) => `${count}件のタスクがゴミ箱にあります`,
    WARNING_LIMITED: (days: number) => `これらのタスクは${days}日後に自動的に完全削除されます。`,
    WARNING_UNLIMITED: 'これらのタスクは無制限に保持されます。手動で削除するまで自動削除されません。不要なタスクは「ゴミ箱を空にする」で削除してください。',
    EMPTY_BIN_BUTTON: 'ゴミ箱を空にする',
    RESTORE_BUTTON: '復元',
    DELETION_SCHEDULE: '削除予定:',
    CONFIRM_EMPTY_MESSAGE: (count: number) => `ゴミ箱内の${count}件のタスクをすべて完全削除します。この操作は取り消すことができません。本当に実行しますか？`,
  },
} as const;

// プリセット検索ヘルパー
export const findPresetByDays = (days: number | null): RetentionPreset | undefined => RETENTION_PRESETS.find(preset => preset.days === days);

// プリセットの値のみを取得
export const getPresetValues = (): (number | null)[] => RETENTION_PRESETS.map(preset => preset.days);