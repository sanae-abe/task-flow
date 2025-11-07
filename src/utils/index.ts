/**
 * ユーティリティ関数とヘルパー
 *
 * プロジェクト全体で使用される共通ユーティリティをエクスポート
 */

// Zod統合型ガード（優先）
export * from './zod-type-guards';

// 型推論ヘルパー
export * from './type-inference-helpers';

// 既存の型ガード（assertTypeを除外して再エクスポート）
export {
  isString,
  isNumber,
  isArray,
  isObject,
  isValidTaskId,
  isValidLabelId,
  isValidBoardId,
  isValidColumnId,
  isValidDateString,
  isValidPriority,
  isValidLabel,
  isValidFileAttachment,
  isValidSubTask,
  isValidRecurrenceConfig,
  isValidTask,
  isValidKanbanBoard,
} from './type-guards';

export type {
  TaskId,
  LabelId,
  BoardId,
  ColumnId,
  Result,
  TypedStorage,
  StorageError,
} from './type-guards';

// その他のユーティリティ
export * from './taskFormFields';
export * from './labelHelpers';
export * from './typed-storage';
