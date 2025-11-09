/**
 * Supabase Database Type Definitions
 *
 * This file provides comprehensive type definitions for the Supabase PostgreSQL schema
 * used for TaskFlow's multi-device sync, team collaboration, and subscription features.
 *
 * @see docs/ACCOUNT_MONETIZATION_PLAN.md - Database schema reference
 * @version 1.0.0
 * @requires TypeScript 5.7.3+
 */

import type { RecurrenceConfig, Priority, Label } from '../types';

// ============================================================================
// Core Database Types
// ============================================================================

/**
 * User authentication state from Supabase Auth
 */
export interface AuthUser {
  id: string; // UUID from auth.users
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
}

/**
 * Plan tiers
 */
export type PlanTier = 'free' | 'pro' | 'team';

/**
 * Subscription status from Stripe
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired';

/**
 * Team member roles
 */
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Supported languages
 */
export type SupportedLanguage = 'ja' | 'en';

// ============================================================================
// Table Row Types
// ============================================================================

/**
 * User profile data
 * Maps to `profiles` table in Supabase
 */
export interface Profile {
  id: string; // UUID references auth.users
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: PlanTier;
  language: SupportedLanguage;
  created_at: string;
  updated_at: string;
}

/**
 * Board data (Kanban board)
 * Maps to `boards` table in Supabase
 */
export interface SupabaseBoard {
  id: string; // UUID
  user_id: string; // UUID references auth.users
  name: string;
  description: string | null;
  columns: SupabaseBoardColumn[]; // JSONB array
  settings: SupabaseBoardSettings; // JSONB object
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Board column structure stored in JSONB
 */
export interface SupabaseBoardColumn {
  id: string;
  title: string;
  color?: string;
  position: number;
}

/**
 * Board settings stored in JSONB
 */
export interface SupabaseBoardSettings {
  default_column_id?: string;
  completed_column_id?: string;
  auto_archive_completed?: boolean;
  recycle_bin_retention_days?: number;
  [key: string]: unknown; // Allow extension
}

/**
 * Task data
 * Maps to `tasks` table in Supabase
 */
export interface SupabaseTask {
  id: string; // UUID
  board_id: string; // UUID references boards(id)
  user_id: string; // UUID references auth.users
  column_id: string; // Column ID from board.columns

  // Task basic information
  title: string;
  description: string | null;
  completed: boolean;

  // DateTime information
  due_date: string | null; // TIMESTAMP
  due_time: string | null; // "HH:mm" format
  recurrence: RecurrenceConfig | null; // JSONB

  // Priority and labels
  priority: Priority | null;
  labels: Label[]; // JSONB array

  // Subtasks and attachments
  subtasks: SupabaseSubTask[]; // JSONB array
  attachments: SupabaseAttachment[]; // JSONB array

