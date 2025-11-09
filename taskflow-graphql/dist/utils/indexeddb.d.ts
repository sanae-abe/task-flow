/**
 * In-Memory Storage for TaskFlow GraphQL (Node.js)
 * Replaces IndexedDB for server-side operations
 */
export type { TaskRecord, SubTaskRecord, AttachmentRecord, RecurrenceConfigRecord, BoardRecord, BoardColumnRecord, BoardSettingsRecord, LabelRecord, TemplateRecord, TaskTemplateDataRecord, WebhookRecord, WebhookEvent, WebhookDeliveryRecord, } from '../types/database.js';
import type { TaskRecord, BoardRecord, LabelRecord, TemplateRecord, WebhookRecord, WebhookDeliveryRecord } from '../types/database.js';
export declare function getTask(id: string): Promise<TaskRecord | null>;
export declare function getAllTasks(): Promise<TaskRecord[]>;
export declare function getTasksByBoard(boardId: string): Promise<TaskRecord[]>;
export declare function createTask(task: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskRecord>;
export declare function createTasks(tasks: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<TaskRecord[]>;
export declare function updateTask(id: string, updates: Partial<TaskRecord>): Promise<TaskRecord | null>;
export declare function deleteTask(id: string): Promise<boolean>;
export declare function getBoard(id: string): Promise<BoardRecord | null>;
export declare function getAllBoards(): Promise<BoardRecord[]>;
export declare function createBoard(board: Omit<BoardRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<BoardRecord>;
export declare function updateBoard(id: string, updates: Partial<BoardRecord>): Promise<BoardRecord | null>;
export declare function deleteBoard(id: string): Promise<boolean>;
export declare function getLabel(id: string): Promise<LabelRecord | null>;
export declare function getAllLabels(): Promise<LabelRecord[]>;
export declare function getLabelsByBoard(boardId: string): Promise<LabelRecord[]>;
export declare function createLabel(label: Omit<LabelRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabelRecord>;
export declare function updateLabel(id: string, updates: Partial<LabelRecord>): Promise<LabelRecord | null>;
export declare function deleteLabel(id: string): Promise<boolean>;
export declare function getTemplate(id: string): Promise<TemplateRecord | null>;
export declare function getAllTemplates(): Promise<TemplateRecord[]>;
export declare function createTemplate(template: Omit<TemplateRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TemplateRecord>;
export declare function updateTemplate(id: string, updates: Partial<TemplateRecord>): Promise<TemplateRecord | null>;
export declare function deleteTemplate(id: string): Promise<boolean>;
export declare function getWebhook(id: string): Promise<WebhookRecord | null>;
export declare function getAllWebhooks(): Promise<WebhookRecord[]>;
export declare function createWebhook(webhook: Omit<WebhookRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebhookRecord>;
export declare function updateWebhook(id: string, updates: Partial<WebhookRecord>): Promise<WebhookRecord | null>;
export declare function deleteWebhook(id: string): Promise<boolean>;
export declare function getWebhookDelivery(id: string): Promise<WebhookDeliveryRecord | null>;
export declare function getAllWebhookDeliveries(): Promise<WebhookDeliveryRecord[]>;
export declare function getWebhookDeliveriesByWebhookId(webhookId: string): Promise<WebhookDeliveryRecord[]>;
export declare function createWebhookDelivery(delivery: Omit<WebhookDeliveryRecord, 'id'>): Promise<WebhookDeliveryRecord>;
//# sourceMappingURL=indexeddb.d.ts.map