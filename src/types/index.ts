// Main types from types.ts
export * from '../types';

// Component specific types
export * from './date';
export * from './shared';
export * from './table';
export * from './task';
export * from './template';
export * from './unified-dialog';
export * from './unified-form';
export * from './unified-menu';

// Enhanced TypeScript 5.7.3 types
export * from './enhanced-types';

// Supabase database types (exclude DeepPartial to avoid conflict with enhanced-types)
export type {
  AuthUser,
  PlanTier,
  SubscriptionStatus,
  TeamRole,
  SupportedLanguage,
  Profile,
  SupabaseBoard,
  SupabaseBoardColumn,
  SupabaseBoardSettings,
  SupabaseTask,
  SupabaseSubTask,
  SupabaseAttachment,
  TeamBoard,
  Subscription,
  SupabaseTemplate,
  SupabaseTaskTemplateData,
  Database,
  TableName,
  Row,
  Insert,
  Update,
  TeamMember,
  PlanFeatures,
  UUID,
  UserId,
  Mutable,
  NonNullableProperties,
  RealtimeEventType,
  RealtimePayload,
  RealtimeCallback,
  SupabaseError,
  SupabaseResult,
} from './supabase';
export {
  PLAN_FEATURES,
  supportsTeamCollaboration,
  supportsAIFeatures,
  isActiveSubscription,
  hasAdminPrivileges,
  canEditTasks,
  createBrandedUUID,
} from './supabase';

// Dialog types - avoiding conflicts
// (Note: CommonDialogProps removed as CommonDialog is no longer used)

// Runtime type safety utilities (avoiding conflicts)
export type {
  TaskId,
  LabelId,
  BoardId,
  ColumnId,
  Result,
  TypedStorage,
  StorageError,
} from '../utils/type-guards';
export type { StorageSchema } from '../utils/typed-storage';
