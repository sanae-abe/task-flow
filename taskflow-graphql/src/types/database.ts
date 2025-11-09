/**
 * Database Record Types
 * These types represent data as stored in IndexedDB (without computed fields)
 * IMPORTANT: Dates are stored as ISO strings in IndexedDB, not Date objects
 */

// ============================================================================
// Database Record Types (without computed fields)
// ============================================================================

export interface TaskRecord {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'DELETED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string; // ISO string
  dueTime?: string;
  labels: string[]; // Store label IDs
  subtasks: SubTaskRecord[];
  files: AttachmentRecord[];
  recurrence?: RecurrenceConfigRecord;
  position: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  completedAt?: string; // ISO string
  deletedAt?: string; // ISO string
}

export interface SubTaskRecord {
  id: string;
  title: string;
  completed: boolean;
  position: number;
  createdAt: string; // ISO string
}

export interface LabelRecord {
  id: string;
  name: string;
  color: string;
  boardId?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface AttachmentRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
  storagePath?: string;
  uploadedAt: string; // ISO string
}

export interface BoardRecord {
  id: string;
  name: string;
  description?: string;
  columns: BoardColumnRecord[];
  settings: BoardSettingsRecord;
  isShared: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface BoardColumnRecord {
  id: string;
  name: string;
  position: number;
  taskIds: string[];
}

export interface BoardSettingsRecord {
  defaultColumn?: string;
  completedColumnId?: string;
  autoArchiveCompleted?: boolean;
  recycleBinRetentionDays?: number;
}

export interface RecurrenceConfigRecord {
  enabled: boolean;
  pattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  weekOfMonth?: number;
  dayOfWeekInMonth?: number;
  endDate?: string; // ISO string
  maxOccurrences?: number;
}

export interface TemplateRecord {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isFavorite: boolean;
  taskTemplate: TaskTemplateDataRecord;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface TaskTemplateDataRecord {
  title: string;
  description?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
  labels: string[]; // Store label IDs
  subtasks?: SubTaskRecord[];
  recurrence?: RecurrenceConfigRecord;
}

export interface WebhookRecord {
  id: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  secret?: string;
  allowedIPs?: string[];
  rateLimit?: number; // requests per minute
  description?: string; // optional description
  deliveryCount?: number; // total delivery count
  failureCount?: number; // failed delivery count
  lastDelivery?: string; // ISO string - last delivery timestamp
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type WebhookEvent =
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'TASK_DELETED'
  | 'BOARD_CREATED'
  | 'BOARD_UPDATED'
  | 'BOARD_DELETED';

export interface WebhookDeliveryRecord {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  response?: Record<string, unknown>;
  status?: number;
  statusCode?: number;
  success: boolean;
  deliveredAt: string; // ISO string
  timestamp?: string; // ISO string (alternative to deliveredAt)
  responseTime?: number; // milliseconds
  error?: string; // error message if failed
}
