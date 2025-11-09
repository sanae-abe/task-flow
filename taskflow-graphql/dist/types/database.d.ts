/**
 * Database Record Types
 * These types represent data as stored in IndexedDB (without computed fields)
 * IMPORTANT: Dates are stored as ISO strings in IndexedDB, not Date objects
 */
export interface TaskRecord {
    id: string;
    boardId: string;
    columnId: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'DELETED';
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    dueDate?: string;
    dueTime?: string;
    labels: string[];
    subtasks: SubTaskRecord[];
    files: AttachmentRecord[];
    recurrence?: RecurrenceConfigRecord;
    position: number;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    deletedAt?: string;
}
export interface SubTaskRecord {
    id: string;
    title: string;
    completed: boolean;
    position: number;
    createdAt: string;
}
export interface LabelRecord {
    id: string;
    name: string;
    color: string;
    boardId?: string;
    createdAt: string;
    updatedAt: string;
}
export interface AttachmentRecord {
    id: string;
    name: string;
    type: string;
    size: number;
    data: string;
    storagePath?: string;
    uploadedAt: string;
}
export interface BoardRecord {
    id: string;
    name: string;
    description?: string;
    columns: BoardColumnRecord[];
    settings: BoardSettingsRecord;
    isShared: boolean;
    createdAt: string;
    updatedAt: string;
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
    endDate?: string;
    maxOccurrences?: number;
}
export interface TemplateRecord {
    id: string;
    name: string;
    description?: string;
    category?: string;
    isFavorite: boolean;
    taskTemplate: TaskTemplateDataRecord;
    createdAt: string;
    updatedAt: string;
}
export interface TaskTemplateDataRecord {
    title: string;
    description?: string;
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    dueDate?: string;
    labels: string[];
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
    rateLimit?: number;
    description?: string;
    deliveryCount?: number;
    failureCount?: number;
    lastDelivery?: string;
    createdAt: string;
    updatedAt: string;
}
export type WebhookEvent = 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_DELETED' | 'BOARD_CREATED' | 'BOARD_UPDATED' | 'BOARD_DELETED';
export interface WebhookDeliveryRecord {
    id: string;
    webhookId: string;
    event: WebhookEvent;
    payload: Record<string, unknown>;
    response?: Record<string, unknown>;
    status?: number;
    statusCode?: number;
    success: boolean;
    deliveredAt: string;
    timestamp?: string;
    responseTime?: number;
    error?: string;
}
//# sourceMappingURL=database.d.ts.map