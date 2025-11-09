/**
 * In-Memory Storage for TaskFlow GraphQL (Node.js)
 * Replaces IndexedDB for server-side operations
 */

// Re-export types from database module to ensure consistency
export type {
  TaskRecord,
  SubTaskRecord,
  AttachmentRecord,
  RecurrenceConfigRecord,
  BoardRecord,
  BoardColumnRecord,
  BoardSettingsRecord,
  LabelRecord,
  TemplateRecord,
  TaskTemplateDataRecord,
  WebhookRecord,
  WebhookEvent,
  WebhookDeliveryRecord,
} from '../types/database.js';

import type {
  TaskRecord,
  BoardRecord,
  LabelRecord,
  TemplateRecord,
  WebhookRecord,
  WebhookDeliveryRecord,
} from '../types/database.js';

// In-memory storage
const tasksStore = new Map<string, TaskRecord>();
const boardsStore = new Map<string, BoardRecord>();
const labelsStore = new Map<string, LabelRecord>();
const templatesStore = new Map<string, TemplateRecord>();
const webhooksStore = new Map<string, WebhookRecord>();
const webhookDeliveriesStore = new Map<string, WebhookDeliveryRecord>();

// Initialize with sample data
function initSampleData() {
  if (boardsStore.size === 0) {
    const board: BoardRecord = {
      id: 'board-1',
      name: 'Default Board',
      description: 'Sample board for testing',
      columns: [
        { id: 'col-1', name: 'To Do', position: 0, taskIds: [] },
        { id: 'col-2', name: 'In Progress', position: 1, taskIds: [] },
        { id: 'col-3', name: 'Done', position: 2, taskIds: [] },
      ],
      settings: { defaultColumn: 'col-1' },
      isShared: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    boardsStore.set(board.id, board);
  }
}

initSampleData();

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Task operations
export async function getTask(id: string): Promise<TaskRecord | null> {
  return tasksStore.get(id) || null;
}

export async function getAllTasks(): Promise<TaskRecord[]> {
  return Array.from(tasksStore.values());
}

export async function getTasksByBoard(boardId: string): Promise<TaskRecord[]> {
  return Array.from(tasksStore.values()).filter(t => t.boardId === boardId);
}

export async function createTask(
  task: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TaskRecord> {
  const newTask: TaskRecord = {
    ...task,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasksStore.set(newTask.id, newTask);
  return newTask;
}

export async function createTasks(
  tasks: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<TaskRecord[]> {
  return Promise.all(tasks.map(task => createTask(task)));
}

export async function updateTask(
  id: string,
  updates: Partial<TaskRecord>
): Promise<TaskRecord | null> {
  const task = tasksStore.get(id);
  if (!task) return null;

  const updated: TaskRecord = {
    ...task,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  tasksStore.set(id, updated);
  return updated;
}

export async function deleteTask(id: string): Promise<boolean> {
  return tasksStore.delete(id);
}

// Board operations
export async function getBoard(id: string): Promise<BoardRecord | null> {
  return boardsStore.get(id) || null;
}

export async function getAllBoards(): Promise<BoardRecord[]> {
  return Array.from(boardsStore.values());
}

export async function createBoard(
  board: Omit<BoardRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<BoardRecord> {
  const newBoard: BoardRecord = {
    ...board,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  boardsStore.set(newBoard.id, newBoard);
  return newBoard;
}

export async function updateBoard(
  id: string,
  updates: Partial<BoardRecord>
): Promise<BoardRecord | null> {
  const board = boardsStore.get(id);
  if (!board) return null;

  const updated: BoardRecord = {
    ...board,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  boardsStore.set(id, updated);
  return updated;
}

export async function deleteBoard(id: string): Promise<boolean> {
  return boardsStore.delete(id);
}

// Label operations
export async function getLabel(id: string): Promise<LabelRecord | null> {
  return labelsStore.get(id) || null;
}

export async function getAllLabels(): Promise<LabelRecord[]> {
  return Array.from(labelsStore.values());
}

export async function getLabelsByBoard(
  boardId: string
): Promise<LabelRecord[]> {
  return Array.from(labelsStore.values()).filter(l => l.boardId === boardId);
}

export async function createLabel(
  label: Omit<LabelRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<LabelRecord> {
  const newLabel: LabelRecord = {
    ...label,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  labelsStore.set(newLabel.id, newLabel);
  return newLabel;
}

export async function updateLabel(
  id: string,
  updates: Partial<LabelRecord>
): Promise<LabelRecord | null> {
  const label = labelsStore.get(id);
  if (!label) return null;

  const updated: LabelRecord = {
    ...label,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  labelsStore.set(id, updated);
  return updated;
}

export async function deleteLabel(id: string): Promise<boolean> {
  return labelsStore.delete(id);
}

// Template operations
export async function getTemplate(id: string): Promise<TemplateRecord | null> {
  return templatesStore.get(id) || null;
}

export async function getAllTemplates(): Promise<TemplateRecord[]> {
  return Array.from(templatesStore.values());
}

export async function createTemplate(
  template: Omit<TemplateRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TemplateRecord> {
  const newTemplate: TemplateRecord = {
    ...template,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  templatesStore.set(newTemplate.id, newTemplate);
  return newTemplate;
}

export async function updateTemplate(
  id: string,
  updates: Partial<TemplateRecord>
): Promise<TemplateRecord | null> {
  const template = templatesStore.get(id);
  if (!template) return null;

  const updated: TemplateRecord = {
    ...template,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  templatesStore.set(id, updated);
  return updated;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  return templatesStore.delete(id);
}

// Webhook operations
export async function getWebhook(id: string): Promise<WebhookRecord | null> {
  return webhooksStore.get(id) || null;
}

export async function getAllWebhooks(): Promise<WebhookRecord[]> {
  return Array.from(webhooksStore.values());
}

export async function createWebhook(
  webhook: Omit<WebhookRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WebhookRecord> {
  const newWebhook: WebhookRecord = {
    ...webhook,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  webhooksStore.set(newWebhook.id, newWebhook);
  return newWebhook;
}

export async function updateWebhook(
  id: string,
  updates: Partial<WebhookRecord>
): Promise<WebhookRecord | null> {
  const webhook = webhooksStore.get(id);
  if (!webhook) return null;

  const updated: WebhookRecord = {
    ...webhook,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  webhooksStore.set(id, updated);
  return updated;
}

export async function deleteWebhook(id: string): Promise<boolean> {
  return webhooksStore.delete(id);
}

// Webhook delivery operations
export async function getWebhookDelivery(
  id: string
): Promise<WebhookDeliveryRecord | null> {
  return webhookDeliveriesStore.get(id) || null;
}

export async function getAllWebhookDeliveries(): Promise<
  WebhookDeliveryRecord[]
> {
  return Array.from(webhookDeliveriesStore.values());
}

export async function getWebhookDeliveriesByWebhookId(
  webhookId: string
): Promise<WebhookDeliveryRecord[]> {
  return Array.from(webhookDeliveriesStore.values()).filter(
    d => d.webhookId === webhookId
  );
}

export async function createWebhookDelivery(
  delivery: Omit<WebhookDeliveryRecord, 'id'>
): Promise<WebhookDeliveryRecord> {
  const newDelivery: WebhookDeliveryRecord = {
    ...delivery,
    id: generateId(),
  };
  webhookDeliveriesStore.set(newDelivery.id, newDelivery);
  return newDelivery;
}
