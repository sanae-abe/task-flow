/**
 * TypeScript 5.7.3の高度な機能を活用した型定義の拡張
 */

// Branded Types for Domain Safety
// Import/Export type namespace
import type { Task, Label, Column, KanbanBoard } from '../types';

export type TaskId = string & { readonly __brand: 'TaskId' };
export type ColumnId = string & { readonly __brand: 'ColumnId' };
export type LabelId = string & { readonly __brand: 'LabelId' };
export type BoardId = string & { readonly __brand: 'BoardId' };

// Type Predicates for Runtime Type Safety
export const isTaskId = (value: string): value is TaskId => typeof value === 'string' && value.length > 0;

export const isValidTask = (obj: unknown): obj is Task => (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'createdAt' in obj &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).title === 'string'
  );

// Conditional Types for Enhanced Type Safety
export type TaskWithStatus<T extends Task> = T extends { completedAt: string }
  ? T & { status: 'completed' }
  : T & { status: 'active' };

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Template Literal Types for Enhanced String Safety
export type DateTimeFormat = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;
export type ColorHex = `#${string}`;
export type FileType = `${string}/${string}`;

// Utility Types for Better Type Inference
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Result Type for Error Handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Event Handler Types with Better Type Safety
export type TaskEventHandler<T = void> = (taskId: TaskId) => T;
export type TaskUpdateHandler<T extends Partial<Task> = Partial<Task>> = (
  taskId: TaskId,
  updates: T
) => void;

// Enhanced Form Types with Runtime Validation
export interface ValidatedFormField<T = unknown> {
  value: T;
  error: string | null;
  touched: boolean;
  validator: (value: T) => string | null;
}

export type FormValidationState<T extends Record<string, unknown>> = {
  [K in keyof T]: ValidatedFormField<T[K]>;
};

// Type-safe Event System
export interface TypedEventMap {
  'task:created': { task: Task };
  'task:updated': { taskId: TaskId; updates: Partial<Task> };
  'task:deleted': { taskId: TaskId };
  'board:switched': { boardId: BoardId };
}

export type TypedEventListener<K extends keyof TypedEventMap> = (
  event: TypedEventMap[K]
) => void;

// Enhanced Context Types with State Management
export interface TypedReducerAction<T extends string, P = undefined> {
  type: T;
  payload: P;
  meta?: {
    timestamp: number;
    source: string;
  };
}

// Type-safe Storage Interface
export interface TypedStorage {
  getItem<T>(key: string, validator: (value: unknown) => value is T): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
}

// Performance Optimization Types
export type LazyComponent<T> = React.LazyExoticComponent<React.ComponentType<T>>;
export type MemoizedComponent<T> = React.MemoExoticComponent<React.ComponentType<T>>;

// Component Props with Enhanced Type Safety
export type StrictComponentProps<T> = T & {
  'data-testid'?: string;
  'aria-label'?: string;
};

export type ComponentWithRef<T, R = HTMLElement> = T & {
  ref?: React.Ref<R>;
};

export {
  Task,
  Label, 
  Column,
  KanbanBoard
};