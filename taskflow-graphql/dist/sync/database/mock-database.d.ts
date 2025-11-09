/**
 * Mock Database Implementation
 * テスト用のインメモリデータベース実装
 *
 * FileSystem interfaceのMockFileSystemと同等の役割:
 * - テスタビリティ向上のためのテストダブル
 * - 実際のIndexedDB/Supabase接続不要
 * - 高速なユニットテスト実行
 */
import type { Database, DatabaseStats, BatchOperationResult, TransactionContext, QueryOptions, QueryResult } from '../interfaces/database.interface';
import type { TaskRecord, BoardRecord, LabelRecord, TemplateRecord } from '../../types/database';
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
export declare class MockDatabase implements Database {
    private store;
    private connected;
    private transactionDepth;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    initialize(): Promise<void>;
    clear(): Promise<void>;
    getTask(id: string): Promise<TaskRecord | null>;
    getTasks(ids: string[]): Promise<TaskRecord[]>;
    getTasksByBoard(boardId: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    getTasksByColumn(columnId: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    createTask(task: TaskRecord): Promise<TaskRecord>;
    updateTask(id: string, updates: Partial<TaskRecord>): Promise<TaskRecord>;
    deleteTask(id: string): Promise<boolean>;
    deleteTasks(ids: string[]): Promise<BatchOperationResult<string>>;
    getBoard(id: string): Promise<BoardRecord | null>;
    getBoards(options?: QueryOptions): Promise<QueryResult<BoardRecord>>;
    createBoard(board: BoardRecord): Promise<BoardRecord>;
    updateBoard(id: string, updates: Partial<BoardRecord>): Promise<BoardRecord>;
    deleteBoard(id: string): Promise<boolean>;
    getLabel(id: string): Promise<LabelRecord | null>;
    getLabelsByBoard(boardId?: string): Promise<LabelRecord[]>;
    createLabel(label: LabelRecord): Promise<LabelRecord>;
    updateLabel(id: string, updates: Partial<LabelRecord>): Promise<LabelRecord>;
    deleteLabel(id: string): Promise<boolean>;
    getTemplate(id: string): Promise<TemplateRecord | null>;
    getTemplates(options?: QueryOptions): Promise<QueryResult<TemplateRecord>>;
    getTemplatesByCategory(category: string): Promise<TemplateRecord[]>;
    createTemplate(template: TemplateRecord): Promise<TemplateRecord>;
    updateTemplate(id: string, updates: Partial<TemplateRecord>): Promise<TemplateRecord>;
    deleteTemplate(id: string): Promise<boolean>;
    batchCreateTasks(tasks: TaskRecord[]): Promise<BatchOperationResult<TaskRecord>>;
    batchUpdateTasks(updates: Array<{
        id: string;
        updates: Partial<TaskRecord>;
    }>): Promise<BatchOperationResult<TaskRecord>>;
    batchCreateLabels(labels: LabelRecord[]): Promise<BatchOperationResult<LabelRecord>>;
    transaction<T>(callback: (tx: TransactionContext) => Promise<T>): Promise<T>;
    getTaskStats(boardId?: string): Promise<DatabaseStats>;
    getBoardStats(): Promise<DatabaseStats>;
    getLabelStats(boardId?: string): Promise<DatabaseStats>;
    searchTasks(query: string, boardId?: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    getTasksByLabel(labelId: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    getTasksByDateRange(startDate: string, endDate: string, boardId?: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    getDeletedTasks(boardId?: string, options?: QueryOptions): Promise<QueryResult<TaskRecord>>;
    purgeDeletedTasks(retentionDays: number): Promise<string[]>;
    private ensureConnected;
    private applyQueryOptions;
    private estimateStorageSize;
}
//# sourceMappingURL=mock-database.d.ts.map