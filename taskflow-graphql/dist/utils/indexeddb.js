/**
 * In-Memory Storage for TaskFlow GraphQL (Node.js)
 * Replaces IndexedDB for server-side operations
 */
// In-memory storage
const tasksStore = new Map();
const boardsStore = new Map();
const labelsStore = new Map();
const templatesStore = new Map();
const webhooksStore = new Map();
const webhookDeliveriesStore = new Map();
// Initialize with sample data
function initSampleData() {
    if (boardsStore.size === 0) {
        const board = {
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
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
// Task operations
export async function getTask(id) {
    return tasksStore.get(id) || null;
}
export async function getAllTasks() {
    return Array.from(tasksStore.values());
}
export async function getTasksByBoard(boardId) {
    return Array.from(tasksStore.values()).filter(t => t.boardId === boardId);
}
export async function createTask(task) {
    const newTask = {
        ...task,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    tasksStore.set(newTask.id, newTask);
    return newTask;
}
export async function createTasks(tasks) {
    return Promise.all(tasks.map(task => createTask(task)));
}
export async function updateTask(id, updates) {
    const task = tasksStore.get(id);
    if (!task)
        return null;
    const updated = {
        ...task,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
    };
    tasksStore.set(id, updated);
    return updated;
}
export async function deleteTask(id) {
    return tasksStore.delete(id);
}
// Board operations
export async function getBoard(id) {
    return boardsStore.get(id) || null;
}
export async function getAllBoards() {
    return Array.from(boardsStore.values());
}
export async function createBoard(board) {
    const newBoard = {
        ...board,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    boardsStore.set(newBoard.id, newBoard);
    return newBoard;
}
export async function updateBoard(id, updates) {
    const board = boardsStore.get(id);
    if (!board)
        return null;
    const updated = {
        ...board,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
    };
    boardsStore.set(id, updated);
    return updated;
}
export async function deleteBoard(id) {
    return boardsStore.delete(id);
}
// Label operations
export async function getLabel(id) {
    return labelsStore.get(id) || null;
}
export async function getAllLabels() {
    return Array.from(labelsStore.values());
}
export async function getLabelsByBoard(boardId) {
    return Array.from(labelsStore.values()).filter(l => l.boardId === boardId);
}
export async function createLabel(label) {
    const newLabel = {
        ...label,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    labelsStore.set(newLabel.id, newLabel);
    return newLabel;
}
export async function updateLabel(id, updates) {
    const label = labelsStore.get(id);
    if (!label)
        return null;
    const updated = {
        ...label,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
    };
    labelsStore.set(id, updated);
    return updated;
}
export async function deleteLabel(id) {
    return labelsStore.delete(id);
}
// Template operations
export async function getTemplate(id) {
    return templatesStore.get(id) || null;
}
export async function getAllTemplates() {
    return Array.from(templatesStore.values());
}
export async function createTemplate(template) {
    const newTemplate = {
        ...template,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    templatesStore.set(newTemplate.id, newTemplate);
    return newTemplate;
}
export async function updateTemplate(id, updates) {
    const template = templatesStore.get(id);
    if (!template)
        return null;
    const updated = {
        ...template,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
    };
    templatesStore.set(id, updated);
    return updated;
}
export async function deleteTemplate(id) {
    return templatesStore.delete(id);
}
// Webhook operations
export async function getWebhook(id) {
    return webhooksStore.get(id) || null;
}
export async function getAllWebhooks() {
    return Array.from(webhooksStore.values());
}
export async function createWebhook(webhook) {
    const newWebhook = {
        ...webhook,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    webhooksStore.set(newWebhook.id, newWebhook);
    return newWebhook;
}
export async function updateWebhook(id, updates) {
    const webhook = webhooksStore.get(id);
    if (!webhook)
        return null;
    const updated = {
        ...webhook,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
    };
    webhooksStore.set(id, updated);
    return updated;
}
export async function deleteWebhook(id) {
    return webhooksStore.delete(id);
}
// Webhook delivery operations
export async function getWebhookDelivery(id) {
    return webhookDeliveriesStore.get(id) || null;
}
export async function getAllWebhookDeliveries() {
    return Array.from(webhookDeliveriesStore.values());
}
export async function getWebhookDeliveriesByWebhookId(webhookId) {
    return Array.from(webhookDeliveriesStore.values()).filter(d => d.webhookId === webhookId);
}
export async function createWebhookDelivery(delivery) {
    const newDelivery = {
        ...delivery,
        id: generateId(),
    };
    webhookDeliveriesStore.set(newDelivery.id, newDelivery);
    return newDelivery;
}
//# sourceMappingURL=indexeddb.js.map