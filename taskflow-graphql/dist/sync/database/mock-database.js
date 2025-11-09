/**
 * Mock Database Implementation
 * テスト用のインメモリデータベース実装
 *
 * FileSystem interfaceのMockFileSystemと同等の役割:
 * - テスタビリティ向上のためのテストダブル
 * - 実際のIndexedDB/Supabase接続不要
 * - 高速なユニットテスト実行
 */
/**
 * Mock Database Implementation
 *
 * **使用例**:
 * ```typescript
 * const mockDb = new MockDatabase();
 * await mockDb.initialize();
 *
 * const task = await mockDb.createTask({
 *   id: '123',
 *   title: 'Test Task',
 *   // ... other fields
 * });
 * ```
 */
export class MockDatabase {
    store;
    connected;
    transactionDepth;
    constructor() {
        this.store = {
            tasks: new Map(),
            boards: new Map(),
            labels: new Map(),
            templates: new Map(),
        };
        this.connected = false;
        this.transactionDepth = 0;
    }
    // --------------------------------------------------------------------------
    // Connection & Lifecycle Management
    // --------------------------------------------------------------------------
    async connect() {
        this.connected = true;
    }
    async disconnect() {
        this.connected = false;
    }
    isConnected() {
        return this.connected;
    }
    async initialize() {
        this.ensureConnected();
        // Mockは初期化不要（既にMapで初期化済み）
    }
    async clear() {
        this.ensureConnected();
        this.store.tasks.clear();
        this.store.boards.clear();
        this.store.labels.clear();
        this.store.templates.clear();
    }
    // --------------------------------------------------------------------------
    // CRUD Operations - Tasks
    // --------------------------------------------------------------------------
    async getTask(id) {
        this.ensureConnected();
        return this.store.tasks.get(id) ?? null;
    }
    async getTasks(ids) {
        this.ensureConnected();
        return ids
            .map((id) => this.store.tasks.get(id))
            .filter((task) => task !== undefined);
    }
    async getTasksByBoard(boardId, options) {
        this.ensureConnected();
        const allTasks = Array.from(this.store.tasks.values()).filter((task) => task.boardId === boardId && task.status !== 'DELETED');
        return this.applyQueryOptions(allTasks, options);
    }
    async getTasksByColumn(columnId, options) {
        this.ensureConnected();
        const allTasks = Array.from(this.store.tasks.values()).filter((task) => task.columnId === columnId && task.status !== 'DELETED');
        return this.applyQueryOptions(allTasks, options);
    }
    async createTask(task) {
        this.ensureConnected();
        if (this.store.tasks.has(task.id)) {
            throw new Error(`Task with id ${task.id} already exists`);
        }
        this.store.tasks.set(task.id, task);
        return task;
    }
    async updateTask(id, updates) {
        this.ensureConnected();
        const existingTask = this.store.tasks.get(id);
        if (!existingTask) {
            throw new Error(`Task with id ${id} not found`);
        }
        const updatedTask = { ...existingTask, ...updates };
        this.store.tasks.set(id, updatedTask);
        return updatedTask;
    }
    async deleteTask(id) {
        this.ensureConnected();
        if (!this.store.tasks.has(id)) {
            throw new Error(`Task with id ${id} not found`);
        }
        return this.store.tasks.delete(id);
    }
    async deleteTasks(ids) {
        this.ensureConnected();
        const success = [];
        const failed = [];
        for (const id of ids) {
            try {
                if (this.store.tasks.has(id)) {
                    this.store.tasks.delete(id);
                    success.push(id);
                }
                else {
                    failed.push({
                        record: id,
                        error: new Error(`Task with id ${id} not found`),
                    });
                }
            }
            catch (error) {
                failed.push({
                    record: id,
                    error: error instanceof Error ? error : new Error(String(error)),
                });
            }
        }
        return {
            success,
            failed,
            successCount: success.length,
            failureCount: failed.length,
        };
    }
    // --------------------------------------------------------------------------
    // CRUD Operations - Boards
    // --------------------------------------------------------------------------
    async getBoard(id) {
        this.ensureConnected();
        return this.store.boards.get(id) ?? null;
    }
    async getBoards(options) {
        this.ensureConnected();
        const allBoards = Array.from(this.store.boards.values());
        return this.applyQueryOptions(allBoards, options);
    }
    async createBoard(board) {
        this.ensureConnected();
        if (this.store.boards.has(board.id)) {
            throw new Error(`Board with id ${board.id} already exists`);
        }
        this.store.boards.set(board.id, board);
        return board;
    }
    async updateBoard(id, updates) {
        this.ensureConnected();
        const existingBoard = this.store.boards.get(id);
        if (!existingBoard) {
            throw new Error(`Board with id ${id} not found`);
        }
        const updatedBoard = { ...existingBoard, ...updates };
        this.store.boards.set(id, updatedBoard);
        return updatedBoard;
    }
    async deleteBoard(id) {
        this.ensureConnected();
        if (!this.store.boards.has(id)) {
            throw new Error(`Board with id ${id} not found`);
        }
        return this.store.boards.delete(id);
    }
    // --------------------------------------------------------------------------
    // CRUD Operations - Labels
    // --------------------------------------------------------------------------
    async getLabel(id) {
        this.ensureConnected();
        return this.store.labels.get(id) ?? null;
    }
    async getLabelsByBoard(boardId) {
        this.ensureConnected();
        const allLabels = Array.from(this.store.labels.values());
        if (!boardId) {
            // グローバルラベル（boardId未指定）のみ
            return allLabels.filter((label) => !label.boardId);
        }
        // 指定ボードのラベル + グローバルラベル
        return allLabels.filter((label) => label.boardId === boardId || !label.boardId);
    }
    async createLabel(label) {
        this.ensureConnected();
        if (this.store.labels.has(label.id)) {
            throw new Error(`Label with id ${label.id} already exists`);
        }
        this.store.labels.set(label.id, label);
        return label;
    }
    async updateLabel(id, updates) {
        this.ensureConnected();
        const existingLabel = this.store.labels.get(id);
        if (!existingLabel) {
            throw new Error(`Label with id ${id} not found`);
        }
        const updatedLabel = { ...existingLabel, ...updates };
        this.store.labels.set(id, updatedLabel);
        return updatedLabel;
    }
    async deleteLabel(id) {
        this.ensureConnected();
        if (!this.store.labels.has(id)) {
            throw new Error(`Label with id ${id} not found`);
        }
        return this.store.labels.delete(id);
    }
    // --------------------------------------------------------------------------
    // CRUD Operations - Templates
    // --------------------------------------------------------------------------
    async getTemplate(id) {
        this.ensureConnected();
        return this.store.templates.get(id) ?? null;
    }
    async getTemplates(options) {
        this.ensureConnected();
        const allTemplates = Array.from(this.store.templates.values());
        return this.applyQueryOptions(allTemplates, options);
    }
    async getTemplatesByCategory(category) {
        this.ensureConnected();
        return Array.from(this.store.templates.values()).filter((template) => template.category === category);
    }
    async createTemplate(template) {
        this.ensureConnected();
        if (this.store.templates.has(template.id)) {
            throw new Error(`Template with id ${template.id} already exists`);
        }
        this.store.templates.set(template.id, template);
        return template;
    }
    async updateTemplate(id, updates) {
        this.ensureConnected();
        const existingTemplate = this.store.templates.get(id);
        if (!existingTemplate) {
            throw new Error(`Template with id ${id} not found`);
        }
        const updatedTemplate = { ...existingTemplate, ...updates };
        this.store.templates.set(id, updatedTemplate);
        return updatedTemplate;
    }
    async deleteTemplate(id) {
        this.ensureConnected();
        if (!this.store.templates.has(id)) {
            throw new Error(`Template with id ${id} not found`);
        }
        return this.store.templates.delete(id);
    }
    // --------------------------------------------------------------------------
    // Batch Operations
    // --------------------------------------------------------------------------
    async batchCreateTasks(tasks) {
        this.ensureConnected();
        const success = [];
        const failed = [];
        for (const task of tasks) {
            try {
                const created = await this.createTask(task);
                success.push(created);
            }
            catch (error) {
                failed.push({
                    record: task,
                    error: error instanceof Error ? error : new Error(String(error)),
                });
            }
        }
        return {
            success,
            failed,
            successCount: success.length,
            failureCount: failed.length,
        };
    }
    async batchUpdateTasks(updates) {
        this.ensureConnected();
        const success = [];
        const failed = [];
        for (const { id, updates: taskUpdates } of updates) {
            try {
                const updated = await this.updateTask(id, taskUpdates);
                success.push(updated);
            }
            catch (error) {
                const existingTask = this.store.tasks.get(id);
                if (existingTask) {
                    failed.push({
                        record: existingTask,
                        error: error instanceof Error ? error : new Error(String(error)),
                    });
                }
            }
        }
        return {
            success,
            failed,
            successCount: success.length,
            failureCount: failed.length,
        };
    }
    async batchCreateLabels(labels) {
        this.ensureConnected();
        const success = [];
        const failed = [];
        for (const label of labels) {
            try {
                const created = await this.createLabel(label);
                success.push(created);
            }
            catch (error) {
                failed.push({
                    record: label,
                    error: error instanceof Error ? error : new Error(String(error)),
                });
            }
        }
        return {
            success,
            failed,
            successCount: success.length,
            failureCount: failed.length,
        };
    }
    // --------------------------------------------------------------------------
    // Transaction Support
    // --------------------------------------------------------------------------
    async transaction(callback) {
        this.ensureConnected();
        this.transactionDepth++;
        const txContext = {
            id: `mock-tx-${Date.now()}-${this.transactionDepth}`,
            startedAt: new Date(),
        };
        try {
            const result = await callback(txContext);
            this.transactionDepth--;
            return result;
        }
        catch (error) {
            this.transactionDepth--;
            throw error;
        }
    }
    // --------------------------------------------------------------------------
    // Statistics & Metadata
    // --------------------------------------------------------------------------
    async getTaskStats(boardId) {
        this.ensureConnected();
        const tasks = boardId
            ? Array.from(this.store.tasks.values()).filter((task) => task.boardId === boardId)
            : Array.from(this.store.tasks.values());
        const lastModified = tasks.length > 0
            ? new Date(Math.max(...tasks.map((t) => new Date(t.updatedAt).getTime())))
            : new Date();
        return {
            count: tasks.length,
            lastModified,
            storageSize: this.estimateStorageSize(tasks),
        };
    }
    async getBoardStats() {
        this.ensureConnected();
        const boards = Array.from(this.store.boards.values());
        const lastModified = boards.length > 0
            ? new Date(Math.max(...boards.map((b) => new Date(b.updatedAt).getTime())))
            : new Date();
        return {
            count: boards.length,
            lastModified,
            storageSize: this.estimateStorageSize(boards),
        };
    }
    async getLabelStats(boardId) {
        this.ensureConnected();
        const labels = await this.getLabelsByBoard(boardId);
        const lastModified = labels.length > 0
            ? new Date(Math.max(...labels.map((l) => new Date(l.updatedAt).getTime())))
            : new Date();
        return {
            count: labels.length,
            lastModified,
            storageSize: this.estimateStorageSize(labels),
        };
    }
    // --------------------------------------------------------------------------
    // Advanced Queries
    // --------------------------------------------------------------------------
    async searchTasks(query, boardId, options) {
        this.ensureConnected();
        const lowerQuery = query.toLowerCase();
        let tasks = Array.from(this.store.tasks.values()).filter((task) => {
            const matchesQuery = task.title.toLowerCase().includes(lowerQuery) ||
                task.description?.toLowerCase().includes(lowerQuery);
            const matchesBoard = !boardId || task.boardId === boardId;
            return matchesQuery && matchesBoard && task.status !== 'DELETED';
        });
        return this.applyQueryOptions(tasks, options);
    }
    async getTasksByLabel(labelId, options) {
        this.ensureConnected();
        const tasks = Array.from(this.store.tasks.values()).filter((task) => task.labels.includes(labelId) && task.status !== 'DELETED');
        return this.applyQueryOptions(tasks, options);
    }
    async getTasksByDateRange(startDate, endDate, boardId, options) {
        this.ensureConnected();
        const tasks = Array.from(this.store.tasks.values()).filter((task) => {
            if (!task.dueDate)
                return false;
            const dueDate = new Date(task.dueDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            const matchesDateRange = dueDate >= start && dueDate <= end;
            const matchesBoard = !boardId || task.boardId === boardId;
            return matchesDateRange && matchesBoard && task.status !== 'DELETED';
        });
        return this.applyQueryOptions(tasks, options);
    }
    async getDeletedTasks(boardId, options) {
        this.ensureConnected();
        const tasks = Array.from(this.store.tasks.values()).filter((task) => {
            const matchesBoard = !boardId || task.boardId === boardId;
            return task.status === 'DELETED' && matchesBoard;
        });
        return this.applyQueryOptions(tasks, options);
    }
    async purgeDeletedTasks(retentionDays) {
        this.ensureConnected();
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);
        const purgedIds = [];
        for (const [id, task] of this.store.tasks.entries()) {
            if (task.status === 'DELETED' && task.deletedAt) {
                const deletedDate = new Date(task.deletedAt);
                if (deletedDate < cutoffDate) {
                    this.store.tasks.delete(id);
                    purgedIds.push(id);
                }
            }
        }
        return purgedIds;
    }
    // --------------------------------------------------------------------------
    // Helper Methods
    // --------------------------------------------------------------------------
    ensureConnected() {
        if (!this.connected) {
            throw new Error('Database not connected. Call connect() first.');
        }
    }
    applyQueryOptions(items, options) {
        let result = [...items];
        // ソート
        if (options?.orderBy) {
            const { field, direction } = options.orderBy;
            result.sort((a, b) => {
                const aVal = a[field];
                const bVal = b[field];
                if (aVal === bVal)
                    return 0;
                const comparison = (aVal ?? '') < (bVal ?? '') ? -1 : 1;
                return direction === 'asc' ? comparison : -comparison;
            });
        }
        const total = result.length;
        // ページネーション
        if (options?.offset !== undefined) {
            result = result.slice(options.offset);
        }
        if (options?.limit !== undefined) {
            result = result.slice(0, options.limit);
        }
        const hasMore = options?.limit !== undefined && result.length === options.limit
            ? (options.offset ?? 0) + options.limit < total
            : false;
        return {
            data: result,
            total,
            hasMore,
        };
    }
    estimateStorageSize(items) {
        // 簡易的な推定（JSON文字列長）
        return JSON.stringify(items).length;
    }
}
//# sourceMappingURL=mock-database.js.map