  // Metadata
  position: number; // Sort order within column
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

/**
 * Subtask structure stored in JSONB
 */
export interface SupabaseSubTask {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  position: number;
}

/**
 * File attachment structure stored in JSONB
 */
export interface SupabaseAttachment {
  id: string;
  name: string;
  type: string; // MIME type
  size: number; // bytes
  storage_path: string; // Supabase Storage path
  uploaded_at: string;
}

/**
 * Team board membership
 * Maps to `team_boards` table in Supabase
 */
export interface TeamBoard {
  id: string; // UUID
  board_id: string; // UUID references boards(id)
  user_id: string; // UUID references auth.users
  role: TeamRole;
  invited_by: string | null; // UUID references auth.users
  created_at: string;
}

/**
 * Subscription data from Stripe
 * Maps to `subscriptions` table in Supabase
 */
export interface Subscription {
  id: string; // UUID
  user_id: string; // UUID references auth.users
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanTier;
  status: SubscriptionStatus | null;
  current_period_start: string | null; // TIMESTAMP
  current_period_end: string | null; // TIMESTAMP
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Task template
 * Maps to `templates` table in Supabase
 */
export interface SupabaseTemplate {
  id: string; // UUID
  user_id: string; // UUID references auth.users
  name: string;
  category: string | null;
  task_template: SupabaseTaskTemplateData; // JSONB
  is_favorite: boolean;
  is_public: boolean; // For future public template marketplace
  created_at: string;
  updated_at: string;
}

/**
 * Task template data stored in JSONB
 */
export interface SupabaseTaskTemplateData {
  title: string;
  description: string;
  priority?: Priority;
  labels: Label[];
  due_date: string | null; // Relative date (e.g., "+1d", "+1w", "+1m")
  recurrence?: RecurrenceConfig;
  subtasks?: SupabaseSubTask[];
}

// ============================================================================
// Database Schema Type
// ============================================================================

/**
 * Complete Supabase database schema
 * Provides full type safety for all database operations
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> &
          Partial<Pick<Profile, 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      boards: {
        Row: SupabaseBoard;
        Insert: Omit<SupabaseBoard, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<SupabaseBoard, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<SupabaseBoard, 'id' | 'user_id' | 'created_at'>>;
      };
      tasks: {
        Row: SupabaseTask;
        Insert: Omit<SupabaseTask, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<SupabaseTask, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<
          Omit<SupabaseTask, 'id' | 'board_id' | 'user_id' | 'created_at'>
        >;
      };
      team_boards: {
        Row: TeamBoard;
        Insert: Omit<TeamBoard, 'id' | 'created_at'> &
          Partial<Pick<TeamBoard, 'id' | 'created_at'>>;
        Update: Partial<Omit<TeamBoard, 'id' | 'created_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Subscription, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at'>>;
      };
      templates: {
        Row: SupabaseTemplate;
        Insert: Omit<SupabaseTemplate, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<SupabaseTemplate, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<
          Omit<SupabaseTemplate, 'id' | 'user_id' | 'created_at'>
        >;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      plan_tier: PlanTier;
      subscription_status: SubscriptionStatus;
      team_role: TeamRole;
      supported_language: SupportedLanguage;
    };
  };
}

// ============================================================================
// Helper Types for Type-Safe Queries
// ============================================================================

/**
 * Type-safe table names
 */
export type TableName = keyof Database['public']['Tables'];

/**
 * Extract Row type from table name
 */
export type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];

/**
 * Extract Insert type from table name
 */
export type Insert<T extends TableName> =
  Database['public']['Tables'][T]['Insert'];

/**
 * Extract Update type from table name
 */
export type Update<T extends TableName> =
  Database['public']['Tables'][T]['Update'];

// ============================================================================
// Extended Team Member Type (with profile data)
// ============================================================================

/**
 * Team member with profile information
 * Used for UI display in team management
 */
export interface TeamMember extends TeamBoard {
  profile: Pick<Profile, 'email' | 'full_name' | 'avatar_url'> | null;
}

// ============================================================================
// Subscription Feature Limits
// ============================================================================

/**
 * Feature limits for each plan tier
 */
export interface PlanFeatures {
  maxBoards: number;
  maxTasksPerBoard: number;
  maxFileSize: number; // bytes
  maxTotalStorage: number; // bytes
  teamCollaboration: boolean;
  maxTeamMembers?: number;
  aiFeatures: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  customBranding: boolean;
}

/**
 * Plan tier to feature mapping
 */
export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  free: {
    maxBoards: 3,
    maxTasksPerBoard: 50,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxTotalStorage: 100 * 1024 * 1024, // 100MB
    teamCollaboration: false,
    aiFeatures: false,
    prioritySupport: false,
    apiAccess: false,
    customBranding: false,
  },
  pro: {
    maxBoards: 999,
    maxTasksPerBoard: 999,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxTotalStorage: 10 * 1024 * 1024 * 1024, // 10GB
    teamCollaboration: false,
    aiFeatures: true,
    prioritySupport: true,
    apiAccess: false,
    customBranding: false,
  },
  team: {
    maxBoards: 999,
    maxTasksPerBoard: 999,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxTotalStorage: 50 * 1024 * 1024 * 1024, // 50GB
    teamCollaboration: true,
    maxTeamMembers: 10,
    aiFeatures: true,
    prioritySupport: true,
    apiAccess: true,
    customBranding: false,
  },
} as const;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a plan supports team collaboration
 */
export function supportsTeamCollaboration(plan: PlanTier): plan is 'team' {
  return plan === 'team';
}

/**
 * Type guard to check if a plan supports AI features
 */
export function supportsAIFeatures(plan: PlanTier): plan is 'pro' | 'team' {
  return plan === 'pro' || plan === 'team';
}

/**
 * Type guard to check if subscription is active
 */
export function isActiveSubscription(
  status: SubscriptionStatus | null
): status is 'active' | 'trialing' {
  return status === 'active' || status === 'trialing';
}

/**
 * Type guard to check if team role has admin privileges
 */
export function hasAdminPrivileges(role: TeamRole): role is 'owner' | 'admin' {
  return role === 'owner' || role === 'admin';
}

/**
 * Type guard to check if team role can edit tasks
 */
export function canEditTasks(
  role: TeamRole
): role is 'owner' | 'admin' | 'member' {
  return role === 'owner' || role === 'admin' || role === 'member';
}

// ============================================================================
// Utility Types for Advanced TypeScript Features
// ============================================================================

/**
 * Create a branded type for UUID strings (nominal typing)
 */
export type UUID<Brand extends string = string> = string & {
  readonly __brand: Brand;
};

/**
 * Branded UUID types for type-safe ID handling
 */
export type UserId = UUID<'UserId'>;
export type BoardId = UUID<'BoardId'>;
export type TaskId = UUID<'TaskId'>;
export type TemplateId = UUID<'TemplateId'>;
export type SubscriptionId = UUID<'SubscriptionId'>;

/**
 * Helper to create branded UUID
 */
export function createBrandedUUID<Brand extends string>(
  uuid: string
): UUID<Brand> {
  return uuid as UUID<Brand>;
}

/**
 * Deep partial type for nested updates
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * Mutable version of a type (remove readonly modifiers)
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Extract non-nullable properties
 */
export type NonNullableProperties<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

// ============================================================================
// Realtime Subscription Types
// ============================================================================

/**
 * Realtime change event types
 */
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Realtime payload for table changes
 */
export interface RealtimePayload<T extends TableName> {
  eventType: RealtimeEventType;
  new: Row<T> | null;
  old: Row<T> | null;
  table: T;
  schema: 'public';
  commit_timestamp: string;
}

/**
 * Realtime subscription callback
 */
export type RealtimeCallback<T extends TableName> = (
  payload: RealtimePayload<T>
) => void | Promise<void>;

// ============================================================================
// Error Types
// ============================================================================

/**
 * Supabase error response
 */
export interface SupabaseError {
  message: string;
  details: string | null;
  hint: string | null;
  code: string | null;
}

/**
 * Result type for Supabase operations
 */
export type SupabaseResult<T> =
  | { data: T; error: null }
  | { data: null; error: SupabaseError };
