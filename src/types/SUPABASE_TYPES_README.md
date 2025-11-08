# Supabase Type Definitions - Usage Guide

**File**: `src/types/supabase.ts` (521 lines)
**TypeScript Version**: 5.7.3+
**Created**: 2025-11-08

## Overview

This file provides comprehensive, type-safe definitions for the TaskFlow Supabase database schema. It includes:

- 6 database table types with full CRUD operations
- Authentication user types
- Plan tier and subscription management
- Team collaboration types
- Advanced TypeScript 5.7.3 features (branded types, type guards, etc.)

## Database Schema Reference

See **docs/ACCOUNT_MONETIZATION_PLAN.md** for the complete PostgreSQL schema.

## Table of Contents

1. [Core Database Types](#core-database-types)
2. [Table Row Types](#table-row-types)
3. [Database Schema Type](#database-schema-type)
4. [Helper Types](#helper-types)
5. [Type Guards](#type-guards)
6. [Usage Examples](#usage-examples)

---

## Core Database Types

### AuthUser

User authentication state from Supabase Auth.

```typescript
interface AuthUser {
  id: string; // UUID from auth.users
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
}
```

### PlanTier

```typescript
type PlanTier = 'free' | 'pro' | 'team';
```

### SubscriptionStatus

```typescript
type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired';
```

### TeamRole

```typescript
type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';
```

---

## Table Row Types

### 1. Profile

User profile data (`profiles` table).

```typescript
interface Profile {
  id: string; // UUID references auth.users
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: PlanTier;
  language: SupportedLanguage; // 'ja' | 'en'
  created_at: string;
  updated_at: string;
}
```

### 2. SupabaseBoard

Board data (`boards` table).

```typescript
interface SupabaseBoard {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  columns: SupabaseBoardColumn[]; // JSONB
  settings: SupabaseBoardSettings; // JSONB
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}
```

### 3. SupabaseTask

Task data (`tasks` table).

```typescript
interface SupabaseTask {
  id: string;
  board_id: string;
  user_id: string;
  column_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  due_time: string | null; // "HH:mm"
  recurrence: RecurrenceConfig | null; // JSONB
  priority: Priority | null;
  labels: Label[]; // JSONB
  subtasks: SupabaseSubTask[]; // JSONB
  attachments: SupabaseAttachment[]; // JSONB
  position: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}
```

### 4. TeamBoard

Team board membership (`team_boards` table).

```typescript
interface TeamBoard {
  id: string;
  board_id: string;
  user_id: string;
  role: TeamRole;
  invited_by: string | null;
  created_at: string;
}
```

### 5. Subscription

Subscription data from Stripe (`subscriptions` table).

```typescript
interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanTier;
  status: SubscriptionStatus | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}
```

### 6. SupabaseTemplate

Task template (`templates` table).

```typescript
interface SupabaseTemplate {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  task_template: SupabaseTaskTemplateData; // JSONB
  is_favorite: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## Database Schema Type

The `Database` interface provides full type safety for all Supabase operations.

```typescript
interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & ...;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      boards: { Row: SupabaseBoard; Insert: ...; Update: ...; };
      tasks: { Row: SupabaseTask; Insert: ...; Update: ...; };
      team_boards: { Row: TeamBoard; Insert: ...; Update: ...; };
      subscriptions: { Row: Subscription; Insert: ...; Update: ...; };
      templates: { Row: SupabaseTemplate; Insert: ...; Update: ...; };
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
```

---

## Helper Types

### Type-Safe Table Operations

```typescript
// Extract table names
type TableName = keyof Database['public']['Tables'];

// Extract Row type from table name
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];

// Extract Insert type from table name
type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];

// Extract Update type from table name
type Update<T extends TableName> = Database['public']['Tables'][T]['Update'];
```

### Branded UUIDs (Nominal Typing)

```typescript
// Branded UUID types for type-safe ID handling
type UserId = UUID<'UserId'>;
type BoardId = UUID<'BoardId'>;
type TaskId = UUID<'TaskId'>;
type TemplateId = UUID<'TemplateId'>;
type SubscriptionId = UUID<'SubscriptionId'>;

// Create branded UUID
function createBrandedUUID<Brand extends string>(uuid: string): UUID<Brand>;
```

### Utility Types

```typescript
// Deep partial for nested updates
type DeepPartial<T> = ...;

// Remove readonly modifiers
type Mutable<T> = ...;

// Extract non-nullable properties
type NonNullableProperties<T> = ...;
```

---

## Type Guards

### Plan Feature Checks

```typescript
// Check if plan supports team collaboration
function supportsTeamCollaboration(plan: PlanTier): plan is 'team';

// Check if plan supports AI features
function supportsAIFeatures(plan: PlanTier): plan is 'pro' | 'team';
```

### Subscription Checks

```typescript
// Check if subscription is active
function isActiveSubscription(
  status: SubscriptionStatus | null
): status is 'active' | 'trialing';
```

### Team Role Checks

```typescript
// Check if role has admin privileges
function hasAdminPrivileges(role: TeamRole): role is 'owner' | 'admin';

// Check if role can edit tasks
function canEditTasks(role: TeamRole): role is 'owner' | 'admin' | 'member';
```

---

## Usage Examples

### 1. Initialize Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

### 2. Type-Safe Query (Select)

```typescript
// Fetch user profile with full type safety
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// data is typed as Profile | null
// error is typed as SupabaseError | null
```

### 3. Type-Safe Insert

```typescript
import type { Insert } from './types/supabase';

// Create new board
const newBoard: Insert<'boards'> = {
  user_id: userId,
  name: 'My Board',
  description: 'Board description',
  columns: [],
  settings: {},
  is_shared: false,
};

const { data, error } = await supabase
  .from('boards')
  .insert(newBoard)
  .select()
  .single();

// data is typed as SupabaseBoard | null
```

### 4. Type-Safe Update

```typescript
import type { Update } from './types/supabase';

// Update task
const updateData: Update<'tasks'> = {
  title: 'Updated title',
  completed: true,
  completed_at: new Date().toISOString(),
};

const { data, error } = await supabase
  .from('tasks')
  .update(updateData)
  .eq('id', taskId)
  .select()
  .single();
```

### 5. Plan Feature Check

```typescript
import { PLAN_FEATURES, supportsAIFeatures } from './types/supabase';

// Check feature availability
const userPlan: PlanTier = 'pro';
const features = PLAN_FEATURES[userPlan];

console.log(`Max boards: ${features.maxBoards}`);
console.log(`AI features: ${features.aiFeatures}`);

// Type guard usage
if (supportsAIFeatures(userPlan)) {
  // userPlan is narrowed to 'pro' | 'team'
  enableAIFeatures();
}
```

### 6. Team Member Permission Check

```typescript
import { hasAdminPrivileges, canEditTasks } from './types/supabase';

function canManageBoard(role: TeamRole): boolean {
  return hasAdminPrivileges(role);
}

function canEditTask(role: TeamRole): boolean {
  return canEditTasks(role);
}

// Usage
const userRole: TeamRole = 'member';
if (canEditTask(userRole)) {
  // Allow task editing
}
```

### 7. Realtime Subscription

```typescript
import type { RealtimePayload } from './types/supabase';

// Subscribe to task changes
const channel = supabase
  .channel('task-changes')
  .on<SupabaseTask>(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `board_id=eq.${boardId}`,
    },
    (payload: RealtimePayload<'tasks'>) => {
      console.log('Task changed:', payload.new);
    }
  )
  .subscribe();
```

### 8. Branded UUID Usage

```typescript
import { createBrandedUUID, type UserId, type BoardId } from './types/supabase';

// Create branded UUIDs
const userId: UserId = createBrandedUUID<'UserId'>('uuid-string');
const boardId: BoardId = createBrandedUUID<'BoardId'>('uuid-string');

// Type safety - prevents mixing different ID types
function getBoard(boardId: BoardId) { /* ... */ }

getBoard(userId); // ❌ Type error!
getBoard(boardId); // ✅ Correct
```

---

## Plan Features Reference

### Free Plan

```typescript
{
  maxBoards: 3,
  maxTasksPerBoard: 50,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxTotalStorage: 100 * 1024 * 1024, // 100MB
  teamCollaboration: false,
  aiFeatures: false,
  prioritySupport: false,
  apiAccess: false,
  customBranding: false,
}
```

### Pro Plan

```typescript
{
  maxBoards: 999,
  maxTasksPerBoard: 999,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxTotalStorage: 10 * 1024 * 1024 * 1024, // 10GB
  teamCollaboration: false,
  aiFeatures: true, // ✅
  prioritySupport: true, // ✅
  apiAccess: false,
  customBranding: false,
}
```

### Team Plan

```typescript
{
  maxBoards: 999,
  maxTasksPerBoard: 999,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxTotalStorage: 50 * 1024 * 1024 * 1024, // 50GB
  teamCollaboration: true, // ✅
  maxTeamMembers: 10,
  aiFeatures: true, // ✅
  prioritySupport: true, // ✅
  apiAccess: true, // ✅
  customBranding: false,
}
```

---

## Best Practices

### 1. Always Use Generic Database Type

```typescript
// ✅ Correct - full type safety
const supabase = createClient<Database>(...);

// ❌ Incorrect - no type safety
const supabase = createClient(...);
```

### 2. Leverage Helper Types

```typescript
// ✅ Correct - reusable types
function insertTask(task: Insert<'tasks'>) { /* ... */ }

// ❌ Incorrect - hardcoded types
function insertTask(task: Omit<SupabaseTask, 'id' | 'created_at' | ...>) { /* ... */ }
```

### 3. Use Type Guards

```typescript
// ✅ Correct - type narrowing
if (supportsAIFeatures(plan)) {
  // TypeScript knows plan is 'pro' | 'team'
  enableAI();
}

// ❌ Incorrect - manual checks
if (plan === 'pro' || plan === 'team') {
  enableAI();
}
```

### 4. Branded Types for IDs

```typescript
// ✅ Correct - prevents ID mixing
function getTask(taskId: TaskId) { /* ... */ }

// ❌ Incorrect - allows any string
function getTask(taskId: string) { /* ... */ }
```

---

## Integration with Existing Types

The Supabase types are designed to integrate seamlessly with existing TaskFlow types:

- `RecurrenceConfig` - from `src/types.ts`
- `Priority` - from `src/types.ts`
- `Label` - from `src/types.ts`

Conversion utilities will be needed to map between:

- `KanbanBoard` ↔ `SupabaseBoard`
- `Task` ↔ `SupabaseTask`
- `TaskTemplate` ↔ `SupabaseTemplate`

---

## Related Documentation

- **Database Schema**: `docs/ACCOUNT_MONETIZATION_PLAN.md` (Section: Database Design)
- **Implementation Roadmap**: `docs/ACCOUNT_MONETIZATION_PLAN.md` (Section: Implementation Roadmap)
- **Supabase Official Docs**: https://supabase.com/docs/guides/api

---

## TypeScript Configuration

Ensure `tsconfig.json` has strict mode enabled for full type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

**Last Updated**: 2025-11-08
**TypeScript Version**: 5.7.3
**Maintainer**: TaskFlow Development Team
